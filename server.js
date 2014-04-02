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
			if (/\.(html)$/.test(path)) {
				fs.readFile(__dirname + path,
					function(err, content) {
						if (err) {
							response.writeHead(404);
							return response.end('Could not find file ' + path);
						}
						response.writeHead(200, {'Content-Type': 'text/html'});
						response.end(content);
					});
				break;
			}
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
			if (/\.(png)$/.test(path)) {
				fs.readFile(__dirname + path,
					function(err, content) {
						if (err) {
							response.writeHead(404);
							return response.end('Could not find file ' + path);
						}
						response.writeHead(200, {'Content-Type': 'Image'});
						response.end(content);
					});
				break;
			}
			response.writeHead(501);
			return response.end('Can not handle ' + path);
			break;
	}
}

var large = 10;
var medium = 5;
var small = 2;

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
var game_state = 0;

var client_1_movements = [];
var client_2_movements = [];

var node = function(units, owner, size, adjacent) {
	this.units = units;
	this.owner = owner;
	this.size = size;
	this.adjacent = adjacent;
	this.generating = false;
}

node.prototype.generate = function() {
	if(this.owner == client_1 || this.owner == client_2) {
		if(this.generating) {
			this.units = this.units + this.size;
		}
		else {
			this.generating = true;
		}
	}
}

var update = function(owner, units, visible) {
	this.owner = owner;
	this.units = units;
	this.visible = visible;
}

var game_setup = function() {
	nodes.push(new node(20, none, large, [4, 6, 8, 14, 15]));
	nodes.push(new node(20, none, large, [5, 7, 10, 18, 22]));
	nodes.push(new node(20, none, large, [9, 11, 12, 20, 23]));
	nodes.push(new node(20, none, large, [6, 7, 9, 16, 17, 21]));
	nodes.push(new node(10, none, medium, [0, 13]));
	nodes.push(new node(10, none, medium, [1, 13]));
	nodes.push(new node(10, none, medium, [0, 3]));
	nodes.push(new node(10, none, medium, [1, 3]));
	nodes.push(new node(10, none, medium, [0, 19]));
	nodes.push(new node(10, none, medium, [2, 3]));
	nodes.push(new node(10, none, medium, [1, 24]));
	nodes.push(new node(10, none, medium, [2, 19]));
	nodes.push(new node(10, none, medium, [2, 24]));
	nodes.push(new node(5, none, small, [4, 5]));
	nodes.push(new node(5, none, small, [0, 17, 18]));
	nodes.push(new node(5, none, small, [0, 16, 20]));
	nodes.push(new node(5, none, small, [3, 15, 20]));
	nodes.push(new node(5, none, small, [3, 14, 18]));
	nodes.push(new node(5, none, small, [1, 14, 17]));
	nodes.push(new node(5, none, small, [8, 11]));
	nodes.push(new node(5, none, small, [2, 15, 16]));
	nodes.push(new node(5, none, small, [3, 22, 23]));
	nodes.push(new node(5, none, small, [1, 21, 23]));
	nodes.push(new node(5, none, small, [2, 21, 22]));
	nodes.push(new node(5, none, small, [10, 12]));
	
	var client_1_start = Math.floor((Math.random()*3));
	var client_2_start = Math.floor((Math.random()*3));
	while(client_1_start == client_2_start) {
		var client_2_start = Math.floor((Math.random()*3));
	}
	
	nodes[client_1_start].owner = client_1;
	nodes[client_1_start].units = 50;
	nodes[client_1_start].generating = true;
	nodes[client_2_start].owner = client_2;
	nodes[client_2_start].units = 50;
	nodes[client_2_start].generating = true;
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
	num_connected_clients = 0;
	movements_recieved = 0;
	game_state = 2;
	
	var player_1_final_update = [];
	var player_2_final_update = [];
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == client_1) {
			player_1_final_update.push(new update(player, nodes[i].units, true));
			player_2_final_update.push(new update(opponent, nodes[i].units, true));
		}
		if(nodes[i].owner == client_2) {
			player_1_final_update.push(new update(opponent, nodes[i].units, true));
			player_2_final_update.push(new update(player, nodes[i].units, true));
		}
		if(nodes[i].owner == none) {
			player_1_final_update.push(new update(none, nodes[i].units, true));
			player_2_final_update.push(new update(none, nodes[i].units, true));
		}
	}
	
	if(client_1_holds == 0) {
		io.sockets.socket(client_1_socket_id).emit('results', {results:"loser", updates:player_1_final_update});
		io.sockets.socket(client_2_socket_id).emit('results', {results:"winner", updates:player_2_final_update});
	}
	else if(client_2_holds == 0) {
		io.sockets.socket(client_1_socket_id).emit('results', {results:"winner", updates:player_1_final_update});
		io.sockets.socket(client_2_socket_id).emit('results', {results:"loser", updates:player_2_final_update});
	}
	nodes = [];
	
}

var calculate_movements = function(){
	for(var i = 0; i < client_1_movements.length; i++){
		if(nodes[client_1_movements[i].source].owner != client_1) {
			client_1_movements[i].units = 0;
		}
		if(nodes[client_1_movements[i].source].units < client_1_movements[i].units) {
			client_1_movements[i].units = nodes[client_1_movements[i].source].units;
		}
		for (var j = 0; j < i; j++) {
			if (client_1_movements[j].units != 0 && client_1_movements[j].source == client_1_movements[i].source) {
				client_1_movements[j].units = 0;
			}
		}
		var destination_adjacent = false;
		for (var j = 0; j < nodes[client_1_movements[i].source].adjacent.length; j++) {
			if (client_1_movements[i].destination == nodes[client_1_movements[i].source].adjacent[j]) {
				destination_adjacent = true;
				break;
			}
		}
		if (destination_adjacent == false) {
			client_1_movements[i].units = 0;
		}
	}
	for(var i = 0; i < client_2_movements.length; i++){
		if(nodes[client_2_movements[i].source].owner != client_2) {
			client_2_movements[i].units = 0;
		}
		if(nodes[client_2_movements[i].source].units < client_2_movements[i].units) {
			client_2_movements[i].units = nodes[client_2_movements[i].source].units;
		}
		for (var j = 0; j < i; j++) {
			if (client_2_movements[j].units != 0 && client_2_movements[j].source == client_2_movements[i].source) {
				client_2_movements[j].units = 0;
			}
		}
		var destination_adjacent = false;
		for (var j = 0; j < nodes[client_2_movements[i].source].adjacent.length; j++) {
			if (client_2_movements[i].destination == nodes[client_2_movements[i].source].adjacent[j]) {
				destination_adjacent = true;
				break;
			}
		}
		if (destination_adjacent == false) {
			client_2_movements[i].units = 0;
		}
	}
	
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
				nodes[i].generating = false;
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
				nodes[i].generating = false;
			}
			else {
				nodes[i].units = nodes[i].units - client_2_incoming;
			}	
		}
	}
	
	for(var i = 0; i < nodes.length; i++){
		nodes[i].generate();
	}
	
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
	if(game_state == 0) {
		num_connected_clients = 0;
		movements_recieved = 0;
		nodes = [];
	}
	if(game_state == 1) {
		num_connected_clients = 0;
		movements_recieved = 0;
		var player_1_final_update = [];
		var player_2_final_update = [];
		for(var i = 0; i < nodes.length; i++) {
			if(nodes[i].owner == client_1) {
				player_1_final_update.push(new update(player, nodes[i].units, true));
				player_2_final_update.push(new update(opponent, nodes[i].units, true));
			}
			if(nodes[i].owner == client_2) {
				player_1_final_update.push(new update(opponent, nodes[i].units, true));
				player_2_final_update.push(new update(player, nodes[i].units, true));
			}
			if(nodes[i].owner == none) {
				player_1_final_update.push(new update(none, nodes[i].units, true));
				player_2_final_update.push(new update(none, nodes[i].units, true));
			}
		}
		io.sockets.socket(client_1_socket_id).emit('results', {results:"winner", updates:player_1_final_update});
		io.sockets.socket(client_2_socket_id).emit('results', {results:"winner", updates:player_2_final_update});
		game_state = 3;
		nodes = [];
	}
	else if (game_state == 2) {
		game_state = 3;
	}
	else if (game_state == 3) {
		game_state = 0;
	}
}

var connection_handler = function(client) {
	if(num_connected_clients == 0 && game_state == 0) {
		client.emit("client_id", client_1);
		client_1_socket_id = client.id;
		game_setup();
		num_connected_clients++;
		client.on('movements', movement_handler);
		client.on('disconnect', disconnect_handler);
	}
	else if (num_connected_clients == 1 && game_state == 0) { 
		client.emit("client_id", client_2);
		client_2_socket_id = client.id;
		send_updates();
		num_connected_clients++
		client.on('movements', movement_handler);
		client.on('disconnect', disconnect_handler);
		game_state = 1;
	}
	else {
		client.on('disconnect', function() {});
	}
	
}

io.sockets.on('connection', connection_handler);

