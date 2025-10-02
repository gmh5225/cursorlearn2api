/**
 * Route configuration
 */

const auth = require("../middleware/auth");

function setupRoutes(app, controllers) {
	const { chatController, modelController, healthController } = controllers;

	// Chat completion endpoint (protected by authentication)
	app.post("/v1/chat/completions", auth, (req, res) =>
		chatController.handleChatCompletion(req, res),
	);

	// Model list endpoint
	app.get("/v1/models", (req, res) => modelController.getModels(req, res));

	// Health check endpoint
	app.get("/health", (req, res) => healthController.getHealth(req, res));

	// Root path
	app.get("/", (req, res) => healthController.getRoot(req, res));
}

module.exports = setupRoutes;
