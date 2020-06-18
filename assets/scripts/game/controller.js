var game = null;

$(document).ready(function() {
    (function() {
        $.getJSON( "scenes.json" )
            .done(function( json ) {
                gGameData = json.scenes;
                initialized();
            })
            .fail(function( jqxhr, textStatus, error ) {
                console.log(textStatus, error)
            });
    })();
});

function initialized() {  
    // prepare theme names available in the game
    let themeNames = [];
    for (var themeName in themes) {
        themeNames.push(themeName);
    }

    var gi = new GameInfo({
        name: "SPOT THE DIFFERENCE",
        width: 1000,
        height: 700,
        autoScale: true,
        isTurnTaking: true,
        allowGameCardNavigation: false
    });

    gi.themes = themeNames;

    sendToGameshell({
        eventType: "gameReady",
        message: gi
    });
}

//////////////////////////////////////////////////

/**
 * Sets the current theme for the game
 * @param {String} themeName the name of the theme to use
 */
function setTheme(themeName = "default") {
  currentThemeName = themeName;
  currentTheme = themes[themeName];
}

/**
 * @returns True if the game has already started. False otherwise
 */
function isGameStarted() {
  // if the game area is visible, then the game has started
  return gGameStarted;
}

/**
 * Starts/Restarts a new game
 * Advances the game from the intro screen into the game area
 */
function startGame(startingPlayerId = null) {
    console.log("~~~~~~~~~~~~~~start game")
    // if game is already defined, destroy
    if (game !== null) {
        game.destroy(true);
    }
    // if (startingPlayerId) {
    //     gCurrentPlayer = gPlayers[startingPlayerId];
    // }
    setTimeout(() => {
            // start new game
        const config = {
            type: Phaser.AUTO,
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            parent: "game",
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            scene: [ChooseScene, GameScene]
        };
        game = new Phaser.Game(config);
    }, 1000);
}

/**
 * Ends the game
 * Advances the game from the game area into the Ending screen
 */
function endGame() {
    if (game) {
        game.destroy(true);
        game = null;
    }
}

/**
 * Updates the players in the game
 */
function updatePlayers() {
  if (!players || players.length == 0) return;

  for (var playerId in players) {
    var player = players[playerId];
    updatePlayerControls(player);
  }
  updateCurrentPlayer(currentPlayer);
}

/**
 * Updates the selected player who is allowed to play the game
 *
 * @param {*} player The current selected player
 */
function updateCurrentPlayer(player) {
  currentPlayer = player;
}

/**
 * Updates the selected player who is allowed to play the game
 *
 * @param {*} playerIds The current selected player
 */
function setLocalPlayers(playerIds) {
  for (let localPlayerId of playerIds) {
    if (players[localPlayerId]) {
      players[localPlayerId].isLocal = true;
      players[localPlayerId].isOnline = true;
      localPlayerIds.push(localPlayerId);
    }
  }
}

/**
 * Updates the player controls' enabled/disabled flag in the game
 *
 * @param {*} player The player object
 */
function updatePlayerControls(player) {
  if (!player) return;

  if (currentPlayer && currentPlayer.personId === player.personId) {
    currentPlayer.controlsEnabled = player.controlsEnabled;
  }
}

/**
 * Sets players to the current game
 * @param {Object} allPlayers List of player(s) currently playing the game
 *    [{id, name, controlsEnabled}]
 *    - controlsEnabled: True is the player is allowed to control the game
 * @returns List of added player ids
 */
function setPlayers(allPlayers) {
  // clear the players list
  players = {};
  for (var player of allPlayers) {
    // add them to the players list
    players[player.personId] = player;
  }

  updatePlayers();
}

/**
 * Updates the current game's state to match the incoming state
 *
 * @param {*} gameState The game state information
 */
function setGameState(gameState) {
  if (!gameState) return;

  // set theme (if changed)
  setTheme(gameState.themeName);

  // start/restart the game
  if (gameState.isGameStarted) {
    startGame(currentPlayer);
  }

  currentPlayer = gameState.currentPlayer;
  playerScores = gameState.playerScores;
  setPlayers(gameState.players);
}

// ===========================================================================
// HANDLONG GAMESHELL EVENTS
// ===========================================================================

/**
 * Starts the game, then send a message to all other game instances to start their games
 */
function startGameHook() {
  // send message to all other games to start their game
  sendToGameshell({
    eventType: "sendToAll",
    message: {
      type: "startGame",
      data: { startingPlayerId: currentPlayer.personId }
    }
  });
}

/**
 * Sets Gameshell information (such as the current user type) in the game
 *
 * @param {*} gameshellInfo Information needed by the game about the Gameshell
 */
function setGameshellInfoHook(gameshellInfo) {
  // handle the userType information
  userType = gameshellInfo.userType;

  // grab the user(s) playing this game on the current computer
  for (var player of gameshellInfo.players) {
    players[player.personId] = player;
    // these are the local players, grab their ids
    if (player.isLocal) {
      localPlayerIds.push(player.personId);
    }
  }

  currentPlayer = gameshellInfo.currentPlayer;
  updatePlayers();

  // the game is now ready
  isGameReady = true;
  handleMessageQueue();
}

/**
 * Changes the theme of the game based on the theme name passed to it
 *
 * @param {string} theme Name of theme to be applied.
 */
function setThemeHook(theme) {
  // send message to all other games to change their themes
  sendToGameshell({
    eventType: "sendToAll",
    message: {
      type: "setTheme",
      data: { theme: theme }
    }
  });
}

/**
 * Changes the gameset for this game.
 *
 * @param {*} data Gameset to use in this game.
 */
function setGamesetHook(data) {
  // update the gameset
  setGameset(data);

  // since changing the gameset will affect the cards
  // check if the game is already started
  if (isGameStarted()) {
    // then restart it again
    startGame();
  }

  // send message to all other games to change their themes
  sendToGameshell({
    eventType: "sendToAll",
    message: {
      type: "setGameset",
      data: { gameset: data, cardsOrder: cardsOrder }
    }
  });
}

/**
 * Changes the current gameset card into a previous or next card.
 *
 * @param {string} direction The direction to change the gameset card. 'Next' to go forward or
 *                           'previous' to go backwards.
 */
function setGamesetItemHook(direction) {
  // this method doesn't apply to this game
  // example implementation
  // grab the card
  //var card = direction == 'next' ? nextCard : previousCard;
  //setGamesetCard(card);
  // once the gameset card is changed, send a message to all other game instances
  //sendToGameshell({
  //  eventType: 'sendToAll',
  //  message: {
  //    type: 'setGamesetItem',
  //    data: {gamesetItem: card}
  //  }
  //});
}

/**
 * Ends the game
 *
 * @param {*} data Data object sent by other game instances. Null if this game (or Gameshell) is initiating the event
 */
function endGameHook() {
  // send message to all other games to start their game
  sendToGameshell({
    eventType: "sendToAll",
    message: {
      type: "endGame"
    }
  });
}

/**
 * Sets the players joined in this game
 *
 * @param {*} playersInfo List of player(s) [{id, name, controlsEnabled}]
 */
function setPlayersHook(allPlayers) {
  // store new player ids
  var newPlayerIds = [];
  // loop over incoming players
  for (var player of allPlayers) {
    if (!players.hasOwnProperty(player.personId)) {
      // grab the list of ids of newly joined players
      newPlayerIds.push(player.personId);
    }
  }

  // add players to this game
  setPlayers(allPlayers);

  // send a message to all
  // informing them of the new players
  // and sending the gamestate to the new players
  sendToGameshell({
    eventType: "sendToAll",
    message: {
      type: "setPlayers",
      data: {
        gameState: getGameState(),
        newPlayerIds: newPlayerIds,
        players: allPlayers
      }
    }
  });
}

/**
 * Sets the current selected player currently controls-enabled/allowed to play the game
 *
 * @param {*} player Player object {id, name, controlsEnabled}
 */
function setCurrentPlayerHook(player) {
  updateCurrentPlayer(player);

  // inform other game instances
  sendToGameshell({
    eventType: "sendToAll",
    message: {
      type: "updateCurrentPlayer",
      data: player
    }
  });

  // inform Gameshell about player change
  sendToGameshell({
    eventType: "setCurrentPlayer",
    message: currentPlayer
  });
}

/**
 * Updates the controls of the player (by enabling/disabling them)
 *
 * @param {*} player Player object {id, name, controlsEnabled}
 */
function updatePlayerControlsHook(player) {
  updatePlayerControls(player);

  // inform other game instances
  sendToGameshell({
    eventType: "sendToAll",
    message: {
      type: "updatePlayerControls",
      data: player
    }
  });
}

/**
 * Updates the controls of the player (by enabling/disabling them)
 *
 * @param {*} message Player object {id, name, controlsEnabled}
 */
// function requestGameStatusHook(message) {
//   // updatePlayerControls(player);
//   console.log('requestGameStatus');
//   console.log(message);
//   gameState = getGameState();

//   // inform other game instances
//   sendToGameshell({
//     eventType: 'sendToPlayers',
//     data: {
//       message: 'requestGameStatus',
//       data: gameState,
//       playerIds: [messgae.person_id]
//     }
//   });
// }

/**
 * Updates the controls of the player (by enabling/disabling them)
 *
 * @param {*} message Player object {id, name, controlsEnabled}
 */
function userJoined(message) {
  // updatePlayerControls(player);
  console.log("userJoined");
  console.log(message);

  // inform other game instances
  sendToGameshell({
    eventType: "sendToAll",
    message: {
      type: "userJoined",
      data: message
    }
  });
}

/**
 * Updates the controls of the player (by enabling/disabling them)
 *
 * @param {*} message Player object {id, name, controlsEnabled}
 */
function pauseGame(message) {
  // updatePlayerControls(player);
  console.log("pauseGame");
  console.log(message);

  // inform other game instances
  sendToGameshell({
    eventType: "sendToAll",
    message: {
      type: "pauseGame",
      data: message
    }
  });
}

/**
 * list of players that current went online
 *
 * @param {*} personIds number array of person ids
 */
function playersOnline(personIds) {
  console.log("playersOnline");
  console.log(personIds);
  for (personId of personIds) {
    if (players[personId]) {
      players[personId].isOnline = true;
    }
    if (currentPlayer && currentPlayer.personId == personId) {
      currentPlayer.isOnline = true;
    }
  }
  if (isGameMaster() && isGameStarted()) {
    gameState = getGameState();
    sendToGameshell({
      eventType: "sendToPlayers",
      playerIds: personIds,
      message: {
        type: "gameState",
        data: gameState
      }
    });
  }
}

/**
 * Returns true if any of the local players are the gamemaster
 *
 */
function isGameMaster() {
  console.log("isGameMaster");
  gamemaster = getGamemaster();
  return localPlayerIds.includes(gamemaster.personId);
}

function getGamemaster() {
  for (var playerId in players) {
    if (players[playerId].gamemaster) {
      return players[playerId];
    }
  }
}

/**
 * list of players that went offline
 *
 * @param {*} personIds number array of person ids
 */
function playersOffline(personIds) {
  console.log("playersOffline");
  console.log(personIds);
  for (personId of personIds) {
    if (players[personId]) {
      players[personId].isOnline = false;
    }
    if (currentPlayer && currentPlayer.personId == personId) {
      currentPlayer.isOnline = false;
    }
  }

  // inform other game instances
  // sendToGameshell({
  //   eventType: 'sendToAll',
  //   message: {
  //     type: 'pauseGame',
  //     data: message
  //   }
  // });
}

/**
 * Updates the controls of the player (by enabling/disabling them)
 *
 * @param {*} message Player object {id, name, controlsEnabled}
 */
function userLeft(message) {
  // updatePlayerControls(player);
  console.log("userLeft");
  console.log(message);

  // inform other game instances
  sendToGameshell({
    eventType: "sendToAll",
    message: {
      type: "userLeft",
      data: message
    }
  });
}

/**
 * Handles messages sent by other game instances or by the gameshell
 *
 * @param {*} message Data object containing a 'message' and it's associated 'data'
 */
function handleGameMessageHook(message) {
  // if game is not ready yet
  if (!isGameReady) {
    // then store the message in a queue
    messageQueue.push(message);
    return;
  }

  var messageType = message.type;
  var data = message.data;
  switch (messageType) {
    /*
     * The following required methods enable the Gameshell to appropriately interact with the game.
     */
    case "startGame":
            startGame(data.startingPlayerId);
            break;
    case "endGame":
        endGame();
        break;
    case "setLocalPlayers":
        break;
    case "pickedScene":
        if (game) {
            game.scene.stop('ChooseScene');
            game.scene.start('GameScene', {themeIndex: gThemeIndex});
        }
        break;
    case "goToGallery":
        if (game) {
            game.scene.stop('GameScene');
            game.scene.start('ChooseScene');
        }
        break;
    case "showForStudent":
        game.scene.scenes[1].toggleShowFound(true);
        break;
    case "hideForStudent":
        game.scene.scenes[1].toggleShowFound(false);
        break;
    case "getGameState":
        break;
    case "showWin":
        game.scene.scenes[1].showGreatJob();
        break;
    case "playersOnline":
        playersOnline(data);
        break;        
    case "playersOffline":
        playersOffline(data);
        break;
    case "imageClicked":
        if (message.loggedInPersonId === message.senderPersonId) return;
        game.scene.scenes[1].handleClick(data.x, data.y);
        break;
    case "updatePlayerControls":
        updatePlayerControls(data);
        break;
    case "updateCurrentPlayer":
        updateCurrentPlayer(data);
        break;
    case "setTheme":
        if (isGameStarted()) {
            startGame(data.startingPlayerId);
        };
        setTheme(data);
        break;
  }
}

function handleMessageQueue() {
  for (var message of messageQueue) {
    handleGameMessageHook(message);
  }
  messageQueue = [];
}
