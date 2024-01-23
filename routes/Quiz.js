// Import the required modules
const express = require("express");
const router = express.Router();


// Import the required controllers and middleware functions
const { createQuiz, getQuiz, getAllQuiz, getDashboardStats, updateQuiz } = require("../controllers/Quiz");
const { authMiddleware } = require('../middlewares/authMiddleware')

// Route for user createQuiz 
router.post("/create",authMiddleware , createQuiz)
router.post("/getallquiz",authMiddleware, getAllQuiz)
router.get('/play/:quizId', getQuiz)
router.get('/getstats', authMiddleware , getDashboardStats)
router.post('/updatequiz/:quizId', updateQuiz)




// Export the router for use in the main application
module.exports = router;

