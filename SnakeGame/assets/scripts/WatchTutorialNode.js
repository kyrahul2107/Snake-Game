cc.Class({
  extends: cc.Component,

  properties: {
    watchTutorialNode: {
      default: null,
      type: cc.VideoPlayer, // Assign this in the Inspector
    },
    bundleName: "videoBundle",
  },

  onWatchTutorialRemote() {
    console.log("Loading Remote Asset Bundle...");
    let self = this;
    let videoAssetPath =
      "https://instadium-live-dev.s3.amazonaws.com/test/VideoBundle";
    cc.assetManager.loadBundle(
      videoAssetPath,
      cc.VideoClip,
      (err, videoAsset) => {
        if (err) {
          console.error("Failed to load video from URL:", err);
          return;
        }
        console.log("Video Loaded:", videoAsset.nativeUrl);

        self.videoPlayer = self.watchTutorialNode.getComponent(cc.VideoPlayer);

        if (!self.videoPlayer) {
          console.error("VideoPlayer component not found!");
          return;
        }

        self.watchTutorialNode.node.active = true;
        if (videoAsset.name == "LeadinVideo")
          self.watchTutorialNode.videoClip = videoAsset;
        self.videoPlayer.node.on(
          "ready-to-play",
          () => {
            console.log("🎥 Video is ready! Playing...");
            self.videoPlayer.play();
          },
          self
        );
      }
    );
  },
});
