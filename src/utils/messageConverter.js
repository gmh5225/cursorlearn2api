/**
 * Utility for converting message formats
 */

/**
 * Extract plain text from message content, supporting complex formats
 */
function extractContentText(content) {
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

/**
 * Convert OpenAI format messages to Cursor format
 */
function convertOpenAIMessagesToCursor(openAIMessages) {
	return openAIMessages.map((message, i) => {
		const textContent = extractContentText(message.content);

		return {
			parts: [{ type: "text", text: textContent }],
			id: message.id || `msg_${Date.now()}_${i}`,
			role: message.role,
		};
	});
}

/**
 * Parse Cursor streaming response
 */
function parseCursorResponse(responseText) {
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

module.exports = {
	convertOpenAIMessagesToCursor,
	parseCursorResponse,
};
