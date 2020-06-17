
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
        const imgRight = null;
        const lblFound = null;
        const lblTries = null;
        const btnShowStudent = null;
        const btnHideStudent = null;
        const btnShowWon = null;
        const btnRevealMe = null;
        const btnHideMe = null;
        const sprCircles = [];

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
            imgRight,
            lblFound,
            lblTries,
            btnShowStudent,
            btnHideStudent,
            btnShowWon,
            btnRevealMe,
            btnHideMe,
            sprCircles
        }

    },
    preload: function() {
        const {themeData} = this.state;
        const fImgWidth = themeData.width;
        const fImgHeight = themeData.height;
        const fGap = (GAME_WIDTH-fImgWidth*2)/3;
        this.state = {...this.state, fGap, fImgWidth, fImgHeight};
        // load assets
        this.load.image('diff1', themeData.images[0]);
        this.load.image('diff2', themeData.images[1]);
        this.load.image('bg', 'assets/images/background.png');
        this.load.image('lblbg', 'assets/images/lblbg.png');
        this.load.image('btnShowStudent', 'assets/images/btnShowStudent.png');
        this.load.image('btnHideStudent', 'assets/images/btnHideStudent.png');
        this.load.image('btnShowWon', 'assets/images/btnShowWon.png');
        this.load.image('btnRevealMe', 'assets/images/btnRevealMe.png');
        this.load.image('btnHideMe', 'assets/images/btnHideMe.png');
        this.load.image('btnGallery', 'assets/images/btnGallery.png');
    },
    create: function() {
        gGameStarted = true;

        const { fImgWidth, fImgHeight, fGap, themeData, nFound } = this.state;
        // add background image
        const bg = this.add.sprite(GAME_WIDTH/2, GAME_HEIGHT/2, currentTheme.backImage);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        // add diff images
        const imgLeft = this.createImage(fGap, 50, fImgWidth, fImgHeight, "diff1");
        const imgRight = this.createImage(2*fGap+fImgWidth, 50, fImgWidth, fImgHeight, "diff2");
        // add found label
        const lblbg = this.add.sprite(10, 25, "lblbg");
        lblbg.setOrigin(0, 0.5);

        const lblFound = this.add.text(150, 25, ``, {fontFamily: 'arial', fontSize: '20px', color: 0xffffff});
        lblFound.setOrigin(0.5, 0.5);
        
        // create tooltips
        const tltpShow = this.add.text(330, 50, `Show number of found differences for the student`, {
            fontFamily: 'arial', 
            fontSize: '20px', 
            stroke: '#000', 
            strokeThickness: 0.1, 
            wordWrap: {
                width: 300
            },
            align: 'center',
            color: 0xffffff});
        tltpShow.setOrigin(0.5, 0.0);
        tltpShow.setVisible(false);       

        const tltpHide = this.add.text(330, 50, `Hide number of found differences for the student`, {
            fontFamily: 'arial', 
            fontSize: '20px', 
            stroke: '#000', 
            strokeThickness: 0.1, 
            wordWrap: {
                width: 300
            },
            align: 'center',
            color: 0xffffff});
        tltpHide.setOrigin(0.5, 0.0);
        tltpHide.setVisible(false);
        // create buttons
        const btnShowStudent = this.createButton('btnShowStudent', 330, 25, 62, 44, this.onClickShowStudent, this, tltpShow);
        const btnHideStudent = this.createButton('btnHideStudent', 330, 25, 62, 44, this.onClickHideStudent, this, tltpHide);
        const btnRevealMe = this.createButton('btnRevealMe', 635, 25, 231, 35, this.onClickRevealMe, this);
        const btnHideMe = this.createButton('btnHideMe', 635, 25, 231, 35, this.onClickRevealMe, this);
        const btnShowWon = this.createButton('btnShowWon', 875, 25, 231, 35, this.onClickEnd, this);

        btnShowStudent.setVisible(false);
        btnHideStudent.setVisible(false);
        btnRevealMe.setVisible(false);
        btnHideMe.setVisible(false);
        btnShowWon.setVisible(false);
        // if therapist, hide buttons
        if (isGameMaster()) {
            btnShowStudent.setVisible(true);
            btnRevealMe.setVisible(true);
            btnHideMe.setVisible(false);
            btnShowWon.setVisible(true);
        }
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
            isShowFounds: (currentPlayer && currentPlayer.gamemaster && currentPlayer.isLocal) ? true : false
        };
        this.updateBoardPos();
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
     * when isShowFound is updated, calls for reposition of images
     */
    updateBoardPos: function(flag) {
        const { isShowFounds, imgLeft, imgRight } = this.state;
        imgLeft.y = 50;
        imgRight.y = 50;
    },
    /**
     * toggle show found
     * @param {boolean} flag 
     */
    toggleShowFound: function(isShowFounds) {
        if (currentPlayer && currentPlayer.gamemaster && currentPlayer.isLocal) return;
        this.state = {...this.state, isShowFounds};
        this.updateLabel();
    },
    /**
     * update label - `x of y - z clicks`
     */
    updateLabel: function() {
        const { lblFound, isShowFounds, nFound, nWrongTry, themeData } = this.state;
        const nTotalDiffs = themeData.differences.length;
        lblFound.text = (isShowFounds ? `Found ${nFound} of ${nTotalDiffs} - ` : "") + (currentPlayer && currentPlayer.gamemaster && currentPlayer.isLocal ? `${nWrongTry} Attempts` : "");
    },
    /**
     * handle click event
     * @param {bool} isLeft : click left or right
     * @param {float} x1 : pos_x
     * @param {float} y1 : pos_y
     */
    handleClick: function(x1, y1) {
        let { imgLeft, imgRight, themeData, isGameEnded, isShowFounds } = this.state;
        if (isGameEnded) return;

        let wrong = true;
        const { differences } = themeData;

        for (const index in differences) {
            const difference = differences[index];
            if (!difference.founded) {
                const {x, y, radius} = difference;
                const dist = Phaser.Math.Distance.Between(x, y, x1, y1);
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
            if (isGameEnded) return;
            if (tooltip) tooltip.setVisible(true);
        });
        image.on('pointerdown', function(e) {
            if (isGameEnded) return;
            this.alpha = 0.5;
            callback.call(sender);
        });
        image.on('pointerout', function(e) {
            this.alpha = 1;
            if (isGameEnded) return;
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

        const rect = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0xffffff);
        rect.setFillStyle(0xffffff, 0.8);

        this.createButton('btnGallery', GAME_WIDTH/2, GAME_HEIGHT/2+100, 244, 43, this.onClickGallery, this);

        const isGameEnded = true;
        this.state = {...this.state, isGameEnded};

        setTimeout(() => {            
            const style = {
                fontSize: '105px',
                color: '#fff',
                stroke: '#000000',
                strokeThickness: 10
            }
            const label = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2, `Great Job!`, style);
            label.setOrigin(0.5, 0.5);
            this.tweens.add({
                targets: label,
                scale: {from: 0, to: 1},
                ease: 'Bounce',
                duration: 300,
                onComplete: function() {
                    // setTimeout(() => {
                        //     this.targets[0].destroy(true);
                        // }, 300);
                    }
                });
        }, 1000);
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
        let {btnHideStudent, btnShowStudent} = this.state;
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
        let {btnHideStudent, btnShowStudent} = this.state;
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
                const {x, y, radius, founded} = difference;
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