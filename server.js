var fs = require('fs');
var path = require('path');
var http = require('http');
var PORT = process.argv[2],
	ANALYTICS = process.argv[3],
	server;


server = http.createServer(kv_server);

if (PORT) { 
	server.listen(PORT, function(){
		console.log("Kinetic Verse server listening on port:"+PORT);
	})
}

function kv_server(req, res) {
	var url = req.url;
	console.log(url)
	if (RegExp(/webcam.js/).test(url)) {
		res.statusCode = 200;
		res.setHeader("Content-Type", "text/javascript");
		fs.createReadStream('./static/js/webcam.js').pipe(res)
		return 
	} else if (RegExp(/webcam.swf/).test(url)) {
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/x-shockwave-flash");
		fs.createReadStream('./static/js/webcam.swf').pipe(res);
		return 
	} else if (RegExp(/^\/static\/(.*)/).test(url)) {
		var loc = '.' + url,
			content_type;
		switch (url.split('/static/')[1].split('/')[0]) { // e.g pages in /static/pages/foo/bar.html => 
			case 'css':
				content_type = "text/css";
				break; // [/static/, /pages/foo/bar.html] => [pages, foo, bar.html]
			case 'js':
				content_type = "text/javascript";
				break;
			case 'img':
				content_type = "image/" + path.extname(url);
				break;
			case 'pages':
				content_type = "text/html";
				break;
			default:
				content_type = "text/plain";
		}
	} else if (RegExp('^/[^/]*$').test(url)) {
		res.setHeader("Content-Type", 'text/html');
		res.statusCode = 200;
		fs.createReadStream('./static/pages/index.html').pipe(res)
	} else { // make sure to catch all requests
		res.statusCode = 404;
		res.setHeader("Content-Type", "text/plain");
		res.end("404: Not Found");
	}
}