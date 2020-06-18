
var GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    state: {
        // calculatable
        fGap: 0,                        // gap between diff images
        fImgWidth: 0,                   // diff image width
        fImgHeight: 0,                  // diff image height

        isShowFounds: false,            // found ?
        isRevealed: false,              // revealed unfound images
        themeData: null,                // theme data
        nWrongTry: 0,                   // counter of wrong try
        nFound: 0,                      // counter found
        isGameEnded: false,             // is game ended
        isCollapsed: true,              // control panel collapse/expand

        // ui states
        imgLeft: null,                  // left image container
        imgRight: null,                 // right image container
        lblFound: null,                 // label found
        lblTries: null,                 // label tries
        tltpShow: null,                 // tooltip for `show for student`
        tltpHide: null,                 // tooltip for `hide for student`
        btnShowStudent: null,           // button `Show for Student`
        btnHideStudent: null,           // button `Hide for Student`
        btnShowWon: null,               // button `Show Won`
        btnRevealMe: null,              // button `Reveal for Me`
        btnHideMe: null,                // button `Hide for Me`
        sprCircles: [],                 // uncovered circles
        btnCollapse: null,              // control bar collapse
        btnExpand: null,                // control bar expand
        controlPanel: null,             // control panel
    },

    initialize: function GameScene() {  
        Phaser.Scene.call(this, {key: 'GameScene'});
    },
    init: function(data) {
        console.log(game)
        gThemeIndex = data.themeIndex;
        
        const themeData = {...gGameData[gThemeIndex]};
        const fGap = 0;
        const fImgWidth = 0;
        const fImgHeight = 0;
        const isShowFounds = false;
        const isRevealed = false;
        const nWrongTry = 0;
        const nFound = 0;
        const isGameEnded = false;
        const isCollapsed = true;
        const imgRight = null;
        const lblFound = null;
        const lblTries = null;
        const btnShowStudent = null;
        const btnHideStudent = null;
        const btnShowWon = null;
        const btnRevealMe = null;
        const btnHideMe = null;
        const sprCircles = [];
        const btnCollapse = null;
        const btnExpand = null;
        const controlPanel = null;

        // initialize
        for (const index in themeData.differences) {
            themeData.differences[index].founded = false;
        }
        if (data !== undefined) {
            const foundIndices = data.foundIndices;
            let nFound = 0;
            if (foundIndices) {
                for (const index of foundIndices) {
                    themeData.differences[index].founded = true;
                    nFound++;
                }
            }
            this.state = {...this.state, themeData, nFound};
        }
        else {
            this.state = {...this.state, themeData};
        }

        this.state = {
            ...this.state,
            fGap,
            fImgWidth,
            fImgHeight,
            isShowFounds,
            isRevealed,
            nWrongTry,
            nFound,
            isGameEnded,
            isCollapsed,
            imgRight,
            lblFound,
            lblTries,
            btnShowStudent,
            btnHideStudent,
            btnShowWon,
            btnRevealMe,
            btnHideMe,
            sprCircles,
            btnExpand,
            btnCollapse,
            controlPanel
        }

    },
    preload: function() {
        const {themeData} = this.state;
        const fImgWidth = 500;
        const fImgHeight = 700;
        const fGap = 0;
        this.state = {...this.state, fGap, fImgWidth, fImgHeight};

        // load assets
        this.load.image('diff1', themeData.images[0]);
        this.load.image('diff2', themeData.images[1]);
        this.load.image('sprSeparater', 'assets/images/sprSeparater.png');
        this.load.image('sprFoundFrame', 'assets/images/sprFoundFrame.png');
        this.load.image('sprFoundbg', 'assets/images/sprFoundbg.png');
        this.load.image('btnShowStudent', 'assets/images/btnShowStudent.png');
        this.load.image('btnHideStudent', 'assets/images/btnHideStudent.png');
        this.load.image('btnShowWon', 'assets/images/btnShowWon.png');
        this.load.image('btnRevealMe', 'assets/images/btnRevealMe.png');
        this.load.image('btnHideMe', 'assets/images/btnHideMe.png');
        this.load.image('btnGallery', 'assets/images/btnGallery.png');
        this.load.image('sprWin', 'assets/images/sprWin.png');
        this.load.image('sprMenuBg', 'assets/images/sprMenuBg.png');
        this.load.image('btnCollapse', 'assets/images/up.png');
        this.load.image('btnExpand', 'assets/images/down.png');
    },
    create: function() {
        gGameStarted = true;

        const { fImgWidth, fImgHeight, fGap, themeData, nFound } = this.state;

        // add diff images
        const imgLeft = this.createImage(0, 0, fImgWidth, fImgHeight, "diff1");
        const imgRight = this.createImage(500, 0, fImgWidth, fImgHeight, "diff2");

        // add seperater image
        this.add.sprite(GAME_WIDTH/2, GAME_HEIGHT/2, "sprSeparater");

        // add found label
        const sprFoundFrame = this.add.sprite(GAME_WIDTH/2, 0, "sprFoundFrame");
        sprFoundFrame.setOrigin(0.5, 0);

        const sprFoundbg = this.add.sprite(GAME_WIDTH/2, 0, "sprFoundbg");
        sprFoundbg.setOrigin(0.5, 0);

        const lblFound = this.add.text(GAME_WIDTH/2-20, 25, ``, {fontFamily: 'arial', fontSize: '20px', color: 0xffffff});
        lblFound.setOrigin(0.5, 0.5);
        
        if (!(currentPlayer && currentPlayer.gamemaster && currentPlayer.isLocal)) {
            sprFoundFrame.setVisible(false);
            sprFoundbg.setVisible(false);
            lblFound.setVisible(false);
        }
        // create buttons
        const { controlPanel, btnExpand, btnCollapse, btnRevealMe, btnHideMe, btnShowWon, btnGallery } = this.createControlPanel();

        // create tooltips
        const tltpShow = this.createTooltipLabel(`Show number of found differences for the student`, 665, 50, 20, 300, 0xffffff);
        const tltpHide = this.createTooltipLabel(`Hide number of found differences for the student`, 665, 50, 20, 300, 0xffffff);
        
        const btnShowStudent = this.createButton('btnShowStudent', 665, 25, 40, 40, this.onClickShowStudent, this, tltpShow);
        const btnHideStudent = this.createButton('btnHideStudent', 665, 25, 40, 40, this.onClickHideStudent, this, tltpHide);

        const bGameMaster = isGameMaster();
        btnShowStudent.setVisible(bGameMaster);
        btnHideStudent.setVisible(false);
        controlPanel.setVisible(bGameMaster);

        // update state
        this.state = {
            ...this.state,
            imgLeft,
            imgRight,
            themeData,
            lblFound,
            btnShowStudent,
            btnHideStudent,
            btnShowWon,
            btnRevealMe,
            btnHideMe,
            tltpShow,
            tltpHide,
            btnGallery,
            controlPanel,
            btnExpand,
            btnCollapse,
            sprFoundFrame,
            sprFoundbg,
            isShowFounds: (currentPlayer && currentPlayer.gamemaster && currentPlayer.isLocal) ? true : false
        };
        this.updateLabel();
        // draw circles
        for (let difference of themeData.differences) {
            const {x, y, radius, founded} = difference;
            if (founded) {
                this.drawCircle(x, y, radius, imgLeft, imgRight);
            }
        }
    },

    /**
     * draw target images
     * @param {float} x pos_x
     * @param {float} y pos_y
     * @param {float} w width
     * @param {float} h height
     * @param {string} name asset name
     */
    createImage: function(x, y, w, h, name) {
        const { themeData } = this.state;
        const self = this;
        const container = this.add.container(x, y);
        container.x = x;
        container.y = y;
        container.setSize(w, h);
        const image = this.add.sprite(w/2, h/2, name).setInteractive();
        image.setDisplaySize(w, h);
        console.log(image)
        container.add(image);
        image.on('pointerdown', function(pt, x, y, e) {
            // check controlsEnabled
            if (!currentPlayer.controlsEnabled || !localPlayerIds.includes(currentPlayer.personId))
                return;
            // if controls is enabled
            sendToGameshell({
                eventType: "sendToAll",
                message: {
                    type: "imageClicked",
                    data: {x, y}
                }
            });
            self.handleClick(x, y);
        });
        return container;
    },
    /**
     * create Tooltip Label
     * @param {string} text 
     * @param {float} x 
     * @param {float} y 
     * @param {number} fontSize 
     * @param {number} wordwrapWidth 
     * @param {hex} color 
     */
    createTooltipLabel: function(text, x, y, fontSize, wordwrapWidth, color) {
        const tltp = this.add.text(x, y, text, {
            fontFamily: 'arial', 
            fontSize, 
            wordWrap: { width: wordwrapWidth},
            align: 'center',
            color
        });
        tltp.setOrigin(0.5, 0.0);
        tltp.setVisible(false);
        return tltp;
    },
    /**
     * create control panel
     */
    createControlPanel: function() {
        const controlPanel = this.add.container(0, 0);
        controlPanel.x = 0;
        controlPanel.y = -170;
        controlPanel.setSize(190, 230);

        const bg = this.add.sprite(0, 0, "sprMenuBg").setInteractive();
        bg.setOrigin(0, 0)

        const btnExpand = this.createButton('btnExpand', 85, 208, 40, 40, this.handleControlPanel, this);
        const btnCollapse = this.createButton('btnCollapse', 85, 208, 40, 40, this.handleControlPanel, this);
        btnCollapse.setVisible(false);
        
        const btnRevealMe = this.createButton('btnRevealMe', 85, 43, 140, 40, this.onClickRevealMe, this);
        const btnHideMe = this.createButton('btnHideMe', 85, 43, 140, 40, this.onClickRevealMe, this);
        const btnShowWon = this.createButton('btnShowWon', 85, 97, 140, 40, this.onClickEnd, this);
        const btnGallery = this.createButton('btnGallery', 85, 151, 140, 40, this.onClickGallery, this);
        btnHideMe.setVisible(false);

        controlPanel.add([bg, btnExpand, btnCollapse, btnRevealMe, btnHideMe, btnShowWon, btnGallery]);

        return { controlPanel, btnExpand, btnCollapse, btnRevealMe, btnHideMe, btnShowWon, btnGallery };
    },
    /**
     * handle collapse/expand of control panel
     */
    handleControlPanel: function() {
        const self = this;
        const { controlPanel, btnExpand, btnCollapse } = this.state;
        let { isCollapsed } = this.state;

        this.tweens.add({
            targets: controlPanel,
            y: isCollapsed ? 0 : -170,
            ease: 'Linear',
            duration: 200,
            onComplete: function() {
                isCollapsed = !isCollapsed;
                btnExpand.setVisible(isCollapsed);
                btnCollapse.setVisible(!isCollapsed);
                self.state = {...self.state, isCollapsed};
            }
        });
    },
    /**
     * toggle show found
     * @param {boolean} flag 
     */
    toggleShowFound: function(isShowFounds) {
        if (currentPlayer && currentPlayer.gamemaster && currentPlayer.isLocal) return;
        
        this.state = {...this.state, isShowFounds};
        const {sprFoundFrame, sprFoundbg, lblFound} = this.state;
        
        sprFoundFrame.setVisible(isShowFounds);
        sprFoundbg.setVisible(isShowFounds);
        lblFound.setVisible(isShowFounds);

        if (isShowFounds)
            this.updateLabel();
    },
    /**
     * update label - `x of y - z clicks`
     */
    updateLabel: function() {
        const { lblFound, isShowFounds, nFound, nWrongTry, themeData } = this.state;
        const nTotalDiffs = themeData.differences.length;
        lblFound.text = `Found ${nFound} of ${nTotalDiffs}` + (currentPlayer && currentPlayer.gamemaster && currentPlayer.isLocal ? ` - ${nWrongTry} Attempts` : "");
    },
    /**
     * handle click event
     * @param {bool} isLeft : click left or right
     * @param {float} x1 : pos_x
     * @param {float} y1 : pos_y
     */
    handleClick: function(x1, y1) {
        let { imgLeft, imgRight, themeData, isGameEnded } = this.state;
        if (isGameEnded) return;

        let wrong = true;
        const { differences } = themeData;

        for (const index in differences) {
            const difference = differences[index];
            if (!difference.founded) {
                let {x, y, radius} = difference;
                const dist = Phaser.Math.Distance.Between(x, y, x1, y1);

                x = x*500/themeData.width;
                y = y*700/themeData.height;
                if (dist < radius) {
                    difference.founded = true;
                    // found
                    wrong = false;
                    // draw circle1
                    this.drawCircle(x, y, radius, imgLeft, imgRight);
                    break;
                }
            }
        }

        x1 = x1*500/themeData.width;
        y1 = y1*700/themeData.height;

        // update state if therapist
        if (wrong) {
            let { nWrongTry } = this.state;
            nWrongTry++;
            this.state = {...this.state, nWrongTry};
            this.showXeffect(x1, y1, imgLeft);
            this.showXeffect(x1, y1, imgRight);
        }
        else {
            let { nFound } = this.state;
            nFound++;
            this.state = {...this.state, themeData, nFound};            
            // if all differences were found, show `Great Job`
            if (themeData.differences.filter(diff => !diff.founded).length == 0) {
                this.showGreatJob();
            }
        }
        if (currentPlayer)
            this.updateLabel();
    },
    /**
     * draw circle on images
     * @param {float} x 
     * @param {float} y 
     * @param {floag} radius 
     * @param {*} img1 
     * @param {*} img2 
     */
    drawCircle: function(x, y, radius, img1, img2) {
        // draw circle1
        const circle1 = this.createCircle(x, y, radius, img1, 0xff0000);
        // draw dircle2
        const circle2 =this.createCircle(x, y, radius, img2, 0xff0000);
        return [circle1, circle2];
    },
    /**
     * draw circle on image
     * @param {*} x 
     * @param {*} y 
     * @param {*} radius 
     * @param {*} container 
     */
    createCircle: function(x, y, radius, container, color) {
        const circle = this.add.circle(x, y, radius);
        circle.setStrokeStyle(5, color, 1);
        container.add(circle);

        this.tweens.add({
            targets: circle,
            scale: { from: 0, to: 1},
            ease: 'Bounce',
            duration: 200
        });
        return circle;
    },
    /**
     * create button (`Show for Student`, `Show Won`, `Reveal for Me`)
     * @param {string} name  asset name
     * @param {float} x 
     * @param {float} y 
     * @param {float} w
     * @param {float} h
     */
    createButton: function(name, x, y, w, h, callback, sender, tooltip=null) {
        const {isGameEnded} = this.state;
        const image = this.add.sprite(x, y, name).setInteractive();
        image.setDisplaySize(w, h);
        image.setOrigin(0.5, 0.5);
       
        image.on('pointerover', function(e) {
            if (tooltip) tooltip.setVisible(true);
        });
        image.on('pointerdown', function(e) {
            this.alpha = 0.5;
            callback.call(sender);
        });
        image.on('pointerout', function(e) {
            this.alpha = 1;
            if (tooltip) tooltip.setVisible(false);
        });
        image.on('pointerup', function(e) {
            this.alpha = 1;
        });
        return image;
    },
    /**
     * show x effect on wrong position
     * @param {float} x 
     * @param {float} y 
     */
    showXeffect: function(x, y, container) {
        const lblx = this.add.text(x, y, `X`, {fontFamily: 'arial', fontSize: '50px', color: 0xffffff});
        lblx.setOrigin(0.5, 0.5);
        container.add(lblx);
        this.tweens.add({
            targets: lblx,
            scale: { from: 0, to: 1},
            ease: 'Bounce',
            duration: 500,
            onComplete: function() {
                lblx.destroy();
            }
        });
    },
    /**
     * show Great Job when all differences were found
     */
    showGreatJob: function() {
        if (this.state.isGameEnded) return;

        const rect = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x000000);
        rect.setFillStyle(0x000000, 0.8);

        const isGameEnded = true;
        const self = this;
        this.state = {...this.state, isGameEnded};

        setTimeout(() => {            
            const style = {
                fontSize: '105px',
                color: '#fff',
                stroke: '#000000',
                strokeThickness: 10
            }
            const sprWin = this.add.sprite(GAME_WIDTH/2, GAME_HEIGHT/2-100, "sprWin").setInteractive();
            this.tweens.add({
                targets: sprWin,
                scale: {from: 0, to: 1},
                ease: 'Bounce',
                duration: 300,
                onComplete: function() {
                    self.createButton('btnGallery', GAME_WIDTH/2, GAME_HEIGHT/2+100, 140, 40, self.onClickGallery, self);
                }
            });
        }, 500);
    },
    /**
     * click event for `go to gallery`
     */
    onClickGallery: function() {
        const type = "goToGallery";
        sendToGameshell({
            eventType: "sendToAll",
            message: {
                type,
                data: {}
            }
        });
    },
    /**
     * click event for `Show for Student`
     */
    onClickShowStudent: function() {        
        let {btnHideStudent, btnShowStudent, isGameEnded} = this.state;
        if (isGameEnded) return;
        btnShowStudent.setVisible(false);
        btnHideStudent.setVisible(true);
        if (currentPlayer && currentPlayer.gamemaster) {
            const type = "showForStudent";
            sendToGameshell({
                eventType: "sendToAll",
                message: {
                    type,
                    data: [currentPlayer.personId]
                }
            });
        }
    },
    /**
     * click event for `Hide for Student`
     */
    onClickHideStudent: function() {        
        let {btnHideStudent, btnShowStudent, isGameEnded} = this.state;
        if (isGameEnded) return;
        btnShowStudent.setVisible(true);
        btnHideStudent.setVisible(false);
        if (currentPlayer && currentPlayer.gamemaster) {
            const type = "hideForStudent";
            sendToGameshell({
                eventType: "sendToAll",
                message: {
                    type,
                    data: [currentPlayer.personId]
                }
            });
        }
    },
    /**
     * click event for `Reveal for Me`
     */
    onClickRevealMe: function() {
        const {themeData, imgLeft, imgRight, btnRevealMe, btnHideMe, isGameEnded} = this.state;
        if (isGameEnded) return;

        let {sprCircles, isRevealed} = this.state;
        // if clicked `reveal for me`
        if (isRevealed) {
            btnRevealMe.setVisible(true);
            btnHideMe.setVisible(false);
            // remove uncovered circles
            for (const circle of sprCircles) {
                circle.destroy(true);
            }
            sprCircles = [];
        }
        // if clicked `hide for me`
        else {
            btnRevealMe.setVisible(false);
            btnHideMe.setVisible(true);
            // add uncovered circles
            for (let difference of themeData.differences) {
                let {x, y, radius, founded} = difference;
                x = x*500/themeData.width;
                y = y*700/themeData.height;
                if (!founded) {
                    sprCircles = [...sprCircles, ...this.drawCircle(x, y, radius, imgLeft, imgRight)];
                }
            }
        }
        isRevealed = !isRevealed;
        this.state = {...this.state, sprCircles, isRevealed}
    },
    /**
     * click event for `Show Won`
     */
    onClickEnd: function() {
        const { isGameEnded } = this.state;
        if (isGameEnded) return;
        const type = "showWin";
        sendToGameshell({
            eventType: "sendToAll",
            message: {
                type,
                data: {}
            }
        });
    },
    /**
     * getGameState
     */
    getGameState: function() {
        const {nWrongTry, themeData} = this.state;
        const {differences} = themeData;
        const foundIndices = [];
        for (const index in differences) {
            if (differences[index].founded) {
                foundIndices.push(index);
            }
        }
        return {
            themeIndex: gThemeIndex,
            foundIndices,
            players: Object.values(players),
            currentPlayer: currentPlayer
        }
    }
});