var ChooseScene = new Phaser.Class({

    Extends: Phaser.Scene,

    /**
     * game state
     */
    state: {
        nThemes: 0,
        nRow: 2,            // theme cards rows
        nCol: 4,            // theme cards cols
        fGap: 5,           // gap between cards
        fCardWidth: 0,      // card width
        fCardHeight: 0,     // card height
        pageContainers: [], // page containers
        nCurrPage: 0,       // page index
        nTotalPages: 0,     // total pages
        sprOutline: null    // border image
    },

    initialize: function ChooseScene() {
        Phaser.Scene.call(this, {key: 'ChooseScene'});
    },

    preload: function() {
        gGameData.forEach((theme, index) => {
            this.load.image(`theme${index}`, theme.thumbnail);
        });
        console.log("currentTheme", currentTheme)
        this.load.image('prev', currentTheme.leftButton);
        this.load.image('next', currentTheme.rightButton);
    },

    create: function() {
        // calculate size
        const nThemes = gGameData.length;
        this.state = {...this.state, nThemes};
        this.calcSize();

        const { nRow, nCol, fGap, fCardWidth, fCardHeight, pageContainers } = this.state;
        let pageIndex = 0;
        let page = null;
        let index = 0;

        const sprOutline = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, fCardWidth+2*fGap, fCardHeight+2*fGap, currentTheme.cardBorderColor);
        sprOutline.setVisible(false);
        this.state = {...this.state, sprOutline}

        for (let i = 0 ; i < nThemes ; i++) {
            // create page
            if (i % (nRow * nCol) == 0) {
                page = this.add.container(GAME_WIDTH*pageIndex, 0);
                page.setSize(GAME_WIDTH, GAME_HEIGHT);
                pageIndex++;
                index = 0;
                pageContainers.push(page);
            }
            // calc row & col
            const row = Math.floor(index/4);
            const col = index % 4;
            // calc x & y
            const x = fGap * (col+1) + fCardWidth*(col+0.5);
            const y = fGap * (row+1) + fCardHeight*(row+0.5);
            // create card
            this.createCard(i, x, y, fCardWidth, fCardHeight, page);
            index++;
        }

        this.createNavButtons();
        this.state = {...this.state, pageContainers}
    },

    /**
     * calculate card width & height
     */
    calcSize: function() {
        const { nThemes, fGap, nRow, nCol } = this.state;

        const nTotalPages = Math.ceil(nThemes/nRow/nCol);
        const fCardWidth = (GAME_WIDTH - fGap * (nCol + 1)) / nCol;
        const fCardHeight = (GAME_HEIGHT - fGap * (nRow + 1)) / nRow;

        this.state = {...this.state, fCardWidth, fCardHeight, nTotalPages};
    },

    /**
     * create card
     * @param {integer} index Card Index
     * @param {float} x Pos_x
     * @param {float} y Pos_y
     * @param {float} w width
     * @param {float} h height
     * @param {*} container container to put theme image & label
     */
    createCard: function(index, x, y, w, h, container) {
        const { nThemes, fCardWidth, fCardHeight, sprOutline } = this.state;
        const self = this;

        // create sprite
        const sprite = this.add.sprite(x, y, `theme${index}`).setInteractive();
        
        sprite.setDisplaySize(w, h);
        sprite.index = index;
        
        sprite.on('pointerover', function(e) {
            sprOutline.x = this.x;
            sprOutline.y = this.y;
            sprOutline.setVisible(true);
        });
        sprite.on('pointerdown', function(e) {
            // check controlsEnabled
            if (currentPlayer && !currentPlayer.controlsEnabled) return;
            // if controls is enabled
            gThemeIndex = this.index;
            // send picked image index
            sendToGameshell({
                eventType: "sendToAll",
                message: {
                    type: "pickedScene",
                    data: gThemeIndex
                }
            });
        });
        sprite.on('pointerout', function(e) {
            sprOutline.setVisible(false);
        });
        
        // create label (x/y)
        const label = this.add.text(
            x+fCardWidth/2-10, 
            y-fCardHeight/2+10, 
            `${index+1}/${nThemes}`, 
            {
                fontSize: '25px',
                color: '#000000'
            }
        );
        label.setOrigin(1, 0);

        container.add([sprite, label]);
    },

    /**
     * create navigation buttons for showing prev & next page
     */
    createNavButtons: function() {
        let { nCurrPage, nTotalPages, pageContainers } = this.state;
        const self = this;

        // prev
        const btnPrev = this.add.sprite(0, GAME_HEIGHT/2, 'prev').setInteractive();
        btnPrev.setOrigin(0, 0.5);
        btnPrev.alpha = 1;
        btnPrev.on('pointerover', function(e) {
            this.alpha = 1;
        });
        btnPrev.on('pointerdown', function(e) {
            this.alpha = 0.9;
            // check controlsEnabled
            if (currentPlayer && !currentPlayer.controlsEnabled) return;
            // if controls is enabled
            if (nCurrPage > 0) {
                for (let page of pageContainers) {
                    const tween = self.tweens.add({
                        targets: page,
                        x: page.x + GAME_WIDTH,
                        duration: 200
                    });
                    self.state = {...self.state, nCurrPage};
                }
                nCurrPage--;
            }
        });
        btnPrev.on('pointerout', function(e) {
            this.alpha = 1;
        });

        // next
        const btnNext = this.add.sprite(GAME_WIDTH, GAME_HEIGHT/2, 'next').setInteractive();
        btnNext.setOrigin(1, 0.5);
        btnNext.alpha = 1;
        btnNext.on('pointerover', function(e) {
            this.alpha = 0.9;
        });
        btnNext.on('pointerdown', function(e) {
            // check controlsEnabled
            if (currentPlayer && !currentPlayer.controlsEnabled) return;
            // if controls is enabled
            if (nCurrPage < nTotalPages-1) {
                for (let page of pageContainers) {
                    const tween = self.tweens.add({
                        targets: page,
                        x: page.x - GAME_WIDTH,
                        duration: 200
                    });
                    self.state = {...self.state, nCurrPage};
                }
                nCurrPage++;
            }
        });
        btnNext.on('pointerout', function(e) {
            this.alpha = 1;
        });
    }
}); 