#!/usr/bin/env node

/**
 * CursorLearn2API - OpenAI-compatible Cursor API Service
 * Educational project using Playwright for web automation
 */

const config = require("./src/config");
const createApp = require("./src/app");

// Services
const BrowserService = require("./src/services/BrowserService");
const XIsHumanService = require("./src/services/XIsHumanService");
const CursorService = require("./src/services/CursorService");

// Controllers
const ChatController = require("./src/controllers/chatController");
const ModelController = require("./src/controllers/modelController");
const HealthController = require("./src/controllers/healthController");

// Initialize services
const browserService = new BrowserService();
const xIsHumanService = new XIsHumanService(browserService);
const cursorService = new CursorService(browserService, xIsHumanService);

// Initialize controllers
const chatController = new ChatController(cursorService);
const modelController = new ModelController();
const healthController = new HealthController(browserService, xIsHumanService);

// Create Express app
const app = createApp({
	chatController,
	modelController,
	healthController,
});

// Start server
const PORT = config.server.port;

app.listen(PORT, async () => {
	console.log("CursorLearn2API - OpenAI-compatible Cursor API Service");
	console.log("=".repeat(60));
	console.log(`Service started on port ${PORT}`);
	console.log(`Health check: http://localhost:${PORT}/health`);
	console.log(`API endpoint: http://localhost:${PORT}/v1/chat/completions`);
	console.log(`Model list: http://localhost:${PORT}/v1/models`);
	console.log("=".repeat(60));

	// Pre-initialize browser
	try {
		await browserService.init();
		console.log("Browser pre-initialization completed");

		// Test dynamic e value update
		const updated = await xIsHumanService.update();
		if (updated) {
			const status = xIsHumanService.getStatus();
			console.log("Successfully updated dynamic e value:", status.currentE);
		} else {
			console.log("Could not fetch latest e value, using default");
		}
	} catch (error) {
		console.error("Browser initialization failed:", error.message);
	}
});

// Graceful shutdown
process.on("SIGINT", async () => {
	console.log("\nReceived shutdown signal, cleaning up resources...");
	await browserService.cleanup();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("\nReceived termination signal, cleaning up resources...");
	await browserService.cleanup();
	process.exit(0);
});
