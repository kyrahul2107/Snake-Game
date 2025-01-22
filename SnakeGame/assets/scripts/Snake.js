cc.Class({
    extends: cc.Component,

    properties: {
        moveSpeed: 100,
        bodyPrefab: cc.Prefab,
        foodPrefab: cc.Prefab,
    },

    onLoad() {
        // Initialize direction (default: moving right)
        this.direction = cc.v2(1, 0);
        const newSegment = cc.instantiate(this.bodyPrefab);
        this.snakeBody = [newSegment];
        this.spawnFood();
        // Listen for keyboard input events
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        // console.log('Parent Width:', parent.width, 'Parent Height:', parent.height);
    },

    onKeyDown(event) {
        switch (event.keyCode) {
            case cc.macro.KEY.left:
                if (this.direction.x !== 1) {
                    console.log('Key Left Pressed');
                    this.direction = cc.v2(-1, 0);
                }
                break;
            case cc.macro.KEY.right:
                if (this.direction.x !== -1) {
                    console.log('Key Right Pressed');
                    this.direction = cc.v2(1, 0);
                }
                break;
            case cc.macro.KEY.up:
                if (this.direction.y !== -1) {
                    console.log('Key Up Pressed');
                    this.direction = cc.v2(0, 1);
                }
                break;
            case cc.macro.KEY.down:
                if (this.direction.y !== 1) {
                    console.log('Key Down Pressed');
                    this.direction = cc.v2(0, -1);
                }
                break;
        }
    },

    update(dt) {
        // Move the snake by shifting each body segment
        for (let i = this.snakeBody.length - 1; i > 0; i--) {
            this.snakeBody[i].setPosition(this.snakeBody[i - 1].position);
        }

        // Move the head (the first segment in the array)
        const movement = this.direction.mul(this.moveSpeed * dt);
        this.node.setPosition(this.node.position.add(movement));

        // Check for collision with food
        this.checkFoodCollision();

        // Keep the snake within the parent's boundaries
        const parent = this.node.parent;
        const halfWidth = parent.width / 2;
        const halfHeight = parent.height / 2;

        const clampedX = Math.min(halfWidth, Math.max(-halfWidth, this.node.x));
        const clampedY = Math.min(halfHeight, Math.max(-halfHeight, this.node.y));

        this.node.setPosition(clampedX, clampedY);
    },

    checkFoodCollision() {
        const food = this.foodNode;
        if (food && this.node.getBoundingBoxToWorld().intersects(food.getBoundingBoxToWorld())) {
            console.log('Collision Occured');
            this.growSnake();
            food.destroy();
            this.spawnFood();
        }
    },

    growSnake() {
        // Create a new body segment (instantiate a prefab)
        console.log('Snake Grows Called');
        const newSegment = cc.instantiate(this.bodyPrefab);
        // Add the new segment to the end of the snake body
        const lastSegment = this.snakeBody[this.snakeBody.length - 1];
        newSegment.setPosition(lastSegment.position);
        newSegment.color = cc.Color.WHITE;
        newSegment.zIndex = this.snakeBody.length;
        this.node.parent.addChild(newSegment);
        // Add the new segment to the snake body array
        this.snakeBody.push(newSegment);
        console.log('Size of the Snake', this.snakeBody);
        console.log('Child count:', this.node.parent);
        // console.log('Child count:', this.node.parent.childrenCount);
        // console.log('Last Segment', lastSegment.x, lastSegment.y);
        // console.log('New Segment', newSegment.x, newSegment.y);
        console.log('Snake Body:', this.snakeBody.map((seg, i) => `Segment ${i}: ${seg.position}`));
    },

    spawnFood() {
        const parentNode = this.node.parent;
        const halfWidth = parentNode.width / 2;
        const halfHeight = parentNode.height / 2;

        const foodPosX = Math.random() * halfWidth * 2 - halfWidth;
        const foodPosY = Math.random() * halfHeight * 2 - halfHeight;

        this.foodNode = cc.instantiate(this.foodPrefab);
        this.foodNode.setPosition(foodPosX, foodPosY);
        parentNode.addChild(this.foodNode); // Add food to the parent node
    },

    onDestroy() {
        // Clean up event listeners when the node is destroyed
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },
});
