var http = require('http');
var ecstatic = require('ecstatic');

var server = http.createServer(
  ecstatic({ root: __dirname + '/public' })
);

var PORT = process.argv[2] || process.env.PORT;
if (PORT) {
	server.listen(PORT, function(){
		console.log("Kinetic Verse server listening on :"+PORT);
	})
}
