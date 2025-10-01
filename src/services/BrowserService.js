/**
 * Browser service for managing Playwright browser instance
 */

const { chromium } = require("playwright");
const config = require("../config");

class BrowserService {
	constructor() {
		this.browser = null;
		this.isInitialized = false;
		this.initLock = null;
		this.activeContexts = new Set();
		this.totalCreated = 0;
	}

	async init() {
		if (this.isInitialized) return;

		if (this.initLock) {
			await this.initLock;
			return;
		}

		let releaseInitLock;
		this.initLock = new Promise((resolve) => {
			releaseInitLock = resolve;
		});

		try {
			if (this.isInitialized) {
				return;
			}

			console.log("Initializing Playwright browser (unlimited concurrency mode)...");

			this.browser = await chromium.launch({
				headless: config.browser.headless,
				args: config.browser.args,
			});

			this.isInitialized = true;
			console.log("Browser initialization completed - unlimited concurrency enabled");
		} finally {
			releaseInitLock();
			this.initLock = null;
		}
	}

	async createContext() {
		if (!this.isInitialized) {
			await this.init();
		}

		const context = await this.browser.newContext({
			userAgent: config.browser.userAgent,
			viewport: config.browser.viewport,
		});

		const page = await context.newPage();

		await page.addInitScript(() => {
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

		await page.goto(config.browser.targetUrl, {
			waitUntil: "networkidle",
			timeout: config.browser.timeout,
		});

		const contextWrapper = {
			context,
			page,
			id: `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
			createdAt: Date.now(),
		};
		this.activeContexts.add(contextWrapper);
		this.totalCreated++;

		return contextWrapper;
	}

	async acquireContext() {
		return await this.createContext();
	}

	async releaseContext(contextWrapper) {
		this.activeContexts.delete(contextWrapper);
		try {
			await contextWrapper.page.close();
			await contextWrapper.context.close();
		} catch (error) {
			console.error(`Error closing context ${contextWrapper.id}:`, error.message);
		}
	}

	async destroyContext(contextWrapper) {
		await this.releaseContext(contextWrapper);
	}

	getStats() {
		return {
			activeContexts: this.activeContexts.size,
			totalCreated: this.totalCreated,
			mode: "unlimited",
		};
	}

	async cleanup() {
		console.log(`Cleaning up ${this.activeContexts.size} active contexts...`);

		const closePromises = [];
		for (const contextWrapper of this.activeContexts) {
			closePromises.push(
				(async () => {
					try {
						await contextWrapper.page.close();
						await contextWrapper.context.close();
					} catch (error) {
						console.error(`Error closing context ${contextWrapper.id}:`, error.message);
					}
				})(),
			);
		}

		await Promise.all(closePromises);
		this.activeContexts.clear();

		if (this.browser) {
			await this.browser.close();
		}
		this.isInitialized = false;
		console.log("Browser cleaned up");
	}
}

module.exports = BrowserService;
