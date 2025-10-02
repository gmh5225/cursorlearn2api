/**
 * Authentication middleware
 * Validates Bearer token from Authorization header
 */

const config = require("../config");

function auth(req, res, next) {
	// If no API key is configured, skip authentication
	if (!config.auth.apiKey) {
		return next();
	}

	const authHeader = req.headers.authorization;

	// Check if Authorization header exists
	if (!authHeader) {
		return res.status(401).json({
			error: {
				message: "Missing Authorization header",
				type: "authentication_error",
			},
		});
	}

	// Check if it's a Bearer token
	const parts = authHeader.split(" ");
	if (parts.length !== 2 || parts[0] !== "Bearer") {
		return res.status(401).json({
			error: {
				message: "Invalid Authorization header format. Expected: Bearer <token>",
				type: "authentication_error",
			},
		});
	}

	const token = parts[1];

	// Validate token
	if (token !== config.auth.apiKey) {
		return res.status(401).json({
			error: {
				message: "Invalid API key",
				type: "authentication_error",
			},
		});
	}

	// Authentication successful
	next();
}

module.exports = auth;
