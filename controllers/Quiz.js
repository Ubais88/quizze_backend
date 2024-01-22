const Quiz = require("../models/quiz");

exports.createQuiz = async (req, res) => {
  try {
    // Validate request body
    const {
      quizName,
      quizType,
      timeLimit,
      correctOption,
      userSelectedOption,
      questions,
    } = req.body;

    // Check if required fields are present
    if (!quizName || !quizType) {
      return res.status(400).json({
        success: false,
        message: "Quiz name and type are required",
      });
    }

    // Check if the type is valid
    if (!["Q&A", "Poll"].includes(quizType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz type",
      });
    }

    // Additional validation based on the quiz type
    if (quizType === "Q&A") {
      if (timeLimit === undefined || ![0, 5, 10].includes(timeLimit)) {
        return res.status(400).json({
          success: false,
          message: "Invalid time limit for Q&A quiz",
        });
      }

      // Validate questions for Q&A quizType
      validateQuestionsForQnAQuiz(questions);
    } else if (quizType === "Poll") {
      // Validate questions for Poll quizType
      validateQuestionsForPollQuiz(questions);
      if (timeLimit) {
        return res.status(400).json({
          success: false,
          message: "Poll type in not supported any time limit",
        }); 
      }
    }

    // Create the quiz
    const newQuiz = await Quiz.create({
      quizName,
      quizType,
      timeLimit,
      questions,
      correctOption,
      userSelectedOption,
    });

    res.status(201).json({
      success: true,
      newQuiz,
      message: "Quiz created successfully",
    });
  } catch (error) {
    console.error(error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


exports.getQuiz = async(req , res) => {
  try{
    const { quizId } = req.params;
  }
  catch(error){
    console.log(error)
    res.status(500).json({
      success: false,
      error:error.message,
      message:"something went wrong during fetching quiz"
    })
  }
}

































// Helper function to validate questions for Q&A quizType
const validateQuestionsForQnAQuiz = (questions) => {
  if (!Array.isArray(questions) || questions.length < 1) {
    throwValidationErrorForQuestions("At least one question is required");
  }

  questions.forEach((question) => {
    validateQuestionContentAndOptions(question);
    validateSingleCorrectOption(question);
  });
};

// Helper function to validate questions for Poll quizType
const validateQuestionsForPollQuiz = (questions) => {
  if (!Array.isArray(questions) || questions.length < 1) {
    throwValidationErrorForQuestions("At least one question is required");
  }

  questions.forEach((question) => {
    validateQuestionContentAndOptions(question);
  });
};

// Helper function to throw a validation error with a specific message
const throwValidationErrorForQuestions = (message) => {
  throw { name: "ValidationError", errors: { questions: message } };
};

// Helper function to validate question content and options
const validateQuestionContentAndOptions = (question) => {
  if (
    !question.questionText ||
    !Array.isArray(question.options) ||
    question.options.length < 2
  ) {
    throwValidationErrorForQuestions(
      "Each question must have content and at least two options"
    );
  }
};

// Helper function to validate a single correct option
const validateSingleCorrectOption = (question) => {
  const correctOptions = question.options.filter((option) => option.correct);
  if (correctOptions.length !== 1) {
    throwValidationErrorForQuestions(
      "Each question must have exactly one correct option"
    );
  }
};
