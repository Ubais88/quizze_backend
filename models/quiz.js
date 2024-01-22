const mongoose = require("mongoose");


// Define a common sub-schema for options
const optionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "imageurl", "textandimageurl"],
    required: true,
  },
  optionText: String,
  correct: {
    type: Boolean,
    default: false,
  },
});

// questoins schema containing option schema
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [optionSchema],
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
    enum: [0, 5 , 10],
    default: 0,
  },
  userSelectedOption: [{
    type: String,
    default: "",
  }],
  questions: [questionSchema], 

  creatorId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "user",
	},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});




module.exports = mongoose.model("Quiz", quizSchema);
