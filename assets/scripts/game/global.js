const GAME_WIDTH = 1000;
const GAME_HEIGHT = 700;


// theme can be chosen from this list
let themes = {
    default: {
        backImage: "./assets/images/background.png"
    },
    tinyeye: {
        backImage: "./assets/images/background.png"
}
};

var gGameData = [];
var gThemeIndex = 0;
var gGameStarted = false;

let gCurrentTheme = "default";

let currentThemeName = "default";
let currentTheme = themes["default"];
// 1 is student userType
let userType = 1;

let players = {};
let playerScores = {};
let localPlayerIds = [];
let currentPlayer = null;

let isGameReady = false;
let messageQueue = [];
