/**
 * Application configuration
 */

module.exports = {
	// Server configuration
	server: {
		port: process.env.PORT || 30011,
	},

	// Authentication configuration
	auth: {
		apiKey: process.env.API_KEY || null, // Set API_KEY environment variable to enable authentication
	},

	// Browser configuration
	browser: {
		headless: true,
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-blink-features=AutomationControlled",
			"--disable-dev-shm-usage",
		],
		userAgent:
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0",
		viewport: { width: 1920, height: 1080 },
		targetUrl: "https://cursor.com/en-US/learn/how-ai-models-work",
		timeout: 30000,
	},

	// x-is-human configuration
	xIsHuman: {
		dynamicEUrl:
			"https://cursor.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/a-4-a/c.js?i=1&v=3&h=cursor.com",
		refreshInterval: 4 * 60 * 60 * 1000, // 4 hours
		defaultData: {
			b: 0,
			v: Math.random() * 0.2,
			e: "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..M8k9E7yHXWkQuVcm.U1W5ovCj_TO3CismFpgq06pvMhNgciB51LnTEhxqQQ7KHmomgbpVfCKcxjUj9q_xR3LUbCf4BMZzYompqCBp3Q1NFZV7TRpzZhZtiQGwbrYW9NGfMCYNb-X1ovwoppDiODfoUjw81nTcXR-pLxgkbwleTq09MrcoDI5mfb3BFu64sdhc1TB6XUDPrhUYzdnyCG3aUDO1XGmA2GJnKPJYnbFX-hfueCmbnrM6L7bFyXbkwDLCGXLoJ6S5DYKKCzWzW_dXIqnK7HQDdxtTEmldioNIT_IFJHgFyD0dtEzRWiRrR9eO9X77jmWK6JSp7uBZLS_KHJKSBQuqFEQwBaqKj_OhDo9ZJ0f3TtL6Xmqw_G4Xh-t2ZNYjbBxDYmBacULmjuDw_iYQ4zrMdYSmUWmY6HsZ4UGprdb4_snCs2vXxHCqjUtubVPk0JvkjRDEebTlPZaYkLmkOJnYIYt24RUGri3p7xs_b7Q3BhslNX4K8T4mhWq0fjfVvVEcdFmus69mBDPvR8rGMvjxmEAJ4g.SJCIYOMw2IlVQXvwC2Vn1w",
			s: "/HYcZdBjAGYOc9Wv44z0jhMutFLwvFimD2XnU/MbJD1WTsUFi71E+fDYaCyiVQwz76uGUsnb7QLXUwWbWjMFY9+Fbej0j4SVqxo8B8ecVZll7RoYJ9GkPPPPV7l2mgXDfkdb+REhq81432gyy6/T5C585FjbSXFXPPe/DifxCQ3EIO636lOWEDRSb6mPXuXRc9qtQF3jezM6sbljI+GaqM4E4KEAC9TlcGSdTJEl+tFaVxfngvckIiH/bPA5laXPs7jOgBqr3jvPnbYmZAaXswUPgCgqHJX5c7PfuTh+jUIvqw==",
			d: 0,
			vr: "3",
		},
	},

	// API configuration
	api: {
		defaultModel: "anthropic/claude-4.5-sonnet",
	},

	// Available models
	models: [
		{
			id: "anthropic/claude-4.5-sonnet",
			object: "model",
			owned_by: "cursor",
		},
		{
			id: "anthropic/claude-4-sonnet",
			object: "model",
			owned_by: "cursor",
		},
		{
			id: "anthropic/claude-4.1-opus",
			object: "model",
			owned_by: "cursor",
		},
		{
			id: "openai/gpt-5",
			object: "model",
			owned_by: "cursor",
		},
		{
			id: "google/gemini-2.5-pro",
			object: "model",
			owned_by: "cursor",
		},
		{
			id: "google/gemini-2.5-flash",
			object: "model",
			owned_by: "cursor",
		},
		{
			id: "xai/grok-4",
			object: "model",
			owned_by: "cursor",
		},
		{
			id: "xai/grok-code-fast-1",
			object: "model",
			owned_by: "cursor",
		},
		{
			id: "moonshotai/kimi-k2-0905",
			object: "model",
			owned_by: "cursor",
		},
		{
			id: "alibaba/qwen3-coder",
			object: "model",
			owned_by: "cursor",
		},
		{
			id: "alibaba/qwen3-coder-plus",
			object: "model",
			owned_by: "cursor",
		},
		{
			id: "alibaba/qwen3-max",
			object: "model",
			owned_by: "cursor",
		},
		{
			id: "zai/glm-4.6",
			object: "model",
			owned_by: "cursor",
		},
	],
};
