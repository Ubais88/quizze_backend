const Quiz = require("../models/quiz");
const moment = require("moment");

exports.createQuiz = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id;
    // console.log("userId: " + userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required are required",
      });
    }
    // Validate request body
    const { quizName, quizType, timeLimit, questions } = req.body;

    console.log(
      "quizName, quizType, timeLimit, questions",
      quizName,
      quizType,
      timeLimit,
      questions
    );
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
      const status = validateQnAQuiz(questions);
      console.log("success", status);
      if (!status.success) {
        return res.status(400).json({
          status,
        });
      }
    } else if (quizType === "Poll") {
      // Validate questions for Poll quizType
      validatePollQuiz(questions);
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
      creatorId: userId,
    });

    res.status(201).json({
      success: true,
      // newQuiz,
      quizId: newQuiz._id,
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

exports.playQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const savedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $inc: { impressions: 1 } },
      { new: true }
    ).select("questions timeLimit quizType impressions");

    // console.log("quiz Exam Data : ", savedQuiz);

    if (!savedQuiz) {
      return res.status(400).json({
        success: false,
        message: "Quiz is missing or quizId is wrong",
      });
    }

    res.status(200).json({
      success: true,
      savedQuiz,
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

// exports.playQuiz = async (req, res) => {
//   try {
//     const { quizId } = req.params;

//     const savedQuiz = await Quiz.findById(quizId).select('questions timeLimit quizType')

//     console.log("quiz Exam  ", savedQuiz);

//     if (!savedQuiz) {
//       return res.status(400).json({
//         success: false,
//         message: "Quiz is missing or quizId is wrong",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       savedQuiz,
//       message: "Result Updated successfully",
//     });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       message: "something went wrong during fetching quiz",
//     });
//   }
// };

exports.getResult = async (req, res) => {
  try {
    const { quizId, userResponses, quizType } = req.body;
    console.log("quizType", quizType);
    const quiz = await Quiz.findById(quizId);
    // Initialize variables for scoring and statistics
    let correctAnswers = 0;

    if (quizType === "Q&A") {
      userResponses.forEach((userResponse) => {
        const question = quiz.questions.find(
          (q) => q.id === userResponse.questionId
        );

        if (question) {
          const selectedOption = question.options[userResponse.selectedOption];

          if (selectedOption) {
            // Update question statistics
            question.totalAnswers++;
            if (selectedOption.correct) {
              question.correctAnswers++;
              correctAnswers++;
            } else {
              question.wrongAnswers++;
            }
          }
        }
      });
      await quiz.save();

    } else {
      userResponses.forEach((userResponse) => {
        const { questionId, selectedOption } = userResponse;
        // Find the question
        const question = quiz.questions.find((q) => q.id === questionId);
      
        if (!question) {
          return res.status(400).json({
            success: false,
            message: "Question not found in the quiz",
          });
        }
      
        // Ensure selectedOption is within bounds
        if (selectedOption >= 0 && selectedOption < question.options.length) {
          const selectedOptionObj = question.options[selectedOption];
          if (selectedOptionObj) {
            selectedOptionObj.selectedCount += 1;
          }
        } else {
          return res.status(400).json({
            success: false,
            message: "Invalid selected option index",
          });
        }
      });
      
      await quiz.save();
      
    }


    console.log("results", correctAnswers);
    // Respond with the calculated score
    res.status(200).json({
      score: correctAnswers,
      totalQuestions: quiz.questions.length,
    });
  } catch (error) {
    console.error("Error submitting responses:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);

    // console.log("quiz Exam  ", quiz);

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

exports.quizAnalysis = async (req, res) => {
  try {
    const { quizId } = req.params;

    const savedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { new: true } // send update data
    );

    console.log("quiz Exam  ", savedQuiz);

    if (!savedQuiz) {
      return res.status(400).json({
        success: false,
        message: "Quiz is missing or quizId is wrong",
      });
    }
    if (savedQuiz.quizType === "Poll") {
      const quiz = {
        quizType: savedQuiz.quizType,
        quizName: savedQuiz.quizName,
        questions: savedQuiz.questions,
        impressions: savedQuiz.impressions,
        createdOn: moment(savedQuiz.createdAt).format("DD MMM, YYYY"),
      };
      res.status(200).json({
        success: true,
        savedQuiz,
        quiz,
        message: "quiz fetched successfully",
      });
    } else {
      const quiz = {
        quizType: savedQuiz.quizType,
        quizName: savedQuiz.quizName,
        questions: savedQuiz.questions,
        impressions: savedQuiz.impressions,
        createdOn: moment(savedQuiz.createdAt).format("DD MMM, YYYY"),
      };
      res.status(200).json({
        success: true,
        savedQuiz,
        quiz,
        message: "quiz fetched successfully",
      });
    }
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
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required are required",
      });
    }
    const quizzes = await Quiz.find(
      { creatorId: userId },
      {
        quizName: true,
        _id: true,
        createdAt: true,
        impressions: true,
      }
    );

    if (!quizzes || quizzes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "There are no quizzes available",
      });
    }

    const formattedQuizzes = quizzes.map((quiz) => ({
      quizName: quiz.quizName,
      _id: quiz._id,
      createdOn: moment(quiz.createdAt).format("DD MMM, YYYY"),
      impressions: quiz.impressions,
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
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "quiz not found",
      });
    }

    // Delete the quiz
    await Quiz.findByIdAndDelete(quizId);

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
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
    const userId = req.user.id;
    const quizzes = await Quiz.find({ creatorId: userId }).select(
      "quizName impressions questions createdAt"
    );

    const totalQuizzesCreated = quizzes.length;
    const totalQuestions = quizzes.reduce(
      (sum, quiz) => sum + quiz.questions.length,
      0
    );

    const formatImpressions = (impressions) => {
      if (impressions >= 1000) {
        return `${(impressions / 1000).toFixed(1)}k`;
      }
      return impressions.toString();
    };

    const totalImpressions = formatImpressions(
      quizzes.reduce((sum, quiz) => sum + quiz.impressions, 0)
    );

    const topQuizzes = quizzes
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 12);

    const trendingQuizzes = topQuizzes.map((quiz) => ({
      quizName: quiz.quizName,
      impressions: formatImpressions(quiz.impressions),
      createdOn: moment(quiz.createdAt).format("DD MMM, YYYY"),
    }));

    res.status(200).json({
      success: true,
      totalQuizzesCreated,
      totalQuestions,
      totalImpressions,
      trendingQuizzes,
      message: "Quiz Data fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Something went wrong while fetching quiz stats",
    });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    // Get user ID from request object
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "quiz not found",
      });
    }
    const quizType = quiz.quizType;

    // Validate request body
    const { timeLimit, questions } = req.body;

    // checking quiz type
    if (quizType === "Q&A") {
      if (timeLimit === undefined || ![0, 5, 10].includes(timeLimit)) {
        return res.status(400).json({
          success: false,
          message: "Invalid time limit for Q&A quiz",
        });
      }
      // Validate questions for Q&A quizType
      validateQnAQuiz(questions);
    } else if (quizType === "Poll") {
      // Validate questions for Poll quizType
      validatePollQuiz(questions);
      if (timeLimit) {
        return res.status(400).json({
          success: false,
          message: "Poll type in not supported any time limit",
        });
      }
    }

    // Create the quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { timeLimit, questions },
      { new: true }
    );

    res.status(201).json({
      success: true,
      quizId: updatedQuiz._id,
      message: "Quiz updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Something went wrong while updating quiz",
    });
  }
};

// Helper Functions
// validate Q&A quizType
const validateQnAQuiz = (questions) => {
  if (
    !Array.isArray(questions) ||
    questions.length < 1 ||
    questions.length > 5
  ) {
    return {
      success: false,
      message: "At least one and Maximum five questions are required",
    };
  }

  for (const question of questions) {
    const result = validateQuestion(question);
    if (!result.success) {
      return result;
    }
    const sameTypes = validateOptionTypes(question);
    const validateSingleCorrect = validateCorrectOption(question);
    if (!validateSingleCorrect.success || !sameTypes.success) {
      return validateSingleCorrect;
    }
  }

  return { success: true };
};

// validate Poll quizType
const validatePollQuiz = (questions) => {
  if (
    !Array.isArray(questions) ||
    questions.length < 1 ||
    questions.length > 5
  ) {
    return {
      success: false,
      message: "At least one and Maximum 5 questions are required",
    };
  }

  for (const question of questions) {
    const result = validateQuestion(question);
    if (!result.success) {
      return result;
    }

    const sameTypes = validateOptionTypes(question);
    console.log("same types: ", sameTypes);
    if (!sameTypes.success) {
      return sameTypes;
    }
  }
  return { success: true };
};

// validate questionText and options
const validateQuestion = (question) => {
  if (
    !question.questionText ||
    !Array.isArray(question.options) ||
    question.options.length < 2
  ) {
    return {
      success: false,
      message: "Each question must have questionText and at least two options",
    };
  }

  return { success: true };
};

// validate correct option
const validateCorrectOption = (question) => {
  const correctOptions = question.options.filter((option) => option.correct);
  console.log("correctOptions:- ", correctOptions.length);
  if (correctOptions.length !== 1) {
    return {
      success: false,
      message: "Each question must have exactly one correct option",
    };
  }

  return { success: true };
};

// Check if all options have the same type
const validateOptionTypes = (question) => {
  const types = question.options.map((option) => option.type);
  console.log("types: ", types); // Log the types array
  if (new Set(types).size !== 1) {
    return {
      success: false,
      message: "All options types must have the same type",
    };
  }
  return { success: true };
};
