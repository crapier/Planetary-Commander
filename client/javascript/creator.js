// ----------------
// GLOBAL VARIABLES
// ----------------

// easelejs stage
var stage;
// textarea to display code
var code_box;

// List of current nodes
var nodes = [];
// List of current lines
var lines = [];
// Id of selected node or -1 if none selected
var selected = -1;

// Wether or not starts have to be inserted or can just be added normally
//		This is because starts have to be at the begining of the nodes list
var insterting_starts = false;
// Number of starts used for code generation to know how many to randomly pick
var number_starts = 0;

// Manifest for preloading
var manifest;
// Preloader
var preload;

// ---------
// CONSTANTS
// ---------
var small = 0;
var medium = 1;
var large = 2;

var none = 0;
var player = 1;
var opponent = 2;

var node_font = "20px Arial";
var node_font_color = "#FFFFFF";

var line_color = "#FFFFFF";

// ------
// IMAGES
// ------

//These are all preloaded before the game appears on the stage
var background;
var small_target_source;
var medium_target_source;
var large_target_source;
var small_target_dest;
var medium_target_dest;
var large_target_dest;
var visible_player_small_node;
var visible_player_medium_node;
var visible_player_large_node;
var visible_opponent_small_node;
var visible_opponent_medium_node;
var visible_opponent_large_node;
var visible_unowned_small_node;
var visible_unowned_medium_node;
var visible_unowned_large_node;
var hidden_unknown_small_node;
var hidden_unknown_medium_node;
var hidden_unknown_large_node;
var hidden_opponent_small_node;
var hidden_opponent_medium_node;
var hidden_opponent_large_node;
var generate_button_img;
var generate_button_hover_img;
var clear_button_img;
var clear_button_hover_img;

// The actual buttons to use for the above button images, so that the image can be switched
//		for different states (hover or normal)
var generate_button;
var clear_button;

// --------
// MESSAGES (easlejs Text)
// --------

var loading_message = new createjs.Text("Loading - 0%", "50px Arial", "#006cff");
loading_message.x = 500;
loading_message.regX = loading_message.getMeasuredWidth()/2;
loading_message.y = 350;
loading_message.regY = loading_message.getMeasuredHeight()/2;

// Handles resizing the stage if its to big for the window
var handle_resize = function(event) {
	if(window.innerWidth < canvas.width && window.innerHeight < canvas.height) {
		var width_scale = window.innerWidth/canvas.width;
		var height_scale = window.innerHeight/canvas.height;
		if(width_scale < height_scale) {
			stage.scaleX = width_scale;
			stage.scaleY = width_scale;
		}
		else {
			stage.scaleX = height_scale;
			stage.scaleY = height_scale;
		}
	}
	else if(window.innerWidth < canvas.width) {
		stage.scaleX = window.innerWidth/canvas.width;
		stage.scaleY = window.innerWidth/canvas.width;
	}
	else if(window.innerHeight < canvas.height) {
		stage.scaleX = window.innerHeight/canvas.height;
		stage.scaleY = window.innerHeight/canvas.height;
	}
	else {
		stage.scaleX = 1;
		stage.scaleY = 1;
	}	
	stage.update();
}

var initialize = function() {
	// Get a easlejs reference to the canvas
	stage = new createjs.Stage("creator");
	stage.enableMouseOver();
	
	// Disable right click context menu
	canvas = document.getElementById("creator");
	canvas.oncontextmenu = function() {
		return false;  
	} 
	
	handle_resize();
	window.onresize = handle_resize;
	
	// Show loading message while preloading
	var black_background = new createjs.Shape();
	black_background.graphics.beginFill("#000000").drawRect(0, 0, 1000, 700);
	stage.addChild(black_background);
	stage.addChild(loading_message);
	stage.update();
	
	// Manifest to load
	manifest = [
		//Images
		{src:"/client/img/background1.png", id:"bg"},
		{src:"/client/img/small_target_source.png", id:"sts"},
		{src:"/client/img/medium_target_source.png", id:"mts"},
		{src:"/client/img/large_target_source.png", id:"lts"},
		{src:"/client/img/small_target_dest.png", id:"std"},
		{src:"/client/img/medium_target_dest.png", id:"mtd"},
		{src:"/client/img/large_target_dest.png", id:"ltd"},
		{src:"/client/img/visible_small_player.png", id:"vsp"},
		{src:"/client/img/visible_medium_player.png", id:"vmp"},
		{src:"/client/img/visible_large_player.png", id:"vlp"},
		{src:"/client/img/visible_small_opponent.png", id:"vso"},
		{src:"/client/img/visible_medium_opponent.png", id:"vmo"},
		{src:"/client/img/visible_large_opponent.png", id:"vlo"},
		{src:"/client/img/visible_small_unowned.png", id:"vsu"},
		{src:"/client/img/visible_medium_unowned.png", id:"vmu"},
		{src:"/client/img/visible_large_unowned.png", id:"vlu"},
		{src:"/client/img/hidden_small_unknown.png", id:"hsu"},
		{src:"/client/img/hidden_medium_unknown.png", id:"hmu"},
		{src:"/client/img/hidden_large_unknown.png", id:"hlu"},
		{src:"/client/img/hidden_small_opponent.png", id:"hso"},
		{src:"/client/img/hidden_medium_opponent.png", id:"hmo"},
		{src:"/client/img/hidden_large_opponent.png", id:"hlo"},
		{src:"/client/img/generate_button.png", id:"gb"},
		{src:"/client/img/generate_button_hover.png", id:"gbh"},
		{src:"/client/img/clear_button.png", id:"cb"},
		{src:"/client/img/clear_button_hover.png", id:"cbh"}
	]
	
	// Preloader
	preload = new createjs.LoadQueue(true);
	preload.addEventListener("complete", complete_handler);
	preload.addEventListener("progress", progress_handler);
	preload.loadManifest(manifest);
}

var progress_handler = function(event) {
	loading_message.text = "Loading - " + Math.ceil(event.progress*100) + "%";
	loading_message.regX = loading_message.getMeasuredWidth()/2;
	loading_message.regY = loading_message.getMeasuredHeight()/2; 
	stage.update();
}

var complete_handler = function(event) {
	// Assigned loaded images
	background = new createjs.Bitmap(preload.getResult("bg"));
	small_target_source = new createjs.Bitmap(preload.getResult("sts"));
	medium_target_source = new createjs.Bitmap(preload.getResult("mts"));
	large_target_source = new createjs.Bitmap(preload.getResult("lts"));
	small_target_dest = new createjs.Bitmap(preload.getResult("std"));
	medium_target_dest = new createjs.Bitmap(preload.getResult("mtd"));
	large_target_dest = new createjs.Bitmap(preload.getResult("ltd"));
	visible_player_small_node = new createjs.Bitmap(preload.getResult("vsp"));
	visible_player_medium_node = new createjs.Bitmap(preload.getResult("vmp"));
	visible_player_large_node = new createjs.Bitmap(preload.getResult("vlp"));
	visible_opponent_small_node = new createjs.Bitmap(preload.getResult("vso"));
	visible_opponent_medium_node = new createjs.Bitmap(preload.getResult("vmo"));
	visible_opponent_large_node = new createjs.Bitmap(preload.getResult("vlo"));
	visible_unowned_small_node = new createjs.Bitmap(preload.getResult("vsu"));
	visible_unowned_medium_node = new createjs.Bitmap(preload.getResult("vmu"));
	visible_unowned_large_node = new createjs.Bitmap(preload.getResult("vlu"));
	hidden_unknown_small_node = new createjs.Bitmap(preload.getResult("hsu"));
	hidden_unknown_medium_node = new createjs.Bitmap(preload.getResult("hmu"));
	hidden_unknown_large_node = new createjs.Bitmap(preload.getResult("hlu"));
	hidden_opponent_small_node = new createjs.Bitmap(preload.getResult("hso"));
	hidden_opponent_medium_node = new createjs.Bitmap(preload.getResult("hmo"));
	hidden_opponent_large_node = new createjs.Bitmap(preload.getResult("hlo"));
	generate_button_img = new createjs.Bitmap(preload.getResult("gb"));
	generate_button_hover_img = new createjs.Bitmap(preload.getResult("gbh"));
	clear_button_img = new createjs.Bitmap(preload.getResult("cb"));
	clear_button_hover_img = new createjs.Bitmap(preload.getResult("cbh"));
	
	// Clear the screen
	stage.removeAllChildren();
	stage.update();
	
	// Show the start menu
	start_creator();
}

// Starts up the creator
var start_creator = function() {
	// Assign and position the images for the buttons
	generate_button = generate_button_img.clone();
	generate_button.x = 890;
	generate_button.regX = generate_button.image.width/2;
	generate_button.y = 670;
	generate_button.regY = generate_button.image.height/2;
	
	clear_button = clear_button_img.clone();
	clear_button.x = 110;
	clear_button.regX = clear_button.image.width/2;
	clear_button.y = 670;
	clear_button.regY = clear_button.image.height/2;
	
	// Add the listeners for the buttons
	generate_button.addEventListener("mouseover", generate_button_listener);
	generate_button.addEventListener("click", generate_button_listener);
	generate_button.addEventListener("mouseout", generate_button_listener);
	
	clear_button.addEventListener("mouseover", clear_button_listener);
	clear_button.addEventListener("click", clear_button_listener);
	clear_button.addEventListener("mouseout", clear_button_listener);
	
	// Add the background and buttons to the stage
	stage.addChild(background);
	stage.addChild(generate_button);
	stage.addChild(clear_button);
	
	stage.update();
	
	// Add the listener for adding new nodes
	stage.addEventListener("click", add_node);
	// Get a reference for the code box from html to use for outputting code
	code_box = document.getElementById("code_output");
	
	// Assign a listener for keypresses
	document.onkeydown = key_listener;
}

// Addds a node to the screen at the postion of the mouse based on a prompt
var add_node = function(event) {
	// Prompt for the type of planet to add
	var size = prompt("Size of the planet", "start, large, medium, or small");
	
	// Add planet based on size entered
	if (size == "large") {
		// Mark that starts must now be inserted
		insterting_starts = true;
		// Add the node and update it
		nodes.push(new node(large, event.stageX/stage.scaleX, event.stageY/stage.scaleY, []));
		nodes[nodes.length-1].update({units:20, owner:none, visible:true});
		// Check to see which listener should be added for clicking
		if(selected == -1) {
			nodes[nodes.length-1].img.addEventListener("click", node_click_source);
		}
		else {
			nodes[nodes.length-1].img.addEventListener("click", adjacent_listener);
		}
		// Add other listeners
		nodes[nodes.length-1].img.addEventListener("mouseover", node_in);
		nodes[nodes.length-1].img.addEventListener("mouseout", node_out);
	}
	else if (size == "medium") {
		// Mark that starts must now be inserted
		insterting_starts = true;
		// Add the node and update it
		nodes.push(new node(medium, event.stageX/stage.scaleX, event.stageY/stage.scaleY, []));
		nodes[nodes.length-1].update({units:10, owner:none, visible:true});
		// Check to see which listener should be added for clicking
		if(selected == -1) {
			nodes[nodes.length-1].img.addEventListener("click", node_click_source);
		}
		else {
			nodes[nodes.length-1].img.addEventListener("click", adjacent_listener);
		}
		// Add other listeners
		nodes[nodes.length-1].img.addEventListener("mouseover", node_in);
		nodes[nodes.length-1].img.addEventListener("mouseout", node_out);
	}
	else if (size == "small") {
		// Mark that starts must now be inserted
		insterting_starts = true;
		// Add the node and update it
		nodes.push(new node(small, event.stageX/stage.scaleX, event.stageY/stage.scaleY, []));
		nodes[nodes.length-1].update({units:5, owner:none, visible:true});
		// Check to see which listener should be added for clicking
		if(selected == -1) {
			nodes[nodes.length-1].img.addEventListener("click", node_click_source);
		}
		else {
			nodes[nodes.length-1].img.addEventListener("click", adjacent_listener);
		}
		// Add other listeners
		nodes[nodes.length-1].img.addEventListener("mouseover", node_in);
		nodes[nodes.length-1].img.addEventListener("mouseout", node_out);
	}
	else if (size == "start") {
		// Check to see if the start needs to be inserted
		if(insterting_starts == false) {
			// Increment number of starts
			number_starts++;
			// Add the node and update it
			nodes.push(new node(large, event.stageX/stage.scaleX, event.stageY/stage.scaleY, []));
			nodes[nodes.length-1].update({units:50, owner:player, visible:true});
			// Check to see which listener should be added for clicking
			if(selected == -1) {
				nodes[nodes.length-1].img.addEventListener("click", node_click_source);
			}
			else {
				nodes[nodes.length-1].img.addEventListener("click", adjacent_listener);
			}
			// Add other listeners
			nodes[nodes.length-1].img.addEventListener("mouseover", node_in);
			nodes[nodes.length-1].img.addEventListener("mouseout", node_out);
		}
		// If it needs to be inserted then add after last start and then update all the node ids
		else {
			// Increment number of starts
			number_starts++;
			// Add the node and update it
			nodes.splice(number_starts-1, 0, new node(large, event.stageX/stage.scaleX, event.stageY/stage.scaleY, []));
			nodes[number_starts-1].update({units:50, owner:player, visible:true});
			// Check to see which listener should be added for clicking
			if(selected == -1) {
				nodes[number_starts-1].img.addEventListener("click", node_click_source);
			}
			else {
				nodes[number_starts-1].img.addEventListener("click", adjacent_listener);
			}
			// Add other listeners
			nodes[number_starts-1].img.addEventListener("mouseover", node_in);
			nodes[number_starts-1].img.addEventListener("mouseout", node_out);
			
			// Update the node id stored in each nodes image for clicking identification
			for(var i = number_starts-1; i < nodes.length; i++) {
				nodes[i].img.node_id = i;
			}
			
			// Update adjacent list node ids
			for(var i = 0; i < nodes.length; i++) {
				for(var j = 0; j < nodes[i].adjacent.length; j++) {
					if(nodes[i].adjacent[j] >= number_starts-1) {
						nodes[i].adjacent[j]++;
					}
				}
			}
			// Update the id stored with the lines for source and destination
			for(var i = 0; i < lines.length; i++) {
				if(lines[i].connected_nodes[0] >= number_starts-1) {
					lines[i].connected_nodes[0]++;
				}
				if(lines[i].connected_nodes[1] >= number_starts-1) {
					lines[i].connected_nodes[1]++;
				}
			}
		}
	}
	
	stage.update();
}

// Perfor either a selection for left mouse click
// 		or a removal of adjacenties for right mouse click
var node_click_source = function(event) {
	// Get which button was pressed
	var button = event.nativeEvent.button;
	
	// Left mouse click select node
	if(button == 0) {
		// Remove selection listeners
		for(var i = 0; i < nodes.length; i++) {
			nodes[i].img.removeAllEventListeners();
		}
		selected = event.currentTarget.node_id;
		nodes[selected].show_target_source();
		stage.update();
		
		// Add listeners for making and adjacent
		nodes[selected].img.addEventListener("click", adjacent_listener);
		for(var i = 0; i < nodes.length; i++){
			if (i != selected) {
				nodes[i].img.addEventListener("click", adjacent_listener);
				nodes[i].img.addEventListener("mouseover", node_in);
				nodes[i].img.addEventListener("mouseout", node_out);
			}
		}
	}
	// Right mouse click, remove all adjacent
	else if(button == 2) {
		var clear_adjacent = event.currentTarget.node_id;
		delete_all_adjacent(clear_adjacent);
		stage.update();
	}
	// Prevent propagation to the stage click listener
	event.stopPropagation();
}

// Removes all the adjacent nodes from a node
var delete_all_adjacent = function(node_id) {
	// Remove the from adjacent nodes adjacency list
	for(var i = 0; i < nodes[node_id].adjacent.length; i++) {
		var index = nodes[nodes[node_id].adjacent[i]].adjacent.indexOf(node_id)
		nodes[nodes[node_id].adjacent[i]].adjacent.splice(index, 1);
	}
	// Remove the lines
	for(var i = 0; i < lines.length; i++) {
		if(lines[i].connected_nodes[0] == node_id || lines[i].connected_nodes[1] == node_id) {
			stage.removeChild(lines[i]);
			lines.splice(i, 1)
			i--;
		}
	}
	// Clear the adjacency list
	nodes[node_id].adjacent = [];
}

// Shows the target on mouse hover
var node_in = function(event) {
	stage.removeEventListener("click", add_node);
	var hover = event.currentTarget.node_id;
	nodes[hover].show_target_source();
	stage.update();
}

// Hides the hover when the mouse is no longer hovering
var node_out = function(event) {
	if(selected == -1) {
		stage.addEventListener("click", add_node);
	}
	var hover = event.currentTarget.node_id;
	nodes[hover].hide_target_source();
	stage.update();
}

// Adds to selections adjacentcy list and updates adjacent selection as well
var adjacent_listener = function(event) {
	var adjacent = event.currentTarget.node_id;
	// If its not the selected node
	if(adjacent != selected) {
		// Remove the listeners
		for(var i = 0; i < nodes.length; i++) {
			nodes[i].img.removeAllEventListeners();
			nodes[i].img.addEventListener("click", node_click_source);
			nodes[i].img.addEventListener("mouseover", node_in);
			nodes[i].img.addEventListener("mouseout", node_out);
		}
		// Check if already adjacent
		var already_adjacent = false;
		for(var i = 0; i < nodes[selected].adjacent.length; i++) {
			if(nodes[selected].adjacent[i] == adjacent) {
				already_adjacent = true;
				break;
			}
		}
		
		// Prevent adding multiple times
		if(!already_adjacent) {
			nodes[selected].adjacent.push(adjacent);
			nodes[adjacent].adjacent.push(selected);
			
			lines.push(new createjs.Shape());
			lines[lines.length-1].graphics.setStrokeStyle(1).beginStroke(line_color).moveTo(nodes[selected].x, nodes[selected].y).lineTo(nodes[adjacent].x, nodes[adjacent].y).endStroke();
			lines[lines.length-1].connected_nodes = [selected, adjacent];
			stage.addChildAt(lines[lines.length-1], 1);
		}
		// Remove if already present
		else {
			// remove from adjacency list
			nodes[selected].adjacent.splice(nodes[selected].adjacent.indexOf(adjacent), 1);
			nodes[adjacent].adjacent.splice(nodes[adjacent].adjacent.indexOf(selected), 1);
			
			// remove the line
			for(var i = 0; i < lines.length; i++) {
				if(lines[i].connected_nodes[0] == selected && lines[i].connected_nodes[1] == adjacent) {
					stage.removeChild(lines[i]);
					lines.splice(i, 1);
					break;
				}
				else if(lines[i].connected_nodes[0] == adjacent && lines[i].connected_nodes[1] == selected) {
					stage.removeChild(lines[i]);
					lines.splice(i, 1);
					break;
				}
			}
		}
		
		nodes[selected].hide_target_source();
		selected = -1;
		// Prevent propagation to the stage click listener
		event.stopPropagation();
	}
	// If its the selected node deselect it
	else {
		nodes[selected].hide_target_source();
		selected = -1;
		// Add back approriate listeners
		for(var i = 0; i < nodes.length; i++) {
			nodes[i].img.removeAllEventListeners();
			nodes[i].img.addEventListener("click", node_click_source);
			nodes[i].img.addEventListener("mouseover", node_in);
			nodes[i].img.addEventListener("mouseout", node_out);
		}
		// Prevent propagation to the stage click listener
		event.stopPropagation();
	}
	stage.update();
}

// Calls the generate code function on click and changes images for hover
var generate_button_listener = function(event) {
	// Call generate code on click
	if(event.type == "click") {
		generate_code();
		event.stopPropagation();
	}
	// Change to hover image on mouseover
	else if(event.type == "mouseover") {
		generate_button.image = generate_button_hover_img.image;
		stage.update();
	}
	// Change back to default on mouseout
	else if(event.type == "mouseout") {
		generate_button.image = generate_button_img.image;
		stage.update();
	}
}

// Clears the nodes to start over and changes images for hover
var clear_button_listener = function(event) {
	// Clears the nodes on click
	if(event.type == "click") {
		stage.removeAllChildren();
		nodes = [];
		lines = [];
		selected = -1;

		insterting_starts = false;
		number_starts = 0;
		
		stage.addChild(background);
		stage.addChild(generate_button);
		stage.addChild(clear_button);
		
		stage.update();
		event.stopPropagation();
	}
	// Change to hover image on mouseover
	else if(event.type == "mouseover") {
		clear_button.image = clear_button_hover_img.image;
		stage.update();
	}
	// Change back to default on mouseout
	else if(event.type == "mouseout") {
		clear_button.image = clear_button_img.image;
		stage.update();
	}
}

// Generates client and server javascript to print to the text area
var generate_code = function(){
	if(number_starts < 2){
		alert("There must be at least two starts");
		return false;
	}
	// Client code
	var client_side = "create_nodes.push (function() {\n";
	// Server code
	var server_side = "maps.push(function(game_id) {\n";
	
	for(var i = 0; i < nodes.length; i++) {
		client_side = client_side + "\tnodes.push(new node("
		server_side = server_side + "\tnodes[game_id].push(new node(" + nodes[i].units + ", ";
		if(nodes[i].size == large){
			client_side = client_side + "large, ";
			server_side = server_side + "large, ";
		}
		else if (nodes[i].size == medium) {
			client_side = client_side + "medium, ";
			server_side = server_side + "medium, ";
		}
		else if (nodes[i].size == small) {
			client_side = client_side + "small, ";
			server_side = server_side + "small, ";
		}
		
		client_side = client_side + nodes[i].x + ", " + nodes[i].y + ", [";
		server_side = server_side + "[";
		
		for(var j = 0; j < nodes[i].adjacent.length; j++) {
			if(j != 0){
				client_side = client_side + ", " + nodes[i].adjacent[j];
				server_side = server_side + ", " + nodes[i].adjacent[j];
			}
			else {
				client_side = client_side + nodes[i].adjacent[j];
				server_side = server_side + nodes[i].adjacent[j];
			}
		}
		client_side = client_side + "]));\n";
		server_side = server_side + "]));\n";
	}
	client_side = client_side + "})";
	server_side = server_side + "\n\tvar client_1_start = Math.floor((Math.random()*" + number_starts + "));"
	server_side = server_side + "\n\tclient_2_start = Math.floor((Math.random()*" + number_starts + "));"
	server_side = server_side + "\n\twhile(client_1_start == client_2_start) {"
	server_side = server_side + "\n\t\tvar client_2_start = Math.floor((Math.random()*" + number_starts + "));"
	server_side = server_side + "\n\t}"
	server_side = server_side + "\n\t"
	server_side = server_side + "\n\tnodes[game_id][client_1_start].owner = client_1;"
	server_side = server_side + "\n\tnodes[game_id][client_1_start].units = 50;"
	server_side = server_side + "\n\tnodes[game_id][client_1_start].generating = true;"
	server_side = server_side + "\n\tnodes[game_id][client_2_start].owner = client_2;"
	server_side = server_side + "\n\tnodes[game_id][client_2_start].units = 50;"
	server_side = server_side + "\n\tnodes[game_id][client_2_start].generating = true;\n})";
	
	// Put the code in the text area
	code_box.value = "Client Side Code:\n" + client_side + "\n\nServer Side Code:\n" +server_side;
}

// Handles key presses
var key_listener = function(event) {
	var key_pressed = event.which;
	
	// Dont do anything if nothing is selected
	if (selected != -1) {
		// Move the selected node around
		if(key_pressed == 37 || key_pressed == 38 || key_pressed == 39 || key_pressed == 40) {
			//up arrow key, move selection up
			if(key_pressed == 38) {
				nodes[selected].y = nodes[selected].y - 5;
				nodes[selected].img.y = nodes[selected].y;
				nodes[selected].text.y = nodes[selected].y;
				nodes[selected].target_source.y = nodes[selected].y;
			}
			//down arrow key, move selection down
			else if(key_pressed == 40) {
				nodes[selected].y = nodes[selected].y + 5;
				nodes[selected].img.y = nodes[selected].y;
				nodes[selected].text.y = nodes[selected].y;
				nodes[selected].target_source.y = nodes[selected].y;
			}
			//left arrow key, move selection left
			else if(key_pressed == 37) {
				nodes[selected].x = nodes[selected].x - 5;
				nodes[selected].img.x = nodes[selected].x;
				nodes[selected].text.x = nodes[selected].x;
				nodes[selected].target_source.x = nodes[selected].x;
			}
			//right arrow key, move selection right
			else if(key_pressed == 39) {
				nodes[selected].x = nodes[selected].x + 5;
				nodes[selected].img.x = nodes[selected].x;
				nodes[selected].text.x = nodes[selected].x;
				nodes[selected].target_source.x = nodes[selected].x;
			}
			// redraw the lines
			for(var i = 0; i < lines.length; i++) {
				if(lines[i].connected_nodes[0] == selected || lines[i].connected_nodes[1] == selected) {
					lines[i].graphics.clear();
					lines[i].graphics.setStrokeStyle(1).beginStroke(line_color).moveTo(nodes[lines[i].connected_nodes[0]].x, nodes[lines[i].connected_nodes[0]].y).lineTo(nodes[lines[i].connected_nodes[1]].x, nodes[lines[i].connected_nodes[1]].y).endStroke();
				}
			}
		}
		//d key, delete a node
		else if(key_pressed == 68) {
			// Decrement number of starts if it is one
			if(nodes[selected].owner == player) {
				number_starts--;
			}
			
			// Remove from adjacency lists of adjacent
			delete_all_adjacent(selected);
			
			// Remove from the stage
			stage.removeChild(nodes[selected].img);
			stage.removeChild(nodes[selected].text);
			stage.removeChild(nodes[selected].target_source);
			// Remove from the node list
			nodes.splice(selected, 1);
			
			// Update node ids for nodes and adjacency lists
			for(var i = 0; i < nodes.length; i++) {
				nodes[i].img.node_id = i;
				for(var j = 0; j < nodes[i].adjacent.length; j++){
					if(nodes[i].adjacent[j] > selected) {
						nodes[i].adjacent[j]--;
					}
				}
			}
			
			// Update node ids for lines
			for(var i = 0; i < lines.length; i++) {
				if(lines[i].connected_nodes[0] > selected) {
					lines[i].connected_nodes[0]--;
				}
				if(lines[i].connected_nodes[1] > selected) {
					lines[i].connected_nodes[1]--;
				}
			}
			
			// Set no selection
			selected = -1;
			
			// Add back listeners for selection
			for(var i = 0; i < nodes.length; i++) {
				nodes[i].img.removeAllEventListeners();
				nodes[i].img.addEventListener("click", node_click_source);
				nodes[i].img.addEventListener("mouseover", node_in);
				nodes[i].img.addEventListener("mouseout", node_out);
			}
		}
		stage.update();
	}
}