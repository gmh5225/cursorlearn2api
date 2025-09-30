/**
 * Chat completion controller
 */

const config = require("../config");

class ChatController {
	constructor(cursorService) {
		this.cursorService = cursorService;
	}

	async handleChatCompletion(req, res) {
		try {
			const { model = config.api.defaultModel, messages, stream = false } = req.body;

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
				await this.handleStreamingResponse(res, messages, model, conversationId);
			} else {
				await this.handleNonStreamingResponse(res, messages, model, conversationId);
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
	}

	async handleStreamingResponse(res, messages, model, conversationId) {
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Headers", "*");

		const streamId = `chatcmpl-${Date.now()}`;
		const created = Math.floor(Date.now() / 1000);
		let fullContent = "";

		try {
			const streamGenerator = this.cursorService.streamAPI(messages, model, conversationId);

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
					prompt_tokens: messages.reduce((sum, msg) => sum + Math.ceil(msg.content.length / 4), 0),
					completion_tokens: Math.ceil(fullContent.length / 4),
					total_tokens: Math.ceil(
						(messages.reduce((sum, msg) => sum + msg.content.length, 0) + fullContent.length) / 4,
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
	}

	async handleNonStreamingResponse(res, messages, model, conversationId) {
		const content = await this.cursorService.callAPI(messages, model, conversationId);

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
				prompt_tokens: messages.reduce((sum, msg) => sum + Math.ceil(msg.content.length / 4), 0),
				completion_tokens: Math.ceil(content.length / 4),
				total_tokens: Math.ceil(
					(messages.reduce((sum, msg) => sum + msg.content.length, 0) + content.length) / 4,
				),
			},
		};

		console.log(`Successful response, content length: ${content.length}`);
		res.json(response);
	}
}

module.exports = ChatController;
