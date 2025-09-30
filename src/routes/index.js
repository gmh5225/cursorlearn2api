/**
 * Route configuration
 */

function setupRoutes(app, controllers) {
	const { chatController, modelController, healthController } = controllers;

	// Chat completion endpoint
	app.post("/v1/chat/completions", (req, res) => chatController.handleChatCompletion(req, res));

	// Model list endpoint
	app.get("/v1/models", (req, res) => modelController.getModels(req, res));

	// Health check endpoint
	app.get("/health", (req, res) => healthController.getHealth(req, res));

	// Root path
	app.get("/", (req, res) => healthController.getRoot(req, res));
}

module.exports = setupRoutes;
