var config = require('config');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var readline = require('readline');
var util = require('./../modules/utils');
var fs = require('fs');
var async = require('async');
var hackHeader = config.get('consts.hack.header');
var exception_country = config.get('consts.hack.exception_country');

function File(app) {
	this.app = app;
	this.name = 'file';
};

File.prototype.resource = function (o) {
	var mount_point = o.mp + '/' + this.name;
	this.app.post(mount_point + '/upload', multipartMiddleware, this.upload);
}

File.prototype.upload = function (req, res, next) {
	var logs_file = null;
	var logs_file = req.files && req.files.logs;

	var result = {
		'success': 0,
		'message': 'Error processing log file.'
	};

	if (!logs_file)
		return res.json(result);

	var rl = readline.createInterface({
		input: fs.createReadStream(logs_file.path)
	});

	var lines = [];

	rl.on('line', function (line, lineCount, byteCount) {
		lines.push(line);
	}).on('close', function () {

		var asyncTasks = [];
		lines.forEach(function (line) {
			asyncTasks.push(function (callback) {

				var tokens = line.match(/\S+/g);
				var header = tokens[3] + ' ' + tokens[4];
				header = header.replace(/^\"|\"$/g, "");

				if (header == hackHeader || util.searchPattern(header, hackHeader) > 0) {
					callback(null,{'status':'Yes','line':line});					
				} else {
					var client_ip = tokens[8].split(":")[0];
					var sql = 'SELECT c.`code` FROM ip2nationCountries c,ip2nation i WHERE i.ip < INET_ATON("182.35.60.12") AND c.code = i.country ORDER BY i.ip DESC LIMIT 0,1;';
					req.db_query(sql, function (err, rows) {
						if (err) {
							console.log('ERR DB : ', err);
							callback(null,{'status':'No','line':line});
						}

						if (rows && rows[0] && rows[0][0] && rows[0][0].code != exception_country) {
							callback(null,{'status':'Yes','line':line});
						} else {
							callback(null,{'status':'No','line':line});
						}
					});
				}
			});
		});

		async.parallel(asyncTasks, function (err, results) {
			if (err) {
				console.log('Error processing log file.', err);
				result.message = 'Users file uploaded successfully.Error processing log file.' + err.message;
				result.success = 0;
				return res.json(result);
			}

			result.message = 'Users file uploaded successfully.';
			result.success = 1;
			result.data = results;
			return res.render('check.ejs',{results:results});
			//return res.json(result);
		});
	});
};

module.exports = File;
