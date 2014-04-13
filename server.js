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
var listen_port = 61111;
app.listen(listen_port);
// Log to the console so see what port the server is running on
console.log('Server is listening on port: ' + listen_port);

// Handles HTTP requests.
function handler(request, response) {
	// Parse the url to get the path
	var path = url.parse(request.url).pathname;
	switch (path) {
		// Return the index page for the client
		case '/':
			fs.readFile(__dirname + '/client/index.html',
				function(err, content) {
					if (err) {
						// The client requested a file we couldn't find
						response.writeHead(404);
						return response.end('Could not find file' + path);
					}
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.end(content);
				});
			break;
		default:
			// Handle html requests
			if (/\.(html)$/.test(path)) {
				fs.readFile(__dirname + path,
					function(err, content) {
						if (err) {
							// The client requested a file we couldn't find
							response.writeHead(404);
							return response.end('Could not find file ' + path);
						}
						response.writeHead(200, {'Content-Type': 'text/html'});
						response.end(content);
					});
				break;
			}
			// Handle css requests
			if (/\.(css)$/.test(path)) {
				fs.readFile(__dirname + path,
					function(err, content) {
						if (err) {
							// The client requested a file we couldn't find
							response.writeHead(404);
							return response.end('Could not find file ' + path);
						}
						response.writeHead(200, {'Content-Type': 'text/css'});
						response.end(content);
					});
				break;
			}
			// Handle javascript requests
			if (/\.(js)$/.test(path)) {
				fs.readFile(__dirname + path,
					function(err, content) {
						if (err) {
							// The client requested a file we couldn't find
							response.writeHead(404);
							return response.end('Could not find file ' + path);
						}
						response.writeHead(200, {'Content-Type': 'application/x-javascript'});
						response.end(content);
					});
				break;
			}
			// Handle image requests (only png support added at the momment)
			if (/\.(png)$/.test(path)) {
				fs.readFile(__dirname + path,
					function(err, content) {
						if (err) {
							// The client requested a file we couldn't find
							response.writeHead(404);
							return response.end('Could not find file ' + path);
						}
						response.writeHead(200, {'Content-Type': 'Image'});
						response.end(content);
					});
				break;
			}
			// Handle sound request (only mp3 suport added at the momment)
			if (/\.(mp3)$/.test(path)) {
				fs.readFile(__dirname + path,
					function(err, content) {
						if (err) {
							// The client requested a file we couldn't find
							response.writeHead(404);
							return response.end('Could not find file ' + path);
						}
						response.writeHead(200, {'Content-Type': 'Sound'});
						response.end(content);
					});
				break;
			}
			// The client requested a file type we don't handle
			response.writeHead(501);
			return response.end('Can not handle ' + path);
	}
}
// ---------
// CONSTANTS
// ---------


var large = 10;
var medium = 5;
var small = 2;

var none = 0;
var player = 1;
var opponent = 2;

var client_1 = 1;
var client_2 = 2;

// -------
// GLOBALS (each is an array and the index of the array is the game_id
// -------

// Socket id's for the two different players, so different messages can be sent 
// 		individualy to each client
var client_1_socket_id = [];
var client_2_socket_id = [];

// Node array for the current game
var nodes = [];
// Number of clients in the game (should be 0-2)
var num_connected_clients = [];
// Number of movements recieved (should be 0-2)
var movements_recieved = [];
// Game state (0 - pregame, 1 -  mid-game, 
//		2 - after-game(waiting for both clients to disconnect), 
//		3 - after-game(waiting for last player to disconnect))
var game_state = [];

// Recieved movements arrays from each player
var client_1_movements = [];
var client_2_movements = [];

// Node class for the server
var node = function(units, size, adjacent) {
	// The number of units on the node
	this.units = units;
	// Who owns the node, uses constants above (none, client_1,, client_2)
	this.owner = none;
	// The size of the node (small, medium, large)
	this.size = size;
	// Array of adjacent node_ids (index in nodes [] array)
	this.adjacent = adjacent;
	// Wether or not this node will generate units this turn
	this.generating = false;
}

// Generate new units function for nodes
node.prototype.generate = function() {
	// Only player owned nodes generate
	if(this.owner == client_1 || this.owner == client_2) {
		// Check to see if the node is generating this turn
		if(this.generating) {
			this.units = this.units + this.size;
		}
		// If it isn't it will next turn
		else {
			this.generating = true;
		}
	}
}

// Update class for sending to the clients
var update = function(owner, units, visible) {
	this.owner = owner;
	this.units = units;
	this.visible = visible;
}

// Set up the game once two clients are connected
var game_setup = function(game_id) {
	// Pick a random map id
	var map_id = Math.floor((Math.random()*maps.length));
	// Create the map for this game
	maps[map_id](game_id);
	
	// Send the map id to the clients
	io.sockets.socket(client_1_socket_id[game_id]).emit('map_select', map_id);
	io.sockets.socket(client_2_socket_id[game_id]).emit('map_select', map_id);
	// First updates to clients
	send_updates(game_id);
}

// Array of functions that create each different map
var maps = [];

// ----
// MAPS
// ----

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

maps.push(function(game_id) {
	nodes[game_id].push(new node(20, large, [11, 18]));
	nodes[game_id].push(new node(20, large, [10, 21]));
	nodes[game_id].push(new node(20, large, [9, 20]));
	nodes[game_id].push(new node(20, large, [8, 19]));
	nodes[game_id].push(new node(20, large, [32, 33, 30]));
	nodes[game_id].push(new node(20, large, [35, 34, 31]));
	nodes[game_id].push(new node(20, large, [14, 32, 35, 37, 38]));
	nodes[game_id].push(new node(20, large, [17, 33, 34, 39, 40]));
	nodes[game_id].push(new node(10, medium, [3, 15, 40]));
	nodes[game_id].push(new node(10, medium, [2, 16, 39]));
	nodes[game_id].push(new node(10, medium, [1, 13, 38]));
	nodes[game_id].push(new node(10, medium, [0, 12, 37]));
	nodes[game_id].push(new node(5, small, [11, 14]));
	nodes[game_id].push(new node(5, small, [10, 14]));
	nodes[game_id].push(new node(10, medium, [12, 13, 6]));
	nodes[game_id].push(new node(5, small, [17, 8]));
	nodes[game_id].push(new node(5, small, [17, 9]));
	nodes[game_id].push(new node(10, medium, [7, 16, 15]));
	nodes[game_id].push(new node(10, medium, [0, 22]));
	nodes[game_id].push(new node(10, medium, [3, 23]));
	nodes[game_id].push(new node(10, medium, [2, 24]));
	nodes[game_id].push(new node(10, medium, [1, 25]));
	nodes[game_id].push(new node(5, small, [18, 26, 37]));
	nodes[game_id].push(new node(5, small, [19, 27, 40]));
	nodes[game_id].push(new node(5, small, [20, 28, 39]));
	nodes[game_id].push(new node(5, small, [21, 29, 38]));
	nodes[game_id].push(new node(5, small, [22, 30]));
	nodes[game_id].push(new node(5, small, [23, 30]));
	nodes[game_id].push(new node(5, small, [24, 31]));
	nodes[game_id].push(new node(5, small, [25, 31]));
	nodes[game_id].push(new node(10, medium, [27, 26, 4]));
	nodes[game_id].push(new node(10, medium, [28, 29, 5]));
	nodes[game_id].push(new node(10, medium, [6, 4, 36]));
	nodes[game_id].push(new node(10, medium, [4, 7, 36]));
	nodes[game_id].push(new node(10, medium, [7, 5, 36]));
	nodes[game_id].push(new node(10, medium, [6, 5, 36]));
	nodes[game_id].push(new node(20, large, [32, 35, 34, 33]));
	nodes[game_id].push(new node(10, medium, [11, 22, 6]));
	nodes[game_id].push(new node(10, medium, [10, 25, 6]));
	nodes[game_id].push(new node(10, medium, [9, 24, 7]));
	nodes[game_id].push(new node(10, medium, [8, 23, 7]));

	var client_1_start = Math.floor((Math.random()*4));
	client_2_start = Math.floor((Math.random()*4));
	while(client_1_start == client_2_start) {
		var client_2_start = Math.floor((Math.random()*4));
	}
	
	nodes[game_id][client_1_start].owner = client_1;
	nodes[game_id][client_1_start].units = 50;
	nodes[game_id][client_1_start].generating = true;
	nodes[game_id][client_2_start].owner = client_2;
	nodes[game_id][client_2_start].units = 50;
	nodes[game_id][client_2_start].generating = true;
})


// ^^^^^^^^^^^^^^
// NEW MAPS ABOVE
// --------------

// Creates and sends updates to the two clients for a game, called after calculating movements
var send_updates = function(game_id) {
	// Create and populate client arrays with empty updates
	var client_1_updates = [];
	var client_2_updates = [];
	for(var i = 0; i < nodes[game_id].length; i++) {
		client_1_updates.push(new update(-1, -1, false));
		client_2_updates.push(new update(-1, -1, false));
	}
	
	// Check each node to see if an update should be non empty
	for(var i = 0; i < nodes[game_id].length; i++) {
		// If the node is player owned create an update
		// If owned by client 1
		if (nodes[game_id][i].owner == client_1) {
			client_1_updates[i].owner = player;
			client_1_updates[i].units = nodes[game_id][i].units;
			client_1_updates[i].visible = true;
			// Create updates for all adjacent nodes to the player node
			for(var j = 0; j < nodes[game_id][i].adjacent.length; j++) {
				// Set the appropriate owner for client 1
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
		// If owned by client 2
		else if (nodes[game_id][i].owner == client_2) {
			client_2_updates[i].owner = player;
			client_2_updates[i].units = nodes[game_id][i].units;
			client_2_updates[i].visible = true;
			// Create updates for all adjacent nodes to the player node
			for(var j = 0; j < nodes[game_id][i].adjacent.length; j++) {
				// Set the appropriate owner for client 2
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
	
	// Send the updates to the clients
	io.sockets.socket(client_1_socket_id[game_id]).emit('updates', client_1_updates);
	io.sockets.socket(client_2_socket_id[game_id]).emit('updates', client_2_updates);
}

// Generates and sends results at the end of the game, resets game variables
var send_results = function(game_id, client_1_holds, client_2_holds) {
	// Reset game variables
	num_connected_clients[game_id] = 0;
	movements_recieved[game_id] = 0;
	game_state[game_id] = 2;
	
	// Create final updates to reveal the entire map for both players
	var player_1_final_update = [];
	var player_2_final_update = [];
	// Go through all the nodes
	for(var i = 0; i < nodes[game_id].length; i++) {
		// Set the appropriate owner for each client
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
	
	// Send winner or lower message based on who no longer holds and nodes
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

// Sends visible animations to each client
var send_animations = function(game_id) {
	// Check for illegal moves
	for(var i = 0; i < client_1_movements[game_id].length; i++){
		// Check that the owner of the node is the user who sent the movement
		if(nodes[game_id][client_1_movements[game_id][i].source].owner != client_1) {
			client_1_movements[game_id][i].units = 0;
		}
		// Check that only the number of units on the node are being sent at maximum
		if(nodes[game_id][client_1_movements[game_id][i].source].units < client_1_movements[game_id][i].units) {
			client_1_movements[game_id][i].units = nodes[game_id][client_1_movements[game_id][i].source].units;
		}
		// Check that only 1 movement is originating from each node
		for (var j = 0; j < i; j++) {
			if (client_1_movements[game_id][j].units != 0 && client_1_movements[game_id][j].source == client_1_movements[game_id][i].source) {
				client_1_movements[game_id][j].units = 0;
			}
		}
		// Check that the destination is an adjacent node
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
		// Check that the owner of the node is the user who sent the movement
		if(nodes[game_id][client_2_movements[game_id][i].source].owner != client_2) {
			client_2_movements[game_id][i].units = 0;
		}
		// Check that only the number of units on the node are being sent at maximum
		if(nodes[game_id][client_2_movements[game_id][i].source].units < client_2_movements[game_id][i].units) {
			client_2_movements[game_id][i].units = nodes[game_id][client_2_movements[game_id][i].source].units;
		}
		// Check that only 1 movement is originating from each node
		for (var j = 0; j < i; j++) {
			if (client_2_movements[game_id][j].units != 0 && client_2_movements[game_id][j].source == client_2_movements[game_id][i].source) {
				client_2_movements[game_id][j].units = 0;
			}
		}
		// Check that the destination is an adjacent node
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
	
	var client_1_animations = [];
	var client_2_animations = [];
	
	for(var i = 0; i < client_1_movements[game_id].length; i++){
		var visible_to_client_1 = false;
		var visible_to_client_2 = false;
		// Check to see if any units are actually being sent
		if(client_1_movements[game_id][i].units != 0) {
			// All valid client 1 movements visible to client 1
			visible_to_client_1 = true;
			// Check to see if visible to client 2 because of a movement
			for(var j = 0; j < client_2_movements[game_id].length; j++){
				if(client_2_movements[game_id][j].destination == client_1_movements[game_id][i].destination) {
					visible_to_client_2 = true;
					break;
				}
			}
			// Check to see if visible to client 2 because of fog of war
			if(!visible_to_client_2) {
				for(var j = 0; j < nodes[game_id].length; j++) {
					if(nodes[game_id][j].owner == client_2) {
						if(client_1_movements[game_id][i].destination == j) {
							visible_to_client_2 = true;
							break;
						}
						else {
							for(var k = 0; k < nodes[game_id][j].adjacent.length; k++) {
								if(client_1_movements[game_id][i].destination == nodes[game_id][j].adjacent[k]) {
									visible_to_client_2 = true;
									break;
								}
							}
						}
					}
				}
			}
		}
		if(visible_to_client_1) {
			client_1_animations.push(client_1_movements[game_id][i]);
		}
		if(visible_to_client_2) {
			client_2_animations.push(client_1_movements[game_id][i]);
		}
	}
	for(var i = 0; i < client_2_movements[game_id].length; i++){
		var visible_to_client_1 = false;
		var visible_to_client_2 = false;
		// Check to see if any units are actually being sent
		if(client_2_movements[game_id][i].units != 0) {
			// All valid client 1 movements visible to client 2
			visible_to_client_2 = true;
			// Check to see if visible to client 1 because of a movement
			for(var j = 0; j < client_1_movements[game_id].length; j++){
				if(client_1_movements[game_id][j].destination == client_2_movements[game_id][i].destination) {
					visible_to_client_1 = true;
					break;
				}
			}
			// Check to see if visible to client 1 because of fog of war
			if(!visible_to_client_1) {
				for(var j = 0; j < nodes[game_id].length; j++) {
					if(nodes[game_id][j].owner == client_1) {
						if(client_2_movements[game_id][i].destination == j) {
							visible_to_client_1 = true;
							break;
						}
						else {
							for(var k = 0; k < nodes[game_id][j].adjacent.length; k++) {
								if(client_2_movements[game_id][i].destination == nodes[game_id][j].adjacent[k]) {
									visible_to_client_1 = true;
									break;
								}
							}
						}
					}
				}
			}
		}
		if(visible_to_client_1) {
			client_1_animations.push(client_2_movements[game_id][i]);
		}
		if(visible_to_client_2) {
			client_2_animations.push(client_2_movements[game_id][i]);
		}
	}
	
	// Send the updates to the clients
	io.sockets.socket(client_1_socket_id[game_id]).emit('animations', client_1_animations);
	io.sockets.socket(client_2_socket_id[game_id]).emit('animations', client_2_animations);
}

// Update all the nodes with both players movements, and then generate new units
var calculate_movements = function(game_id){
	// Subtract all leaving units from their source node (they have left the node)
	for(var i = 0; i < client_1_movements[game_id].length; i++){
		nodes[game_id][client_1_movements[game_id][i].source].units -= client_1_movements[game_id][i].units;
	}
	for(var i = 0; i < client_2_movements[game_id].length; i++){
		nodes[game_id][client_2_movements[game_id][i].source].units -= client_2_movements[game_id][i].units;
	}
	
	// Calculate the results of movements for each node
	for(var i = 0; i < nodes[game_id].length; i++){
		// Totals for incoming for each node, from each client
		var client_1_incoming = 0;
		var client_2_incoming = 0;
		// Calclutate client 1 total for this node
		for(var j = 0; j < client_1_movements[game_id].length; j++) {
			if(client_1_movements[game_id][j].destination == i) {
				client_1_incoming += client_1_movements[game_id][j].units;
			}
		}
		// Calculate client 2 total for this node
		for(var j = 0; j < client_2_movements[game_id].length; j++) {
			if(client_2_movements[game_id][j].destination == i) {
				client_2_incoming += client_2_movements[game_id][j].units;
			}
		}
		// If client 1 sent more units
		if(client_1_incoming >= client_2_incoming) {
			// Client 1 loses units equal to client 2's fleet
			client_1_incoming -= client_2_incoming;
			
			// If the destination node is owned by client 1, just add remaining fleet to nodes units
			if (nodes[game_id][i].owner == client_1) {
				nodes[game_id][i].units += client_1_incoming;
			}
			// If its not client 1 owned, and the fleet is larger than the nodes units
			// 		client 1 captures the planet
			else if (client_1_incoming > nodes[game_id][i].units) {
				nodes[game_id][i].units = client_1_incoming - nodes[game_id][i].units;
				nodes[game_id][i].owner = client_1;
				nodes[game_id][i].generating = false;
			}
			// If its not client 1 owned, and the fleet is smaller than the nodes units
			// 		client 1 weakens the planet
			else {
				nodes[game_id][i].units = nodes[game_id][i].units - client_1_incoming;
			}	
		}
		// If client 2 sent more units
		else {
			// Client 2 loses units equal to client 1's fleet
			client_2_incoming -= client_1_incoming;
			
			// If the destination node is owned by client 2, just add remaining fleet to nodes units
			if (nodes[game_id][i].owner == client_2) {
				nodes[game_id][i].units += client_2_incoming;
			}
			// If its not client 2 owned, and the fleet is larger than the nodes units
			// 		client 2 captures the planet
			else if (client_2_incoming > nodes[game_id][i].units) {
				nodes[game_id][i].units = client_2_incoming - nodes[game_id][i].units;
				nodes[game_id][i].owner = client_2;
				nodes[game_id][i].generating = false;
			}
			// If its not client 2 owned, and the fleet is smaller than the nodes units
			// 		client 2 weakens the planet
			else {
				nodes[game_id][i].units = nodes[game_id][i].units - client_2_incoming;
			}	
		}
	}
	
	// Generate units on each node
	for(var i = 0; i < nodes[game_id].length; i++){
		nodes[game_id][i].generate();
	}
	
	// Count each players holdings
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
	// If either player has 0 nodes the game is over and send the results
	if (client_1_holds == 0 || client_2_holds == 0) {
		send_results(game_id, client_1_holds, client_2_holds);
	}
	// If neither player is out yet, just send the updates
	else {
		send_updates(game_id);
	}
}

var send_movements = function(message) {
	// Get game and client id from client data store (sever side)
	var game_id = this.store.data.game_id;
	var client_id = this.store.data.client_id;
	
	// If both players are done animating calculate movements, else do nothing
	if(movements_recieved[game_id] == 0) {
		movements_recieved[game_id]++;
	}
	else {
	    movements_recieved[game_id]--;
		calculate_movements(game_id);
	}
}

// Handles movement messages from the clients
var movement_handler = function(movements) {
	// Get game and client id from client data store (sever side)
	var game_id = this.store.data.game_id;
	var client_id = this.store.data.client_id;
	
	// Save the movements for use in calulation based on the client id
	if(client_id == client_1) {
		client_1_movements[game_id] = movements;
	}
	else if (client_id == client_2) {
		client_2_movements[game_id] = movements;
	}
	
	// If both players movements are recieved send animations, else do nothing
	if(movements_recieved[game_id] == 0) {
		movements_recieved[game_id]++;
	}
	else {
	    movements_recieved[game_id]--;
		send_animations(game_id);
	}
}

// Handles disconnection from the clients in various game states
var disconnect_handler = function() {
	// Get game and client id from client data store (sever side)
	var game_id = this.store.data.game_id;
	var client_id = this.store.data.client_id;
	
	// If a client disconnects pre game nothing really happens
	if(game_state[game_id] == 0) {
        console.log('Client ' + client_id + ' disconnected from pre-game ' + game_id);
		num_connected_clients[game_id] = 0;
		movements_recieved[game_id] = 0;
		nodes[game_id] = [];
	}
	// If a client disconnects mid game a win message is generated for the other player
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
	// After a game the following two states are used to track if both players have left yet
	else if (game_state[game_id] == 2) {
        console.log('Client ' + client_id + ' disconnected from finished game ' + game_id);
		game_state[game_id] = 3;
	}
	// Game is ready for new players after state 3 disconnect
	else if (game_state[game_id] == 3) {
        console.log('Client ' + client_id + ' disconnected from finished game ' + game_id);
        console.log('Game ' + game_id + ' open for new clients');
		game_state[game_id] = 0;
	}
}

// Hanndles connections of clients to match them with another player
var connection_handler = function(client) {
	// First try to find an game to join
	var game_id = -1;
	// Check for a game with a player wating
	for(var i = 0; i < num_connected_clients.length; i++) {
		if(num_connected_clients[i] == 1 && game_state[i] == 0) {
			game_id = i;
			break;
		}
	}
	// Check for a game with no players if no games with player waitng available
	if(game_id == -1) {
		for(var i = 0; i < num_connected_clients.length; i++) {
			if(num_connected_clients[i] == 0 && game_state[i] == 0) {
				game_id = i;
				break;
			}
		}
	}
	// As a last resort create a new game and initialize its variables
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
	
	// If they are the first player to connect set their listeners, id's and wait
	if(num_connected_clients[game_id] == 0) {
		console.log("New client joined game " + game_id + " as client " + client_1);
		client.set("game_id", game_id);
		client.set("client_id", client_1);
		client_1_socket_id[game_id] = client.id;
		num_connected_clients[game_id]++;
		client.on('movements', movement_handler);
		client.on('animation_done', send_movements);
		client.on('disconnect', disconnect_handler);
	}
	// If they are the second player to connect set their listeners, id's and start the game
	else if (num_connected_clients[game_id] == 1) {
		console.log("New client joined game " + game_id + " as client " + client_2);	
		client.set("game_id", game_id);
		client.set("client_id", client_2);
		client_2_socket_id[game_id] = client.id;
		game_setup(game_id);
		num_connected_clients[game_id]++
		client.on('movements', movement_handler);
		client.on('animation_done', send_movements);
		client.on('disconnect', disconnect_handler);
		game_state[game_id] = 1;
	}
}

// Set the listener for connections
io.sockets.on('connection', connection_handler);
