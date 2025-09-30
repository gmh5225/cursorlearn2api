/**
 * Browser service for managing Playwright browser instance
 */

const { chromium } = require("playwright");
const config = require("../config");

class BrowserService {
	constructor() {
		this.browser = null;
		this.page = null;
		this.isInitialized = false;
	}

	async init() {
		if (this.isInitialized) return;

		console.log("Initializing Playwright browser...");

		this.browser = await chromium.launch({
			headless: config.browser.headless,
			args: config.browser.args,
		});

		const context = await this.browser.newContext({
			userAgent: config.browser.userAgent,
			viewport: config.browser.viewport,
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
		await this.page.goto(config.browser.targetUrl, {
			waitUntil: "networkidle",
			timeout: config.browser.timeout,
		});

		this.isInitialized = true;
		console.log("Browser initialization completed");
	}

	getPage() {
		if (!this.isInitialized) {
			throw new Error("Browser not initialized. Call init() first.");
		}
		return this.page;
	}

	async cleanup() {
		if (this.page) await this.page.close();
		if (this.browser) await this.browser.close();
		this.isInitialized = false;
		console.log("Browser cleaned up");
	}
}

module.exports = BrowserService;
