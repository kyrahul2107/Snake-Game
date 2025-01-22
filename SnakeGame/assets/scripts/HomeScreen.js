cc.Class({
    extends: cc.Component,

    properties: {
        soundButton: cc.Button,
        playButton: cc.Button,
        scoreHistoryButton: cc.Button,
    },


    onLoad() {
        this.soundButton.node.on('click', this.onSoundButtonClick, this);
        this.playButton.node.on('click', this.onPlayButtonClick, this);
        this.scoreHistoryButton.node.on('click', this.onScoreHistoryButtonClick, this);
    },

    // onSoundButtonClick() {
    //     cc.log('Sound button clicked!');
    // },

    onPlayButtonClick() {
        cc.director.loadScene('GameScene');
        console.log("Game Scene Loaded");
        
        
    },

    // onScoreHistoryButtonClick() {
    //     cc.log('Score History button clicked!');
    // },

    start() {
    },

    // update (dt) {},

});
