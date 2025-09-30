/**
 * Error handling middleware
 */

function errorHandler(error, _req, res, _next) {
	console.error("Server error:", error);
	res.status(500).json({
		error: {
			message: "Internal server error",
			type: "internal_error",
		},
	});
}

module.exports = errorHandler;
