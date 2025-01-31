cc.Class({
  extends: cc.Component,

  properties: {
    questionLabel: cc.Label,
    optionsContainer: cc.Node,
    submitButton: cc.Button,
    optionUIPrefab:cc.Prefab,
  },

  onLoad() {
    this.surveyData = null;
    this.selectedOption = null;
    this.node.active = false;
    this.node.zIndex = 2;
  },

  async fetchSurveyData() {
    try {
      const response = await fetch(
        "https://instadium-live-dev.s3.us-east-1.amazonaws.com/sportsnet-rogers/SurveyData.json"
      );
      this.surveyData = await response.json();
      console.log("Survey Data Loaded:", this.surveyData);
    } catch (error) {
      console.error("Error fetching survey data:", error);
    }
  },

  showSurvey() {
    if (
      !this.surveyData ||
      !this.surveyData.SurveyForm ||
      !this.surveyData.SurveyForm.Questions
    ) {
      console.error("Survey data not loaded.");
      return;
    }

    this.node.active = true;
    this.currentQuestionIndex = 0;
    this.renderQuestion();
  },

  renderQuestion() {
    let questions = this.surveyData.SurveyForm.Questions;
    console.log("Questions are", questions);
  
    if (this.currentQuestionIndex >= questions.length) {
      console.log("Survey Completed");
      return;
    }
  
    let questionData = questions[this.currentQuestionIndex];
    console.log("This Node is", this.node);
  
    // Get references to UI elements inside prefab
    let questionLabel = this.node
      .getChildByName("QuestionLabel")
      .getComponent(cc.Label);
    let optionsContainer = this.node
      .getChildByName("OptionsContainer")
      .getChildByName("OptionUI"); // Assuming OptionUI is the parent prefab container for options
  
    console.log("Options Container is", optionsContainer);
  
    let submitButton = this.node.getChildByName("SubmitButton");
    console.log("SubmitButton", submitButton);
    questionLabel.string = `${questionData.title}\n\n${questionData.question}`;
  
    // Clear existing options
    optionsContainer.removeAllChildren();
  
    let selectedOptions = [];
  
    // Add Layout Component to handle vertical spacing
    let optionsLayout = optionsContainer.getComponent(cc.Layout);
    if (!optionsLayout) {
      optionsLayout = optionsContainer.addComponent(cc.Layout);
    }
  
    // Set the Layout properties
    optionsLayout.type = cc.Layout.Type.VERTICAL;
    optionsLayout.spacingY =1;  // Adjust this value for the vertical spacing between options
    optionsLayout.resizeMode = cc.Layout.ResizeMode.NONE; // No resizing
  
    // Iterate through each option and instantiate OptionUI prefab for each option
    questionData.options.forEach((optionText, index) => {
      // Instantiate OptionUI prefab for each option
      let optionUI = cc.instantiate(this.optionUIPrefab); // Assuming you have optionUIPrefab reference set
      optionsContainer.addChild(optionUI);
  
      // Get references to OptionToggle and OptionLabel inside OptionUI
      let toggleNode = optionUI.getChildByName("OptionToggle");
      let labelNode = optionUI.getChildByName("OptionLabel");
  
      console.log("Toggle Node is", toggleNode);
      console.log("Label Node is", labelNode);
  
      if (!toggleNode || !labelNode) {
        console.error(
          "Missing OptionToggle or OptionLabel node inside OptionUI prefab."
        );
        return;
      }
  
      // Get components of the toggle and label
      let toggle = toggleNode.getComponent(cc.Toggle);
      let optionLabel = labelNode.getComponent(cc.Label);
  
      // Set the option label text
      optionLabel.string = optionText;
  
      // Ensure Toggle is properly working
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
  
    // Submit button logic
    submitButton.on("click", () => {
      console.log(
        `Selected Options for ${questionData.title}:`,
        selectedOptions
      );
      this.currentQuestionIndex++;
      this.renderQuestion();
    });
  }  
});
