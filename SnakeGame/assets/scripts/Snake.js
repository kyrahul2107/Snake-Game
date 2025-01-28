cc.Class({
  extends: cc.Component,

  properties: {
    bodyPrefab: cc.Prefab,
    foodPrefab: cc.Prefab,
    scoreNode: cc.Label,
    timerLabel: cc.Label,
    delayTime: 5,
    snakeBody: [],
  },

  onLoad() {
    cc.director.getCollisionManager().enabled = true;
    cc.director.getCollisionManager().enabledDebugDraw = true;
    this.snakeBody = [];

    // Create and position the head of the snake
    const head = cc.instantiate(this.bodyPrefab);
    head.parent = this.node.parent;
    this.snakeBody.push(head);

    // Spawn initial food
    this.spawnFood();

    this.schedule(this.moveSnake, 0.4);

    // Initialize score and timer
    this.score = 0;
    this.updateScore();
    this.currentTime = this.delayTime;
    this.schedule(this.updateTimerLabel, 1);

    // Schedule game over and score save
    this.scheduleOnce(() => {
      this.loadEndGameScene();
      this.saveScore();
    }, this.delayTime);

    // Setup input listeners
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);

    // Load score history
    this.scoreHistory =
      JSON.parse(cc.sys.localStorage.getItem("scoreHistory")) || [];
  },

  onKeyDown(event) {
    const headComp = this.snakeBody[0].getComponent("SnakeElement");

    switch (event.keyCode) {
      case cc.macro.KEY.left:
        if (headComp.direction.x !== 1) headComp.direction = cc.v2(-1, 0); 
        break;
      case cc.macro.KEY.right:
        if (headComp.direction.x !== -1) headComp.direction = cc.v2(1, 0); 
        break;
      case cc.macro.KEY.up:
        if (headComp.direction.y !== -1) headComp.direction = cc.v2(0, 1);
        break;
      case cc.macro.KEY.down:
        if (headComp.direction.y !== 1) headComp.direction = cc.v2(0, -1);
        break;
    }
  },

  growSnake() {
    const newSegment = cc.instantiate(this.bodyPrefab);
    newSegment.parent = this.node.parent;

    const lastSegment = this.snakeBody[this.snakeBody.length - 1];
    const lastSegmentComp = lastSegment.getComponent("SnakeElement");
    const newSegmentPos = lastSegmentComp.calculateNewSegmentPosition();

    newSegment.setPosition(newSegmentPos);
    this.snakeBody.push(newSegment);
  },

  moveSnake() {
    this.checkFoodCollision();
    this.checkSelfCollision();

    const previousPositions = [];

    const head = this.snakeBody[0];
    const headComp = head.getComponent("SnakeElement");
    previousPositions.push(head.position);

    headComp.move();

    for (let i = 1; i < this.snakeBody.length; i++) {
      const currentSegment = this.snakeBody[i];

      previousPositions[i] = currentSegment.position;

      currentSegment.setPosition(previousPositions[i - 1]);
    }
  },

  spawnFood() {
    const parentNode = this.node.parent;
    const tileSize = 40; 
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

  checkCollision(nodeA, nodeB) {
    const boxCollider = nodeA.getComponent(cc.PhysicsBoxCollider);
    const circleCollider = nodeB.getComponent(cc.PhysicsCircleCollider);
  
    const boxWorldPos = nodeA.convertToWorldSpaceAR(cc.v2(0, 0)); // Box position in world space
    const boxWidth = boxCollider.size.width;
    const boxHeight = boxCollider.size.height;

    // Get the circle collider's world position and radius
    const circleWorldPos = nodeB.convertToWorldSpaceAR(cc.v2(0, 0)); // Circle position in world space
    const circleRadius = circleCollider.radius;

    // Find the closest point on the box to the circle center
    const closestX = Math.max(
      boxWorldPos.x - boxWidth / 2,
      Math.min(circleWorldPos.x, boxWorldPos.x + boxWidth / 2)
    );
    const closestY = Math.max(
      boxWorldPos.y - boxHeight / 2,
      Math.min(circleWorldPos.y, boxWorldPos.y + boxHeight / 2)
    );

    // Calculate the distance between the closest point and the circle's center
    const distanceX = circleWorldPos.x - closestX;
    const distanceY = circleWorldPos.y - closestY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // If the distance is less than or equal to the circle's radius, it's a collision
    return distance <= circleRadius;
  },

  checkSelfCollision() {
    const head = this.snakeBody[0];
    for (let i = 1; i < this.snakeBody.length; i++) {
      const segment = this.snakeBody[i];
      if (this.arePositionsEqual(head.position, segment.position)) {
        console.log("Game Over!");
        cc.director.loadScene("HomeScreen");
        return true;
      }
    }

    return false;
  },

  arePositionsEqual(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  },

  checkFoodCollision() {
    const head = this.snakeBody[0];
    if (this.checkCollision(head, this.foodNode)) {
      this.foodNode.destroy();
      this.growSnake();
      console.log("Food Collision Occured");
      this.spawnFood();
      this.incrementScore();
    }
  },

  incrementScore() {
    this.score += 10;
    this.updateScore();
  },

  updateScore() {
    if (this.scoreNode) {
      this.scoreNode.string = `Score: ${this.score}`;
    }
  },

  updateTimerLabel() {
    this.timerLabel.string = `Time Remaining: ${this.currentTime}`;
    this.currentTime--;
    if (this.currentTime < 0) {
      this.unschedule(this.updateTimerLabel);
    }
  },

  saveScore() {
    console.log("Save Score Method is Called");

    const newScore = {
      score: this.score,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    this.scoreHistory.push(newScore);
    cc.sys.localStorage.setItem(
      "scoreHistory",
      JSON.stringify(this.scoreHistory)
    );
  },

  loadEndGameScene() {
    console.log("Game Over!");
    cc.director.loadScene("HomeScreen");
  },

  onDestroy() {
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
  },
});
