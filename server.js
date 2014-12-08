var http = require('http');
var ecstatic = require('ecstatic');

// Simple static file server.
// We need to run the example from a server, even if it
// is a local one, so the browser will authorize webcam access.
// Frankly I don't know why, its just what worked on my machine.
//
// Note! All the work is done by client.js. Because it uses some
// node.js modules, it has to be put together before being served
// to clients. This is done before the server starts up using
// browserify, and there is a precompiled version in the public dir.
// If it is changed however, it has to be recompiled. This can be
// done by running npm start in the root directory or by running
//
// npm install -g browserify
// browseriry client.js > public/js/client.js
//
// from the command line in the root dir
// Then the server can be spun up by calling
//
// node server.js 3000
//
// or any other port number

var server = http.createServer(
  ecstatic({ root: __dirname + '/public' })
);


var PORT = process.argv[2] || process.env.PORT;
if (PORT) {
	server.listen(PORT, function(){
		console.log("Kinetic Verse server listening on :"+PORT);
	})
}
