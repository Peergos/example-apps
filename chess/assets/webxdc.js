// debug friend: document.writeln(JSON.stringify(value));
//@ts-check
/** @type {import('./webxdc').Webxdc<any>} */
//quick hack to get this to work in peergos
//TODO get rid of use of localStorage
window.webxdc = (() => {
    var updateListener = (_) => {};
    var updatesKey = "__xdcUpdatesKey__";
    window.addEventListener('storage', (event) => {
        if (event.key == null) {
            window.location.reload();
        } else if (event.key === updatesKey) {
            var updates = JSON.parse(event.newValue);
            var update = updates[updates.length-1];
            update.max_serial = updates.length;
            console.log("[Webxdc] " + JSON.stringify(update));
            updateListener(update);
        }
    });
    window.localStorage.clear();
	var messagesRead = 0;
    let href = window.location.href
    let url = new URL(href);
    let username = url.searchParams.get("username");
    var chatId = url.searchParams.get("chatId");
    var polling = false;
    function poll() {
        getUpdates(updates => {
            updates.forEach((update) => {
                updateListener(update);
            });
            setTimeout(() => poll(), 5000);
        });
    }
    function getChatUpdates(callback) {
        if (chatId == null) {
            callback([]);
        } else {
            let params = '?from=' + messagesRead + '&to=' + (messagesRead + 10);
            fetch('/peergos-api/v0/chat/' + chatId + params, { method: 'GET' }).then(function(response) {
                if (response.status === 200) {
                    response.arrayBuffer().then(function(buffer) {
                        let body = new TextDecoder().decode(buffer);
                        let items = JSON.parse(body);
                        messagesRead = messagesRead + items.count;
                        callback(items.messages);
                    });
                } else {
                    console.log('call to get messages failed');
                    callback([]);
                }
            });
        }
	}
    function getUpdates(callback) {
        getChatUpdates( msgs => {
            if (chatId == null) {
                callback([]);
            }
            var updatesJSON = window.localStorage.getItem(updatesKey);
            if (updatesJSON == null) {
                updatesJSON = [];
            } else {
                updatesJSON = JSON.parse(updatesJSON);
            }
            let newAppMsgs = [];
            for(var i = 0; i < msgs.length; i++) {
                let update = msgs[i];
                if (update.type == 'Application') {
                    let appMsg = window.atob(update.text);
                    let msg = JSON.parse(appMsg);
                    updatesJSON.push(msg);
                    newAppMsgs.push(msg);
                }
            }
            if (updatesJSON.length > 0) {
                window.localStorage.setItem(updatesKey, JSON.stringify(updatesJSON));
                callback(newAppMsgs);
            } else {
                callback([]);
            }
        });
    }

    return {
        selfAddr: username,
        selfName: username,
        setUpdateListener: (cb, serial = 0) => {
            return new Promise(function(resolve, reject) {
                getUpdates(updates => {
                    var maxSerial = updates.length;
                    updates.forEach((update) => {
                        if (update.serial > serial) {
                            update.max_serial = maxSerial;
                            cb(update);
                        }
                    });
                    updateListener = cb;
                    resolve();
                });
            });
        },
        createChat: (callback) => {
            if (chatId != null) {
                callback(chatId);
            } else {
                let data = new FormData();
                data.append("title", "game-chat");
                data.append("maxInvites", 1);
                console.log('creating chat');
                fetch('/peergos-api/v0/chat/', { method: 'POST', headers: {}, body: data }).then(function(response) {
                    if (response.status === 201) {
                        chatId = response.headers.get('location');
                        callback(chatId);
                    } else {
                        console.log('chat not created...');
                    }
                });
            }
        },
        sendUpdate: (update, description) => {
            getUpdates(updates => {
                var serial = updates.length + 1;
                var _update = {payload: update.payload, summary: update.summary, info: update.info, serial: serial};
                updates.push(_update);
                let data = new FormData();
                _update.max_serial = serial;
                data.append("text", window.btoa(JSON.stringify(_update)));
                fetch('/peergos-api/v0/chat/' + chatId, { method: 'PUT', headers: {}, body: data })
                    .then(function(response) {
                    if (response.status === 201) {
                        //window.localStorage.setItem(updatesKey, JSON.stringify(updates));
                        //_update.max_serial = serial;
                        console.log('[Webxdc] description="' + description + '", ' + JSON.stringify(_update));
                        if (!polling) {
                            polling = true;
                            poll();
                        }
                    } else {
                        console.log('message not sent');
                    }
                });
            });
        },
    };
})();

window.alterXdcApp = () => {
    var styleControlPanel = 'position: fixed; bottom:1em; left:1em; background-color: #000; opacity:0.8; padding:.5em; font-size:16px; font-family: sans-serif; color:#fff; z-index: 9999';
    var styleMenuLink = 'color:#fff; text-decoration: none; vertical-align: middle';
    var styleAppIcon = 'height: 1.5em; width: 1.5em; margin-right: 0.5em; border-radius:10%; vertical-align: middle';
    var title = document.getElementsByTagName('title')[0];
    if (typeof title == 'undefined') {
        title = document.createElement('title');
        document.getElementsByTagName('head')[0].append(title);
    }
    title.innerText = window.webxdc.selfAddr;
}

window.addEventListener("load", window.alterXdcApp);
