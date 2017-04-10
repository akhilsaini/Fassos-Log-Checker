var log4js = require('log4js');
log4js.configure({
	appenders: [
		{ type: 'console' },
		{ type: 'file', filename: "./logs/info.log" }
	],
	replaceConsole: true
});

module.exports = {
	route_404: function (req, res, next) {
		var err = new Error('Not Found : '+req.url);
		err.status = 404;
		next(err);
	},
	dev_error_handler: function (req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	},
	prod_error_handler: function (req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {}
		});
	},
	log_api: function (req, res, next) {
		console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
		console.log('IN URL:', req.url, req.path);
		console.log('Method:', req.method);
		console.log('Query:', req.query);
		console.log('IP :', req.app.helper.remote_ip(req));
		console.log('------------------------------------');
		next();
	},
	log_api_lateral: function (req, res, next) {
		console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
		console.log('IN URL:', req.url, req.path);
		console.log('Method:', req.method);
		console.log('Query:', req.query);
		console.log('Body:', req.body);
		console.log('Files:', req.files);
		console.log('------------------------------------');
		//req.request = _.merge(req.query, req.body)
		next();
	},
	logmsg: function (req, res, next) {
		logger = log4js.getLogger();
		logger.setLevel('INFO');
		req.logmsg = logger;
		next();
	}
};
