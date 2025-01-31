cc.Class({
  extends: cc.Component,

  properties: {
    questionLabel: cc.Label,
    optionsContainer: cc.Node,
    submitButton: cc.Button,
    optionUIPrefab: cc.Prefab,
  },

  onLoad() {
    this.surveyData = null;
    this.node.active = true;
    this.node.zIndex = 2;
    let storedData = cc.sys.localStorage.getItem("surveyData");
    if (storedData) {
      this.surveyData = JSON.parse(storedData);
      console.log("Restored survey data from local storage.");
    }
  },

  async fetchSurveyData() {
    try {
      const response = await fetch(
        "https://instadium-live-dev.s3.us-east-1.amazonaws.com/sportsnet-rogers/SurveyData.json"
      );
      this.surveyData = await response.json();

      // Save survey data to local storage to prevent loss
      cc.sys.localStorage.setItem(
        "surveyData",
        JSON.stringify(this.surveyData)
      );

      console.log("Survey Data Loaded and Saved:", this.surveyData);
    } catch (error) {
      console.error("Error fetching survey data:", error);
    }
  },

  showSurvey() {
    console.log("Survey Method Called");

    if (this.surveyData) {
      console.log("Survey data already loaded from local storage.");
      this.node.active = true;
      this.currentQuestionIndex = 0;
      this.renderQuestion();
      return;
    }

    // Fetch new survey data if not available
    this.fetchSurveyData()
      .then(() => {
        if (
          !this.surveyData ||
          !this.surveyData.SurveyForm ||
          !this.surveyData.SurveyForm.Questions
        ) {
          console.error("Survey data not loaded.");
          return;
        }

        console.log("Data Loaded Successfully", this.surveyData);

        this.node.active = true;
        this.currentQuestionIndex = 0;
        this.renderQuestion();
        cc.game.addPersistRootNode(this.node);
      })
      .catch((error) => {
        console.error("Failed to fetch survey data:", error);
      });
  },

  renderQuestion() {
    if (
      !this.surveyData ||
      !this.surveyData.SurveyForm ||
      !this.surveyData.SurveyForm.Questions
    ) {
      console.error("Survey data is missing or corrupted.");
      return;
    }

    let questions = this.surveyData.SurveyForm.Questions;
    console.log("Questions are", questions);

    if (this.currentQuestionIndex >= questions.length) {
      console.log("Survey Completed");
      cc.game.removePersistRootNode(this.node);
      cc.director.loadScene("HomeScreen")
        console.log("Scene Reloaded");
      return;
    }

    let questionData = questions[this.currentQuestionIndex];

    let questionLabel = this.node
      .getChildByName("QuestionLabel")
      ?.getComponent(cc.Label);
    let optionsContainer = this.node
      .getChildByName("OptionsContainer")
      ?.getChildByName("OptionUI");

    let submitButton = this.node.getChildByName("SubmitButton");

    if (!questionLabel || !optionsContainer || !submitButton) {
      console.error("UI Elements not found!");
      return;
    }

    questionLabel.string = `${questionData.title}\n\n${questionData.question}`;

    // Clear existing options
    optionsContainer.removeAllChildren();

    let selectedOptions = [];

    let optionsLayout = optionsContainer.getComponent(cc.Layout);
    if (!optionsLayout) {
      optionsLayout = optionsContainer.addComponent(cc.Layout);
    }

    optionsLayout.type = cc.Layout.Type.VERTICAL;
    optionsLayout.spacingY = 1;
    optionsLayout.resizeMode = cc.Layout.ResizeMode.NONE;

    // Iterate through options
    questionData.options.forEach((optionText) => {
      let optionUI = cc.instantiate(this.optionUIPrefab);
      optionsContainer.addChild(optionUI);

      let toggleNode = optionUI.getChildByName("OptionToggle");
      let labelNode = optionUI.getChildByName("OptionLabel");

      if (!toggleNode || !labelNode) {
        console.error("OptionToggle or OptionLabel missing in prefab.");
        return;
      }

      let toggle = toggleNode.getComponent(cc.Toggle);
      let optionLabel = labelNode.getComponent(cc.Label);

      optionLabel.string = optionText;

      toggleNode.on("toggle", () => {
        if (questionData.canSelectMultipleOption) {
          if (selectedOptions.includes(optionText)) {
            selectedOptions = selectedOptions.filter(
              (opt) => opt !== optionText
            );
          } else {
            selectedOptions.push(optionText);
          }
        } else {
          selectedOptions = [optionText];
        }
      });
    });

    submitButton.off("click");
    submitButton.on("click", () => {
      console.log(
        `Selected Options for ${questionData.title}:`,
        selectedOptions
      );

      this.currentQuestionIndex++;
      if (
        !this.surveyData ||
        !this.surveyData.SurveyForm ||
        !this.surveyData.SurveyForm.Questions
      ) {
        console.error("Survey data lost before rendering next question.");
        return;
      }
      this.renderQuestion();
    });
  },

  loadEndGameScene() {
    cc.director.loadScene("HomeScreen", () => {
      console.log("Callback Called");
      setTimeout(() => {
        this.showSurvey();
        console.log("Show Survey Manager Called");
      }, 300);
    });
  },
});
