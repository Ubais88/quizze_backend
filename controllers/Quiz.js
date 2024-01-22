const User = require("../models/User");
const Quiz = require("../models/quiz");
const moment = require("moment");


exports.createQuiz = async (req, res) => {
  try {
    // Get user ID from request object
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required are required",
      });
    }
    // Validate request body
    const {
      quizName,
      quizType,
      timeLimit,
      correctOption,
      userSelectedOption,
      questions,
    } = req.body;

    // Check fields are present or not
    if (!quizName || !quizType) {
      return res.status(400).json({
        success: false,
        message: "Quiz name and type are required",
      });
    }

    // Check type is valid or not
    if (!["Q&A", "Poll"].includes(quizType)) {
      return res.status(400).json({
        success: false,
        message: "Quiz type must be QnA or Poll",
      });
    }

    // checking quiz type
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
      creatorId:userId
    });

    // Add the new quizId to the User Schema
    await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        $push: {
          quizzes: newQuiz._id,
        },
      },
      { new: true }
    );

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


exports.getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $inc: { impressions: 1 } }, // update impressions count by 1
      { new: true }  // send update data
    );

    console.log("quiz Exam  ", quiz);

    if (!quiz) {
      return res.status(400).json({
        success: false,
        message: "Quiz is missing or quizId is wrong",
      });
    }

    res.status(200).json({
      success: true,
      quiz,
      message: "quiz fetched successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "something went wrong during fetching quiz",
    });
  }
};


exports.getAllQuiz = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required are required",
      });
    }
    const quizzes = await Quiz.find({ creatorId: userId }, {
      quizName: true,
      _id: true,
      createdAt: true,
    });

    if (!quizzes || quizzes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "There are no quizzes available",
      });
    }
   
    const formattedQuizzes = quizzes.map(quiz => ({
      quizName: quiz.quizName,
      _id: quiz._id,
      createdOn: moment(quiz.createdAt).format("DD MMM, YYYY"),
    }));
    
    console.log("quiz Exam  ", quizzes);

    res.status(200).json({
      success: true,
      formattedQuizzes,
      message: "Quizzes fetched successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "something went wrong during fetching all quiz",
    });
  }
};


exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    // find quiz
    const quiz = await Course.findById(quizId)
	  if (!quiz) {
      return res.status(404).json({ 
        success:false,
        message: "quiz not found" 
    })
	  }

    // Delete the quiz
	  await Quiz.findByIdAndDelete(quizId)

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
      })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "something went wrong during deleting quiz",
    });
  }
};


exports.getDashboardStats = async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('quizName impressions questions createdAt');
    const totalQuizzesCreated = quizzes.length;
    const totalQuestions = quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0);
    const totalImpressions = quizzes.reduce((sum, quiz) => sum + quiz.impressions, 0);
    const topQuizzes = quizzes.sort((a, b) => b.impressions - a.impressions).slice(0, 12);

    const trendingQuizzes = topQuizzes.map(quiz => ({
      quizName: quiz.quizName,
      impressions: quiz.impressions,
      createdOn: moment(quiz.createdAt).format("DD MMM, YYYY"),
    }));

    res.status(200).json({
      success: true,
      totalQuizzesCreated,
      totalQuestions,
      totalImpressions,
      trendingQuizzes,
      message: 'Quiz Data fetched successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Something went wrong while fetching quiz stats',
    });
  }
};





















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
