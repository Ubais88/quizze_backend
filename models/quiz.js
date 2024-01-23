const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "imageurl", "textandimageurl"],
    required: true,
  },
  optionText: {
    type: String,
    required: function () {
      return this.type === "text" || this.type === "textandimageurl";
    },
  },
  imageUrl: {
    type: String,
    required: function () {
      return this.type === "imageurl" || this.type === "textandimageurl";
    },
  },
  correct: {
    type: Boolean,
    default: false,
  }, 
});


const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [optionSchema],

  // Common fields for both Q&A and Poll types
  correctOption: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Option",
  },

  // Fields specific to Q&A type
  totalAnswers: {
    type: Number,
    default: 0,
    required: function () {
      return this.parent().quizType === "Q&A";
    },
  },
  correctAnswers: {
    type: Number,
    default: 0,
    required: function () {
      return this.parent().quizType === "Q&A";
    },
  },
  wrongAnswers: {
    type: Number,
    default: 0,
    required: function () {
      return this.parent().quizType === "Q&A";
    },
  },

  // Fields specific to Poll type
  optionCounts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Option",
      selectCount: {
        type: Number,
        default: 0,
      },
    },
  ],
});



const quizSchema = new mongoose.Schema({
  quizName: {
    type: String,
    required: true,
  },
  quizType: {
    type: String,
    enum: ["Q&A", "Poll"],
    required: true,
  },
  timeLimit: {
    type: Number,
    enum: [0, 5, 10],
    default: 0,
  },
  
  questions: [questionSchema],

  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },

  impressions: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("Quiz", quizSchema);
