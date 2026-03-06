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
let context, desktop, xModel, ctrl, config;

    /**
     * Turn off toolbars.
     * @param officeModules - ["Base", "Calc", "Draw", "Impress", "Math", "Writer"];
     */
function configDisableToolbars(officeModules) {
        for (const mod of officeModules) {
            const modName = "/org.openoffice.Office.UI." + mod + "WindowState/UIElements/States";
            const uielems = config.getByHierarchicalName(modName);
            for (const i of uielems.getElementNames()) {
                if (i.startsWith("private:resource/toolbar/standardbar")) {
                    const uielem = uielems.getByName(i); // SLOW OPERATION
                    if (uielem.getByName('Visible')) {
                        uielem.setPropertyValue('Visible', false);
                    }
                }
            }
        }
        config.commitChanges();
}
    /**
     * @param unoUrl - string following ".uno:" (e.g. "Bold")
     */
    function transformUrl(unoUrl) {
        const ioparam = { val: new css.util.URL({ Complete: '.uno:' + unoUrl }) };
        css.util.URLTransformer.create(context).parseStrict(ioparam);
        return ioparam.val;
    }
    function queryDispatch(ctrl, urlObj) {
        return ctrl.queryDispatch(urlObj, '_self', 0);
    }
    function dispatch(ctrl, unoUrl, params = []) {
        const urlObj = transformUrl(unoUrl);
        queryDispatch(ctrl, urlObj).dispatch(urlObj, params);
    }

function demo() {
  context = zetajs.getUnoComponentContext();
  const bean_overwrite = new css.beans.PropertyValue({
    Name: 'Overwrite',
    Value: true
  });
  const bean_odt_export = new css.beans.PropertyValue({
    Name: 'FilterName',
    Value: 'writer8'
  });
  desktop = css.frame.Desktop.create(context);

  zetajs.mainPort.onmessage = function(e) {
    switch (e.data.cmd) {
      case 'upload':
        loadFile(e.data.filename);
        break;
      case 'download':
        xModel.store();
        zetajs.mainPort.postMessage({
          cmd: 'download',
          id: e.data.id
        });
        break;
      default:
        throw Error('Unknown message command: ' + e.data.cmd);
    }
  }
  zetajs.mainPort.postMessage({
    cmd: 'thr_running'
  });
}

function loadFile(filename) {
  const in_path = 'file:///tmp/office/' + filename;
  xModel = desktop.loadComponentFromURL(in_path, '_default', 0, []);
  if (!xModel) {
    zetajs.mainPort.postMessage({ cmd: 'error', message: 'Failed to load document' });
    return;
  }
  ctrl = xModel.getCurrentController();
  ctrl.getFrame().getContainerWindow().FullScreen = true;
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