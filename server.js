// The node.js HTTP server.
var app = require('http').createServer(handler);
// The socket.io WebSocket server, running with the node.js server.
var io = require('socket.io').listen(app);
// Allows access to local file system.
var fs = require('fs');
// Allows for parsing urls
var url = require('url');

// Listen on a high port.
var listen_port = 61111;
app.listen(listen_port);
console.log('Server is listening on port: ' + listen_port);

// Handles HTTP requests.
function handler(request, response) {
	var path = url.parse(request.url).pathname;
	switch (path) {
		case '/':
			fs.readFile(__dirname + '/client/index.html',
				function(err, content) {
					if (err) {
						response.writeHead(404);
						return response.end('Could not find file' + path);
					}
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.end(content);
				});
			break;
		default:
			if (/\.(css)$/.test(path)) {
				fs.readFile(__dirname + path,
					function(err, content) {
						if (err) {
							response.writeHead(404);
							return response.end('Could not find file ' + path);
						}
						response.writeHead(200, {'Content-Type': 'text/css'});
						response.end(content);
					});
				break;
			}
			if (/\.(js)$/.test(path)) {
				fs.readFile(__dirname + path,
					function(err, content) {
						if (err) {
							response.writeHead(404);
							return response.end('Could not find file ' + path);
						}
						response.writeHead(200, {'Content-Type': 'application/x-javascript'});
						response.end(content);
					});
				break;
			}
			response.writeHead(501);
			return response.end('Can not handle ' + path);
			break;
	}
}

var large = 40;
var medium = 20;
var small = 13;

var none = 0;
var player = 1;
var opponent = 2;

var client_1 = 1;
var client_2 = 2;
var client_1_socket_id;
var client_2_socket_id;

var nodes = [];
var num_connected_clients = 0;
var movements_recieved = 0;

var client_1_movements = [];
var client_2_movements = [];

var node = function(units, owner, size, adjacent) {
	this.units = units;
	this.owner = owner;
	this.size = size;
	this.adjacent = adjacent;
}

node.prototype.generate = function() {

}

var update = function(owner, units, visible) {
	this.owner = owner;
	this.units = units;
	this.visible = visible;
}

var game_setup = function() {
	nodes.push(new node(20, none, large, [15, 6, 8, 4, 14]));
	nodes.push(new node(20, none, large, [5, 18, 7, 22, 10]));
	nodes.push(new node(20, none, large, [11, 20, 9, 23, 12]));
	nodes.push(new node(20, none, large, [17, 6, 16, 9, 21, 7]));
	nodes.push(new node(10, none, medium, [0, 13]));
	nodes.push(new node(10, none, medium, [13, 1]));
	nodes.push(new node(10, none, medium, [0, 3]));
	nodes.push(new node(10, none, medium, [1, 3]));
	nodes.push(new node(10, none, medium, [0, 19]));
	nodes.push(new node(10, none, medium, [2, 3]));
	nodes.push(new node(10, none, medium, [1, 24]));
	nodes.push(new node(10, none, medium, [19, 2]));
	nodes.push(new node(10, none, medium, [2, 24]));
	nodes.push(new node(5, none, small, 580, 70, [4, 5]));
	nodes.push(new node(5, none, small, 460, 150, [0, 17, 18]));
	nodes.push(new node(5, none, small, 230, 230, [0, 16, 20]));
	nodes.push(new node(5, none, small, 370, 270, [3, 15, 20]));
	nodes.push(new node(5, none, small, 460, 240, [3, 14, 18]));
	nodes.push(new node(5, none, small, 620, 210, [1, 14, 17]));
	nodes.push(new node(5, none, small, 240, 430, [8, 11]));
	nodes.push(new node(5, none, small, 370, 410, [2, 15, 16]));
	nodes.push(new node(5, none, small, 540, 350, [3, 22, 23]));
	nodes.push(new node(5, none, small, 660, 320, [1, 21, 23]));
	nodes.push(new node(5, none, small, 620, 500, [2, 21, 22]));
	nodes.push(new node(5, none, small, 820, 460, [10, 12]));
	
	var client_1_start = Math.floor((Math.random()*3));
	var client_2_start = Math.floor((Math.random()*3));
	while(client_1_start == client_2_start) {
		var client_2_start = Math.floor((Math.random()*3));
	}
	
	nodes[client_1_start].owner = client_1;
	nodes[client_1_start].units = 50;
	nodes[client_2_start].owner = client_2;
	nodes[client_2_start].units = 50;
}

var send_updates = function() {
	var client_1_updates = [];
	var client_2_updates = [];
	for(var i = 0; i < nodes.length; i++) {
		client_1_updates.push(new update(-1, -1, false));
		client_2_updates.push(new update(-1, -1, false));
	}
	
	for(var i = 0; i < nodes.length; i++) {
		if (nodes[i].owner == client_1) {
			client_1_updates[i].owner = player;
			client_1_updates[i].units = nodes[i].units;
			client_1_updates[i].visible = true;
			for(var j = 0; j < nodes[i].adjacent.length; j++) {
				if (nodes[nodes[i].adjacent[j]].owner == client_1) {
					client_1_updates[nodes[i].adjacent[j]].owner = player;
				}
				else if (nodes[nodes[i].adjacent[j]].owner == client_2) {
					client_1_updates[nodes[i].adjacent[j]].owner = opponent;
				}
				else if (nodes[nodes[i].adjacent[j]].owner == none) {
					client_1_updates[nodes[i].adjacent[j]].owner = none;
				}
				client_1_updates[nodes[i].adjacent[j]].units = nodes[nodes[i].adjacent[j]].units;
				client_1_updates[nodes[i].adjacent[j]].visible = true;
			}
		}
		else if (nodes[i].owner == client_2) {
			client_2_updates[i].owner = player;
			client_2_updates[i].units = nodes[i].units;
			client_2_updates[i].visible = true;
			for(var j = 0; j < nodes[i].adjacent.length; j++) {
				if (nodes[nodes[i].adjacent[j]].owner == client_2) {
					client_2_updates[nodes[i].adjacent[j]].owner = player;
				}
				else if (nodes[nodes[i].adjacent[j]].owner == client_1) {
					client_2_updates[nodes[i].adjacent[j]].owner = opponent;
				}
				else if (nodes[nodes[i].adjacent[j]].owner == none) {
					client_2_updates[nodes[i].adjacent[j]].owner = none;
				}
				client_2_updates[nodes[i].adjacent[j]].units = nodes[nodes[i].adjacent[j]].units;
				client_2_updates[nodes[i].adjacent[j]].visible = true;
			}
		}
	}
	
	io.sockets.socket(client_1_socket_id).emit('updates', client_1_updates);
	io.sockets.socket(client_2_socket_id).emit('updates', client_2_updates);
}

var send_results = function(client_1_holds, client_2_holds) {
	if(client_1_holds == 0) {
		io.sockets.socket(client_1_socket_id).emit('results', "loser");
		io.sockets.socket(client_2_socket_id).emit('results', "winner");
	}
	else if(client_2_holds == 0) {
		io.sockets.socket(client_1_socket_id).emit('results', "winner");
		io.sockets.socket(client_2_socket_id).emit('results', "loser");
	}
	nodes = [];
}

var calculate_movements = function(){
	for(var i = 0; i < client_1_movements.length; i++){
		nodes[client_1_movements[i].source].units -= client_1_movements[i].units;
	}
	for(var i = 0; i < client_2_movements.length; i++){
		nodes[client_2_movements[i].source].units -= client_2_movements[i].units;
	}
	
	for(var i = 0; i < nodes.length; i++){
		var client_1_incoming = 0;
		var client_2_incoming = 0;
		for(var j = 0; j < client_1_movements.length; j++) {
			if(client_1_movements[j].destination == i) {
				client_1_incoming += client_1_movements[j].units;
			}
		}
		for(var j = 0; j < client_2_movements.length; j++) {
			if(client_2_movements[j].destination == i) {
				client_2_incoming += client_2_movements[j].units;
			}
		}
		if(client_1_incoming >= client_2_incoming) {
			client_1_incoming -= client_2_incoming;
			if (nodes[i].owner == client_1) {
				nodes[i].units += client_1_incoming;
			}
			else if (client_1_incoming > nodes[i].units) {
				nodes[i].units = client_1_incoming - nodes[i].units;
				nodes[i].owner = client_1;
			}
			else {
				nodes[i].units = nodes[i].units - client_1_incoming;
			}	
		}
		else {
			client_2_incoming -= client_1_incoming;
			if (nodes[i].owner == client_2) {
				nodes[i].units += client_2_incoming;
			}
			else if (client_2_incoming > nodes[i].units) {
				nodes[i].units = client_2_incoming - nodes[i].units;
				nodes[i].owner = client_2;
			}
			else {
				nodes[i].units = nodes[i].units - client_2_incoming;
			}	
		}
	}
	
	for(var i = 0; i < nodes.length; i++){
		nodes[i].generate();
	}
	
	console.log(nodes);
	var client_1_holds = 0;
	var client_2_holds = 0;
	for(var i = 0; i < nodes.length; i++){
		if(nodes[i].owner == client_1) {
			client_1_holds++;
		}
		else if (nodes[i].owner == client_2) {
			client_2_holds++;
		}
	}
	if (client_1_holds == 0 || client_2_holds == 0) {
		send_results(client_1_holds, client_2_holds);
	}
	else {
		send_updates();
	}
}

var movement_handler = function(message) {
	if(message.client_id == client_1) {
		client_1_movements = message.movements;
	}
	else if (message.client_id == client_2) {
		client_2_movements = message.movements;
	}
	
	if(movements_recieved == 0) {
		movements_recieved++;
	}
	else {
		calculate_movements();
		movements_recieved--;
	}
}

var disconnect_handler = function() {
	num_connected_clients--;
	nodes = [];
}

var connection_handler = function(client) {
	if(num_connected_clients == 0) {
		client.emit("client_id", client_1);
		client_1_socket_id = client.id;
		game_setup();
		num_connected_clients++;
	}
	else { 
		client.emit("client_id", client_2);
		client_2_socket_id = client.id;
		send_updates();
		num_connected_clients++
	}
	
	client.on('movements', movement_handler);
	client.on('disconnect', disconnect_handler);
}

io.sockets.on('connection', connection_handler);

