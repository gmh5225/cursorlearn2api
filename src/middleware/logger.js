/**
 * Request logging middleware
 */

function logger(req, _res, next) {
	console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
	next();
}

module.exports = logger;
