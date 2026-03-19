/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

// Debugging note:
// Switch the web worker in the browsers debug tab to debug this code.
// It's the "em-pthread" web worker with the most memory usage, where "zetajs" is defined.

'use strict';

// GL context recovery for OffscreenCanvas in Worker threads.
//
// Problem: GL.createContext() in soffice.js applies a Safari WebGL2 workaround that wraps
// canvas.getContext with fixedGetContext, which filters results using:
//   `instanceof WebGLRenderingContext`
// In worker scope WebGLRenderingContext may be undefined or the instanceof check may fail
// for OffscreenCanvas contexts, causing fixedGetContext to return null. This makes
// emscripten_webgl_create_context return 0 (failure). Then makeContextCurrent(0) sets
// GLctx=undefined but wrongly returns true (Emscripten bug), so Qt proceeds unaware and
// crashes on _glGetString with "Cannot read properties of undefined".
//
// Fix 1: Pre-set getContextSafariWebGL2Fixed on OffscreenCanvas.prototype so that
// GL.createContext skips applying fixedGetContext for future context creation calls.
if (typeof OffscreenCanvas !== 'undefined' && !OffscreenCanvas.prototype.getContextSafariWebGL2Fixed) {
  OffscreenCanvas.prototype.getContextSafariWebGL2Fixed = OffscreenCanvas.prototype.getContext;
}

// Fix 2: If GL context creation already ran and failed (GL.createContext was called before
// this script loaded), attempt to recover by directly calling the original getContext on
// Module.canvas, bypassing fixedGetContext, and registering the resulting context.
// Also patch makeContextCurrent so Qt's makeContextCurrent(0) calls don't clear GLctx.
(function() {
  if (typeof GL === 'undefined' || typeof Module === 'undefined' || !Module.canvas) return;

  var canvas = Module.canvas;
  // canvas.getContextSafariWebGL2Fixed is the original getContext stored by fixedGetContext.
  // If it's present, use it directly to bypass the broken instanceof check.
  var origGetContext = canvas.getContextSafariWebGL2Fixed || canvas.getContext;
  if (!origGetContext) return;

  // Test if a WebGL context can be obtained directly (bypassing fixedGetContext filter)
  var existingCtx = GL.currentContext && GL.currentContext.GLctx;
  if (!existingCtx) {
    var ctx = null;
    try { ctx = origGetContext.call(canvas, 'webgl', {}); } catch(e) {}
    if (!ctx) { try { ctx = origGetContext.call(canvas, 'webgl2', {}); } catch(e) {} }
    if (ctx) {
      try {
        var handle = GL.registerContext(ctx, {
          majorVersion: 1, minorVersion: 0, enableExtensionsByDefault: true
        });
        GL.makeContextCurrent(handle);
        console.log('office_thread: recovered GL context via direct getContext, handle:', handle);
        // Patch makeContextCurrent to redirect handle-0 (Qt's "clear context" call) to our
        // valid handle, preventing GLctx from being set to undefined.
        var _recoveredHandle = handle;
        var _origMCC = GL.makeContextCurrent;
        GL.makeContextCurrent = function(h) {
          return _origMCC.call(GL, h === 0 ? _recoveredHandle : h);
        };
      } catch(e) {
        console.warn('office_thread: GL context recovery failed:', e);
      }
    } else {
      console.warn('office_thread: WebGL unavailable on OffscreenCanvas - document will not render');
    }
  }
})();

// global variables - zetajs environment:
let zetajs, css;

// = global variables (some are global for easier debugging) =
// common variables:
let context, desktop, xModel, ctrl;
let docFilename = '';


function demo() {
  context = zetajs.getUnoComponentContext();
  desktop = css.frame.Desktop.create(context);

  zetajs.mainPort.onmessage = function(e) {
    switch (e.data.cmd) {
      case 'upload':
        loadFile(e.data.filename);
        break;
      case 'triggerSave':
        ownSaveInProgress = true;
        try { storeDoc(); } catch(e) { console.warn('storeDoc failed:', e); }
        ownSaveInProgress = false;
        zetajs.mainPort.postMessage({ cmd: 'saved', isAs: false, filename: docFilename });
        break;
      case 'triggerSaveAs':
        ownSaveInProgress = true;
        try { storeDoc(); } catch(e) { console.warn('storeDoc failed:', e); }
        ownSaveInProgress = false;
        zetajs.mainPort.postMessage({ cmd: 'saved', isAs: true, filename: docFilename });
        break;
      case 'insertGraphic':
        insertGraphic(e.data.tmpPath);
        break;
      case 'openFile':
        openFileInFrame(e.data.filename);
        break;
      case 'newDoc':
        loadNewDoc(e.data.factoryUrl);
        break;
      default:
        throw Error('Unknown message command: ' + e.data.cmd);
    }
  }
  zetajs.mainPort.postMessage({
    cmd: 'thr_running'
  });
}

// ownSaveInProgress suppresses OnSaveDone events fired by our own store() calls.
let ownSaveInProgress = false;
let docEventListener = null;  // keep alive; GC of this would invalidate the emval handle
let saveInterceptor = null;    // keep alive (doc frame)
let saveInterceptorTop = null; // keep alive (top frame fallback)
let frameInterceptors = [];    // keep alive (all frames from desktop.getFrames())
let framesListener = null;     // keep alive (XContainerListener for new frames)
let frameActionListener = null; // keep alive (XFrameActionListener for component changes)
let newDocDispatch = null;      // shared XDispatch for all File>New commands
let inNewDocDispatch = false;   // re-entry guard for makeNewDocDispatch
let mainFrameName = '';         // name of the main WASM frame, captured at load time
let insertGraphicDispatch = null; // keep alive
let openFileDispatch = null;      // keep alive

// Tracks frame names (and '__desktop__') that already have a save interceptor.
// Each JS interceptor in the LO dispatch chain adds one Emscripten FinalizationRegistry
// entry per queryDispatch call. LO makes O(commands) queryDispatch calls on every cell
// commit, so duplicate interceptors on the same frame produce O(N²) attachFinalizer
// work and cause multi-second hangs. Guard all registration sites with this set.
const interceptedFrameNames = new Set();

// Return the filename for a new untitled document based on its UNO service type.
function guessFilenameForModel(model) {
  try {
    if (model.supportsService('com.sun.star.presentation.PresentationDocument')) return 'Untitled.pptx';
    if (model.supportsService('com.sun.star.sheet.SpreadsheetDocument'))        return 'Untitled.xlsx';
    if (model.supportsService('com.sun.star.drawing.DrawingDocument'))          return 'Untitled.odg';
    if (model.supportsService('com.sun.star.text.TextDocument'))                return 'Untitled.docx';
  } catch(e) {}
  return 'Untitled.docx';
}

// Handle File > New by creating the new document through desktop.loadComponentFromURL
// ('private:factory/...') rather than LO's internal mechanism. This ensures the new
// document is in the XFrame dispatch chain so our Save interceptor works on it.
function makeNewDocDispatch() {
  const obj = {
    dispatch(url, args) {
      const cmd = url && (url.Complete || url.Main || '');
      console.log('office_thread: File>New intercepted, cmd=' + cmd);

      // Determine factory URL from the command. LO's File>New submenu dispatches the
      // raw factory URL (e.g. "private:factory/simpress?slot=6686") directly.
      // .uno: commands come from keyboard/toolbar. Both are handled here.
      let factoryUrl;
      if (cmd.startsWith('private:factory/')) {
        // Strip the ?slot=... query param — it's not needed for loadComponentFromURL.
        factoryUrl = cmd.split('?')[0];
      } else if (cmd === '.uno:Presentation' || cmd === '.uno:NewPresentation') {
        factoryUrl = 'private:factory/simpress';
      } else if (cmd === '.uno:Spreadsheet') {
        factoryUrl = 'private:factory/scalc';
      } else if (cmd === '.uno:Drawing' || cmd === '.uno:DrawImpressLayout') {
        factoryUrl = 'private:factory/sdraw';
      } else if (cmd === '.uno:Text' || cmd === '.uno:NewTextDoc') {
        factoryUrl = 'private:factory/swriter';
      } else {
        // Generic new-doc command — create same type as current document.
        const ext = (docFilename.match(/\.([^.]+)$/) || [])[1] || '';
        switch (ext.toLowerCase()) {
          case 'ods': case 'xlsx': case 'xls': case 'csv':
            factoryUrl = 'private:factory/scalc'; break;
          case 'odg':
            factoryUrl = 'private:factory/sdraw'; break;
          case 'odp': case 'pptx': case 'ppt':
            factoryUrl = 'private:factory/simpress'; break;
          default:
            factoryUrl = 'private:factory/swriter'; break;
        }
      }

      inNewDocDispatch = true;
      try {
        // Remove old document event listener before switching models.
        const oldModel = xModel;
        const oldListener = docEventListener;
        try { oldModel.removeDocumentEventListener(oldListener); } catch(e) {}

        // Load into the CURRENT frame by name to avoid creating a new Qt window.
        // '_default' creates a new Qt window in WASM (fails with nullptr errors).
        // mainFrameName is set (and assigned via setName if needed) in loadFile.
        console.log('office_thread: loading new doc into frame:', mainFrameName, 'factory:', factoryUrl);
        if (!mainFrameName) {
          console.warn('office_thread: no frame name available, cannot create new document');
          zetajs.mainPort.postMessage({ cmd: 'error', message: 'File > New is not supported: frame name unavailable' });
          return;
        }
        const newModel = desktop.loadComponentFromURL(factoryUrl, mainFrameName, 0, []);
        if (!newModel) {
          console.warn('office_thread: loadComponentFromURL returned null for', factoryUrl);
          return;
        }

        xModel = newModel;
        ctrl = newModel.getCurrentController();
        docFilename = guessFilenameForModel(newModel);
        try { ctrl.getFrame().getContainerWindow().FullScreen = true; } catch(e) {}

        setupSaveListener();
        setupSaveInterceptor();

        zetajs.mainPort.postMessage({ cmd: 'ui_ready' });
        console.log('office_thread: new doc created:', factoryUrl, '→', docFilename);
      } catch(e) {
        console.warn('office_thread: new doc creation failed:', e);
      } finally {
        inNewDocDispatch = false;
      }
    },
    addStatusListener(listener, url) {},
    removeStatusListener(listener, url) {},
  };
  return zetajs.unoObject(['com.sun.star.frame.XDispatch'], new Proxy(obj, {
    get(t, p) { return p in t ? t[p] : function() {}; }
  }));
}

// Intercept Insert > Image: ask the main thread to show the Peergos file picker,
// then receive back the image path and insert it via UNO.
function makeInsertGraphicDispatch() {
  const obj = {
    dispatch(url, args) {
      console.log('office_thread: InsertGraphic intercepted, requesting file picker');
      zetajs.mainPort.postMessage({ cmd: 'pickImage' });
    },
    addStatusListener(listener, url) {},
    removeStatusListener(listener, url) {},
  };
  return zetajs.unoObject(['com.sun.star.frame.XDispatch'], new Proxy(obj, {
    get(t, p) { return p in t ? t[p] : function() {}; }
  }));
}

// Insert an image (already written to WASM FS at tmpPath) into the current document.
function insertGraphic(tmpPath) {
  const fileUrl = 'file://' + tmpPath;
  console.log('office_thread: inserting graphic from', fileUrl);
  try {
    if (xModel.supportsService('com.sun.star.text.TextDocument')) {
      // Writer: insert inline at the current view cursor position.
      const shape = xModel.createInstance('com.sun.star.text.TextGraphicObject');
      shape.setPropertyValue('AnchorType', css.text.TextContentAnchorType.AS_CHARACTER);
      shape.setPropertyValue('GraphicURL', fileUrl);
      shape.setPropertyValue('Size', new css.awt.Size({ Width: 5000, Height: 5000 }));
      xModel.getText().insertTextContent(ctrl.getViewCursor(), shape, false);
    } else if (xModel.supportsService('com.sun.star.presentation.PresentationDocument') ||
               xModel.supportsService('com.sun.star.drawing.DrawingDocument')) {
      // Impress / Draw: add a floating graphic shape to the current slide/page.
      const page = ctrl.getCurrentPage();
      const shape = xModel.createInstance('com.sun.star.drawing.GraphicObjectShape');
      page.add(shape);
      shape.setPropertyValue('GraphicURL', fileUrl);
      shape.setSize(new css.awt.Size({ Width: 10000, Height: 10000 }));
      shape.setPosition(new css.awt.Point({ X: 1000, Y: 1000 }));
    } else if (xModel.supportsService('com.sun.star.sheet.SpreadsheetDocument')) {
      // Calc: add a floating graphic shape to the active sheet's draw page.
      const shapes = ctrl.getActiveSheet().getDrawPage();
      const shape = xModel.createInstance('com.sun.star.drawing.GraphicObjectShape');
      shapes.add(shape);
      shape.setPropertyValue('GraphicURL', fileUrl);
      shape.setSize(new css.awt.Size({ Width: 10000, Height: 10000 }));
      shape.setPosition(new css.awt.Point({ X: 1000, Y: 1000 }));
    }
    zetajs.mainPort.postMessage({ cmd: 'imageInserted' });
    console.log('office_thread: graphic inserted successfully');
  } catch(e) {
    console.warn('office_thread: insertGraphic failed:', e);
    zetajs.mainPort.postMessage({ cmd: 'error', message: 'Failed to insert image: ' + e });
  }
}

// Intercept File > Open: ask the main thread to show the Peergos file picker.
// This XDispatch interception catches File > Open dispatched through the UNO chain
// (e.g. toolbar, macro). The Qt menu path is caught by the custom FilePicker service.
function makeOpenFileDispatch() {
  const obj = {
    dispatch(url, args) {
      console.log('office_thread: Open intercepted via XDispatch, requesting file picker');
      zetajs.mainPort.postMessage({ cmd: 'pickOpenFile' });
    },
    addStatusListener(listener, url) {},
    removeStatusListener(listener, url) {},
  };
  return zetajs.unoObject(['com.sun.star.frame.XDispatch'], new Proxy(obj, {
    get(t, p) { return p in t ? t[p] : function() {}; }
  }));
}

// Create a custom UNO FilePicker that shows the Peergos file picker instead of
// the Qt WASM file dialog (which is rendered in the WebGL canvas and cannot be
// intercepted via DOM or UNO dispatch). Synchronisation between the LO WASM
// pthread (worker) and the async main-thread picker is done via SharedArrayBuffer
// + Atomics.wait / Atomics.notify.
function makeCustomFilePicker() {
  // SAB layout: [0..3] = Int32 signal (0=waiting, 1=ok, 2=cancel), [4..] = UTF-8 filename
  const sab = new SharedArrayBuffer(4 + 4096);
  const signal = new Int32Array(sab, 0, 1);
  const pathBuf = new Uint8Array(sab, 4);
  let pendingFilename = null;

  const pickerObj = {
    // XExecutableDialog
    setTitle(title) {},
    execute() {
      console.log('office_thread: *** CUSTOM FILEPICKER EXECUTE CALLED ***');
      zetajs.mainPort.postMessage({ cmd: 'debug', message: 'Custom FilePicker.execute() called' });
      Atomics.store(signal, 0, 0);
      zetajs.mainPort.postMessage({ cmd: 'pickOpenFilePicker', sab });
      // Block the WASM pthread until the main thread signals (file picked or cancelled).
      const waitResult = Atomics.wait(signal, 0, 0, 120000); // 2 min timeout
      console.log('office_thread: Atomics.wait returned:', waitResult);
      const result = Atomics.load(signal, 0);
      if (result !== 1) {
        console.log('office_thread: FilePicker cancelled or timed out, result=' + result);
        return 0; // ExecutableDialogResults.CANCEL
      }
      // Decode the filename written by the main thread into the SAB.
      let end = pathBuf.indexOf(0);
      if (end < 0) end = pathBuf.length;
      pendingFilename = new TextDecoder().decode(pathBuf.subarray(0, end));
      console.log('office_thread: FilePicker selected filename:', pendingFilename);
      // Open the file in the existing frame before returning CANCEL.
      // We return CANCEL so LO doesn't try its own open path (_default → new Qt window).
      // openFileInFrame() is deferred until after LO's OpenDoc_Impl unwinds.
      const fn = pendingFilename;
      pendingFilename = null;
      Promise.resolve().then(() => {
        console.log('office_thread: deferred openFileInFrame:', fn);
        openFileInFrame(fn);
      });
      return 0; // CANCEL
    },
    // XFilePicker / XFilePicker2 / XFilePicker3
    setMultiSelectionMode(bMode) {},
    getDisplayDirectory() { return ''; },
    setDisplayDirectory(dir) {},
    getFileName() { return ''; },
    setFileName(name) {},
    getFiles() { return []; },
    getSelectedFiles() { return []; },
    // XFilterManager
    appendFilter(title, filter) {},
    removeAllFilters() {},
    setCurrentFilter(title) {},
    getCurrentFilter() { return ''; },
    // XFilePickerControlAccess
    setValue(id, ctrl, val) {},
    getValue(id, ctrl) { return null; },
    enableControl(id, bEnable) {},
    setLabel(id, label) {},
    getLabel(id) { return ''; },
    // XFilePickerNotifier
    addFilePickerListener(l) {},
    removeFilePickerListener(l) {},
    // XInitialization
    initialize(args) {
      console.log('office_thread: custom FilePicker.initialize() called');
    },
    // XServiceInfo
    getImplementationName() { return 'peergos.CustomFilePicker'; },
    supportsService(n) { return n === 'com.sun.star.ui.dialogs.FilePicker'; },
    getSupportedServiceNames() { return ['com.sun.star.ui.dialogs.FilePicker']; },
    // XComponent
    dispose() {},
    addEventListener(l) {},
    removeEventListener(l) {},
  };

  return zetajs.unoObject([
    'com.sun.star.ui.dialogs.XFilePicker3',
    'com.sun.star.ui.dialogs.XFilePickerControlAccess',
    'com.sun.star.ui.dialogs.XFilePickerNotifier',
    'com.sun.star.ui.dialogs.XFilePicker2',
    'com.sun.star.ui.dialogs.XFilePicker',
    'com.sun.star.ui.dialogs.XExecutableDialog',
    'com.sun.star.lang.XInitialization',
    'com.sun.star.lang.XServiceInfo',
    'com.sun.star.lang.XComponent',
  ], new Proxy(pickerObj, { get(t, p) { return p in t ? t[p] : function() {}; } }));
}

// Create a factory that makes custom FilePicker instances, and register it in the
// UNO service manager so LO's internal File > Open path uses our picker.
function installCustomFilePicker() {
  console.log('office_thread: installCustomFilePicker() starting');
  try {
    const ctx = zetajs.getUnoComponentContext();
    console.log('office_thread: got context:', !!ctx);
    const smgr = ctx.getServiceManager();
    console.log('office_thread: got service manager:', !!smgr);
    if (!smgr) { console.warn('office_thread: no service manager, aborting'); return; }

    // Verify we can call a known method on smgr.
    try {
      const impl = smgr.getImplementationName ? smgr.getImplementationName() : '(no method)';
      console.log('office_thread: smgr.getImplementationName():', impl);
    } catch(e) {
      console.log('office_thread: smgr.getImplementationName() threw:', e.message);
    }

    const factoryObj = {
      // XSingleComponentFactory (used when context is available)
      createInstanceWithContext(ctx) {
        console.log('office_thread: *** FILEPICKER FACTORY createInstanceWithContext CALLED ***');
        return makeCustomFilePicker();
      },
      createInstanceWithArgumentsAndContext(args, ctx) {
        console.log('office_thread: *** FILEPICKER FACTORY createInstanceWithArgumentsAndContext CALLED ***');
        return makeCustomFilePicker();
      },
      // XSingleServiceFactory (used when no context — fallback path)
      createInstance() {
        console.log('office_thread: *** FILEPICKER FACTORY createInstance CALLED ***');
        return makeCustomFilePicker();
      },
      createInstanceWithArguments(args) {
        console.log('office_thread: *** FILEPICKER FACTORY createInstanceWithArguments CALLED ***');
        return makeCustomFilePicker();
      },
      getImplementationName() { return 'peergos.CustomFilePickerFactory'; },
      supportsService(n) { return n === 'com.sun.star.ui.dialogs.FilePicker'; },
      getSupportedServiceNames() { return ['com.sun.star.ui.dialogs.FilePicker']; },
    };
    const factory = zetajs.unoObject([
      'com.sun.star.lang.XSingleComponentFactory',
      'com.sun.star.lang.XSingleServiceFactory',
      'com.sun.star.lang.XServiceInfo',
    ], new Proxy(factoryObj, { get(t, p) { return p in t ? t[p] : function() {}; } }));

    console.log('office_thread: calling smgr.insert(factory)...');
    smgr.insert(factory);
    console.log('office_thread: smgr.insert() succeeded — custom FilePicker registered');

    // Verify: try to enumerate factories for this service to confirm registration.
    try {
      const en = smgr.createContentEnumeration
        ? smgr.createContentEnumeration('com.sun.star.ui.dialogs.FilePicker')
        : null;
      if (en) {
        let count = 0;
        while (en.hasMoreElements && en.hasMoreElements()) { en.nextElement(); count++; }
        console.log('office_thread: FilePicker factory count after insert:', count);
      }
    } catch(e) {
      console.log('office_thread: createContentEnumeration check threw:', e.message);
    }
  } catch(e) {
    console.warn('office_thread: custom FilePicker registration failed:', e.message || e);
  }
}

// Load a file (already written to /tmp/office/<filename> in WASM FS) into the current frame.
function openFileInFrame(filename) {
  console.log('office_thread: opening file in frame:', filename);
  const fileUrl = 'file:///tmp/office/' + filename;
  try {
    try { xModel.removeDocumentEventListener(docEventListener); } catch(e) {}
    if (!mainFrameName) {
      zetajs.mainPort.postMessage({ cmd: 'error', message: 'Cannot open file: frame name unavailable' });
      return;
    }
    const newModel = desktop.loadComponentFromURL(fileUrl, mainFrameName, 0, []);
    if (!newModel) {
      zetajs.mainPort.postMessage({ cmd: 'error', message: 'Failed to open document' });
      return;
    }
    xModel = newModel;
    ctrl = newModel.getCurrentController();
    docFilename = filename;
    try { ctrl.getFrame().getContainerWindow().FullScreen = true; } catch(e) {}
    setupSaveListener();
    setupSaveInterceptor();
    zetajs.mainPort.postMessage({ cmd: 'ui_ready' });
    console.log('office_thread: file opened:', filename);
  } catch(e) {
    console.warn('office_thread: openFileInFrame failed:', e);
    zetajs.mainPort.postMessage({ cmd: 'error', message: 'Failed to open file: ' + e });
  }
}

// Return the LO filter name for saving a document in its current format.
// Using storeToURL with an explicit filter avoids the "Keep in Microsoft format?" dialog
// which hits broken file-picker code in this WASM build and crashes.
function filterForFilename(filename) {
  const ext = (filename.match(/\.([^.]+)$/) || [])[1];
  switch ((ext || '').toLowerCase()) {
    case 'odt':  return 'writer8';
    case 'docx': return 'MS Word 2007 XML';
    case 'doc':  return 'MS Word 97';
    case 'ods':  return 'calc8';
    case 'xlsx': return 'Calc MS Excel 2007 XML';
    case 'xls':  return 'MS Excel 97';
    case 'odp':  return 'impress8';
    case 'pptx': return 'Impress MS PowerPoint 2007 XML';
    case 'ppt':  return 'MS PowerPoint 97';
    case 'odg':  return 'draw8';
    default:     return null;
  }
}

// Save a model to /tmp/office/<filename> using an explicit filter to avoid
// any format-conversion dialog (which crashes in this WASM build).
function storeDocWithModel(model, filename) {
  const filter = filterForFilename(filename);
  if (filter) {
    const beanFilter   = new css.beans.PropertyValue({Name: 'FilterName', Value: filter});
    const beanOverwrite = new css.beans.PropertyValue({Name: 'Overwrite',  Value: true});
    model.storeToURL('file:///tmp/office/' + filename, [beanFilter, beanOverwrite]);
  } else {
    model.store();
  }
}

// Convenience wrapper using the currently loaded document.
function storeDoc() {
  storeDocWithModel(xModel, docFilename);
}

// Return the LO PDF export filter name for a given filename extension.
function pdfFilterForFilename(filename) {
  const ext = (filename.match(/\.([^.]+)$/) || [])[1];
  switch ((ext || '').toLowerCase()) {
    case 'ods': case 'xlsx': case 'xls': case 'csv': return 'calc_pdf_Export';
    case 'odp': case 'pptx': case 'ppt': return 'impress_pdf_Export';
    case 'odg':                                       return 'draw_pdf_Export';
    default:                                          return 'writer_pdf_Export';
  }
}

// Create and return a UNO XDispatchProviderInterceptor object.
// registeredFrame: the frame this interceptor will be attached to. When a dispatch
// fires, we read the CURRENT model from the frame rather than the global xModel —
// this correctly handles documents created after File > New without reloading.
// Each frame needs its own instance (separate slave/master provider chain).
function createSaveInterceptor(registeredFrame) {
  let slaveProvider = null;
  let masterProvider = null;
  let saveDispatch = null;
  let saveAsDispatch = null;
  let saveAsTemplateDispatch = null;
  let pdfExportDispatch = null;
  let presentationDispatch = null;
  // Cache for slaveProvider.queryDispatch() results, keyed by command string.
  // LO calls queryDispatch ~1000 times per cell commit (one per UNO command in the
  // status-update sweep). Each call wraps a C++ XDispatch pointer into a new JS object
  // via Emscripten's RegisteredPointer_fromWireType + makeClassHandle — ~6 ms each.
  // Caching the result after the first call drops subsequent commits to near-zero cost.
  // Cleared in setSlaveDispatchProvider so chain changes (new document load) repopulate.
  const slaveDispatchCache = new Map();

  // Get the model that is currently active in our frame, and derive its filename.
  // Falls back to the global xModel/docFilename if the frame can't be queried.
  function getModelAndFilename() {
    if (registeredFrame) {
      try {
        const c = registeredFrame.getController();
        const m = c && c.getModel();
        if (m) {
          const u = m.getURL();
          let filename;
          if (u && u.startsWith('file:///tmp/office/')) {
            filename = decodeURIComponent(u.slice('file:///tmp/office/'.length));
          } else if (!u || u === '') {
            filename = guessFilenameForModel(m);  // new untitled document
          } else {
            filename = decodeURIComponent(u.slice(u.lastIndexOf('/') + 1));
          }
          return { model: m, filename };
        }
      } catch(e) {
        console.warn('office_thread: getModelAndFilename failed:', e);
      }
    }
    return { model: xModel, filename: docFilename };
  }

  // Inner XDispatch for Save / Save As.
  function makeSaveDispatchInner(isAs) {
    const obj = {
      dispatch(url, args) {
        const { model, filename } = getModelAndFilename();
        console.log('office_thread: save intercepted via XDispatch, isAs=' + isAs + ' filename=' + filename);
        ownSaveInProgress = true;
        try { storeDocWithModel(model, filename); } catch(e) { console.warn('storeDoc failed:', e); }
        ownSaveInProgress = false;
        zetajs.mainPort.postMessage({ cmd: 'saved', isAs, filename });
      },
      addStatusListener(listener, url) {},
      removeStatusListener(listener, url) {},
    };
    return zetajs.unoObject(['com.sun.star.frame.XDispatch'], new Proxy(obj, {
      get(t, p) { return p in t ? t[p] : function() {}; }
    }));
  }

  // Inner XDispatch for Save As Template.
  function makeSaveAsTemplateDispatchInner() {
    const obj = {
      dispatch(url, args) {
        const { model, filename } = getModelAndFilename();
        let ext, filter;
        try {
          if (model.supportsService('com.sun.star.sheet.SpreadsheetDocument')) {
            ext = 'ots'; filter = 'calc8_template';
          } else if (model.supportsService('com.sun.star.presentation.PresentationDocument')) {
            ext = 'otp'; filter = 'impress8_template';
          } else if (model.supportsService('com.sun.star.drawing.DrawingDocument')) {
            ext = 'otg'; filter = 'draw8_template';
          } else {
            ext = 'ott'; filter = 'writer8_template';
          }
        } catch(e) { ext = 'ott'; filter = 'writer8_template'; }
        const templateFilename = filename.replace(/\.[^.]+$/, '') + '.' + ext;
        console.log('office_thread: save as template, filter=' + filter + ' file=' + templateFilename);
        ownSaveInProgress = true;
        try {
          const beanFilter    = new css.beans.PropertyValue({ Name: 'FilterName', Value: filter });
          const beanOverwrite = new css.beans.PropertyValue({ Name: 'Overwrite',  Value: true });
          model.storeToURL('file:///tmp/office/' + templateFilename, [beanFilter, beanOverwrite]);
        } catch(e) { console.warn('office_thread: save as template storeToURL failed:', e); }
        ownSaveInProgress = false;
        zetajs.mainPort.postMessage({ cmd: 'saved', isAs: true, filename: templateFilename });
      },
      addStatusListener(listener, url) {},
      removeStatusListener(listener, url) {},
    };
    return zetajs.unoObject(['com.sun.star.frame.XDispatch'], new Proxy(obj, {
      get(t, p) { return p in t ? t[p] : function() {}; }
    }));
  }

  // Inner XDispatch for PDF export.
  function makePdfExportDispatchInner() {
    const obj = {
      dispatch(url, args) {
        const { model, filename } = getModelAndFilename();
        const pdfFilename = filename.replace(/\.[^.]+$/, '') + '.pdf';
        const tmpPath = 'file:///tmp/export.pdf';
        const filterName = pdfFilterForFilename(filename);
        console.log('office_thread: PDF export, filter:', filterName);
        try {
          const beanFilter   = new css.beans.PropertyValue({Name: 'FilterName', Value: filterName});
          const beanOverwrite = new css.beans.PropertyValue({Name: 'Overwrite',  Value: true});
          model.storeToURL(tmpPath, [beanOverwrite, beanFilter]);
          zetajs.mainPort.postMessage({ cmd: 'saved', isAs: true, filename: pdfFilename, tmpFile: 'export.pdf' });
        } catch(e) {
          console.warn('office_thread: PDF export failed:', e);
          zetajs.mainPort.postMessage({ cmd: 'error', message: 'PDF export failed: ' + e });
        }
      },
      addStatusListener(listener, url) {},
      removeStatusListener(listener, url) {},
    };
    return zetajs.unoObject(['com.sun.star.frame.XDispatch'], new Proxy(obj, {
      get(t, p) { return p in t ? t[p] : function() {}; }
    }));
  }

  const interceptorObj = {
    queryDispatch(url, targetFrameName, searchFlags) {
      // LO occasionally calls queryDispatch with a null C++ URL struct. Accessing
      // url.Complete on a null zetajs proxy throws "invalid nullptr parameter" through
      // Emscripten's embind — guard against it here.
      let cmd = '';
      try { cmd = url && (url.Complete || url.Main || ''); } catch(e) { return null; }
      //console.log('office_thread: queryDispatch:', cmd);
      if (cmd === '.uno:Save' || cmd === 'slot:5000') {
        if (!saveDispatch) saveDispatch = makeSaveDispatchInner(false);
        return saveDispatch;
      }
      if (cmd === '.uno:SaveAs' || cmd === '.uno:SaveACopy' || cmd === 'slot:5002' || cmd === 'slot:5523') {
        if (!saveAsDispatch) saveAsDispatch = makeSaveDispatchInner(true);
        return saveAsDispatch;
      }
      if (cmd === '.uno:SaveAsTemplate' || cmd === '.uno:AddToTemplates') {
        if (!saveAsTemplateDispatch) saveAsTemplateDispatch = makeSaveAsTemplateDispatchInner();
        return saveAsTemplateDispatch;
      }
      if (cmd === '.uno:ExportToPDF' || cmd === '.uno:ExportDirectToPDF') {
        if (!pdfExportDispatch) pdfExportDispatch = makePdfExportDispatchInner();
        return pdfExportDispatch;
      }
      if (cmd === '.uno:InsertGraphic') {
        if (!insertGraphicDispatch) insertGraphicDispatch = makeInsertGraphicDispatch();
        return insertGraphicDispatch;
      }
      if (cmd === '.uno:Open' || cmd.startsWith('.uno:OpenFrom') ||
          cmd === '.uno:OpenUrl' || cmd === '.uno:OpenTemplate' ||
          cmd === '.uno:NewFromTemplate') {
        if (!openFileDispatch) openFileDispatch = makeOpenFileDispatch();
        return openFileDispatch;
      }
      // Disable Tools > Options — it tries to create a new Qt window which fails in WASM
      // (QObject::connect nullptr error). Return a dispatch that reports IsEnabled=false
      // so the item is grayed out. The module config registry is stripped in this WASM
      // build so the item cannot be fully removed via the UNO config API.
      if (cmd === '.uno:OptionsTreeDialog') {
        const obj = {
          dispatch(url, args) {},
          addStatusListener(listener, url) {
            try {
              listener.statusChanged(new css.frame.FeatureStateEvent({
                FeatureURL: url, IsEnabled: false, Requery: false,
              }));
            } catch(e) {}
          },
          removeStatusListener(listener, url) {},
        };
        return zetajs.unoObject(['com.sun.star.frame.XDispatch'],
          new Proxy(obj, { get(t, p) { return p in t ? t[p] : function() {}; } }));
      }
      // Disable slideshow commands — they require a new Qt window which is always
      // nullptr in WASM, causing a crash. Gray them out via IsEnabled=false.
      if (cmd === '.uno:Presentation' || cmd === '.uno:PresentationCurrentSlide') {
        if (!presentationDispatch) {
          const obj = {
            dispatch(url, args) {},
            addStatusListener(listener, url) {
              try {
                listener.statusChanged(new css.frame.FeatureStateEvent({
                  FeatureURL: url, IsEnabled: false, Requery: false,
                }));
              } catch(e) {}
            },
            removeStatusListener(listener, url) {},
          };
          presentationDispatch = zetajs.unoObject(['com.sun.star.frame.XDispatch'],
            new Proxy(obj, { get(t, p) { return p in t ? t[p] : function() {}; } }));
        }
        return presentationDispatch;
      }
      // Intercept File > New commands. Redirect to loadComponentFromURL so the new
      // document is properly wired into the XFrame dispatch chain (making Save As
      // interceptable). LO's internal File>New path bypasses XDispatchProviderInterceptor.
      // NOTE: LO's File>New submenu dispatches the raw factory URL (e.g.
      // "private:factory/simpress?slot=6686"), not a .uno: command. We catch both forms.
      if (cmd === '.uno:NewDoc' ||
          cmd === '.uno:NewPresentation' || cmd === '.uno:Text' ||
          cmd === '.uno:Spreadsheet' || cmd === '.uno:DrawImpressLayout' ||
          (cmd.startsWith('.uno:New') && !cmd.startsWith('.uno:NewFile')) ||
          cmd.startsWith('private:factory/')) {
        // Skip interception if we're already inside makeNewDocDispatch — that call
        // may internally re-dispatch a factory URL and must not loop back to us.
        if (inNewDocDispatch) {
          return slaveProvider ? slaveProvider.queryDispatch(url, targetFrameName, searchFlags) : null;
        }
        if (!newDocDispatch) newDocDispatch = makeNewDocDispatch();
        return newDocDispatch;
      }
      if (slaveProvider) {
        if (slaveDispatchCache.has(cmd)) {
          return slaveDispatchCache.get(cmd);
        }
        let result = null;
        try { result = slaveProvider.queryDispatch(url, targetFrameName, searchFlags); } catch(e) {}
        slaveDispatchCache.set(cmd, result);
        return result;
      }
      return null;
    },
    // queryDispatches intentionally omitted — returning [] caused Impress to cache
    // slave dispatchers for batch-queried commands, bypassing our interceptor on click.
    // With queryDispatches absent, LO falls back to individual queryDispatch calls.
    getSlaveDispatchProvider() { return slaveProvider; },
    setSlaveDispatchProvider(provider) {
      slaveProvider = provider;
      slaveDispatchCache.clear(); // repopulate when chain changes (new document load)
    },
    getMasterDispatchProvider() { return masterProvider; },
    setMasterDispatchProvider(provider) { masterProvider = provider; },
  };

  return zetajs.unoObject([
    'com.sun.star.frame.XDispatchProviderInterceptor',
    'com.sun.star.frame.XDispatchProvider',
  ], new Proxy(interceptorObj, { get(t, p) { return p in t ? t[p] : function() {}; } }));
}

function registerInterceptorOnFrame(frame, label) {
  let fname = '';
  try { fname = frame.getName(); } catch(e) {}
  if (interceptedFrameNames.has(fname)) {
    console.log('office_thread: interceptor already registered on frame, skipping:', label, fname);
    return null;
  }
  const fi = createSaveInterceptor(frame);
  frame.registerDispatchProviderInterceptor(fi);
  interceptedFrameNames.add(fname);
  console.log('office_thread: save interceptor registered on', label, fname);
  return fi;
}

function setupSaveInterceptor() {
  const docFrame = ctrl.getFrame();

  // Register on the document frame (handles Writer, Calc).
  try {
    const fi = registerInterceptorOnFrame(docFrame, 'doc frame');
    if (fi) {
      saveInterceptor = fi;
    } else if (!saveInterceptor) {
      // Frame already intercepted but saveInterceptor not set (shouldn't happen).
      console.warn('office_thread: doc frame already intercepted, saveInterceptor not updated');
    }
  } catch(e) {
    console.warn('office_thread: interceptor failed on doc frame:', e);
    hideMenuBar();
    return;
  }

  // Register on ALL frames known to the desktop.
  // Impress dispatches Save/SaveAs via a different frame than ctrl.getFrame(),
  // so we cover every frame to ensure the interceptor is in the dispatch chain.
  // Frames already in interceptedFrameNames (e.g. docFrame) are skipped — this
  // was the main source of duplicate registrations causing the typing hang.
  try {
    const frames = desktop.getFrames();
    const count = frames.getCount();
    console.log('office_thread: checking', count, 'desktop frames for interceptor registration');
    for (let i = 0; i < count; i++) {
      try {
        const f = frames.getByIndex(i);
        const fi = registerInterceptorOnFrame(f, 'desktop frame ' + i);
        if (fi) frameInterceptors.push(fi);
      } catch(e) {
        console.warn('office_thread: desktop frame', i, 'interceptor failed (non-fatal):', e);
      }
    }
  } catch(e) {
    // Fallback: at least try the top-level parent frame.
    console.warn('office_thread: desktop.getFrames() failed, trying top-frame fallback:', e);
    try {
      const topFrame = docFrame.findFrame('_top', 1 + 8); // SELF=1, PARENT=8
      if (topFrame) {
        const fi = registerInterceptorOnFrame(topFrame, 'top frame (fallback)');
        if (fi) saveInterceptorTop = fi;
      }
    } catch(e2) {
      console.warn('office_thread: top-frame fallback also failed:', e2);
    }
  }

  // Register on desktop itself. File > Open (and similar application-level commands)
  // are dispatched through the Desktop dispatcher, not a child frame, so they bypass
  // the frame-level interceptors above. Registering here catches them.
  if (!interceptedFrameNames.has('__desktop__')) {
    try {
      const di = createSaveInterceptor(null);
      desktop.registerDispatchProviderInterceptor(di);
      frameInterceptors.push(di);
      interceptedFrameNames.add('__desktop__');
      console.log('office_thread: save interceptor registered on desktop');
    } catch(e) {
      console.warn('office_thread: desktop interceptor failed (non-fatal):', e);
    }
  }
}

// Listen for new frames created by File > New so we can register our interceptor
// on the new frame before the user tries to save the new document.
function setupFrameListener() {
  try {
    const listenerObj = {
      elementInserted(event) {
        try {
          // event.Element is the new XFrame — register our interceptor on it.
          const f = event && event.Element;
          if (!f) return;
          const fi = registerInterceptorOnFrame(f, 'new frame (File>New)');
          if (fi) frameInterceptors.push(fi);
        } catch(e) {
          console.warn('office_thread: new frame interceptor failed:', e);
        }
      },
      elementRemoved(event) {},
      disposing(event) {},
    };
    framesListener = zetajs.unoObject(
      ['com.sun.star.container.XContainerListener'],
      new Proxy(listenerObj, { get(t, p) { return p in t ? t[p] : function() {}; } })
    );
    desktop.getFrames().addContainerListener(framesListener);
    console.log('office_thread: frame container listener registered');
  } catch(e) {
    console.warn('office_thread: frame container listener failed (non-fatal):', e);
  }
}

function setupSaveListener() {
  const listenerObj = {
    // The UNO IDL method name is "documentEventOccured" (one 'r') — a typo in LO's own API.
    documentEventOccured(event) {
      // Fallback: if a save happens outside our interceptor, upload the result.
      const name = event && event.EventName;
      if (!ownSaveInProgress && (name === 'OnSaveDone' || name === 'OnSaveAsDone')) {
        zetajs.mainPort.postMessage({ cmd: 'saved', isAs: name === 'OnSaveAsDone' });
      }
    },
    disposing(event) {}
  };
  const listenerProxy = new Proxy(listenerObj, {
    get(target, prop) {
      if (prop in target) return target[prop];
      console.log('office_thread: unimplemented listener method called:', prop);
      return function() {};
    }
  });
  docEventListener = zetajs.unoObject(['com.sun.star.document.XDocumentEventListener'], listenerProxy);
  xModel.addDocumentEventListener(docEventListener);
}

// Listen for component changes on the doc frame (e.g. File > New replaces the document
// in the same frame). Re-register our interceptor each time so Save As is caught.
function setupFrameActionListener() {
  const docFrame = ctrl.getFrame();
  try {
    const listenerObj = {
      frameAction(event) {
        const action = event && event.Action;
        // COMPONENT_ATTACHED=4, COMPONENT_REATTACHED=3: new doc loaded into this frame
        if (action === 3 || action === 4) {
          console.log('office_thread: component changed in frame (action=' + action + ')');
          // Update global model/ctrl/docFilename to point to the new document.
          // This ensures Ctrl+S and the HTML "Save As" button save the correct file.
          try {
            const c = docFrame.getController();
            const m = c && c.getModel();
            if (m) {
              xModel = m;
              ctrl = c;
              const u = m.getURL();
              if (u && u.startsWith('file:///tmp/office/')) {
                docFilename = decodeURIComponent(u.slice('file:///tmp/office/'.length));
              } else {
                docFilename = guessFilenameForModel(m);
              }
              console.log('office_thread: xModel updated to new doc, filename:', docFilename);
            }
          } catch(e) {
            console.warn('office_thread: could not update model refs:', e);
          }
          // Re-register interceptor for the new document if not already present.
          try {
            const fi = registerInterceptorOnFrame(docFrame, 'doc frame (component change)');
            if (fi) frameInterceptors.push(fi);
          } catch(e) {
            console.warn('office_thread: re-register after component change failed:', e);
          }
        }
      },
      disposing(event) {},
    };
    frameActionListener = zetajs.unoObject(
      ['com.sun.star.frame.XFrameActionListener'],
      new Proxy(listenerObj, { get(t, p) { return p in t ? t[p] : function() {}; } })
    );
    docFrame.addFrameActionListener(frameActionListener);
    console.log('office_thread: frame action listener registered');
  } catch(e) {
    console.warn('office_thread: frame action listener failed (non-fatal):', e);
  }
}


// Hide LO's menu bar. Pass an explicit frame, or omit to use the current doc frame.
function hideMenuBar(frame) {
  try {
    const dispatcher = css.frame.DispatchHelper.create(context);
    dispatcher.executeDispatch(frame || ctrl.getFrame(), '.uno:Menubar', '', 0, []);
    console.log('office_thread: menu bar hidden');
  } catch(e) {
    console.warn('office_thread: could not hide menu bar:', e);
  }
}

function loadNewDoc(factoryUrl) {
  factoryUrl = factoryUrl || 'private:factory/swriter';
  try { FS.mkdir('/tmp/office/'); } catch {}
  xModel = desktop.loadComponentFromURL(factoryUrl, '_default', 0, []);
  if (!xModel) {
    zetajs.mainPort.postMessage({ cmd: 'error', message: 'Failed to create document' });
    return;
  }
  ctrl = xModel.getCurrentController();
  docFilename = guessFilenameForModel(xModel);
  try {
    const f = ctrl.getFrame();
    mainFrameName = f.getName();
    if (!mainFrameName) {
      mainFrameName = 'weboffice_main';
      f.setName(mainFrameName);
    }
  } catch(e) { mainFrameName = ''; }
  ctrl.getFrame().getContainerWindow().FullScreen = true;
  installCustomFilePicker();
  setupSaveListener();
  setupSaveInterceptor();
  setupFrameListener();
  setupFrameActionListener();

  zetajs.mainPort.postMessage({ cmd: 'ui_ready' });
}

function loadFile(filename) {
  docFilename = filename;
  const in_path = 'file:///tmp/office/' + filename;
  xModel = desktop.loadComponentFromURL(in_path, '_default', 0, []);
  if (!xModel) {
    zetajs.mainPort.postMessage({ cmd: 'error', message: 'Failed to load document' });
    return;
  }
  ctrl = xModel.getCurrentController();
  try {
    const f = ctrl.getFrame();
    mainFrameName = f.getName();
    if (!mainFrameName) {
      // WASM frames often have no name — assign one so File>New can target it.
      mainFrameName = 'weboffice_main';
      f.setName(mainFrameName);
    }
  } catch(e) { mainFrameName = ''; }
  console.log('office_thread: main frame name:', mainFrameName);
  ctrl.getFrame().getContainerWindow().FullScreen = true;
  installCustomFilePicker();
  setupSaveListener();
  setupSaveInterceptor();
  setupFrameListener();
  setupFrameActionListener();

  zetajs.mainPort.postMessage({
    cmd: 'ui_ready'
  });
}

Module.zetajs.then(function(pZetajs) {
  // initializing zetajs environment:
  zetajs = pZetajs;
  css = zetajs.uno.com.sun.star;
  demo(); // launching demo
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
