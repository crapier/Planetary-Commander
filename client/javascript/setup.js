var stage;
var nodes = [];
var lines = [];
var movements = [];
var units_list = [];
var percent;
var socket;
var selected;

var start_menu_background = new createjs.Bitmap("/client/img/start_menu_background.png");
var game_background = new createjs.Bitmap("/client/img/background1.png");

var play_button_img = new createjs.Bitmap("/client/img/play_button.png");
var play_button_hover_img = new createjs.Bitmap("/client/img/play_button_hover.png");
var instructions_button_img = new createjs.Bitmap("/client/img/instructions_button.png");
var instructions_button_hover_img = new createjs.Bitmap("/client/img/instructions_button_hover.png");
var finalize_button_img = new createjs.Bitmap("/client/img/finalize_button.png");
var finalize_button_hover_img = new createjs.Bitmap("/client/img/finalize_button_hover.png");
var play_button;
var instruction_button;
var finalize_button;

var small_target = new createjs.Bitmap("/client/img/small_target.png");
var medium_target = new createjs.Bitmap("/client/img/medium_target.png");
var large_target = new createjs.Bitmap("/client/img/large_target.png");
var visible_player_small_node = new createjs.Bitmap("/client/img/visible_small_player.png");
var visible_player_medium_node = new createjs.Bitmap("/client/img/visible_medium_player.png");
var visible_player_large_node = new createjs.Bitmap("/client/img/visible_large_player.png");
var visible_opponent_small_node = new createjs.Bitmap("/client/img/visible_small_opponent.png");
var visible_opponent_medium_node = new createjs.Bitmap("/client/img/visible_medium_opponent.png");
var visible_opponent_large_node = new createjs.Bitmap("/client/img/visible_large_opponent.png");
var visible_unowned_small_node = new createjs.Bitmap("/client/img/visible_small_unowned.png");
var visible_unowned_medium_node = new createjs.Bitmap("/client/img/visible_medium_unowned.png");
var visible_unowned_large_node = new createjs.Bitmap("/client/img/visible_large_unowned.png");
var hidden_unknown_small_node = new createjs.Bitmap("/client/img/hidden_small_unknown.png");
var hidden_unknown_medium_node = new createjs.Bitmap("/client/img/hidden_medium_unknown.png");
var hidden_unknown_large_node = new createjs.Bitmap("/client/img/hidden_large_unknown.png");
var hidden_opponent_small_node = new createjs.Bitmap("/client/img/hidden_small_opponent.png");
var hidden_opponent_medium_node = new createjs.Bitmap("/client/img/hidden_medium_opponent.png");
var hidden_opponent_large_node = new createjs.Bitmap("/client/img/hidden_large_opponent.png");

var units_img = new createjs.Bitmap("/client/img/units.png");

var small = 0;
var medium = 1;
var large = 2;

var none = 0;
var player = 1;
var opponent = 2;

var node_font = "20px Arial";
var node_font_color = "#FFFFFF";

var percent_font = "50px Arial";
var percent_font_color = "#FFFFFF";

var units_font = "20px Arial";
var units_font_color = "#FFFFFF";

var timer_font = "50px Arial";
var timer_font_color = "#FFFFFF";
var timer_x = 450;
var timer_y = 640
var time_limit = 180;

var line_color = "#FFFFFF";

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

var initialize = function() {
	
	play_button = play_button_img.clone();
	instructions_button = instructions_button_img.clone();
	finalize_button = finalize_button_img.clone();
	
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

	stage = new createjs.Stage("pcgame");
	stage.enableMouseOver();

	stage.addChild(start_menu_background);
	stage.addChild(play_button);
	stage.addChild(instructions_button);
	
	stage.update();
	
	play_button.addEventListener("mouseover", play_button_listener);
	play_button.addEventListener("click", play_button_listener);
	play_button.addEventListener("mouseout", play_button_listener);
	instructions_button.addEventListener("mouseover", instruction_button_listener);
	instructions_button.addEventListener("click", instruction_button_listener);
	instructions_button.addEventListener("mouseout", instruction_button_listener);
}

var start_game = function() {
	stage.removeAllChildren();
	
	stage.addChild(game_background);
	
	nodes = [];
	
	lines = [];
	
	percent = new percent_display(50, 10, 640);
	stage.addChild(player_match_message);
	
	stage.update();
	
	socket = io.connect('http://' + document.location.host, {'force new connection':true});
	socket.on("map_select", draw_map);
	
	
	document.onkeydown = percent_key_listener;
}

var create_lines = function() {
	index = 0;
	for(var i = 0; i < nodes.length; i++) {
		for(var j = 0; j < nodes[i].adjacent.length; j++) {
			if(nodes[i].adjacent[j] > i) {
				lines.push(new createjs.Shape());
				lines[index].graphics.setStrokeStyle(1).beginStroke(line_color).moveTo(nodes[i].x, nodes[i].y).lineTo(nodes[nodes[i].adjacent[j]].x, nodes[nodes[i].adjacent[j]].y).endStroke();
				stage.addChildAt(lines[index], 1);
				index++;
			}
		}
	}
	
}

var draw_map = function(map_id) {
	stage.removeChild(player_match_message);
	
	create_nodes[map_id]();
	create_lines();
	
	socket.on("updates", update_handler);
	socket.on("results", result_handler);
}

var create_nodes = []

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