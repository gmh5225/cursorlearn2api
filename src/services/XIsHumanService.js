/**
 * Service for managing x-is-human data
 */

const config = require("../config");

class XIsHumanService {
	constructor(browserService) {
		this.browserService = browserService;
		this.data = { ...config.xIsHuman.defaultData };
		this.lastFetch = 0;
		this.latestE = null;
	}

	getData() {
		return this.data;
	}

	async update() {
		const latestE = await this.fetchLatestE();
		if (latestE) {
			this.data.e = latestE;
			// Also update v value for increased randomness
			this.data.v = Math.random() * 0.2;
			return true;
		}
		return false;
	}

	async fetchLatestE() {
		try {
			const now = Date.now();
			// Check if refresh is needed
			if (this.latestE && now - this.lastFetch < config.xIsHuman.refreshInterval) {
				return this.latestE;
			}

			const page = this.browserService.getPage();

			// Use browser page to fetch JS file content
			const jsContent = await page.evaluate(async (url) => {
				try {
					const response = await fetch(url, {
						method: "GET",
						headers: {
							Accept: "text/javascript, application/javascript",
							"User-Agent":
								"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
						},
					});

					if (!response.ok) {
						throw new Error(`HTTP ${response.status}`);
					}

					return await response.text();
				} catch (error) {
					return { error: error.message };
				}
			}, config.xIsHuman.dynamicEUrl);

			if (jsContent && !jsContent.error) {
				// Use regex to extract e value
				const eRegex =
					/window\.V_C\.push\s*\(\s*\(\s*\)\s*=>\s*X\s*\([^,]*,[^,]*,[^,]*,\s*"(eyJ[^"]+)"/g;
				const matches = [];
				let match;

				while ((match = eRegex.exec(jsContent)) !== null) {
					matches.push(match[1]);
				}

				if (matches.length > 0) {
					// Take the latest e value (usually the last one)
					const latestE = matches[matches.length - 1];
					this.latestE = latestE;
					this.lastFetch = now;
					return latestE;
				}
			}

			return null;
		} catch (error) {
			console.error("Failed to fetch latest e value:", error.message);
			return null;
		}
	}

	getStatus() {
		return {
			currentE: this.data.e ? this.data.e.substring(0, 30) + "..." : null,
			currentV: this.data.v,
			lastFetch: this.lastFetch,
			url: config.xIsHuman.dynamicEUrl,
			hasLatestE: !!this.latestE,
		};
	}
}

module.exports = XIsHumanService;
