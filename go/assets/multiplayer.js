/**
 * Multiplayer support for Peer-Go using the Peergos chat API directly.
 *
 * Message payload types sent through the chat:
 *   {type:'init',  blackAddr:str}           – creator announces colour
 *   {type:'join',  whiteAddr:str}           – joiner claims white
 *   {type:'move',  row:int, col:int}        – stone placement
 *   {type:'pass'}                           – player passes
 *   {type:'resign'}                         – player resigns
 */
var MultiplayerGame = (function () {

    /* ── URL / identity ────────────────────────────────────────────── */
    var _url      = new URL(window.location.href);
    var myAddr    = _url.searchParams.get('username') || 'unknown';
    var chatId    = _url.searchParams.get('chatId');

    /* ── game state ─────────────────────────────────────────────────── */
    var blackAddr        = null;
    var whiteAddr        = null;
    var myColor          = null;   // Constants.Color.BLACK / WHITE
    var gameStarted      = false;
    var consecutivePasses = 0;
    var messagesRead     = 0;      // cursor into the chat log
    var seen             = {};     // uuid → true, deduplication
    var pollTimer        = null;

    /* ── helpers ─────────────────────────────────────────────────────── */
    function uuid() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c) {
            return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
        });
    }

    function isMyTurn() {
        if (!gameStarted) return false;
        var cur = gGameState.currentPlayer.color;
        return (cur === Constants.Color.BLACK && myAddr === blackAddr) ||
               (cur === Constants.Color.WHITE && myAddr === whiteAddr);
    }

    /* ── chat API ────────────────────────────────────────────────────── */
    function fetchMessages(callback) {
        if (!chatId) { callback([]); return; }
        var params = '?from=' + messagesRead + '&to=' + (messagesRead + 20);
        fetch('/peergos-api/v0/chat/' + chatId + params, { method: 'GET' })
            .then(function (r) { return r.json(); })
            .then(function (body) {
                messagesRead += body.count;
                callback(body.messages || []);
            })
            .catch(function () { callback([]); });
    }

    function sendMessage(payload, callback) {
        var msg = { uuid: uuid(), payload: payload };
        var data = new FormData();
        data.append('text', btoa(JSON.stringify(msg)));
        fetch('/peergos-api/v0/chat/' + chatId, { method: 'PUT', body: data })
            .then(function (r) {
                if (r.status === 201) {
                    // process our own message immediately (optimistic)
                    seen[msg.uuid] = true;
                    handlePayload(payload);
                    if (callback) callback();
                } else {
                    console.warn('Go: message send failed', r.status);
                }
            })
            .catch(function (e) { console.error('Go: send error', e); });
    }

    function createChat(callback) {
        var data = new FormData();
        data.append('title', 'go-game');
        data.append('maxInvites', 1);
        fetch('/peergos-api/v0/chat/', { method: 'POST', body: data })
            .then(function (r) {
                if (r.status === 201) {
                    chatId = r.headers.get('location');
                    callback(chatId);
                } else {
                    console.warn('Go: chat creation failed', r.status);
                }
            })
            .catch(function (e) { console.error('Go: createChat error', e); });
    }

    /* ── polling ─────────────────────────────────────────────────────── */
    function poll() {
        fetchMessages(function (msgs) {
            msgs.forEach(function (m) {
                if (m.type !== 'Application') return;
                try {
                    var msg = JSON.parse(atob(m.text));
                    if (!seen[msg.uuid]) {
                        seen[msg.uuid] = true;
                        handlePayload(msg.payload);
                    }
                } catch (e) { /* ignore malformed */ }
            });
        });
        pollTimer = setTimeout(poll, 5000);
    }

    function startPolling() {
        if (!pollTimer) poll();
    }

    /* ── game logic helpers ──────────────────────────────────────────── */
    function switchTurn() {
        gGameState.currentPlayer = (gGameState.currentPlayer === gGameState.player1)
            ? gGameState.player2 : gGameState.player1;
    }

    function applyMove(row, col) {
        var result = Ish.Go.Logic.move(row, col);
        if (result) {
            Ish.Go.View.update(result);
            consecutivePasses = 0;
            refreshStatus();
        }
    }

    function applyPass() {
        switchTurn();
        consecutivePasses++;
        Ish.Go.View.drawInfo();
        if (consecutivePasses >= 2) {
            endGame('two consecutive passes');
        } else {
            refreshStatus();
        }
    }

    function applyResign(addr) {
        var winner = (addr === blackAddr) ? 'White' : 'Black';
        showResult(winner + ' wins – opponent resigned');
    }

    function endGame(reason) {
        Ish.Go.Logic.setScores();
        var p1 = gGameState.player1, p2 = gGameState.player2;
        var winner;
        if (p1.score > p2.score) winner = cap(p1.color);
        else if (p2.score > p1.score) winner = cap(p2.color);
        else winner = 'Neither player';
        showResult(winner + ' wins (' + reason + '). Black: ' + p1.score + '  White: ' + p2.score);
    }

    function showResult(text) {
        gameStarted = false;
        clearTimeout(pollTimer);
        pollTimer = null;
        $('#mpResult').text(text).show();
        $('#mpActions').hide();
        refreshStatus();
    }

    function startGame() {
        if (gameStarted) return;
        gameStarted = true;
        consecutivePasses = 0;
        myColor = (myAddr === blackAddr) ? Constants.Color.BLACK : Constants.Color.WHITE;

        $('#mpSetup').hide();
        $('#gameSection').show();
        $('#mpActions').show();
        $('#mpResult').hide();

        Ish.Go.Logic.newGame(19, 19);
        Ish.Go.View.redraw();
        refreshStatus();
        startPolling();
    }

    function refreshStatus() {
        if (!gameStarted) {
            $('#mpStatus').text('');
            return;
        }
        var cur = gGameState.currentPlayer.color;
        var yours = isMyTurn();
        $('#mpStatus').html(
            'You are <b>' + cap(myColor) + '</b>. ' +
            (yours ? '<span class="mp-your-turn">Your turn</span>'
                   : '<span class="mp-waiting">Waiting for opponent…</span>')
        );
    }

    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    /* ── incoming message dispatcher ─────────────────────────────────── */
    function handlePayload(payload) {
        if (!payload) return;
        switch (payload.type) {
            case 'init':
                blackAddr = payload.blackAddr;
                if (myAddr !== blackAddr && !whiteAddr) {
                    whiteAddr = myAddr;
                    sendMessage({ type: 'join', whiteAddr: myAddr });
                    startGame();
                }
                break;

            case 'join':
                if (!whiteAddr) whiteAddr = payload.whiteAddr;
                if (blackAddr && whiteAddr) startGame();
                break;

            case 'move':
                if (gameStarted) applyMove(payload.row, payload.col);
                break;

            case 'pass':
                if (gameStarted) applyPass();
                break;

            case 'resign':
                if (gameStarted) applyResign(payload.addr);
                break;
        }
    }

    /* ── override Ish.Go.View.placePiece ─────────────────────────────── */
    function hookView() {
        Ish.Go.View.placePiece = function (point) {
            if (!gameStarted) return;
            if (!isMyTurn()) return;   // silently ignore off-turn clicks

            if (!Ish.Go.Logic.isValidMove(point, gGameState.currentPlayer)) {
                var msg = 'Invalid move';
                if (gGameState.moveError) msg += ':\n' + gGameState.moveError;
                alert(msg);
                return;
            }

            sendMessage({ type: 'move', row: point.row, col: point.column });
        };
    }

    /* ── public API ──────────────────────────────────────────────────── */
    return {

        init: function () {
            hookView();

            if (chatId) {
                // Opened via invite – load history then auto-join
                $('#mpSetup').html('<p>Joining game…</p>');
                fetchMessages(function (msgs) {
                    msgs.forEach(function (m) {
                        if (m.type !== 'Application') return;
                        try {
                            var msg = JSON.parse(atob(m.text));
                            seen[msg.uuid] = true;
                            handlePayload(msg.payload);
                        } catch (e) { /* skip */ }
                    });
                    if (!blackAddr) {
                        $('#mpSetup').html('<p>No game found in this chat.</p>');
                    }
                    startPolling();
                });
            }
            // else: show the "New Game" button (already in HTML)
        },

        createGame: function () {
            $('#mpNewGameBtn').prop('disabled', true).text('Creating…');
            createChat(function (id) {
                $('#mpInviteRow').show();
                $('#mpSetup').find('p').first()
                    .text('Waiting for opponent to join…');

                sendMessage({ type: 'init', blackAddr: myAddr });
                startPolling();
            });
        },

        pass: function () {
            if (!gameStarted || !isMyTurn()) return;
            sendMessage({ type: 'pass', addr: myAddr });
        },

        resign: function () {
            if (!gameStarted) return;
            if (confirm('Resign?')) {
                sendMessage({ type: 'resign', addr: myAddr });
            }
        }
    };

})();

/* ── bootstrap ───────────────────────────────────────────────────────── */
// Override the window.onload set in ish.go.js
window.onload = function () {
    // Prime gGameState so logic functions have something to work with
    // before the real game starts.
    gGameState = new GameState(
        19, 19,
        new Player(Constants.Color.BLACK, Constants.PointState.BLACK),
        new Player(Constants.Color.WHITE, Constants.PointState.WHITE)
    );
    MultiplayerGame.init();
};
