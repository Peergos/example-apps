/**
 * Multiplayer Peer-Go – SPA with game list + game view.
 *
 * Message payload types:
 *   {type:'init',   blackAddr:str}      – creator claims Black
 *   {type:'join',   whiteAddr:str}      – joiner claims White
 *   {type:'move',   row:int, col:int}   – stone placement
 *   {type:'pass'}                       – player passes
 *   {type:'resign'}                     – player resigns
 */
var App = (function () {

    var _url   = new URL(window.location.href);
    var myAddr = _url.searchParams.get('username') || 'unknown';

    /* ══════════════════════════════════════════════════════════════════
       CHAT API HELPERS
    ══════════════════════════════════════════════════════════════════ */

    function createChat(callback) {
        var data = new FormData();
        data.append('title', 'go-game');
        data.append('maxInvites', 1);
        fetch('/peergos-api/v0/chat/', { method: 'POST', body: data })
            .then(function (r) {
                if (r.status === 201) callback(r.headers.get('location'));
                else console.warn('Go: createChat failed', r.status);
            })
            .catch(function (e) { console.error('Go: createChat error', e); });
    }

    function listChats(callback) {
        fetch('/peergos-api/v0/chat/')
            .then(function (r) { return r.json(); })
            .then(function (chats) {
                callback((chats || []).map(function (c) { return c.chatId; }));
            })
            .catch(function () { callback([]); });
    }

    function fetchMessages(chatId, from, to, callback) {
        fetch('/peergos-api/v0/chat/' + chatId + '?from=' + from + '&to=' + to)
            .then(function (r) { return r.json(); })
            .then(function (body) { callback(body.messages || [], body.count || 0); })
            .catch(function () { callback([], 0); });
    }

    function sendRaw(chatId, payload, onSuccess) {
        var msg  = { uuid: uuidv4(), payload: payload };
        var data = new FormData();
        data.append('text', btoa(JSON.stringify(msg)));
        fetch('/peergos-api/v0/chat/' + chatId, { method: 'PUT', body: data })
            .then(function (r) { if (r.status === 201 && onSuccess) onSuccess(msg); })
            .catch(function (e) { console.error('Go: send error', e); });
    }

    function uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function (c) {
            return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
        });
    }

    function parseAppMessages(rawMessages) {
        var out = [];
        rawMessages.forEach(function (m) {
            if (m.type !== 'Application') return;
            try { out.push(JSON.parse(atob(m.text))); } catch (e) { /* skip */ }
        });
        return out;
    }

    /* ── derive high-level game state from ordered payloads ─────────── */
    function analyseGame(chatId, appMessages) {
        var black = null, white = null, moves = 0;
        var consecutivePasses = 0, lastWasPass = false, gameOver = false;

        appMessages.forEach(function (msg) {
            var p = msg.payload;
            if (!p) return;
            switch (p.type) {
                case 'init':   black = p.blackAddr; break;
                case 'join':   white = p.whiteAddr; break;
                case 'move':   moves++; consecutivePasses = 0; lastWasPass = false; break;
                case 'pass':
                    moves++;
                    consecutivePasses = lastWasPass ? consecutivePasses + 1 : 1;
                    lastWasPass = true;
                    if (consecutivePasses >= 2) gameOver = true;
                    break;
                case 'resign': gameOver = true; break;
            }
        });

        var blackToMove = (moves % 2 === 0);
        var myTurn = !gameOver && white !== null &&
            ((blackToMove && myAddr === black) || (!blackToMove && myAddr === white));

        return {
            chatId:   chatId,
            black:    black,
            white:    white,
            moves:    moves,
            gameOver: gameOver,
            waiting:  black !== null && white === null,
            myTurn:   myTurn
        };
    }

    /* ══════════════════════════════════════════════════════════════════
       GAME LIST VIEW
    ══════════════════════════════════════════════════════════════════ */

    function showList() {
        resetGameState();
        $('#gameSection').hide();
        $('#mpSetup').show();
        $('#gameListItems').html('<p>Loading games…</p>');
        $('#mpNewGameBtn').prop('disabled', false).text('New Game');

        listChats(function (chatIds) {
            if (!chatIds || !chatIds.length) {
                $('#gameListItems').html('<p>No games yet.</p>');
                return;
            }

            var results   = [];
            var remaining = chatIds.length;

            chatIds.forEach(function (id) {
                fetchMessages(id, 0, 200, function (msgs) {
                    results.push(analyseGame(id, parseAppMessages(msgs)));
                    if (--remaining === 0) renderList(results);
                });
            });
        });
    }

    function renderList(states) {
        function priority(s) {
            if (!s.black)   return 99;
            if (s.myTurn)   return 0;
            if (s.waiting)  return 1;
            if (!s.gameOver) return 2;
            return 3;
        }
        states.sort(function (a, b) { return priority(a) - priority(b); });

        var html = '';
        states.forEach(function (s) {
            if (!s.black) return;

            var myColor  = s.black === myAddr ? 'Black' : s.white === myAddr ? 'White' : 'Observer';
            var opponent = myColor === 'Black' ? s.white : s.black;
            var oppLabel = opponent || '(waiting for opponent)';

            var statusText, statusCls;
            if (s.gameOver)      { statusText = 'Game over';            statusCls = 'status-done'; }
            else if (s.waiting)  { statusText = 'Waiting for opponent'; statusCls = 'status-waiting'; }
            else if (s.myTurn)   { statusText = 'Your turn';            statusCls = 'status-your-turn'; }
            else                 { statusText = "Opponent's turn";       statusCls = 'status-opponent'; }

            html += '<div class="game-entry" data-chatid="' + s.chatId + '">' +
                '<span class="game-color">' + myColor + '</span>' +
                ' vs <span class="game-opponent">' + oppLabel + '</span>' +
                '&nbsp;<span class="game-status ' + statusCls + '">' + statusText + '</span>' +
                '<span class="game-delete" data-chatid="' + s.chatId + '">&times;</span>' +
                '</div>';
        });

        if (!html) html = '<p>No games yet.</p>';
        $('#gameListItems').html(html);
        $('.game-entry').click(function () { openGame($(this).attr('data-chatid')); });
        $('.game-delete').click(function (e) {
            e.stopPropagation();
            var id = $(this).attr('data-chatid');
            if (!confirm('Delete this game?')) return;
            fetch('/peergos-api/v0/chat/' + id, { method: 'DELETE' })
                .then(function (r) {
                    if (r.status === 204) showList();
                    else console.warn('Go: deleteChat failed', r.status);
                });
        });
    }

    /* ══════════════════════════════════════════════════════════════════
       GAME VIEW
    ══════════════════════════════════════════════════════════════════ */

    var chatId            = null;
    var blackAddr         = null;
    var whiteAddr         = null;
    var myColor           = null;
    var gameStarted       = false;
    var consecutivePasses = 0;
    var messagesRead      = 0;
    var seen              = {};
    var pollTimer         = null;
    var history           = []; // {type:'move'|'pass', row, col} in play order
    var viewIndex         = 0;  // number of history entries currently shown

    function isLive() { return viewIndex === history.length; }

    function resetGameState() {
        clearTimeout(pollTimer);
        pollTimer = chatId = blackAddr = whiteAddr = myColor = null;
        gameStarted = false;
        consecutivePasses = messagesRead = viewIndex = 0;
        history = [];
        seen = {};
    }

    function openGame(id) {
        resetGameState();
        chatId = id;
        $('#mpSetup').hide();
        $('#gameSection').show();
        $('#mpStatus').text('Loading game…');
        $('#mpResult').hide();
        $('#mpActions').hide();

        fetchMessages(chatId, 0, 200, function (msgs, count) {
            messagesRead = count;
            parseAppMessages(msgs).forEach(function (msg) {
                seen[msg.uuid] = true;
                handlePayload(msg.payload);
            });
            if (!blackAddr) $('#mpStatus').text('No game found in this chat.');
            startPolling();
        });
    }

    function isMyTurn() {
        if (!gameStarted) return false;
        var cur = gGameState.currentPlayer.color;
        return (cur === Constants.Color.BLACK && myAddr === blackAddr) ||
               (cur === Constants.Color.WHITE && myAddr === whiteAddr);
    }

    function switchTurn() {
        gGameState.currentPlayer = (gGameState.currentPlayer === gGameState.player1)
            ? gGameState.player2 : gGameState.player1;
    }

    function applyMove(row, col) {
        var wasLive = isLive();
        history.push({ type: 'move', row: row, col: col });
        consecutivePasses = 0;
        if (wasLive) {
            viewIndex = history.length;
            var result = Ish.Go.Logic.move(row, col);
            if (result) Ish.Go.View.update(result);
            refreshStatus();
        }
        updateMoveNav();
    }

    function applyPass() {
        var wasLive = isLive();
        history.push({ type: 'pass' });
        consecutivePasses++;
        if (wasLive) {
            viewIndex = history.length;
            switchTurn();
            Ish.Go.View.drawInfo();
            if (consecutivePasses >= 2) endGame('two consecutive passes');
            else refreshStatus();
        }
        updateMoveNav();
    }

    /* ── replay board state up to (but not including) index n ────────── */
    function replayTo(n) {
        Ish.Go.Logic.newGame(19, 19);
        for (var i = 0; i < n; i++) {
            var h = history[i];
            if (h.type === 'move') {
                Ish.Go.Logic.move(h.row, h.col);
            } else if (h.type === 'pass') {
                switchTurn();
            }
        }
        Ish.Go.View.redraw();
        updateMoveNav();
    }

    function updateMoveNav() {
        $('#btnBack').prop('disabled', viewIndex === 0);
        $('#btnForward').prop('disabled', isLive());
        $('#moveCount').text(viewIndex + ' / ' + history.length);
    }

    function applyResign(addr) {
        showResult((addr === blackAddr ? 'White' : 'Black') + ' wins – opponent resigned');
    }

    function endGame(reason) {
        Ish.Go.Logic.setScores();
        var p1 = gGameState.player1, p2 = gGameState.player2;
        var winner = p1.score > p2.score ? cap(p1.color)
                   : p2.score > p1.score ? cap(p2.color) : 'Neither player';
        showResult(winner + ' wins (' + reason + '). Black: ' + p1.score + '  White: ' + p2.score);
    }

    function showResult(text) {
        gameStarted = false;
        clearTimeout(pollTimer); pollTimer = null;
        $('#mpResult').text(text).show();
        $('#mpActions').hide();
        refreshStatus();
    }

    function startGame() {
        if (gameStarted) return;
        gameStarted = true;
        consecutivePasses = 0;
        myColor = (myAddr === blackAddr) ? Constants.Color.BLACK : Constants.Color.WHITE;
        $('#mpActions').show();
        $('#mpMoveNav').show();
        $('#mpResult').hide();
        Ish.Go.Logic.newGame(19, 19);
        Ish.Go.View.redraw();
        refreshStatus();
        updateMoveNav();
    }

    function refreshStatus() {
        if (!gameStarted) { $('#mpStatus').text(''); return; }
        $('#mpStatus').html(
            'You are <b>' + cap(myColor) + '</b>. ' +
            (isMyTurn()
                ? '<span class="mp-your-turn">Your turn</span>'
                : '<span class="mp-waiting">Waiting for opponent…</span>')
        );
    }

    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    function handlePayload(payload) {
        if (!payload) return;
        switch (payload.type) {
            case 'init':
                blackAddr = payload.blackAddr;
                if (myAddr !== blackAddr && !whiteAddr) {
                    whiteAddr = myAddr;
                    sendMessage({ type: 'join', whiteAddr: myAddr });
                    startGame();
                } else if (blackAddr && whiteAddr) {
                    startGame();
                }
                break;
            case 'join':
                if (!whiteAddr) whiteAddr = payload.whiteAddr;
                if (blackAddr && whiteAddr) startGame();
                break;
            case 'move':   if (gameStarted) applyMove(payload.row, payload.col); break;
            case 'pass':   if (gameStarted) applyPass(); break;
            case 'resign': if (gameStarted) applyResign(payload.addr); break;
        }
    }

    function sendMessage(payload) {
        sendRaw(chatId, payload, function (msg) {
            seen[msg.uuid] = true;
            handlePayload(payload);
        });
    }

    function poll() {
        fetchMessages(chatId, messagesRead, messagesRead + 20, function (msgs, count) {
            messagesRead += count;
            parseAppMessages(msgs).forEach(function (msg) {
                if (!seen[msg.uuid]) { seen[msg.uuid] = true; handlePayload(msg.payload); }
            });
        });
        pollTimer = setTimeout(poll, 5000);
    }

    function startPolling() { if (!pollTimer) poll(); }

    function hookView() {
        Ish.Go.View.placePiece = function (point) {
            if (!gameStarted || !isMyTurn() || !isLive()) return;
            if (!Ish.Go.Logic.isValidMove(point, gGameState.currentPlayer)) {
                var msg = 'Invalid move';
                if (gGameState.moveError) msg += ':\n' + gGameState.moveError;
                alert(msg);
                return;
            }
            sendMessage({ type: 'move', row: point.row, col: point.column });
        };
    }

    /* ══════════════════════════════════════════════════════════════════
       PUBLIC API
    ══════════════════════════════════════════════════════════════════ */
    return {
        init: function () {
            hookView();
            gGameState = new GameState(
                19, 19,
                new Player(Constants.Color.BLACK, Constants.PointState.BLACK),
                new Player(Constants.Color.WHITE, Constants.PointState.WHITE)
            );
            var initChatId = _url.searchParams.get('chatId');
            if (initChatId) openGame(initChatId);
            else showList();
        },

        newGame: function () {
            $('#mpNewGameBtn').prop('disabled', true).text('Creating…');
            createChat(function (id) {
                chatId = id;
                blackAddr = myAddr;
                sendRaw(chatId, { type: 'init', blackAddr: myAddr }, function (msg) {
                    seen[msg.uuid] = true;
                });
                $('#mpSetup').hide();
                $('#gameSection').show();
                $('#mpStatus').html(
                    'Waiting for opponent… <span class="mp-waiting">Ask your friend to check their newsfeed.</span>'
                );
                $('#mpActions').hide();
                $('#mpResult').hide();
                startPolling();
            });
        },

        backToList: function () { showList(); },

        stepBack: function () {
            if (viewIndex > 0) { viewIndex--; replayTo(viewIndex); }
        },

        stepForward: function () {
            if (!isLive()) { viewIndex++; replayTo(viewIndex); }
        },

        pass: function () {
            if (!gameStarted || !isMyTurn() || !isLive()) return;
            sendMessage({ type: 'pass', addr: myAddr });
        },

        resign: function () {
            if (!gameStarted) return;
            if (confirm('Resign?')) sendMessage({ type: 'resign', addr: myAddr });
        }
    };

})();

window.onload = function () { App.init(); };
