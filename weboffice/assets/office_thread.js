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
        // Called from the message handler (not a LO UNO callback), so store() is safe here.
        ownSaveInProgress = true;
        xModel.store();
        ownSaveInProgress = false;
        zetajs.mainPort.postMessage({ cmd: 'saved', isAs: false });
        break;
      case 'triggerSaveAs':
        // Called from the message handler (not a LO UNO callback), so store() is safe here.
        ownSaveInProgress = true;
        xModel.store();
        ownSaveInProgress = false;
        zetajs.mainPort.postMessage({ cmd: 'saved', isAs: true });
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
let saveInterceptor = null;   // keep alive

// XDispatch implementation that calls xModel.store() and notifies the main thread.
function makeSaveDispatch(isAs) {
  const obj = {
    dispatch(url, args) {
      console.log('office_thread: save intercepted via XDispatch, isAs=' + isAs);
      ownSaveInProgress = true;
      try { xModel.store(); } catch(e) { console.warn('store() failed:', e); }
      ownSaveInProgress = false;
      zetajs.mainPort.postMessage({ cmd: 'saved', isAs });
    },
    addStatusListener(listener, url) {},
    removeStatusListener(listener, url) {},
  };
  return zetajs.unoObject(['com.sun.star.frame.XDispatch'], new Proxy(obj, {
    get(t, p) { return p in t ? t[p] : function() {}; }
  }));
}

// XDispatchProviderInterceptor: intercepts .uno:Save and .uno:SaveAs dispatches.
// queryDispatches(sequence<DispatchDescriptor>) is not called for menu dispatches —
// only queryDispatch is called. We return empty array for queryDispatches as a safety net;
// LO uses it only for toolbar state queries.
function setupSaveInterceptor() {
  let slaveProvider = null;
  let masterProvider = null;
  let saveDispatch = null;
  let saveAsDispatch = null;

  const interceptorObj = {
    // XDispatchProvider
    queryDispatch(url, targetFrameName, searchFlags) {
      const cmd = url && (url.Complete || url.Main || '');
      console.log('office_thread: queryDispatch:', cmd);
      if (cmd === '.uno:Save' || cmd === 'slot:5000') {
        if (!saveDispatch) saveDispatch = makeSaveDispatch(false);
        return saveDispatch;
      }
      if (cmd === '.uno:SaveAs' || cmd === '.uno:SaveACopy' || cmd === 'slot:5002' || cmd === 'slot:5523') {
        if (!saveAsDispatch) saveAsDispatch = makeSaveDispatch(true);
        return saveAsDispatch;
      }
      if (slaveProvider) {
        try { return slaveProvider.queryDispatch(url, targetFrameName, searchFlags); } catch(e) {}
      }
      return null;
    },
    queryDispatches(/*sequence<DispatchDescriptor>*/ requests) {
      // Not called for menu dispatches; sequence type not registered so we cannot
      // unmarshal the argument. Return empty array — toolbar state queries will degrade gracefully.
      return [];
    },
    // XDispatchProviderInterceptor
    getSlaveDispatchProvider() { return slaveProvider; },
    setSlaveDispatchProvider(provider) { slaveProvider = provider; },
    getMasterDispatchProvider() { return masterProvider; },
    setMasterDispatchProvider(provider) { masterProvider = provider; },
  };

  const interceptorProxy = new Proxy(interceptorObj, {
    get(t, p) { return p in t ? t[p] : function() {}; }
  });

  try {
    saveInterceptor = zetajs.unoObject([
      'com.sun.star.frame.XDispatchProviderInterceptor',
      'com.sun.star.frame.XDispatchProvider',
    ], interceptorProxy);
    ctrl.getFrame().registerDispatchProviderInterceptor(saveInterceptor);
    console.log('office_thread: save interceptor registered');
  } catch(e) {
    console.warn('office_thread: interceptor registration failed, hiding menu bar instead:', e);
    hideMenuBar();
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

// Hide LO's menu bar as a fallback if the dispatch interceptor fails.
function hideMenuBar() {
  try {
    const dispatcher = css.frame.DispatchHelper.create(context);
    dispatcher.executeDispatch(ctrl.getFrame(), '.uno:Menubar', '', 0, []);
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
  ctrl.getFrame().getContainerWindow().FullScreen = true;
  setupSaveListener();
  setupSaveInterceptor();
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