
var LoadScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function LoadScene() {
        Phaser.Scene.call(this, {key: 'LoadScene'});
    },

    preload: function() {
        this.load.image('bg', 'assets/images/background.png');
    },

    create: function() {
        // add background image
        const bg = this.add.sprite(GAME_WIDTH/2, GAME_HEIGHT/2, "bg");
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        // create label 'SPOT THE DIFFERENCE' on the center of screen
        const label = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2, "SPOT THE DIFFERENCE", {fontSize: '25px'});
        // set anchor point
        label.setOrigin(0.5, 0.5);

        setTimeout(() => {
            this.loadChooseScene();
        }, 1000);
    },

    loadChooseScene: function() {
        this.scene.start('ChooseScene');
    }
});