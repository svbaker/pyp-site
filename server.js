var http = require("http");
var https = require('https');
var exec = require('child_process').exec;
var connect = require('connect');
var fs = require('fs');
var breedPage = require('breedPage');
var breedUploadViewer = require('breedUploadViewer');
var photoUploader = require('photoUploader');
var ops = require('ops');
var site = require('site');
var file_uploader = require('file-uploader');
var url = require('url');
var sslModeRedirector = require('sslModeRedirector');
var oldsiteRedirector = require('oldsiteRedirector');
var errtrack = require('errtrack');
var mysql = require('mysql');

console.log('\n\n-------------------- Node Version: ' + process.version + ' --------------');
console.log('Initializing pyp node server');

// Override default of 5 max sockets
http.Agent.defaultMaxSockets = 100;

// Archive old log file(s) and create new log file
var logFile
exec('mv ' + __dirname + '/log/*.log ' + __dirname + '/log/archive', 
  function(err, stdout, stderr) {
    if (err) {
    	console.log('Error archiving log files: ' + stderr);
    	process.exit(1);
    } else {
    	console.log('Prior log files archived to ' + __dirname + '/log/archive');
    }
});


// Create new log file
var dt = new Date();
var log_filename = __dirname + '/log/pyp_'
	+ dt.getFullYear() + '_'
	+ (dt.getMonth() + 1)
	+ '_' + dt.getDate()
	+ '-' + dt.getHours()
	+ '_' + dt.getMinutes()
	+ '_' + dt.getSeconds() + '.log';

logFile = fs.createWriteStream(log_filename, {flags: 'a'});
console.log('Logging site access and errors to: ' + log_filename);

// Set up environment using json setup config file
var env_settings = {};
var env_filepath = __dirname + '/env.json';
var ssl_filepath = __dirname + '/ssl/';

console.log('Looking for env.json file at ' + env_filepath);

if (fs.existsSync(env_filepath)) {
	try {
		var env_data = JSON.parse(fs.readFileSync(env_filepath));
		
		env_settings.dbConnSettings = env_data.db;
		env_settings.emailSettings = env_data.email;
		env_settings.encryption_key = env_data.encryption_key;
		env_settings.port = env_data.port;
		env_settings.sslport = env_data.sslport;
		env_settings.host = env_data.host;
		env_settings.webroot_path = env_data.webroot_path;
		env_settings.env_mode = env_data.env_mode;

		if (env_data.logSQL == 'Y') {
			env_settings.logSQL = true;
		} else {
			env_settings.logSQL = false;
		}
		env_settings.notification_email = env_data.notification_email;
		env_settings.logFile = logFile;

		console.log('Standard/SSL ports: ' + env_settings.port + '/' + env_settings.sslport);
		console.log('Webroot path: ' + env_settings.webroot_path);

		// Initialize database connection pool
		env_settings.dbConnSettings.queueLimit = 50;
		env_settings.connection_pool = mysql.createPool(env_settings.dbConnSettings);

	} catch(err) {
		console.log('Error loading config JSON file or pasring contents: ' + err.message);
		process.exit(1);
	}

} else {
	console.log('ERROR: No env.json config file found');
	process.exit(1);
}


// Set up SSL
var hskey = fs.readFileSync(ssl_filepath + 'key.pem');
var hscert = fs.readFileSync(ssl_filepath + 'cert.pem')
var ssl_options = {
	key: hskey,
	cert: hscert
};

// For managing static file server cache control
var oneDay = 86400000;

// Set up Non-SSL Connect routing
console.log('SET UP APP');
var app = connect()
	.use(connect.logger({stream: logFile}))
	.use(sslModeRedirector.route(env_settings, 'NONSSL'))
	.use(connect.favicon('public/images/favicon.ico'))
	.use(connect.compress())
	.use(connect.static(__dirname + '/public', {maxAge: oneDay}))
	.use(site.ajaxHandlers(env_settings))
	.use(breedPage.servePage(__dirname + '/public'))
	.use(photoUploader.uploadPhotosForm(env_settings))
	.use(ops.ajaxHandlers(env_settings))
	.use(oldsiteRedirector.route()) // Handle known 404 requests
	.use(connect.bodyParser()) // Parse body here for file uploaders
	.use(photoUploader.uploadPhoto(env_settings))
	.use(file_uploader.uploadFiles(env_settings))
	.use(function(req, res) {
		errtrack.logErr('Could not find handler for: ' + req.url, req, env_settings);
		res.writeHead(301, {
			'Location': '/404.html'
		});
		res.end();
	})
	.use(function(err, req, res, next) {
		errtrack.logErr('Error trapped by Connect: ' + err.message + ' : ' + err.stack, req, env_settings);
		res.writeHead(301, {
			'Location': '/500.html'
		});
		res.end('Error trapped by Connect: ' + err.message);
	});



// Set up SSL Connect routing
var ssl_app = connect()
	.use(connect.logger({stream: logFile}))
	.use(sslModeRedirector.route(env_settings, 'SSL'))
	.use(connect.favicon('public/images/favicon.ico'))
	.use(connect.compress())
	.use(connect.static(__dirname + '/public'), {maxAge: oneDay})
	.use(site.ajaxHandlers(env_settings))
	.use(breedUploadViewer.servePage(env_settings))
	.use(ops.ajaxHandlers(env_settings))
	.use(connect.bodyParser()) // Parse body here for file uploaders
	.use(file_uploader.uploadFiles(env_settings))  
	.use(function(req, res) {
		errtrack.logErr('Could not find handler for: ' + req.url, req, env_settings);
		res.writeHead(301, {
			'Location': '/404.html'
		});
		res.end();
	})
	.use(function(err, req, res, next) {
		errtrack.logErr('Error trapped by Connect: ' + err.message + ' : ' + err.stack, req, env_settings);
		res.writeHead(301, {
			'Location': '/500.html'
		});
		res.end('Error trapped by Connect: ' + err.message);
	});



// Start node servers listening on specified ports -----
http.createServer(app).listen(env_settings.port);
https.createServer(ssl_options, ssl_app).listen(env_data.sslport);

console.log('HTTP server listening on port ' + env_settings.port);
console.log('Secure HTTPS server listening on port ' + env_settings.sslport);


