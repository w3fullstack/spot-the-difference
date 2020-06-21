const GAME_WIDTH = 1000;
const GAME_HEIGHT = 700;


// theme can be chosen from this list
let themes = {
    default: {
        backImage: "./assets/images/background.png",
        cardBorderColor: 0xff0000,
        foundSpotColor: 0x0000ff,
        revealedSpotColor: 0xffff00,
        wrongSpotColor: '#ff0000',
        glowSpotColor: 0xffffff,
        leftButton: "./assets/images/prev.png",
        rightButton: "./assets/images/next.png",
        showButton: "./assets/images/btnShowStudent.png",
        hideButton: "./assets/images/btnHideStudent.png",
        downButton: "./assets/images/down.png",
        upButton: "./assets/images/up.png",
        galleryButton: "./assets/images/btnGallery.png",
        revealButton: "./assets/images/btnRevealMe.png",
        unrevealButton: "./assets/images/btnHideMe.png",
        winButton: "./assets/images/btnShowWon.png",
        winMessageImage: "./assets/images/sprWin.png",
        foundBackgroundImage: "./assets/images/sprFoundbg.png",
        foundPanelImage: "./assets/images/sprFoundFrame.png",
        // galleryBackgroundImage: "./assets/images/background.png.png",
        // galleryFrameImage: "./assets/images/background.png",
        separatorImage: "./assets/images/sprSeparater.png",
        menuBackgroundImage: "./assets/images/sprMenuBg.png"
    },
    tinyeye: {
        backImage: "./assets/images/background.png",
        cardBorderColor: 0xff0000,
        foundSpotColor: 0x0000ff,
        revealedSpotColor: 0xffff00,
        wrongSpotColor: '#ff0000',
        glowSpotColor: 0xffffff,
        leftButton: "./assets/images/prev.png",
        rightButton: "./assets/images/next.png",
        showButton: "./assets/images/btnShowStudent.png",
        hideButton: "./assets/images/btnHideStudent.png",
        downButton: "./assets/images/down.png",
        upButton: "./assets/images/up.png",
        galleryButton: "./assets/images/btnGallery.png",
        revealButton: "./assets/images/btnRevealMe.png",
        unrevealButton: "./assets/images/btnHideMe.png",
        winButton: "./assets/images/btnShowWon.png",
        winMessageImage: "./assets/images/sprWin.png",
        foundBackgroundImage: "./assets/images/sprFoundbg.png",
        foundPanelImage: "./assets/images/sprFoundFrame.png",
        // galleryBackgroundImage: "./assets/images/background.png.png",
        // galleryFrameImage: "./assets/images/background.png",
        separatorImage: "./assets/images/sprSeparater.png",
        menuBackgroundImage: "./assets/images/sprMenuBg.png"
    }
};

var gGameData = [];
var gThemeIndex = 0;
var gGameStarted = false;

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
