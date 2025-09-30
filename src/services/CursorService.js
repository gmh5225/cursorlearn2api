/**
 * Cursor API service
 */

const config = require("../config");
const { convertOpenAIMessagesToCursor, parseCursorResponse } = require("../utils/messageConverter");

class CursorService {
	constructor(browserService, xIsHumanService) {
		this.browserService = browserService;
		this.xIsHumanService = xIsHumanService;
	}

	async callAPI(messages, model = config.api.defaultModel, conversationId = null) {
		// Ensure browser is initialized
		if (!this.browserService.isInitialized) {
			await this.browserService.init();
		}

		// Update x-is-human data before API call
		await this.xIsHumanService.update();

		// Convert OpenAI format messages to Cursor format
		const cursorMessages = convertOpenAIMessagesToCursor(messages);
		const requestId = conversationId || `msg_${Date.now()}`;

		try {
			const page = this.browserService.getPage();
			const result = await page.evaluate(
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
					xIsHuman: this.xIsHumanService.getData(),
					model: model,
					cursorMessages: cursorMessages,
					requestId: requestId,
				},
			);

			if (result.success) {
				return parseCursorResponse(result.text);
			} else {
				throw new Error(`API call failed: ${result.error || result.status}`);
			}
		} catch (error) {
			throw new Error(`API call exception: ${error.message}`);
		}
	}

	async *streamAPI(messages, model = config.api.defaultModel, conversationId = null) {
		// Ensure browser is initialized
		if (!this.browserService.isInitialized) {
			await this.browserService.init();
		}

		// Update x-is-human data before API call
		await this.xIsHumanService.update();

		// Convert OpenAI format messages to Cursor format
		const cursorMessages = convertOpenAIMessagesToCursor(messages);
		const requestId = conversationId || `msg_${Date.now()}`;

		// Create a unique stream ID for this request
		const streamId = `stream_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

		// Buffer to collect streaming data
		const streamBuffer = [];
		let streamComplete = false;
		let streamError = null;

		const page = this.browserService.getPage();

		// Expose function to receive chunks from browser (synchronous callback)
		await page.exposeFunction(`streamChunk_${streamId}`, (chunk) => {
			if (chunk === null) {
				streamComplete = true;
			} else if (chunk.error) {
				streamError = new Error(chunk.error);
				streamComplete = true;
			} else {
				streamBuffer.push(chunk);
			}
		});

		// Initiate the fetch request in browser context with optimized streaming
		const fetchPromise = page.evaluate(
			async (params) => {
				const sendChunk = window[`streamChunk_${params.streamId}`];

				try {
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
						sendChunk({ error: `HTTP ${response.status}` });
						return { error: `HTTP ${response.status}` };
					}

					// Read streaming response with minimal buffering
					const reader = response.body.getReader();
					const decoder = new TextDecoder();
					let buffer = "";

					try {
						while (true) {
							const { done, value } = await reader.read();
							if (done) break;

							const text = decoder.decode(value, { stream: true });
							buffer += text;

							let newlineIndex;
							while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
								const line = buffer.slice(0, newlineIndex);
								buffer = buffer.slice(newlineIndex + 1);

								const trimmedLine = line.trim();
								if (trimmedLine.startsWith("data: ")) {
									const dataStr = trimmedLine.slice(6);
									if (dataStr === "[DONE]") {
										sendChunk(null);
										return { success: true };
									}
									try {
										const data = JSON.parse(dataStr);
										if (data.type === "text-delta" && data.delta) {
											// Send chunk immediately
											sendChunk(data.delta);
										}
									} catch (e) {
										// Ignore parsing errors
									}
								}
							}
						}

						// Signal completion
						sendChunk(null);
						return { success: true };
					} finally {
						reader.releaseLock();
					}
				} catch (error) {
					sendChunk({ error: error.message });
					return { error: error.message };
				}
			},
			{
				xIsHuman: this.xIsHumanService.getData(),
				model: model,
				cursorMessages: cursorMessages,
				requestId: requestId,
				streamId: streamId,
			},
		);

		let lastYieldedIndex = 0;
		// Yield any new chunks that have arrived
		while (!streamComplete) {
			while (lastYieldedIndex < streamBuffer.length) {
				yield streamBuffer[lastYieldedIndex];
				lastYieldedIndex++;
			}
			await new Promise((resolve) => setImmediate(resolve));
		}

		// Yield any remaining chunks
		while (lastYieldedIndex < streamBuffer.length) {
			yield streamBuffer[lastYieldedIndex];
			lastYieldedIndex++;
		}

		// Wait for fetch to complete
		await fetchPromise;

		if (streamError) {
			throw streamError;
		}
	}
}

module.exports = CursorService;
