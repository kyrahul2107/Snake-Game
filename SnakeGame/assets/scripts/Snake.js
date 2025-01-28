cc.Class({
  extends: cc.Component,
  properties: {
    bodyPrefab: cc.Prefab,
    foodPrefab: cc.Prefab,
    scoreNode: cc.Label,
    timerLabel: cc.Label,
    delayTime: 5,
    positionsArray: [],
  },

  onLoad() {
    cc.director.getCollisionManager().enabled = true;
    this.direction = cc.v2(1, 0);
    this.snakeBody = [];
    const head = cc.instantiate(this.bodyPrefab);
    head.parent = this.node.parent;
    this.snakeBody.push(head);
    this.positionsArray.push(
      new cc.v2(this.snakeBody[0].x, this.snakeBody[0].y)
    );
    this.spawnFood();
    this.score = 0;
    this.updateScore();
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    this.checkBoundaryCollision();
    this.currentTime = this.delayTime;
    this.schedule(this.updateTimerLabel, 1);
    this.scheduleOnce(() => {
      this.loadEndGameScene();
      this.saveScore();
    }, this.delayTime);
    this.scoreHistory =
      JSON.parse(cc.sys.localStorage.getItem("scoreHistory")) || [];
  },


  saveScore() {
    // Add the current score to the history
    console.log("Save Score Method is Called");
    const newScore = {
      score: this.score, // Use this.score to assign the current score
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };
    // Push the newScore object to the scoreHistory array
    this.scoreHistory.push(newScore);
    // Save the updated history to local storage
    cc.sys.localStorage.setItem(
      "scoreHistory",
      JSON.stringify(this.scoreHistory)
    );
  },

  checkCollision(nodeA, nodeB) {
    // Get bounding boxes of both nodes
    const boxA = nodeA.getBoundingBoxToWorld();
    const boxB = nodeB.getBoundingBoxToWorld();

    // Check for intersection
    return boxA.intersects(boxB);
  },

  spawnFood() {
    const parentNode = this.node.parent;
    const tileSize = 40; // Tile size
    const halfWidth = parentNode.width / 2;
    const halfHeight = parentNode.height / 2;
    const columns = Math.floor(parentNode.width / tileSize);
    const rows = Math.floor(parentNode.height / tileSize);
    const randomCol = Math.floor(Math.random() * columns);
    const randomRow = Math.floor(Math.random() * rows);
    const foodPosX = randomCol * tileSize - halfWidth + tileSize / 2;
    const foodPosY = randomRow * tileSize - halfHeight + tileSize / 2;
    this.foodNode = cc.instantiate(this.foodPrefab);
    this.foodNode.setPosition(cc.v2(foodPosX, foodPosY));
    parentNode.addChild(this.foodNode);
  },
  

  
  foodCollisionOccu() {
    console.log("Collision Occured");
    this.foodNode.destroy();
    this.spawnFood();
    this.growSnake2();
    this.incrementScore();
  },

  growSnake2() {
    const newSegment = cc.instantiate(this.bodyPrefab);
    newSegment.parent = this.node.parent;
  
    // Get the tail position
    const lastSegmentPos = this.positionsArray[this.positionsArray.length - 1];
  
    // Calculate offset based on direction
    let offset = cc.v2(0, 0); // Default no offset
    if (this.direction.x !== 0) {
      // Moving horizontally: offset along X-axis
      offset = cc.v2(-this.direction.x * newSegment.width, 0);
    } else if (this.direction.y !== 0) {
      // Moving vertically: offset along Y-axis
      offset = cc.v2(0, -this.direction.y * newSegment.height);
    }
  
    // Calculate new position with offset
    const newSegmentPos = lastSegmentPos.add(offset);
  
    // Add the new position to the array
    this.positionsArray.push(newSegmentPos);
    this.snakeBody.push(newSegment);
  
    // Position the new segment
    newSegment.setPosition(newSegmentPos);
  },
  

  incrementScore() {
    this.score += 10;
    this.updateScore();
  },

  updateScore() {
    if (this.scoreNode) {
      this.scoreNode.string = `Score:${this.score}`;
    }
  },

  checkBoundaryCollision() {
    console.log(`Boundary Collision Occured`);
    const parent = this.node.parent;
    const halfWidth = parent.width / 2;
    const halfHeight = parent.height / 2;
    const head = this.snakeBody[0];

    if (
      head.x < -halfWidth ||
      head.x > halfWidth ||
      head.y < -halfHeight ||
      head.y > halfHeight
    ) {
      this.endGame();
    }
  },

  updateTimerLabel() {
    this.timerLabel.string = `Time Remaining: ${this.currentTime}`;
    this.currentTime--;
    if (this.currentTime < 0) {
      this.unschedule(this.updateTimerLabel);
    }
  },

  loadEndGameScene() {
    console.log("Game Over!");
    cc.director.loadScene("HomeScreen");
  },
  onDestroy() {
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
  },
});
