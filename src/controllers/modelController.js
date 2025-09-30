/**
 * Model list controller
 */

const config = require("../config");

class ModelController {
	getModels(_req, res) {
		const models = config.models.map((model) => ({
			...model,
			created: Math.floor(Date.now() / 1000),
		}));

		res.json({
			object: "list",
			data: models,
		});
	}
}

module.exports = ModelController;
