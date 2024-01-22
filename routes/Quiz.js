// Import the required modules
const express = require("express");
const router = express.Router();

// Import the required controllers and middleware functions
const { createQuiz } = require("../controllers/Quiz");


// Route for user createQuiz
router.post("/create", createQuiz)
router.post('/play/:quizId',)


// Export the router for use in the main application
module.exports = router;

