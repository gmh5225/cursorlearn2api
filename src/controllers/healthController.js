/**
 * Health check controller
 */

class HealthController {
	constructor(browserService, xIsHumanService) {
		this.browserService = browserService;
		this.xIsHumanService = xIsHumanService;
	}

	getHealth(_req, res) {
		res.json({
			status: "ok",
			service: "cursorlearn2api",
			timestamp: new Date().toISOString(),
			initialized: this.browserService.isInitialized,
			concurrency: this.browserService.getStats(),
			xIsHumanData: this.xIsHumanService.getStatus(),
		});
	}

	getRoot(_req, res) {
		res.json({
			message: "CursorLearn2API - OpenAI-compatible Cursor API Service",
			version: "1.0.0",
			description: "Educational project for learning Cursor API integration",
			endpoints: {
				chat: "/v1/chat/completions",
				models: "/v1/models",
				health: "/health",
			},
		});
	}
}

module.exports = HealthController;
