const Snake = require("Snake");
cc.Class({
  extends: cc.Component,

  properties: {
    soundButton: cc.Button,
    playButton: cc.Button,
    scoreHistoryButton: cc.Button,
    audioClip: {
      default: null,
      type: cc.AudioClip,
    },
    audioOnSprite: {
      default: null,
      type: cc.SpriteFrame,
    },
    audioOffSprite: {
      default: null,
      type: cc.SpriteFrame,
    },
    scoreRowPrefab: {
      default: null,
      type: cc.Prefab,
    },
    scoreHistoryContainer: {
      default: null,
      type: cc.Node,
    },
  },

  onLoad() {
    this.isSoundOn = true;
    this.audioID = cc.audioEngine.play(this.audioClip, true, 1);
    this.soundButton.node.on("click", this.onSoundButtonClick, this);
    this.playButton.node.on("click", this.onPlayButtonClick, this);
    this.scoreHistoryButton.node.on(
      "click",
      this.onScoreHistoryButtonClick,
      this
    );
    this.updateSoundButtonSprite();
    this.scoreHistory = JSON.parse(cc.sys.localStorage.getItem("scoreHistory"));
  },

  onSoundButtonClick() {
    console.log("Sound Button is being Clicked");
    this.isSoundOn = !this.isSoundOn;
    if (this.isSoundOn) {
      this.audioID = cc.audioEngine.play(this.audioClip, true, 1);
    } else {
      cc.audioEngine.stop(this.audioID);
      this.audioID = null;
    }
    this.updateSoundButtonSprite();
  },

  updateSoundButtonSprite() {
    const buttonSprite = this.soundButton.getComponent(cc.Sprite);
    // console.log(buttonSprite);
    buttonSprite.spriteFrame = this.isSoundOn
      ? this.audioOffSprite
      : this.audioOnSprite;
    //console.log(buttonSprite);
  },

  onPlayButtonClick() {
    cc.director.loadScene("GameScene");
    console.log("Game Scene Loaded");
  },

  onScoreHistoryButtonClick() {
    console.log("Score History button clicked!");
    // Clear previous rows
    console.log("Before Removale of Child Node", this.scoreHistoryContainer);

    this.scoreHistoryContainer.removeAllChildren();
    console.log("After Removale of Child Node", this.scoreHistoryContainer);
    console.log("Score History Array is:", this.scoreHistory);
    // Loop through the scoreHistory array and create rows
    this.scoreHistory.forEach((scoreData, index) => {
      // Instantiate the ScoreRowPrefab
      const scoreRow = cc.instantiate(this.scoreRowPrefab);

      // Set the score, date, and time
      scoreRow
        .getChildByName("ScoreLabel")
        .getComponent(cc.Label).string = `Score: ${scoreData.score}`;
      scoreRow
        .getChildByName("DateLabel")
        .getComponent(cc.Label).string = `Date: ${scoreData.date}`;
      scoreRow
        .getChildByName("TimeLabel")
        .getComponent(cc.Label).string = `Time: ${scoreData.time}`;

      // Position the row within the container
      const rowHeight = 50; // Adjust this value based on the height of your prefab
      scoreRow.setPosition(0, -index * rowHeight); // Arrange rows vertically, with a gap of rowHeight

      // Add the row to the container
      this.scoreHistoryContainer.addChild(scoreRow);
    });

    console.log(
      "After Looping the Score History Array:",
      this.scoreHistoryContainer
    );
    if (this.scoreHistoryContainer) {
      // Add a Graphics component to the node to draw the background
      let graphics = this.scoreHistoryContainer.addComponent(cc.Graphics);

      // Set the fill color to white
      graphics.fillColor = cc.Color.WHITE;

      // Get the size of the scoreHistoryContainer node
      let width = this.scoreHistoryContainer.width;
      let height = this.scoreHistoryContainer.height;

      // Draw a filled rectangle to serve as the background
      graphics.fillRect(-width / 2, -height / 2, width, height);
    } else {
      console.warn("scoreHistoryContainer is not assigned!");
    }
  },

  start() {},
});
