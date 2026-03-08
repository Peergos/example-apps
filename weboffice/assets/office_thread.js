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
  let pdfExportDispatch = null;

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
      const cmd = url && (url.Complete || url.Main || '');
      console.log('office_thread: queryDispatch:', cmd);
      if (cmd === '.uno:Save' || cmd === 'slot:5000') {
        if (!saveDispatch) saveDispatch = makeSaveDispatchInner(false);
        return saveDispatch;
      }
      if (cmd === '.uno:SaveAs' || cmd === '.uno:SaveACopy' || cmd === 'slot:5002' || cmd === 'slot:5523') {
        if (!saveAsDispatch) saveAsDispatch = makeSaveDispatchInner(true);
        return saveAsDispatch;
      }
      if (cmd === '.uno:ExportToPDF' || cmd === '.uno:ExportDirectToPDF') {
        if (!pdfExportDispatch) pdfExportDispatch = makePdfExportDispatchInner();
        return pdfExportDispatch;
      }
      // Intercept File > New commands. Redirect to loadComponentFromURL so the new
      // document is properly wired into the XFrame dispatch chain (making Save As
      // interceptable). LO's internal File>New path bypasses XDispatchProviderInterceptor.
      // NOTE: LO's File>New submenu dispatches the raw factory URL (e.g.
      // "private:factory/simpress?slot=6686"), not a .uno: command. We catch both forms.
      if (cmd === '.uno:NewDoc' || cmd === '.uno:Presentation' ||
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
        try { return slaveProvider.queryDispatch(url, targetFrameName, searchFlags); } catch(e) {}
      }
      return null;
    },
    // queryDispatches intentionally omitted — returning [] caused Impress to cache
    // slave dispatchers for batch-queried commands, bypassing our interceptor on click.
    // With queryDispatches absent, LO falls back to individual queryDispatch calls.
    getSlaveDispatchProvider() { return slaveProvider; },
    setSlaveDispatchProvider(provider) { slaveProvider = provider; },
    getMasterDispatchProvider() { return masterProvider; },
    setMasterDispatchProvider(provider) { masterProvider = provider; },
  };

  return zetajs.unoObject([
    'com.sun.star.frame.XDispatchProviderInterceptor',
    'com.sun.star.frame.XDispatchProvider',
  ], new Proxy(interceptorObj, { get(t, p) { return p in t ? t[p] : function() {}; } }));
}

function setupSaveInterceptor() {
  const docFrame = ctrl.getFrame();

  // Register on the document frame (handles Writer, Calc).
  try {
    saveInterceptor = createSaveInterceptor(docFrame);
    docFrame.registerDispatchProviderInterceptor(saveInterceptor);
    console.log('office_thread: save interceptor registered on doc frame');
  } catch(e) {
    console.warn('office_thread: interceptor failed on doc frame:', e);
    hideMenuBar();
    return;
  }

  // Register on ALL frames known to the desktop.
  // Impress dispatches Save/SaveAs via a different frame than ctrl.getFrame(),
  // so we cover every frame to ensure the interceptor is in the dispatch chain.
  try {
    const frames = desktop.getFrames();
    const count = frames.getCount();
    console.log('office_thread: registering interceptor on', count, 'desktop frames');
    for (let i = 0; i < count; i++) {
      try {
        const f = frames.getByIndex(i);
        const fi = createSaveInterceptor(f);
        f.registerDispatchProviderInterceptor(fi);
        frameInterceptors.push(fi);
        console.log('office_thread: save interceptor registered on desktop frame', i);
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
        saveInterceptorTop = createSaveInterceptor(topFrame);
        topFrame.registerDispatchProviderInterceptor(saveInterceptorTop);
        console.log('office_thread: save interceptor registered on top frame (fallback)');
      }
    } catch(e2) {
      console.warn('office_thread: top-frame fallback also failed:', e2);
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
          const fi = createSaveInterceptor(f);
          f.registerDispatchProviderInterceptor(fi);
          frameInterceptors.push(fi);
          console.log('office_thread: save interceptor registered on new frame (File>New)');
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
          // Re-register interceptor for the new document.
          try {
            const fi = createSaveInterceptor(docFrame);
            docFrame.registerDispatchProviderInterceptor(fi);
            frameInterceptors.push(fi);
            console.log('office_thread: interceptor re-registered after component change');
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