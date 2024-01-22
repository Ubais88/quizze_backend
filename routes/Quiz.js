// Import the required modules
const express = require("express");
const router = express.Router();

// Import the required controllers and middleware functions
const { createQuiz, getQuiz, getAllQuiz } = require("../controllers/Quiz");


// Route for user createQuiz 
router.post("/create/:userId", createQuiz)
router.post("/getallquiz/:userId", getAllQuiz)
router.get('/play/:quizId', getQuiz)


// Export the router for use in the main application
module.exports = router;

