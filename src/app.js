/**
 * Express application setup
 */

const express = require("express");
const cors = require("cors");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const setupRoutes = require("./routes");

function createApp(controllers) {
	const app = express();

	// Middleware
	app.use(cors());
	app.use(express.json({ limit: Infinity }));
	app.use(express.urlencoded({ limit: Infinity, extended: true }));
	app.use(logger);

	// Routes
	setupRoutes(app, controllers);

	// Error handling middleware (must be last)
	app.use(errorHandler);

	return app;
}

module.exports = createApp;
