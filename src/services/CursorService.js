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
		await this.browserService.init();
		await this.xIsHumanService.update();

		const cursorMessages = convertOpenAIMessagesToCursor(messages);
		const requestId =
			conversationId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		const contextWrapper = await this.browserService.acquireContext();

		try {
			const result = await contextWrapper.page.evaluate(
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
		} finally {
			await this.browserService.releaseContext(contextWrapper);
		}
	}

	async *streamAPI(messages, model = config.api.defaultModel, conversationId = null) {
		await this.browserService.init();
		await this.xIsHumanService.update();

		const cursorMessages = convertOpenAIMessagesToCursor(messages);
		const requestId =
			conversationId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		const streamId = `stream_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

		const streamBuffer = [];
		let streamComplete = false;
		let streamError = null;
		let resolveWaiting = null;

		const contextWrapper = await this.browserService.acquireContext();

		try {
			await contextWrapper.page.exposeFunction(`streamChunk_${streamId}`, (chunk) => {
				if (chunk === null) {
					streamComplete = true;
					if (resolveWaiting) {
						resolveWaiting();
						resolveWaiting = null;
					}
				} else if (chunk.error) {
					streamError = new Error(chunk.error);
					streamComplete = true;
					if (resolveWaiting) {
						resolveWaiting();
						resolveWaiting = null;
					}
				} else if (chunk.batch) {
					streamBuffer.push(...chunk.batch);
					if (resolveWaiting) {
						resolveWaiting();
						resolveWaiting = null;
					}
				} else {
					streamBuffer.push(chunk);
					if (resolveWaiting) {
						resolveWaiting();
						resolveWaiting = null;
					}
				}
			});

			const fetchPromise = contextWrapper.page.evaluate(
				async (params) => {
					const sendChunk = window[`streamChunk_${params.streamId}`];
					let chunkBatch = [];

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

						const reader = response.body.getReader();
						const decoder = new TextDecoder();
						let buffer = "";

						try {
							while (true) {
								const { done, value } = await reader.read();
								if (done) break;

								buffer += decoder.decode(value, { stream: true });

								let newlineIndex;
								while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
									const line = buffer.substring(0, newlineIndex);
									buffer = buffer.substring(newlineIndex + 1);

									if (line.length === 0 || line === "\r") continue;

									if (line.charCodeAt(0) === 100 && line.startsWith("data: ")) {
										const dataStr = line.substring(6);

										if (dataStr === "[DONE]") {
											if (chunkBatch.length > 0) {
												sendChunk({ batch: chunkBatch });
												chunkBatch = [];
											}
											sendChunk(null);
											return { success: true };
										}

										if (dataStr.charCodeAt(0) === 123) {
											try {
												const data = JSON.parse(dataStr);
												if (data.type === "text-delta" && data.delta) {
													chunkBatch.push(data.delta);
												}
											} catch (e) {
												// Ignore parsing errors
											}
										}
									}
								}

								if (chunkBatch.length > 0) {
									sendChunk({ batch: chunkBatch });
									chunkBatch = [];
								}
							}

							if (chunkBatch.length > 0) {
								sendChunk({ batch: chunkBatch });
							}

							sendChunk(null);
							return { success: true };
						} finally {
							reader.releaseLock();
						}
					} catch (error) {
						if (chunkBatch.length > 0) {
							sendChunk({ batch: chunkBatch });
						}
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

			while (!streamComplete) {
				while (lastYieldedIndex < streamBuffer.length) {
					yield streamBuffer[lastYieldedIndex];
					lastYieldedIndex++;
				}

				if (!streamComplete) {
					await new Promise((resolve) => {
						resolveWaiting = resolve;
					});
				}
			}

			while (lastYieldedIndex < streamBuffer.length) {
				yield streamBuffer[lastYieldedIndex];
				lastYieldedIndex++;
			}

			await fetchPromise;

			if (streamError) {
				throw streamError;
			}
		} finally {
			await this.browserService.releaseContext(contextWrapper);
		}
	}
}

module.exports = CursorService;
