const mongoose = require("mongoose");

// Define the user schema using the Mongoose Schema constructor
const userSchema = new mongoose.Schema(
	{
		// Define the name field with type String, required, and trimmed
		name: {
			type: String,
			required: true,
			trim: true,
		},

		// Define the email field with type String, required, and trimmed
		email: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},

		// Define the password field with type String and required
		password: {
			type: String,
			required: true,
            // minLenght:6
		},
		// token: {
		// 	type: String,
		// },
		// quizzes: [
		// 	{
		// 		type: mongoose.Schema.Types.ObjectId,
		// 		ref: "Quiz",
		// 	},
		// ],
	},
	{ timestamps: true }
);

// Export the Mongoose model for the user schema, using the name "user"
module.exports = mongoose.model("user", userSchema);