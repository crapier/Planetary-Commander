// ----------------
// GLOBAL VARIABLES
// ----------------

// easeljs stage
var stage;
// HTML reference to the stage
var canvas;
// Array of the current nodes on the screen
var nodes = [];
// Array of the current lines on the screen, lines are drawn behind nodes
var lines = [];
// Array of current movements to send to the server on end of turn
var movements = [];
// Array of current units that represent movements on the screen
var units_list = [];
// Current socket.io socket reference
var socket;
// ID of the currently selected node if there is one, -1 if no node is selected
var selected;
// If a node is selected this is the visible reprentation of how many units will be sent
// 		if a destination node is selected, trackes the mouse around selected node
var selection_units;
// The current number of units to send from the selected node, starts at max currently
var units_to_send;
// The time in milliseconds of the current animation if animating
var animation_time;
// List of units to be animating
var animation_list = [];
// Time interval for animations
var animation_interval;

// Manifest for preloading
var manifest;
// Preloader
var preload;

// ------
// IMAGES
// ------

//These are all preloaded before the game appears on the stage
var start_menu_background;
var game_background;

var play_button_img;
var play_button_hover_img;
var instructions_button_img;
var instructions_button_hover_img;
var finalize_button_img;
var finalize_button_hover_img;
var bgm_mute_img;
var bgm_play_img;

// The actual buttons to use for the above button images, so that the image can be switched
//		for different states (hover or normal)
var play_button;
var instruction_button;
var finalize_button;
var bgm_button;

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

var units_img;
var units_opponent_img;

// ------
// SOUNDS
// ------

// To be used as the sound instance to play the bgm
var bgm_loop;

// ---------
// CONSTANTS
// ---------

var small = 0;
var medium = 1;
var large = 2;

var small_units_distance = 45;
var medium_units_distance = 50;
var large_units_distance = 70;

var none = 0;
var player = 1;
var opponent = 2;

var node_font = "20px Arial";
var node_font_color = "#FFFFFF";

var units_font = "20px Arial";
var units_font_color = "#FFFFFF";

var timer_font = "50px Arial";
var timer_font_color = "#FFFFFF";
var timer_x = 10;
var timer_y = 640
var time_limit = 180;

var line_color = "#FFFFFF";

// --------
// MESSAGES (easlejs Text)
// --------

var loading_message = new createjs.Text("Loading - 0%", "50px Arial", "#FFFFFF");
loading_message.x = 500;
loading_message.regX = loading_message.getMeasuredWidth()/2;
loading_message.y = 350;
loading_message.regY = loading_message.getMeasuredHeight()/2;

var waiting = new createjs.Text("Waiting for other Player", "30px Arial", "#FFFFFF");
waiting.x = 830;
waiting.regX = waiting.getMeasuredWidth()/2;
waiting.y = 670;
waiting.regY = waiting.getMeasuredHeight()/2;

var win_message = new createjs.Text("You Won!", "100px Arial", "#0000FF");
win_message.x = 500;
win_message.regX = win_message.getMeasuredWidth()/2;
win_message.y = 350;
win_message.regY = win_message.getMeasuredHeight()/2;

var lose_message = new createjs.Text("You Lost...", "100px Arial", "#FF0000");
lose_message.x = 500;
lose_message.regX = lose_message.getMeasuredWidth()/2;
lose_message.y = 350;
lose_message.regY = lose_message.getMeasuredHeight()/2;

var player_match_message = new createjs.Text("Waiting for another Player.", "50px Arial", "#FFFFFF");
player_match_message.x = 500;
player_match_message.regX = player_match_message.getMeasuredWidth()/2;
player_match_message.y = 350;
player_match_message.regY = player_match_message.getMeasuredHeight()/2;

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
	stage = new createjs.Stage("pcgame");
	stage.enableMouseOver();
	
	// Diable right clicking
	canvas = document.getElementById("pcgame");
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
		{src:"/client/img/start_menu_background.png", id:"bgs"},
		{src:"/client/img/background1.png", id:"bg1"},
		{src:"/client/img/play_button.png", id:"pb"},
		{src:"/client/img/play_button_hover.png", id:"pbh"},
		{src:"/client/img/instructions_button.png", id:"ib"},
		{src:"/client/img/instructions_button_hover.png", id:"ibh"},
		{src:"/client/img/finalize_button.png", id:"fb"},
		{src:"/client/img/finalize_button_hover.png", id:"fbh"},
		{src:"/client/img/sound_mute.png", id:"sm"},
		{src:"/client/img/sound_high.png", id:"sp"},
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
		{src:"/client/img/units.png", id:"u"},
		{src:"/client/img/units_opponent.png", id:"uo"},
		//Sounds
		{src:"client/sound/button_over.mp3", id:"button_over"},
		{src:"client/sound/button_click.mp3", id:"button_click"},
		{src:"client/sound/bgm1.mp3", id:"bgm1"}
	]
	
	// Preloader
	preload = new createjs.LoadQueue(true);
	preload.installPlugin(createjs.Sound)
	preload.addEventListener("complete", complete_handler);
	preload.addEventListener("progress", progress_handler);
	preload.loadManifest(manifest);
}

// Updates the loading message percentage
var progress_handler = function(event) {
	loading_message.text = "Loading - " + Math.ceil(event.progress*100) + "%";
	loading_message.regX = loading_message.getMeasuredWidth()/2;
	loading_message.regY = loading_message.getMeasuredHeight()/2; 
	stage.update();
}

var complete_handler = function(event) {
	// Assigned loaded images
	start_menu_background = new createjs.Bitmap(preload.getResult("bgs"));
	game_background = new createjs.Bitmap(preload.getResult("bg1"));
	play_button_img = new createjs.Bitmap(preload.getResult("pb"));
	play_button_hover_img = new createjs.Bitmap(preload.getResult("pbh"));
	instructions_button_img = new createjs.Bitmap(preload.getResult("ib"));
	instructions_button_hover_img = new createjs.Bitmap(preload.getResult("ibh"));
	finalize_button_img = new createjs.Bitmap(preload.getResult("fb"));
	finalize_button_hover_img = new createjs.Bitmap(preload.getResult("fbh"));
	bgm_mute_img = new createjs.Bitmap(preload.getResult("sm"));
	bgm_play_img = new createjs.Bitmap(preload.getResult("sp"));
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
	units_img = new createjs.Bitmap(preload.getResult("u"));
	units_opponent_img = new createjs.Bitmap(preload.getResult("uo"));
	// Clear the screen
	stage.removeAllChildren();
	stage.update();
	
	// Show the start menu
	start_menu();
}

// Shows the main menu
var start_menu = function() {
	// Prepare all the button instances
	play_button = play_button_img.clone();
	instructions_button = instructions_button_img.clone();
	finalize_button = finalize_button_img.clone();
	bgm_button = bgm_play_img.clone();
	bgm_button.playing = true;
	
	play_button.x = 500;
	play_button.regX = play_button.image.width/2;
	play_button.y = 300;
	play_button.regY = play_button.image.height/2;
	
	instructions_button.x = 500;
	instructions_button.regX = instructions_button.image.width/2;
	instructions_button.y = 350;
	instructions_button.regY = instructions_button.image.height/2;
	
	finalize_button.x = 890;
	finalize_button.regX = finalize_button.image.width/2;
	finalize_button.y = 670;
	finalize_button.regY = finalize_button.image.height/2;
	
	bgm_button.scaleX = .5;
	bgm_button.scaleY = .5;
	bgm_button.x = 980;
	bgm_button.regX = bgm_button.image.width/2;
	bgm_button.y = 20;
	bgm_button.regY = bgm_button.image.height/2;

	// Add and show the main menu to the stage
	stage.addChild(start_menu_background);
	stage.addChild(play_button);
	stage.addChild(instructions_button);
	stage.addChild(bgm_button);
	stage.update();
	
	// Add appropriate listeners for the buttons
	play_button.addEventListener("mouseover", play_button_listener);
	play_button.addEventListener("click", play_button_listener);
	play_button.addEventListener("mouseout", play_button_listener);
	instructions_button.addEventListener("mouseover", instruction_button_listener);
	instructions_button.addEventListener("click", instruction_button_listener);
	instructions_button.addEventListener("mouseout", instruction_button_listener);
	bgm_button.addEventListener("click", bgm_control);
	finalize_button.addEventListener("mouseover", finish_click_listener);
	finalize_button.addEventListener("click", finish_click_listener);
	finalize_button.addEventListener("mouseout", finish_click_listener);
	
	// Try to begin playing the bgm music
	bgm_loop = createjs.Sound.play("bgm1", {loop:-1});
	// Set the volume of the bgm music
	bgm_loop.volume = 0.1;
}

// Called by hitting the play button
var start_game = function() {
	// Clear the stage
	stage.removeAllChildren();
	
	// Add the background for gameplay
	stage.addChild(game_background);
	
	// Add back the music button
	stage.addChild(bgm_button);
	
	// Clear the nodes and lines
	nodes = [];
	
	lines = [];
	
	// Add the waiting for other player message
	stage.addChild(player_match_message);
	
	stage.update();
	
	// Connect to the server, forces new connection
	socket = io.connect('http://' + document.location.host, {'force new connection':true});
	// Wait for the server to send which map is being played this game
	socket.on("map_select", draw_map);
	
	// Add listeners for keyboard and mousewheel events, used to control units being sent
	document.onkeydown = key_listener;
	var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
	document.addEventListener(mousewheelevt, wheel_listener);
}

// Creates lines based on the current nodes
var create_lines = function() {
	// Index to edit and create the new line in the lines array
	index = 0;
	// Go through all the nodes and draw lines to any adjacent nodes
	for(var i = 0; i < nodes.length; i++) {
		// Go through the adjacent nodes
		for(var j = 0; j < nodes[i].adjacent.length; j++) {
			// Only need to draw a line if the node ID is greater than current
			//		to prevent repeate lines
			if(nodes[i].adjacent[j] > i) {
				lines.push(new createjs.Shape());
				lines[index].graphics.setStrokeStyle(1).beginStroke(line_color).moveTo(nodes[i].x, nodes[i].y).lineTo(nodes[nodes[i].adjacent[j]].x, nodes[nodes[i].adjacent[j]].y).endStroke();
				stage.addChildAt(lines[index], 1);
				index++;
			}
		}
	}
	
}

// Draws the map element for a certain map id from the sever
var draw_map = function(map_id) {
	// Remove matchmaking message
	stage.removeChild(player_match_message);
	
	// Draw appropriate nodes for map id
	create_nodes[map_id]();
	// Draw the lines for the nodes
	create_lines();
	
	// Add listeners for updates and results messages from the server for this match
	socket.on("animations", animation_handler);
	socket.on("updates", update_handler);
	socket.on("results", result_handler);
}

// Array of different nodes for map creation
var create_nodes = []

// ----
// MAPS
// ----
// Each of the following creates a different map

create_nodes.push (function() {
	nodes.push(new node(large, 200, 150, [4, 6, 8, 14, 15]));
	nodes.push(new node(large, 850, 190, [5, 7, 10, 18, 22]));
	nodes.push(new node(large, 470, 550, [9, 11, 12, 20, 23]));
	nodes.push(new node(large, 490, 300, [6, 7, 9, 16, 17, 21]));
	nodes.push(new node(medium, 450, 100, [0, 13]));
	nodes.push(new node(medium, 700, 80, [1, 13]));
	nodes.push(new node(medium, 350, 220, [0, 3]));
	nodes.push(new node(medium, 650, 270, [1, 3]));
	nodes.push(new node(medium, 140, 340, [0, 19]));
	nodes.push(new node(medium, 420, 390, [2, 3]));
	nodes.push(new node(medium, 930, 360, [1, 24]));
	nodes.push(new node(medium, 280, 540, [2, 19]));
	nodes.push(new node(medium, 680, 520, [2, 24]));
	nodes.push(new node(small, 580, 70, [4, 5]));
	nodes.push(new node(small, 460, 150, [0, 17, 18]));
	nodes.push(new node(small, 230, 230, [0, 16, 20]));
	nodes.push(new node(small, 370, 270, [3, 15, 20]));
	nodes.push(new node(small, 460, 240, [3, 14, 18]));
	nodes.push(new node(small, 620, 210, [1, 14, 17]));
	nodes.push(new node(small, 240, 430, [8, 11]));
	nodes.push(new node(small, 370, 410, [2, 15, 16]));
	nodes.push(new node(small, 540, 350, [3, 22, 23]));
	nodes.push(new node(small, 660, 320, [1, 21, 23]));
	nodes.push(new node(small, 620, 500, [2, 21, 22]));
	nodes.push(new node(small, 820, 460, [10, 12]));
})

create_nodes.push (function() {
	nodes.push(new node(large, 200, 150, [3, 5]));
	nodes.push(new node(large, 850, 190, [3, 4]));
	nodes.push(new node(large, 470, 550, [4, 5]));
	nodes.push(new node(medium, 540, 100, [0, 1, 6]));
	nodes.push(new node(medium, 700, 400, [1, 2, 7]));
	nodes.push(new node(medium, 260, 380, [0, 2, 8]));
	nodes.push(new node(small, 500, 230, [3, 7, 8]));
	nodes.push(new node(small, 560, 320, [4, 6, 8]));
	nodes.push(new node(small, 400, 300, [5, 6, 7]));
})

create_nodes.push (function() {
	nodes.push(new node(large, 550, 296, [1, 2, 4]));
	nodes.push(new node(large, 425, 295, [2, 0, 5]));
	nodes.push(new node(large, 486, 372, [1, 0, 3]));
	nodes.push(new node(small, 484, 494, [2, 9, 10, 16]));
	nodes.push(new node(small, 662, 227, [11, 0, 12, 15]));
	nodes.push(new node(small, 309, 224, [1, 13, 14, 17]));
	nodes.push(new node(large, 846, 559, [9, 10, 21]));
	nodes.push(new node(large, 529, 45, [11, 12, 22]));
	nodes.push(new node(large, 80, 422, [13, 14, 23]));
	nodes.push(new node(small, 652, 566, [3, 6, 16]));
	nodes.push(new node(medium, 678, 458, [6, 3, 18]));
	nodes.push(new node(small, 653, 82, [7, 4, 15]));
	nodes.push(new node(medium, 495, 125, [7, 4, 20]));
	nodes.push(new node(small, 117, 253, [5, 8, 17]));
	nodes.push(new node(medium, 217, 337, [8, 5, 19]));
	nodes.push(new node(small, 753, 277, [11, 4, 18]));
	nodes.push(new node(small, 387, 508, [3, 9, 19]));
	nodes.push(new node(small, 369, 141, [5, 13, 20]));
	nodes.push(new node(small, 633, 348, [15, 10]));
	nodes.push(new node(small, 347, 361, [16, 14]));
	nodes.push(new node(small, 446, 199, [12, 17]));
	nodes.push(new node(small, 907, 405, [6]));
	nodes.push(new node(small, 364, 22, [7]));
	nodes.push(new node(small, 180, 576, [8]));
})

create_nodes.push (function() {
	nodes.push(new node(large, 52, 57, [11, 18]));
	nodes.push(new node(large, 51, 586, [10, 21]));
	nodes.push(new node(large, 941, 596, [9, 20]));
	nodes.push(new node(large, 936, 54, [8, 19]));
	nodes.push(new node(large, 465, 146, [32, 33, 30]));
	nodes.push(new node(large, 482, 522, [35, 34, 31]));
	nodes.push(new node(large, 237, 306, [14, 32, 35, 37, 38]));
	nodes.push(new node(large, 690, 316, [17, 33, 34, 39, 40]));
	nodes.push(new node(medium, 821, 138, [3, 15, 40]));
	nodes.push(new node(medium, 803, 479, [2, 16, 39]));
	nodes.push(new node(medium, 186, 462, [1, 13, 38]));
	nodes.push(new node(medium, 159, 169, [0, 12, 37]));
	nodes.push(new node(small, 84, 252, [11, 14]));
	nodes.push(new node(small, 85, 392, [10, 14]));
	nodes.push(new node(medium, 150, 312, [12, 13, 6]));
	nodes.push(new node(small, 901, 241, [17, 8]));
	nodes.push(new node(small, 890, 388, [17, 9]));
	nodes.push(new node(medium, 815, 322, [7, 16, 15]));
	nodes.push(new node(medium, 232, 31, [0, 22]));
	nodes.push(new node(medium, 726, 23, [3, 23]));
	nodes.push(new node(medium, 702, 620, [2, 24]));
	nodes.push(new node(medium, 218, 618, [1, 25]));
	nodes.push(new node(small, 263, 121, [18, 26, 37]));
	nodes.push(new node(small, 714, 121, [19, 27, 40]));
	nodes.push(new node(small, 658, 535, [20, 28, 39]));
	nodes.push(new node(small, 293, 543, [21, 29, 38]));
	nodes.push(new node(small, 363, 70, [22, 30]));
	nodes.push(new node(small, 621, 74, [23, 30]));
	nodes.push(new node(small, 582, 590, [24, 31]));
	nodes.push(new node(small, 359, 591, [25, 31]));
	nodes.push(new node(medium, 477, 33, [27, 26, 4]));
	nodes.push(new node(medium, 483, 656, [28, 29, 5]));
	nodes.push(new node(medium, 390, 253, [6, 4, 36]));
	nodes.push(new node(medium, 547, 264, [4, 7, 36]));
	nodes.push(new node(medium, 533, 394, [7, 5, 36]));
	nodes.push(new node(medium, 393, 380, [6, 5, 36]));
	nodes.push(new node(large, 471, 319, [32, 35, 34, 33]));
	nodes.push(new node(medium, 285, 201, [11, 22, 6]));
	nodes.push(new node(medium, 299, 436, [10, 25, 6]));
	nodes.push(new node(medium, 688, 419, [9, 24, 7]));
	nodes.push(new node(medium, 757, 209, [8, 23, 7]));
})


// ^^^^^^^^^^^^^^
// NEW MAPS ABOVE
// --------------