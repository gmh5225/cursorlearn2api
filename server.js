/**
 * CursorLearn2API - OpenAI-compatible Cursor API Service
 * Educational project using Playwright for web automation
 */

const express = require("express");
const { chromium } = require("playwright");
const cors = require("cors");

class CursorOpenAIService {
	constructor() {
		this.browser = null;
		this.page = null;
		this.isInitialized = false;

		// Dynamic x-is-human data
		this.xIsHumanData = {
			b: 0,
			v: Math.random() * 0.2,
			e: "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..M8k9E7yHXWkQuVcm.U1W5ovCj_TO3CismFpgq06pvMhNgciB51LnTEhxqQQ7KHmomgbpVfCKcxjUj9q_xR3LUbCf4BMZzYompqCBp3Q1NFZV7TRpzZhZtiQGwbrYW9NGfMCYNb-X1ovwoppDiODfoUjw81nTcXR-pLxgkbwleTq09MrcoDI5mfb3BFu64sdhc1TB6XUDPrhUYzdnyCG3aUDO1XGmA2GJnKPJYnbFX-hfueCmbnrM6L7bFyXbkwDLCGXLoJ6S5DYKKCzWzW_dXIqnK7HQDdxtTEmldioNIT_IFJHgFyD0dtEzRWiRrR9eO9X77jmWK6JSp7uBZLS_KHJKSBQuqFEQwBaqKj_OhDo9ZJ0f3TtL6Xmqw_G4Xh-t2ZNYjbBxDYmBacULmjuDw_iYQ4zrMdYSmUWmY6HsZ4UGprdb4_snCs2vXxHCqjUtubVPk0JvkjRDEebTlPZaYkLmkOJnYIYt24RUGri3p7xs_b7Q3BhslNX4K8T4mhWq0fjfVvVEcdFmus69mBDPvR8rGMvjxmEAJ4g.SJCIYOMw2IlVQXvwC2Vn1w",
			s: "/HYcZdBjAGYOc9Wv44z0jhMutFLwvFimD2XnU/MbJD1WTsUFi71E+fDYaCyiVQwz76uGUsnb7QLXUwWbWjMFY9+Fbej0j4SVqxo8B8ecVZll7RoYJ9GkPPPPV7l2mgXDfkdb+REhq81432gyy6/T5C585FjbSXFXPPe/DifxCQ3EIO636lOWEDRSb6mPXuXRc9qtQF3jezM6sbljI+GaqM4E4KEAC9TlcGSdTJEl+tFaVxfngvckIiH/bPA5laXPs7jOgBqr3jvPnbYmZAaXswUPgCgqHJX5c7PfuTh+jUIvqw==",
			d: 0,
			vr: "3",
		};

		// Dynamic e value fetch configuration
		this.dynamicEConfig = {
			url: "https://cursor.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/a-4-a/c.js?i=1&v=3&h=cursor.com",
			lastFetch: 0,
			refreshInterval: 60 * 60 * 1000, // Refresh every 60 minutes
			latestE: null
		};
	}

	// Update e value in x-is-human data
	async updateXIsHumanE() {
		const latestE = await this.fetchLatestE();
		if (latestE) {
			this.xIsHumanData.e = latestE;
			// Also update v value for increased randomness
			this.xIsHumanData.v = Math.random() * 0.2;
			return true;
		}
		return false;
	}

	// Fetch latest e value from Cursor's JS file
	async fetchLatestE() {
		try {
			const now = Date.now();
			// Check if refresh is needed
			if (this.dynamicEConfig.latestE && (now - this.dynamicEConfig.lastFetch < this.dynamicEConfig.refreshInterval)) {
				return this.dynamicEConfig.latestE;
			}

			if (!this.page) {
				return null;
			}

			// Use browser page to fetch JS file content
			const jsContent = await this.page.evaluate(async (url) => {
				try {
					const response = await fetch(url, {
						method: 'GET',
						headers: {
							'Accept': 'text/javascript, application/javascript',
							'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
						}
					});

					if (!response.ok) {
						throw new Error(`HTTP ${response.status}`);
					}

					return await response.text();
				} catch (error) {
					return { error: error.message };
				}
			}, this.dynamicEConfig.url);

			if (jsContent && !jsContent.error) {
				// Use regex to extract e value
				// Match pattern: window.V_C.push( () => X(0, 0, number, "eyJ-starting string"
				const eRegex = /window\.V_C\.push\s*\(\s*\(\s*\)\s*=>\s*X\s*\([^,]*,[^,]*,[^,]*,\s*"(eyJ[^"]+)"/g;
				const matches = [];
				let match;

				while ((match = eRegex.exec(jsContent)) !== null) {
					matches.push(match[1]);
				}

				if (matches.length > 0) {
					// Take the latest e value (usually the last one)
					const latestE = matches[matches.length - 1];
					this.dynamicEConfig.latestE = latestE;
					this.dynamicEConfig.lastFetch = now;
					return latestE;
				}
			}

			return null;
		} catch (error) {
			console.error("Failed to fetch latest e value:", error.message);
			return null;
		}
	}

	async initBrowser() {
		if (this.isInitialized) return;

		console.log("Initializing Playwright browser...");

		this.browser = await chromium.launch({
			headless: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-blink-features=AutomationControlled",
				"--disable-dev-shm-usage",
			],
		});

		const context = await this.browser.newContext({
			userAgent:
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0",
			viewport: { width: 1920, height: 1080 },
		});

		this.page = await context.newPage();

		await this.page.addInitScript(() => {
			Object.defineProperty(navigator, "webdriver", { get: () => false });
			delete window.domAutomation;
			delete window.domAutomationController;
			delete window._WEBDRIVER_ELEM_CACHE;
			delete window.phantom;
			delete window.callPhantom;
			delete window.nightmare;
			delete window.selenium;
			if (!window.chrome) window.chrome = { runtime: {} };
			delete window.playwright;
			delete window.__playwright;
			delete window._playwright;
		});

		// Visit learning page to establish session
		await this.page.goto("https://cursor.com/en-US/learn/how-ai-models-work", {
			waitUntil: "networkidle",
			timeout: 5000,
		});

		this.isInitialized = true;
		console.log("Browser initialization completed");
	}

	async callCursorAPI(
		messages,
		model = "anthropic/claude-4-sonnet",
		conversationId = null,
	) {
		if (!this.isInitialized) {
			await this.initBrowser();
		}

		// Convert OpenAI format messages to Cursor format
		const cursorMessages = this.convertOpenAIMessagesToCursor(messages);
		const requestId = conversationId || `msg_${Date.now()}`;

		try {
			const result = await this.page.evaluate(
				async (params) => {
					try {
						const response = await fetch("/api/chat", {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								"x-is-human": JSON.stringify(params.xIsHuman),
								"x-method": "POST",
								"x-path": "/api/chat",
							},
							body: JSON.stringify({
								context: [],
								model: params.model,
								id: params.requestId,
								messages: params.cursorMessages,
								trigger: "submit-message",
							}),
						});

						return {
							status: response.status,
							text: await response.text(),
							success: response.status === 200,
						};
					} catch (error) {
						return { error: error.message };
					}
				},
				{
					xIsHuman: this.xIsHumanData,
					model: model,
					cursorMessages: cursorMessages,
					requestId: requestId,
				},
			);

			if (result.success) {
				return this.parseCursorResponse(result.text);
			} else {
				throw new Error(`API call failed: ${result.error || result.status}`);
			}
		} catch (error) {
			throw new Error(`API call exception: ${error.message}`);
		}
	}

	// Extract plain text from message content, supporting complex formats
	extractContentText(content) {
		if (typeof content === "string") {
			// Simple string format
			return content;
		}

		if (Array.isArray(content)) {
			// Complex format, such as arrays containing multiple content types
			const textParts = [];

			for (const item of content) {
				if (typeof item === "object" && item !== null) {
					// Handle different types of content blocks
					if (item.type === "text" && item.text) {
						textParts.push(item.text);
					} else if (item.type === "code" && item.code) {
						// Code block format
						const language = item.language || "";
						const code = item.code;
						if (language) {
							textParts.push(`\`\`\`${language}\n${code}\n\`\`\``);
						} else {
							textParts.push(`\`\`\`\n${code}\n\`\`\``);
						}
					} else if (item.type === "image_url") {
						// Image URL (temporarily replaced with description)
						textParts.push("[Image]");
					} else if (item.text) {
						// Other formats containing text field
						textParts.push(item.text);
					} else if (item.content) {
						// Nested content field
						textParts.push(String(item.content));
					}
				} else if (typeof item === "string") {
					// String elements in array
					textParts.push(item);
				}
			}

			return textParts.join("\n");
		}

		// Other formats, try to convert to string
		return String(content);
	}

	// Convert OpenAI format messages to Cursor format
	convertOpenAIMessagesToCursor(openAIMessages) {
		const result = openAIMessages.map((message, i) => {
			const textContent = this.extractContentText(message.content);

			return {
				parts: [{ type: "text", text: textContent }],
				id: message.id || `msg_${Date.now()}_${i}`,
				role: message.role,
			};
		});

		return result;
	}

	parseCursorResponse(responseText) {
		const lines = responseText.split("\n");
		let content = "";

		for (const line of lines) {
			const trimmedLine = line.trim();
			if (trimmedLine.startsWith("data: ")) {
				const dataStr = trimmedLine.substring(6);
				if (dataStr === "[DONE]") break;

				try {
					const data = JSON.parse(dataStr);
					if (data.type === "text-delta" && data.delta) {
						content += data.delta;
					}
				} catch (e) {
					// Ignore parsing errors
				}
			}
		}

		return content || "Sorry, unable to get a valid response.";
	}

	// Stream call to Cursor API
	async *streamCursorAPI(
		messages,
		model = "anthropic/claude-4-sonnet",
		conversationId = null,
	) {
		if (!this.isInitialized) {
			await this.initBrowser();
		}

		// Convert OpenAI format messages to Cursor format
		const cursorMessages = this.convertOpenAIMessagesToCursor(messages);
		const requestId = conversationId || `msg_${Date.now()}`;

		// Initiate streaming request in page context
		const response = await this.page.evaluate(
			async (params) => {
				const response = await fetch("/api/chat", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "text/event-stream",
						"x-is-human": JSON.stringify(params.xIsHuman),
						"x-method": "POST",
						"x-path": "/api/chat",
					},
					body: JSON.stringify({
						context: [],
						model: params.model,
						id: params.requestId,
						messages: params.cursorMessages,
						trigger: "submit-message",
					}),
				});

				if (!response.ok) {
					return { error: `HTTP ${response.status}` };
				}

				// Read streaming response
				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";
				const chunks = [];

				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;

						buffer += decoder.decode(value, { stream: true });
						const lines = buffer.split("\n");
						buffer = lines.pop() || "";

						for (const line of lines) {
							const trimmedLine = line.trim();
							if (trimmedLine.startsWith("data: ")) {
								const dataStr = trimmedLine.slice(6);
								if (dataStr === "[DONE]") {
									return { success: true, chunks };
								}
								try {
									const data = JSON.parse(dataStr);
									if (data.type === "text-delta" && data.delta) {
										chunks.push(data.delta);
									}
								} catch (e) {
									// Ignore parsing errors
								}
							}
						}
					}
					return { success: true, chunks };
				} finally {
					reader.releaseLock();
				}
			},
			{
				xIsHuman: this.xIsHumanData,
				model: model,
				cursorMessages: cursorMessages,
				requestId: requestId,
			},
		);

		if (response.success && response.chunks) {
			for (const chunk of response.chunks) {
				yield chunk;
			}
		} else {
			throw new Error(`Streaming API call failed: ${response.error || "Unknown error"}`);
		}
	}

	async cleanup() {
		if (this.page) await this.page.close();
		if (this.browser) await this.browser.close();
		this.isInitialized = false;
	}
}

// Create Express application
const app = express();
const cursorService = new CursorOpenAIService();

// Middleware
app.use(cors());
app.use(express.json({ limit: Infinity }));
app.use(express.urlencoded({ limit: Infinity, extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
	console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
	next();
});

// OpenAI-compatible chat completion endpoint
app.post("/v1/chat/completions", async (req, res) => {
	try {
		const {
			model = "anthropic/claude-4-sonnet",
			messages,
			stream = false,
		} = req.body;

		if (!messages || !Array.isArray(messages) || messages.length === 0) {
			return res.status(400).json({
				error: {
					message: "messages field is required and must be a non-empty array",
					type: "invalid_request_error",
				},
			});
		}

		console.log(
			`Calling Cursor API, model: ${model}, message count: ${messages.length}, streaming: ${stream}`,
		);

		const conversationId = req.body.conversation_id || null;

		// Streaming response
		if (stream) {
			res.setHeader("Content-Type", "text/event-stream");
			res.setHeader("Cache-Control", "no-cache");
			res.setHeader("Connection", "keep-alive");
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.setHeader("Access-Control-Allow-Headers", "*");

			const streamId = `chatcmpl-${Date.now()}`;
			const created = Math.floor(Date.now() / 1000);
			let fullContent = "";

			try {
				const streamGenerator = cursorService.streamCursorAPI(
					messages,
					model,
					conversationId,
				);

				for await (const chunk of streamGenerator) {
					fullContent += chunk;

					const streamChunk = {
						id: streamId,
						object: "chat.completion.chunk",
						created: created,
						model: model,
						choices: [
							{
								index: 0,
								delta: {
									content: chunk,
								},
								finish_reason: null,
							},
						],
					};

					res.write(`data: ${JSON.stringify(streamChunk)}\n\n`);
				}

				// Send final chunk
				const finalChunk = {
					id: streamId,
					object: "chat.completion.chunk",
					created: created,
					model: model,
					choices: [
						{
							index: 0,
							delta: {},
							finish_reason: "stop",
						},
					],
					usage: {
						prompt_tokens: messages.reduce(
							(sum, msg) => sum + Math.ceil(msg.content.length / 4),
							0,
						),
						completion_tokens: Math.ceil(fullContent.length / 4),
						total_tokens: Math.ceil(
							(messages.reduce((sum, msg) => sum + msg.content.length, 0) +
								fullContent.length) /
								4,
						),
					},
				};

				res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
				res.write("data: [DONE]\n\n");
				res.end();

				console.log(`Streaming response completed, content length: ${fullContent.length}`);
			} catch (error) {
				console.error(`Streaming API call failed: ${error.message}`);
				const errorChunk = {
					error: {
						message: error.message,
						type: "api_error",
					},
				};
				res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
				res.end();
			}
		} else {
			// Non-streaming response
			const content = await cursorService.callCursorAPI(
				messages,
				model,
				conversationId,
			);

			const response = {
				id: `chatcmpl-${Date.now()}`,
				object: "chat.completion",
				created: Math.floor(Date.now() / 1000),
				model: model,
				choices: [
					{
						index: 0,
						message: {
							role: "assistant",
							content: content,
						},
						finish_reason: "stop",
					},
				],
				usage: {
					prompt_tokens: messages.reduce(
						(sum, msg) => sum + Math.ceil(msg.content.length / 4),
						0,
					),
					completion_tokens: Math.ceil(content.length / 4),
					total_tokens: Math.ceil(
						(messages.reduce((sum, msg) => sum + msg.content.length, 0) +
							content.length) /
							4,
					),
				},
			};

			console.log(`Successful response, content length: ${content.length}`);
			res.json(response);
		}
	} catch (error) {
		console.error(`API call failed: ${error.message}`);
		res.status(500).json({
			error: {
				message: error.message,
				type: "api_error",
			},
		});
	}
});

// Model list endpoint
app.get("/v1/models", (_req, res) => {
	res.json({
		object: "list",
		data: [
			{
				id: "anthropic/claude-4-sonnet",
				object: "model",
				created: Math.floor(Date.now() / 1000),
				owned_by: "cursor",
			},
			{
				id: "openai/gpt-5",
				object: "model",
				created: Math.floor(Date.now() / 1000),
				owned_by: "cursor",
			},
			{
				id: "google/gemini-2.5-pro",
				object: "model",
				created: Math.floor(Date.now() / 1000),
				owned_by: "cursor",
			},
			{
				id: "xai/grok-4",
				object: "model",
				created: Math.floor(Date.now() / 1000),
				owned_by: "cursor",
			},
		],
	});
});

// Health check endpoint
app.get("/health", (_req, res) => {
	res.json({
		status: "ok",
		service: "cursorlearn2api",
		timestamp: new Date().toISOString(),
		initialized: cursorService.isInitialized,
		xIsHumanData: {
			currentE: cursorService.xIsHumanData.e ?
				cursorService.xIsHumanData.e.substring(0, 30) + "..." : null,
			currentV: cursorService.xIsHumanData.v,
			lastFetch: cursorService.dynamicEConfig.lastFetch,
			url: cursorService.dynamicEConfig.url,
			hasLatestE: !!cursorService.dynamicEConfig.latestE
		}
	});
});

// Root path
app.get("/", (_req, res) => {
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
});

// Error handling middleware
app.use((error, _req, res, _next) => {
	console.error("Server error:", error);
	res.status(500).json({
		error: {
			message: "Internal server error",
			type: "internal_error",
		},
	});
});

// Start server
const PORT = process.env.PORT || 30011;

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
		await cursorService.initBrowser();
		console.log("Browser pre-initialization completed");

		// Test dynamic e value update
		const updated = await cursorService.updateXIsHumanE();
		if (updated) {
			console.log("Successfully updated dynamic e value:", cursorService.xIsHumanData.e.substring(0, 50) + "...");
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
	await cursorService.cleanup();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("\nReceived termination signal, cleaning up resources...");
	await cursorService.cleanup();
	process.exit(0);
});
