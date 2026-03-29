/**
 * Peergos file storage for mindmaps.
 *
 * Replaces the open/save dialogs with direct Peergos API calls so the
 * user is sent straight to the Peergos file picker or save dialog with
 * no intermediate step.
 *
 * API used:
 *   GET  /peergos-api/v0/file-picker/?extension=json&writable=true
 *   GET  <path>          – read file (path from picker or ?path= param)
 *   PUT  <path>          – overwrite file
 *   PUT  /peergos-api/v0/save/<filename>   – save-as dialog
 */
(function () {

    /* ── current file path ──────────────────────────────────────────── */
    var currentPath = new URL(window.location.href).searchParams.get('path');

    /* ── capture MindMapModel instance ─────────────────────────────── */
    var _origModel = mindmaps.MindMapModel;
    mindmaps.MindMapModel = function (eventBus, commandRegistry, undoController) {
        _origModel.call(this, eventBus, commandRegistry, undoController);
        mindmaps.MindMapModel._instance = this;
    };
    mindmaps.MindMapModel.prototype = _origModel.prototype;

    /* ── helpers ────────────────────────────────────────────────────── */
    function openFilePicker(onPicked, onError) {
        fetch('/peergos-api/v0/file-picker/?extension=json&writable=true')
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (paths) {
                if (paths && paths.length) onPicked(paths[0]);
            })
            .catch(onError);
    }

    function saveAsDialog(filename, body, onSuccess, onError) {
        fetch('/peergos-api/v0/save/' + encodeURIComponent(filename),
              { method: 'PUT', body: body })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                onSuccess();
            })
            .catch(onError);
    }

    /* ── replace OpenDocumentView/Presenter – no dialog ────────────── */
    mindmaps.OpenDocumentView = function () {};

    mindmaps.OpenDocumentPresenter = function (eventBus, model) {
        this.go = function () {
            openFilePicker(
                function (path) {
                    fetch(path)
                        .then(function (r) {
                            if (!r.ok) throw new Error('HTTP ' + r.status);
                            return r.text();
                        })
                        .then(function (json) {
                            try {
                                currentPath = path;
                                model.setDocument(mindmaps.Document.fromJSON(json));
                            } catch (e) {
                                eventBus.publish(mindmaps.Event.NOTIFICATION_ERROR,
                                    'File is not a valid mind map.');
                            }
                        })
                        .catch(function (err) {
                            eventBus.publish(mindmaps.Event.NOTIFICATION_ERROR,
                                'Could not read file: ' + err.message);
                        });
                },
                function (err) {
                    eventBus.publish(mindmaps.Event.NOTIFICATION_ERROR,
                        'File picker failed: ' + err.message);
                }
            );
        };
    };

    /* ── replace SaveDocumentView/Presenter – no dialog ────────────── */
    mindmaps.SaveDocumentView = function () {};

    mindmaps.SaveDocumentPresenter = function (eventBus, model) {
        this.go = function () {
            var doc  = model.getDocument().prepareSave();
            var json = doc.serialize();
            var name = model.getMindMap().getRoot().getCaption() + '.json';

            function onSuccess() {
                eventBus.publish(mindmaps.Event.DOCUMENT_SAVED, doc);
            }
            function onError(err) {
                eventBus.publish(mindmaps.Event.NOTIFICATION_ERROR,
                    'Save failed: ' + err.message);
            }

            if (currentPath) {
                fetch(currentPath, { method: 'PUT', body: json })
                    .then(function (r) {
                        if (!r.ok) throw new Error('HTTP ' + r.status);
                        onSuccess();
                    })
                    .catch(onError);
            } else {
                saveAsDialog(name, json, onSuccess, onError);
            }
        };
    };

    /* ── auto-load on startup when launched with ?path= ─────────────── */
    $(document).ready(function () {
        if (!currentPath) return;

        fetch(currentPath)
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.text();
            })
            .then(function (json) {
                var model = mindmaps.MindMapModel._instance;
                if (!model) return;
                try {
                    model.setDocument(mindmaps.Document.fromJSON(json));
                } catch (e) {
                    console.error('Could not parse mind map:', e);
                }
            })
            .catch(function (err) {
                console.error('Could not fetch mind map from Peergos:', err);
            });
    });

})();
