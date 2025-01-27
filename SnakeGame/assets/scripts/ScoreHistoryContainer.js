cc.Class({
    extends: cc.Component,

    properties: {
        scoreHistoryContainer: {
            default: null,
            type: cc.Node,
        },
    },

    onLoad() {
        // if (this.scoreHistoryContainer) {
        //     // Add a Graphics component to the node to draw the background
        //     let graphics = this.scoreHistoryContainer.addComponent(cc.Graphics);

        //     // Set the fill color to white
        //     graphics.fillColor = cc.Color.WHITE;

        //     // Get the size of the scoreHistoryContainer node
        //     let width = this.scoreHistoryContainer.width;
        //     let height = this.scoreHistoryContainer.height;

        //     // Draw a filled rectangle to serve as the background
        //     graphics.fillRect(-width / 2, -height / 2, width, height);
        // } else {
        //     console.warn('scoreHistoryContainer is not assigned!');
        // }
    },
});
