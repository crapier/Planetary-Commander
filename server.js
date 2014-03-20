// The node.js HTTP server.
var app = require('http').createServer(handler);
// The socket.io WebSocket server, running with the node.js server.
var io = require('socket.io').listen(app);
// Allows access to local file system.
var fs = require('fs');

// Listen on a high port.
var listen_port = 61111;
app.listen(listen_port);
console.log('HTTP Server is listening on port: ' + listen_port);

// Handles HTTP requests.
function handler(request, response) {
	var path = request.url;
	switch (path) {
		case '/':
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(fs.readFileSync(__dirname + '/index.html', 'utf8'));
			response.end();
			break;
		default:
			if (/\.(css)$/.test(path)) {
				response.writeHead(200, {'Content-Type': 'text/css'});
				response.write(fs.readFileSync(__dirname + path, 'utf8'));
				response.end();
				break;
			}
			response.writeHead(404);
			return response.end('Could not find ' + path);
			break;
	}
}

// Listen for 'connection'
io.sockets.on('connection', 
	function(client) {
	
	// Listen for 'disconnect'
	client.on( 'disconnect', 
		function() {
		
		});
	});

