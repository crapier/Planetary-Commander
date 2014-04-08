// The node.js HTTP server.
var app = require('http').createServer(handler);
// The socket.io WebSocket server, running with the node.js server.
var io = require('socket.io').listen(app);
io.set('log level', 1);
// Allows access to local file system.
var fs = require('fs');
// Allows for parsing urls
var url = require('url');

// Listen on a high port.
var listen_port = 61112;
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
var client_1_socket_id = [];
var client_2_socket_id = [];

var nodes = [];
var num_connected_clients = [];
var movements_recieved = [];
var game_state = [];

var client_1_movements = [];
var client_2_movements = [];

var node = function(units, size, adjacent) {
	this.units = units;
	this.owner = none;
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

var game_setup = function(game_id) {
	var map_id = Math.floor((Math.random()*maps.length));
	maps[map_id](game_id);
	
	io.sockets.socket(client_1_socket_id[game_id]).emit('map_select', map_id);
	io.sockets.socket(client_2_socket_id[game_id]).emit('map_select', map_id);
	send_updates(game_id);
}

var maps = [];

maps.push(function(game_id) {
	nodes[game_id].push(new node(20, large, [4, 6, 8, 14, 15]));
	nodes[game_id].push(new node(20, large, [5, 7, 10, 18, 22]));
	nodes[game_id].push(new node(20, large, [9, 11, 12, 20, 23]));
	nodes[game_id].push(new node(20, large, [6, 7, 9, 16, 17, 21]));
	nodes[game_id].push(new node(10, medium, [0, 13]));
	nodes[game_id].push(new node(10, medium, [1, 13]));
	nodes[game_id].push(new node(10, medium, [0, 3]));
	nodes[game_id].push(new node(10, medium, [1, 3]));
	nodes[game_id].push(new node(10, medium, [0, 19]));
	nodes[game_id].push(new node(10, medium, [2, 3]));
	nodes[game_id].push(new node(10, medium, [1, 24]));
	nodes[game_id].push(new node(10, medium, [2, 19]));
	nodes[game_id].push(new node(10, medium, [2, 24]));
	nodes[game_id].push(new node(5, small, [4, 5]));
	nodes[game_id].push(new node(5, small, [0, 17, 18]));
	nodes[game_id].push(new node(5, small, [0, 16, 20]));
	nodes[game_id].push(new node(5, small, [3, 15, 20]));
	nodes[game_id].push(new node(5, small, [3, 14, 18]));
	nodes[game_id].push(new node(5, small, [1, 14, 17]));
	nodes[game_id].push(new node(5, small, [8, 11]));
	nodes[game_id].push(new node(5, small, [2, 15, 16]));
	nodes[game_id].push(new node(5, small, [3, 22, 23]));
	nodes[game_id].push(new node(5, small, [1, 21, 23]));
	nodes[game_id].push(new node(5, small, [2, 21, 22]));
	nodes[game_id].push(new node(5, small, [10, 12]));
	
	var client_1_start = Math.floor((Math.random()*3));
	var client_2_start = Math.floor((Math.random()*3));
	while(client_1_start == client_2_start) {
		client_2_start = Math.floor((Math.random()*3));
	}
	
	nodes[game_id][client_1_start].owner = client_1;
	nodes[game_id][client_1_start].units = 50;
	nodes[game_id][client_1_start].generating = true;
	nodes[game_id][client_2_start].owner = client_2;
	nodes[game_id][client_2_start].units = 50;
	nodes[game_id][client_2_start].generating = true;
})

maps.push(function(game_id) {
	nodes[game_id].push(new node(20, large, [3, 5]));
	nodes[game_id].push(new node(20, large, [3, 4]));
	nodes[game_id].push(new node(20, large, [4, 5]));
	nodes[game_id].push(new node(10, medium, [0, 1, 6]));
	nodes[game_id].push(new node(10, medium, [1, 2, 7]));
	nodes[game_id].push(new node(10, medium, [0, 2, 8]));
	nodes[game_id].push(new node(5, small, [3, 7, 8]));
	nodes[game_id].push(new node(5, small, [4, 6, 8]));
	nodes[game_id].push(new node(5, small, [5, 6, 7]));
	
	var client_1_start = Math.floor((Math.random()*3));
	var client_2_start = Math.floor((Math.random()*3));
	while(client_1_start == client_2_start) {
		client_2_start = Math.floor((Math.random()*3));
	}
	
	nodes[game_id][client_1_start].owner = client_1;
	nodes[game_id][client_1_start].units = 50;
	nodes[game_id][client_1_start].generating = true;
	nodes[game_id][client_2_start].owner = client_2;
	nodes[game_id][client_2_start].units = 50;
	nodes[game_id][client_2_start].generating = true;
})

maps.push(function(game_id) {
	nodes[game_id].push(new node(20, large, [1, 2, 4]));
	nodes[game_id].push(new node(20, large, [2, 0, 5]));
	nodes[game_id].push(new node(20, large, [1, 0, 3]));
	nodes[game_id].push(new node(5, small, [2, 9, 10, 16]));
	nodes[game_id].push(new node(5, small, [11, 0, 12, 15]));
	nodes[game_id].push(new node(5, small, [1, 13, 14, 17]));
	nodes[game_id].push(new node(20, large, [9, 10, 21]));
	nodes[game_id].push(new node(20, large, [11, 12, 22]));
	nodes[game_id].push(new node(20, large, [13, 14, 23]));
	nodes[game_id].push(new node(5, small, [3, 6, 16]));
	nodes[game_id].push(new node(10, medium, [6, 3, 18]));
	nodes[game_id].push(new node(5, small, [7, 4, 15]));
	nodes[game_id].push(new node(10, medium, [7, 4, 20]));
	nodes[game_id].push(new node(5, small, [5, 8, 17]));
	nodes[game_id].push(new node(10, medium, [8, 5, 19]));
	nodes[game_id].push(new node(5, small, [11, 4, 18]));
	nodes[game_id].push(new node(5, small, [3, 9, 19]));
	nodes[game_id].push(new node(5, small, [5, 13, 20]));
	nodes[game_id].push(new node(5, small, [15, 10]));
	nodes[game_id].push(new node(5, small, [16, 14]));
	nodes[game_id].push(new node(5, small, [12, 17]));
	nodes[game_id].push(new node(5, small, [6]));
	nodes[game_id].push(new node(5, small, [7]));
	nodes[game_id].push(new node(5, small, [8]));

	var client_1_start = Math.floor((Math.random()*3));
	var client_2_start = Math.floor((Math.random()*3));
	while(client_1_start == client_2_start) {
		client_2_start = Math.floor((Math.random()*3));
	}

	nodes[game_id][client_1_start].owner = client_1;
	nodes[game_id][client_1_start].units = 50;
	nodes[game_id][client_1_start].generating = true;
	nodes[game_id][client_2_start].owner = client_2;
	nodes[game_id][client_2_start].units = 50;
	nodes[game_id][client_2_start].generating = true;
})

var send_updates = function(game_id) {
	var client_1_updates = [];
	var client_2_updates = [];
	for(var i = 0; i < nodes[game_id].length; i++) {
		client_1_updates.push(new update(-1, -1, false));
		client_2_updates.push(new update(-1, -1, false));
	}
	
	for(var i = 0; i < nodes[game_id].length; i++) {
		if (nodes[game_id][i].owner == client_1) {
			client_1_updates[i].owner = player;
			client_1_updates[i].units = nodes[game_id][i].units;
			client_1_updates[i].visible = true;
			for(var j = 0; j < nodes[game_id][i].adjacent.length; j++) {
				if (nodes[game_id][nodes[game_id][i].adjacent[j]].owner == client_1) {
					client_1_updates[nodes[game_id][i].adjacent[j]].owner = player;
				}
				else if (nodes[game_id][nodes[game_id][i].adjacent[j]].owner == client_2) {
					client_1_updates[nodes[game_id][i].adjacent[j]].owner = opponent;
				}
				else if (nodes[game_id][nodes[game_id][i].adjacent[j]].owner == none) {
					client_1_updates[nodes[game_id][i].adjacent[j]].owner = none;
				}
				client_1_updates[nodes[game_id][i].adjacent[j]].units = nodes[game_id][nodes[game_id][i].adjacent[j]].units;
				client_1_updates[nodes[game_id][i].adjacent[j]].visible = true;
			}
		}
		else if (nodes[game_id][i].owner == client_2) {
			client_2_updates[i].owner = player;
			client_2_updates[i].units = nodes[game_id][i].units;
			client_2_updates[i].visible = true;
			for(var j = 0; j < nodes[game_id][i].adjacent.length; j++) {
				if (nodes[game_id][nodes[game_id][i].adjacent[j]].owner == client_2) {
					client_2_updates[nodes[game_id][i].adjacent[j]].owner = player;
				}
				else if (nodes[game_id][nodes[game_id][i].adjacent[j]].owner == client_1) {
					client_2_updates[nodes[game_id][i].adjacent[j]].owner = opponent;
				}
				else if (nodes[game_id][nodes[game_id][i].adjacent[j]].owner == none) {
					client_2_updates[nodes[game_id][i].adjacent[j]].owner = none;
				}
				client_2_updates[nodes[game_id][i].adjacent[j]].units = nodes[game_id][nodes[game_id][i].adjacent[j]].units;
				client_2_updates[nodes[game_id][i].adjacent[j]].visible = true;
			}
		}
	}
	
	io.sockets.socket(client_1_socket_id[game_id]).emit('updates', client_1_updates);
	io.sockets.socket(client_2_socket_id[game_id]).emit('updates', client_2_updates);
}



var send_results = function(game_id, client_1_holds, client_2_holds) {
	num_connected_clients[game_id] = 0;
	movements_recieved[game_id] = 0;
	game_state[game_id] = 2;
	
	var player_1_final_update = [];
	var player_2_final_update = [];
	for(var i = 0; i < nodes[game_id].length; i++) {
		if(nodes[game_id][i].owner == client_1) {
			player_1_final_update.push(new update(player, nodes[game_id][i].units, true));
			player_2_final_update.push(new update(opponent, nodes[game_id][i].units, true));
		}
		if(nodes[game_id][i].owner == client_2) {
			player_1_final_update.push(new update(opponent, nodes[game_id][i].units, true));
			player_2_final_update.push(new update(player, nodes[game_id][i].units, true));
		}
		if(nodes[game_id][i].owner == none) {
			player_1_final_update.push(new update(none, nodes[game_id][i].units, true));
			player_2_final_update.push(new update(none, nodes[game_id][i].units, true));
		}
	}
	
	if(client_1_holds == 0) {
		io.sockets.socket(client_1_socket_id[game_id]).emit('results', {results:"loser", updates:player_1_final_update});
		io.sockets.socket(client_2_socket_id[game_id]).emit('results', {results:"winner", updates:player_2_final_update});
        console.log('Game ' + game_id + ' ended because client ' + client_1 + ' was victorious');
	}
	else if(client_2_holds == 0) {
		io.sockets.socket(client_1_socket_id[game_id]).emit('results', {results:"winner", updates:player_1_final_update});
		io.sockets.socket(client_2_socket_id[game_id]).emit('results', {results:"loser", updates:player_2_final_update});
		console.log('Game ' + game_id + ' ended because client ' + client_2 + ' was victorious');
	}
	nodes[game_id] = [];
	
}

var calculate_movements = function(game_id){
	for(var i = 0; i < client_1_movements[game_id].length; i++){
		if(nodes[game_id][client_1_movements[game_id][i].source].owner != client_1) {
			client_1_movements[game_id][i].units = 0;
		}
		if(nodes[game_id][client_1_movements[game_id][i].source].units < client_1_movements[game_id][i].units) {
			client_1_movements[game_id][i].units = nodes[game_id][client_1_movements[game_id][i].source].units;
		}
		for (var j = 0; j < i; j++) {
			if (client_1_movements[game_id][j].units != 0 && client_1_movements[game_id][j].source == client_1_movements[game_id][i].source) {
				client_1_movements[game_id][j].units = 0;
			}
		}
		var destination_adjacent = false;
		for (var j = 0; j < nodes[game_id][client_1_movements[game_id][i].source].adjacent.length; j++) {
			if (client_1_movements[game_id][i].destination == nodes[game_id][client_1_movements[game_id][i].source].adjacent[j]) {
				destination_adjacent = true;
				break;
			}
		}
		if (destination_adjacent == false) {
			client_1_movements[game_id][i].units = 0;
		}
	}
	for(var i = 0; i < client_2_movements[game_id].length; i++){
		if(nodes[game_id][client_2_movements[game_id][i].source].owner != client_2) {
			client_2_movements[game_id][i].units = 0;
		}
		if(nodes[game_id][client_2_movements[game_id][i].source].units < client_2_movements[game_id][i].units) {
			client_2_movements[game_id][i].units = nodes[game_id][client_2_movements[game_id][i].source].units;
		}
		for (var j = 0; j < i; j++) {
			if (client_2_movements[game_id][j].units != 0 && client_2_movements[game_id][j].source == client_2_movements[game_id][i].source) {
				client_2_movements[game_id][j].units = 0;
			}
		}
		var destination_adjacent = false;
		for (var j = 0; j < nodes[game_id][client_2_movements[game_id][i].source].adjacent.length; j++) {
			if (client_2_movements[game_id][i].destination == nodes[game_id][client_2_movements[game_id][i].source].adjacent[j]) {
				destination_adjacent = true;
				break;
			}
		}
		if (destination_adjacent == false) {
			client_2_movements[game_id][i].units = 0;
		}
	}
	
	for(var i = 0; i < client_1_movements[game_id].length; i++){
		nodes[game_id][client_1_movements[game_id][i].source].units -= client_1_movements[game_id][i].units;
	}
	for(var i = 0; i < client_2_movements[game_id].length; i++){
		nodes[game_id][client_2_movements[game_id][i].source].units -= client_2_movements[game_id][i].units;
	}
	
	for(var i = 0; i < nodes[game_id].length; i++){
		var client_1_incoming = 0;
		var client_2_incoming = 0;
		for(var j = 0; j < client_1_movements[game_id].length; j++) {
			if(client_1_movements[game_id][j].destination == i) {
				client_1_incoming += client_1_movements[game_id][j].units;
			}
		}
		for(var j = 0; j < client_2_movements[game_id].length; j++) {
			if(client_2_movements[game_id][j].destination == i) {
				client_2_incoming += client_2_movements[game_id][j].units;
			}
		}
		if(client_1_incoming >= client_2_incoming) {
			client_1_incoming -= client_2_incoming;
			if (nodes[game_id][i].owner == client_1) {
				nodes[game_id][i].units += client_1_incoming;
			}
			else if (client_1_incoming > nodes[game_id][i].units) {
				nodes[game_id][i].units = client_1_incoming - nodes[game_id][i].units;
				nodes[game_id][i].owner = client_1;
				nodes[game_id][i].generating = false;
			}
			else {
				nodes[game_id][i].units = nodes[game_id][i].units - client_1_incoming;
			}	
		}
		else {
			client_2_incoming -= client_1_incoming;
			if (nodes[game_id][i].owner == client_2) {
				nodes[game_id][i].units += client_2_incoming;
			}
			else if (client_2_incoming > nodes[game_id][i].units) {
				nodes[game_id][i].units = client_2_incoming - nodes[game_id][i].units;
				nodes[game_id][i].owner = client_2;
				nodes[game_id][i].generating = false;
			}
			else {
				nodes[game_id][i].units = nodes[game_id][i].units - client_2_incoming;
			}	
		}
	}
	
	for(var i = 0; i < nodes[game_id].length; i++){
		nodes[game_id][i].generate();
	}
	
	var client_1_holds = 0;
	var client_2_holds = 0;
	for(var i = 0; i < nodes[game_id].length; i++){
		if(nodes[game_id][i].owner == client_1) {
			client_1_holds++;
		}
		else if (nodes[game_id][i].owner == client_2) {
			client_2_holds++;
		}
	}
	if (client_1_holds == 0 || client_2_holds == 0) {
		send_results(game_id, client_1_holds, client_2_holds);
	}
	else {
		send_updates(game_id);
	}
}

var movement_handler = function(movements) {
	var game_id = this.store.data.game_id;
	var client_id = this.store.data.client_id;
	
	console.log("movements recieved")
	if(client_id == client_1) {
		client_1_movements[game_id] = movements;
	}
	else if (client_id == client_2) {
		client_2_movements[game_id] = movements;
	}
	
	if(movements_recieved[game_id] == 0) {
		movements_recieved[game_id]++;
	}
	else {
	    movements_recieved[game_id]--;
		calculate_movements(game_id);
	}
}

var disconnect_handler = function() {
	var game_id = this.store.data.game_id;
	var client_id = this.store.data.client_id;
	
	if(game_state[game_id] == 0) {
        console.log('Client ' + client_id + ' disconnected from pre-game ' + game_id);
		num_connected_clients[game_id] = 0;
		movements_recieved[game_id] = 0;
		nodes[game_id] = [];
	}
	if(game_state[game_id] == 1) {
        console.log('Game ' + game_id + ' ended because client ' + client_id + ' disconnected');
		num_connected_clients[game_id] = 0;
		movements_recieved[game_id] = 0;
		var player_1_final_update = [];
		var player_2_final_update = [];
		for(var i = 0; i < nodes[game_id].length; i++) {
			if(nodes[game_id][i].owner == client_1) {
				player_1_final_update.push(new update(player, nodes[game_id][i].units, true));
				player_2_final_update.push(new update(opponent, nodes[game_id][i].units, true));
			}
			if(nodes[game_id][i].owner == client_2) {
				player_1_final_update.push(new update(opponent, nodes[game_id][i].units, true));
				player_2_final_update.push(new update(player, nodes[game_id][i].units, true));
			}
			if(nodes[game_id][i].owner == none) {
				player_1_final_update.push(new update(none, nodes[game_id][i].units, true));
				player_2_final_update.push(new update(none, nodes[game_id][i].units, true));
			}
		}
		if(client_id == client_1) {
			io.sockets.socket(client_2_socket_id[game_id]).emit('results', {results:"winner", updates:player_2_final_update});
		}
		else if(client_id == client_2) {
			io.sockets.socket(client_1_socket_id[game_id]).emit('results', {results:"winner", updates:player_1_final_update});
		}
		game_state[game_id] = 3;
		nodes[game_id] = [];
	}
	else if (game_state[game_id] == 2) {
        console.log('Client ' + client_id + ' disconnected from finished game ' + game_id);
		game_state[game_id] = 3;
	}
	else if (game_state[game_id] == 3) {
        console.log('Client ' + client_id + ' disconnected from finished game ' + game_id);
        console.log('Game ' + game_id + ' open for new clients');
		game_state[game_id] = 0;
	}
}

var connection_handler = function(client) {
	var game_id = -1;
	for(var i = 0; i < num_connected_clients.length; i++) {
		if(num_connected_clients[i] == 1 && game_state[i] == 0) {
			game_id = i;
			break;
		}
	}
	if(game_id == -1) {
		for(var i = 0; i < num_connected_clients.length; i++) {
			if(num_connected_clients[i] == 0 && game_state[i] == 0) {
				game_id = i;
				break;
			}
		}
	}
	if(game_id == -1) {
		game_id = num_connected_clients.length;
		num_connected_clients.push(0);
		movements_recieved.push(0);
		game_state.push(0);
		nodes.push([]);
		client_1_movements.push([]);
		client_2_movements.push([]);
		
		client_1_socket_id.push(0);
		client_2_socket_id.push(0);
	}
	
	if(num_connected_clients[game_id] == 0) {
		console.log("New client joined game " + game_id + " as client " + client_1);
		client.set("game_id", game_id);
		client.set("client_id", client_1);
		client_1_socket_id[game_id] = client.id;
		num_connected_clients[game_id]++;
		client.on('movements', movement_handler);
		client.on('disconnect', disconnect_handler);
	}
	else if (num_connected_clients[game_id] == 1) {
		console.log("New client joined game " + game_id + " as client " + client_2);	
		client.set("game_id", game_id);
		client.set("client_id", client_2);
		client_2_socket_id[game_id] = client.id;
		game_setup(game_id);
		num_connected_clients[game_id]++
		client.on('movements', movement_handler);
		client.on('disconnect', disconnect_handler);
		game_state[game_id] = 1;
	}
}

io.sockets.on('connection', connection_handler);