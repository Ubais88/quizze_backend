// Import the required modules
const express = require("express");
const router = express.Router();

// Import the required controllers and middleware functions
const { signup, login } = require("../controllers/Auth");
const { authMiddleware } = require("../middlewares/authMiddleware");


// Route for user signup
router.post("/signup", signup)
// Route for user login
router.post("/login", login)
router.get('/validate', authMiddleware)

// Export the router for use in the main application
module.exports = router;

