cc.Class({
  extends: cc.Component,

  properties: {
    tileSize: 40,
    moveSpeed: 1,
  },

  onLoad() {
    this.direction = cc.v2(1, 0);
    this.position = cc.v2(0, 0);
    console.log("OnLoad Method Called");
  },

  start() {
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    console.log("Start Method is called");
    this.schedule(this.moveSnake, this.moveSpeed);
  },

  onKeyDown(event) {
    switch (event.keyCode) {
      case cc.macro.KEY.left:
        if (this.direction.x !== 1) this.direction = cc.v2(-1, 0); // Move left
        break;
      case cc.macro.KEY.right:
        if (this.direction.x !== -1) this.direction = cc.v2(1, 0); // Move right
        break;
      case cc.macro.KEY.up:
        if (this.direction.y !== -1) this.direction = cc.v2(0, 1); // Move up
        break;
      case cc.macro.KEY.down:
        if (this.direction.y !== 1) this.direction = cc.v2(0, -1); // Move down
        break;
    }
  },

  moveSnake() {
    let newPosition = cc.v2(
      this.node.x + this.direction.x * this.tileSize,
      this.node.y + this.direction.y * this.tileSize
    );
    if (this.isPositionWithinBounds(newPosition)) {
      console.log("New position is within bounds:", newPosition);
      this.node.setPosition(newPosition);
      console.log("Moved to new position:", this.node.position);
    } else {
      console.log("New position is out of bounds:", newPosition);
    }
  },

  isPositionWithinBounds(position) {
    const parentNode = this.node.parent;
    const halfWidth = parentNode.width / 2;
    const halfHeight = parentNode.height / 2;
    return (
      position.x >= -halfWidth + this.tileSize / 2 &&
      position.x <= halfWidth - this.tileSize / 2 &&
      position.y >= -halfHeight + this.tileSize / 2 &&
      position.y <= halfHeight - this.tileSize / 2
    );
  },
});
