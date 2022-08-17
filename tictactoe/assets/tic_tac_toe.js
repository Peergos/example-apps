//@ts-check
// minimal h
function h(type, content, css_class) {
  const node = document.createElement(type);
  let hcontent = (c) => {
    if (c instanceof Node) {
      node.appendChild(c);
    } else if (typeof c == "string") {
      node.append(document.createTextNode(c));
    }
  };
  if (Array.isArray(content)) {
    content.map(hcontent);
  } else {
    hcontent(content);
  }

  if (css_class) css_class.split(" ").forEach((c) => node.classList.add(c));
  return node;
}

/**
 *
 * @param {{board: Game['board'], moveCallback: undefined | ((tileId:number)=>void)}} param0
 * @returns
 */
function Board({ board, moveCallback }) {
  const Field = (index) => {
    const state = board[index];
    const isOccupied = state > 0 && state <= 2;
    const field = h(
      "div",
      "",
      isOccupied ? (state == 1 ? "circle" : "cross") : undefined
    );
    if (!isOccupied && moveCallback) {
      field.onclick = () => moveCallback(index);
    }
    return field;
  };

  return h(
    "div",
    [
      h("div", [Field(0), Field(1), Field(2)]),
      h("div", [Field(3), Field(4), Field(5)]),
      h("div", [Field(6), Field(7), Field(8)]),
    ],
    moveCallback ? "board myturn" : "board"
  );
}

/**
 * @param {Game} game
 */
function GameState(game) {
  const player1IsYou = game.player1.email == ME_PLAYER.email;
  const player2IsYou = game.player2.email == ME_PLAYER.email;
  switch (game.state) {
    case GAME_STATE.PLAYER1_TURN:
      if (player1IsYou) {
        return [
          h("span", "Your turn", "user circle"),
        ];
      } else {
        return [
          "waiting for ",
          h("span", game.player1.name, "user circle"),
          "'s turn...",
        ];
      }
    case GAME_STATE.PLAYER2_TURN:
      if (player2IsYou) {
        return [
          h("span", "Your turn", "user cross"),
        ];
      } else {
        return [
          "waiting for ",
          h("span", game.player2.name, "user cross"),
          "'s turn...",
        ];
      }
    case GAME_STATE.TIE:
      return "Tie";
    case GAME_STATE.PLAYER1_WON:
      return [
        h("span", game.player1.name, "user circle"),
        " won",
      ];
    case GAME_STATE.PLAYER2_WON:
      return [
        h("span", game.player2.name, "user cross"),
        " won",
      ];
    default:
      return "unknown game state: " + game.state;
  }
}

/**
 * @param {Game} game
 */
function GameScreen(game) {
  let moveCallback;
  if (
    (game.player1.email == ME_PLAYER.email &&
      game.state == GAME_STATE.PLAYER1_TURN) ||
    (game.player2.email == ME_PLAYER.email &&
      game.state == GAME_STATE.PLAYER2_TURN)
  ) {
    moveCallback = (fieldID) => {
      console.log("should move", { gameid: game.id, fieldID });
      /** @type {stateChange} */
      const payload = {
        action: { type: "move", gameId: game.id, field: fieldID },
        player: getCurrentPlayer(),
      };
      window.webxdc.sendUpdate({ payload }, "a game move");
    };
  }

  return h(
    "div",
    [
      h(
        "div",
        [
          h(
            "div",
            [
              h(
                "div",
                [
                  h("span", game.player1.name, "user circle"),
                  " vs ",
                  h("span", game.player2.name, "user cross"),
                ],
                "game-title"
              ),

              Board({ board: game.board, moveCallback }),
              h("div", h("div", GameState(game)), "turn-container"),
            ],
            "board-container"
          ),
        ],
        "content"
      ),
    ],
    "screen"
  );
}

/**
 *
 * @param {Game} game
 */
function HomeScreenGameEntry(game) {
  const { board, player1, player2 } = game;
  const entry = h(
    "div",
    [
      Board({ board, moveCallback: undefined }),
      h(
        "div",
        [
          h(
            "div",
            [
              h("span", player1.name, "user circle"),
              " vs ",
              h("span", player2.name, "user cross"),
            ],
            "game-title"
          ),
          h("div", h("div", GameState(game)), "turn-container"),
        ],
        "game-info"
      ),
    ],
    "game-entry"
  );

  entry.onclick = () => {
    inner_state.currentGameId = game.id;
    reRender();
  };

  return entry;
}

/**
 *
 * @param {GameOfferType} param0
 * @returns
 */
function GameOffer({ player1, gameId }) {
  const isYourOffer = player1.email == ME_PLAYER.email;

  const offer = h(
    "div",
    isYourOffer
      ? [
          h("span", "You", "user circle"),
          " offered a game, waiting for someone to join...",
        ]
      : inner_state.wait_for_game_start_id == gameId
      ? [
          "asking ",
          h("span", player1.name, "user circle"),
          " to join their game, waiting for them to confirm...",
        ]
      : [
          h("span", player1.name, "user circle"),
          " offered a  game, tap to join",
        ],
    "game-offer"
  );
  offer.onclick = () => {
    if (isYourOffer) {
      // can not accept own offer
      return;
    }
    // accept (show user loading spinner until other user auto confirms the match)
    if (!inner_state.wait_for_game_start_id) {
      inner_state.wait_for_game_start_id = gameId;
      /** @type {stateChange} */
      const payload = {
        action: { type: "join_request", gameId },
        player: getCurrentPlayer(),
      };
      window.webxdc.sendUpdate({ payload }, "request to join a game");
    }

    reRender();
  };

  return offer;
}

function CreateGameOfferButton() {
  const btn = h("div", "Create new game offer...", "game-entry");

  btn.onclick = () => {
    playBeep(180, 0.1);
    window.webxdc.createChat((newChatId) => {
        createGameOffer();
    });
    reRender();
  };

  return btn;
}

function HomeScreen({ youHaveGameOffer }) {
  // if there is no new game offer by current user to create one

  const active_games = inner_state.games.filter(
    ({ state }) =>
      state == GAME_STATE.PLAYER1_TURN || state == GAME_STATE.PLAYER2_TURN
  );
  const completed_games = inner_state.games.filter(
    ({ state }) =>
      state !== GAME_STATE.PLAYER1_TURN && state !== GAME_STATE.PLAYER2_TURN
  );

if (isHost) {
  return h(
    "div",
    [
      h(
        "div",
        [
          h("h2", "Active Games"),
          youHaveGameOffer || CreateGameOfferButton(chatId),
          ...inner_state.gameOffers.map(GameOffer).reverse(),
          ...active_games.map(HomeScreenGameEntry).reverse(),
          h("h2", "Completed Games"),
          ...completed_games.map(HomeScreenGameEntry).reverse(),
        ],
        "content"
      ),
    ],
    "home-screen screen"
  );
} else {
  return h(
    "div",
    [
      h(
        "div",
        [
          h("h2", "Active Games"),
          ...inner_state.gameOffers.map(GameOffer).reverse(),
          ...active_games.map(HomeScreenGameEntry).reverse(),
          h("h2", "Completed Games"),
          ...completed_games.map(HomeScreenGameEntry).reverse(),
        ],
        "content"
      ),
    ],
    "home-screen screen"
  );

}
}

const bs = document.getElementById("board-screen");
function reRender() {
  const { youHaveGameOffer, currentGame } = getState();
  let screen;
  if (currentGame) {
    screen = GameScreen(currentGame);
  } else {
    screen = HomeScreen({
      youHaveGameOffer,
    });
  }

  bs.innerHTML = "";
  bs.appendChild(screen);
}

// Logic

/**
 * @returns {Player}
 */
function getCurrentPlayer() {
  return {
    name: window.webxdc.selfName || window.webxdc.selfAddr.split("@")[0],
    email: window.webxdc.selfAddr,
  };
}

let href = window.location.href
let url = new URL(href);
let chatId = url.searchParams.get("chatId");
let isHost = chatId == null;

const ME_PLAYER = getCurrentPlayer();

const GAME_STATE = Object.freeze({
  /** @type {1} */
  PLAYER1_TURN: 1,
  /** @type {2} */
  PLAYER2_TURN: 2,
  /** @type {3} */
  PLAYER1_WON: 3,
  /** @type {4} */
  PLAYER2_WON: 4,
  /** @type {5} */
  TIE: 5,
});

/**
 * @typedef {{
 *      id: number,
 *      state: GAME_STATE[keyof GAME_STATE],
 *      player1: Player,
 *      player2: Player,
 *      board: [0|1|2,0|1|2,0|1|2,0|1|2,0|1|2,0|1|2,0|1|2,0|1|2,0|1|2]
 * }} Game
 * @typedef {{player1:Player, gameId:number, player2:undefined|Player}} GameOfferType
 * @type {{
 *  currentGameId:number,
 *  gameOffers: GameOfferType[]
 *  games: Game[],
 *  wait_for_game_start_id: undefined | number
 * }}
 */
const inner_state = {
  currentGameId: undefined,
  gameOffers: [],
  games: [],
  wait_for_game_start_id: undefined,
};

function getState() {
  return {
    ...inner_state,
    youHaveGameOffer:
      inner_state.gameOffers.findIndex(
        (o) => o.player1.email == ME_PLAYER.email
      ) !== -1,
    currentGame: inner_state.currentGameId
      ? inner_state.games.find(({ id }) => id == inner_state.currentGameId)
      : undefined,
  };
}

/**
 * @typedef {{name: string, email: string}} Player
 * @typedef {(
 * { type: "create", gameId: number }
 * | { type: "join_request", gameId: number }
 * | { type: "start", gameId: number, player2: Player}
 * | { type: "move", gameId: number, field: number }
 * )} gameAction
 * @typedef {{action: gameAction, player: Player}} stateChange
 * @typedef {import('./webxdc').SendingStatusUpdate<stateChange>} StateUpdate
 */
function createGameOffer() {
  /** @type {stateChange} */
  const payload = {
    action: { type: "create", gameId: Date.now() },
    player: getCurrentPlayer(),
  };
  window.webxdc.sendUpdate({ payload }, "create a new game offer");
}

/** @type { undefined | {id: number, player2: Player} } gameId to start, if it was not started already */
let pending_game_start = undefined;

let pending_game_result_message = undefined;
/**
 * @param {boolean} is_live wether state update is live and not reconstructing
 * @param {StateUpdate} state
 * @returns {boolean} wether screen should be rerendered
 */
function addStateToGames(is_live, { payload }) {
  let { action, player } = payload;
  let shouldRefreshScreen = false;
  try {
    if (!action) {
      console.error("no action, ignoring state update");
      return;
    }
    if (action.type == "create") {
      inner_state.gameOffers.push({
        player1: player,
        gameId: action.gameId,
        player2: undefined,
      });
      shouldRefreshScreen = true;
    } else if (action.type == "join_request") {
      console.log("join_request recieved");
      const game = inner_state.gameOffers.find(
        ({ gameId }) => gameId == action.gameId
      );

      if (!game) {
        throw new Error("Game offer for this join request doesn't exist");
      } else if (game.player1.email == ME_PLAYER.email) {
        console.log("join_request is for my game");
        // first player get's to join the game
        // but sending pending game start is only sent if we are NOT reconstructing state
        if (!pending_game_start || pending_game_start.id != game.gameId) {
          pending_game_start = { id: game.gameId, player2: player };
          console.log("join_request accepted: ", { pending_game_start });
        }
      }
    } else if (action.type == "start") {
      console.log("start a game");
      // remove offer from list
      const game = inner_state.gameOffers.find(
        ({ gameId }) => gameId == action.gameId
      );
      if (game) {
        inner_state.gameOffers = inner_state.gameOffers.filter(
          (o) => o !== game
        );
      } else {
        console.error("game not found");
        return;
      }
      // remove pending_game_start
      if (pending_game_start && pending_game_start.id == game.gameId) {
        pending_game_start = undefined;
      }

      // create game for it
      inner_state.games.push({
        id: action.gameId,
        state: GAME_STATE.PLAYER1_TURN,
        player1: player,
        player2: action.player2,
        board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      });
      console.log(
        "started game",
        inner_state.games[inner_state.games.length - 1]
      );

      if (
        player.email == ME_PLAYER.email ||
        action.player2.email == ME_PLAYER.email
      ) {
        inner_state.wait_for_game_start_id = undefined;
        // this my game, open it - if no other game is open currently
        if (is_live && !inner_state.currentGameId) {
          playBeep(180, 0.14);
          inner_state.currentGameId = action.gameId;
        }
      }

      shouldRefreshScreen = true;
    } else if (action.type == "move") {
      const game = inner_state.games.find(({ id }) => id == action.gameId);
      if (!game) {
        console.error("game for this action not found:", action.gameId, action);
      } else {
        const TurnPlayerEmail = player.email;
        if (
          game.player1.email !== TurnPlayerEmail &&
          game.player2.email !== TurnPlayerEmail
        ) {
          console.error("Player is not part of the game", {
            TurnPlayerEmail,
            game,
          });
          return;
        }

        /** @type {0|1|2} */
        let player_id = 0;
        if (game.player1.email == TurnPlayerEmail) {
          player_id = 1;
        } else if (game.player2.email == TurnPlayerEmail) {
          player_id = 2;
        }

        if (
          game.state == GAME_STATE.PLAYER2_TURN ||
          game.state == GAME_STATE.PLAYER1_TURN
        ) {
          // is it the player's turn
          if (
            !(
              (player_id === 2 && game.state == GAME_STATE.PLAYER2_TURN) ||
              (player_id === 1 && game.state == GAME_STATE.PLAYER1_TURN)
            )
          ) {
            console.error(
              "not the turn of the player trying to make the move",
              { action, game }
            );
            return;
          }

          // Is the field free?
          if (game.board[action.field] !== 0) {
            console.error("field is already taken", { action, game });
            return;
          }

          // Move in internal db state
          game.board[action.field] = player_id;

          // Set new game state:
          // __________________

          // Has someone won?

          function hasWon(playerId) {
            const owned = (field) => game.board[field] === playerId;
            return (
              // Horizontal Rows
              (owned(0) && owned(1) && owned(2)) ||
              (owned(3) && owned(4) && owned(5)) ||
              (owned(6) && owned(7) && owned(8)) ||
              // Vertical rows
              (owned(0) && owned(3) && owned(6)) ||
              (owned(1) && owned(4) && owned(7)) ||
              (owned(2) && owned(5) && owned(8)) ||
              // diagonals
              (owned(0) && owned(4) && owned(8)) ||
              (owned(6) && owned(4) && owned(2))
            );
          }

          if (hasWon(1)) {
            game.state = GAME_STATE.PLAYER1_WON;
          } else if (hasWon(2)) {
            game.state = GAME_STATE.PLAYER2_WON;
          } else if (game.board.findIndex((field) => field === 0) === -1) {
            // or is tie?
            game.state = GAME_STATE.TIE;
          } else {
            game.state =
              game.state == GAME_STATE.PLAYER1_TURN
                ? GAME_STATE.PLAYER2_TURN
                : GAME_STATE.PLAYER1_TURN;
          }
          shouldRefreshScreen = true;

          // if game active play turn sound
          if (inner_state.currentGameId === game.id) {
            if (player.email === ME_PLAYER.email) {
              // me player turn sound
              playBeep(334);
            } else {
              //other player turn sound
              playBeep(200);
            }
            if (
              game.state == GAME_STATE.PLAYER1_WON ||
              game.state == GAME_STATE.PLAYER2_WON
            ) {
              if (player.email === ME_PLAYER.email) {
                console.log("set pending_game_result_message", { action });
                pending_game_result_message =
                  "TicTacToe: " +
                  player.name +
                  " won against " +
                  (player.email === game.player1.email
                    ? game.player2.name
                    : game.player1.name);
              }
            } else if (game.state == GAME_STATE.TIE) {
              if (player.email === ME_PLAYER.email) {
                pending_game_result_message =
                  "TicTacToe: The match between " +
                  game.player1.name +
                  " and " +
                  game.player2.name +
                  " resulted in a tie.";
              }
            }
            setTimeout(() => {
              if (
                game.state == GAME_STATE.PLAYER1_WON ||
                game.state == GAME_STATE.PLAYER2_WON
              ) {
                if (player.email === ME_PLAYER.email) {
                  // if wining move was mine?
                  playBeep(300, 0.4);
                } else {
                  playBeep(190, 0.4);
                }
              } else if (game.state == GAME_STATE.TIE) {
                playBeep(195, 0.4);
              }
            }, 210);
          }
        } else {
          console.error(
            "no players turn, are the turns received out of order?"
          );
          return;
        }
      }
    } else {
      console.error("recieved unknown state update", {
        payload,
      });
    }
  } catch (error) {
    console.error("error applying state update", error, {
      payload,
    });
  }

  // check if game is there
  // check if state change is valid (by correct player)

  return shouldRefreshScreen;
}

document.onkeydown = (ev) => {
  if (ev.key == "Backspace" || ev.key == "Escape") {
    if (inner_state.currentGameId) {
      inner_state.currentGameId = undefined;
      reRender();
    }
  }
};

reRender();

async function startup() {
  window.webxdc.setUpdateListener((update) => {
    const is_newest = update.serial === update.max_serial;
    if (addStateToGames(is_newest, update)) {
      reRender();
    }
    if (is_newest) {
      processPending();
    }
  }, 0);
  reRender();
}

startup();

function processPending() {
  console.info("processPending");
  if (pending_game_start) {
    /** @type {stateChange} */
    const payload = {
      action: {
        type: "start",
        gameId: pending_game_start.id,
        player2: pending_game_start.player2,
      },
      player: getCurrentPlayer(),
    };
    window.webxdc.sendUpdate(
      { payload, summary: getAppSummary() },
      "start the game"
    );
    pending_game_start = undefined;
  }

  if (pending_game_result_message) {
    console.info("processPending:pending_game_result_message");
    const msg = pending_game_result_message;
    pending_game_result_message = undefined;
    setTimeout(
      () =>
        window.webxdc.sendUpdate(
          {
            payload: {},
            info: msg,
            summary: getAppSummary(),
          },
          msg
        ),
      0
    );
  }
}

function getAppSummary() {
  const active_games = inner_state.games.filter(
    ({ state }) =>
      state == GAME_STATE.PLAYER1_TURN || state == GAME_STATE.PLAYER2_TURN
  );
  const completed_games = inner_state.games.filter(
    ({ state }) =>
      state !== GAME_STATE.PLAYER1_TURN && state !== GAME_STATE.PLAYER2_TURN
  );
  const ties = completed_games.filter(
    ({ state }) => state === GAME_STATE.TIE
  ).length;
  const wins = completed_games.length - ties;
  return (
    "Stats:" +
    "\nRunning Games: " +
    active_games.length +
    "\nCompleted Games: " +
    completed_games.length +
    "\nWins: " +
    wins +
    "\nTies: " +
    ties
  );
}

// sound?
function playBeep(frequency = 440, duration = 0.2) {
}
