/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

// Debugging note:
// Switch the web worker in the browsers debug tab to debug this code.
// It's the "em-pthread" web worker with the most memory usage, where "zetajs" is defined.

'use strict';

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
            		console.log('i=' + i);
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
  config = css.configuration.ReadWriteAccess.create(context, 'en-US');

  configDisableToolbars(["Base", "Calc", "Draw", "Impress", "Math", "Writer"]);

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
  ctrl = xModel.getCurrentController();
  dispatch(ctrl, 'Sidebar');
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