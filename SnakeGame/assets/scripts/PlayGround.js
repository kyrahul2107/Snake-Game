cc.Class({
    extends: cc.Component,
  
    properties: {
      tilePrefab:cc.Prefab
    },
  
    onLoad() {
      this.fillPlaygroundWithTiles()
    },
  
    fillPlaygroundWithTiles() {
      const tileSize = 40;
      const playgroundWidth = this.node.width;
      const playgroundHeight = this.node.height;
      const columns = Math.floor(playgroundWidth / tileSize);
      const rows = Math.floor(playgroundHeight / tileSize);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const newTile = cc.instantiate(this.tilePrefab); 
          const x = col * tileSize + tileSize / 2 - playgroundWidth / 2;
          const y = row * tileSize + tileSize / 2 - playgroundHeight / 2;
          newTile.setPosition(cc.v2(x, y));
          newTile.parent = this.node;
        }
      }
    }
    
  });
  