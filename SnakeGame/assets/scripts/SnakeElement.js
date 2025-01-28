cc.Class({
  extends: cc.Component,

  properties: {
    tileSize: 40,
    moveSpeed: 1,
  },

  onLoad() {
    this.direction = cc.v2(1, 0);
  },

  move() {
    const newPosition = cc.v2(
      this.node.x + this.direction.x * this.tileSize,
      this.node.y + this.direction.y * this.tileSize
    );
    if (this.isPositionWithinBounds(newPosition)) {
      this.node.setPosition(newPosition);
    } else {
      console.log("Boundary Collision Detected");
    }
  },

  calculateNewSegmentPosition() {
    const currentPos = this.node.position;
    const direction = this.lastDirection || cc.v2(0, -1); 

    const offset = 40;
    const newX = currentPos.x - direction.x * offset;
    const newY = currentPos.y - direction.y * offset;

    return cc.v2(newX, newY);
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
