var stage;
var code_box;

var small = 0;
var medium = 1;
var large = 2;

var none = 0;
var player = 1;
var opponent = 2;

var nodes = [];
var lines = [];
var selected = -1;

var allow_starts = true;
var number_starts = 0;

var background = new createjs.Bitmap("/client/img/background1.png");

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

var generate_button_img = new createjs.Bitmap("/client/img/generate_button.png");
var generate_button_hover_img = new createjs.Bitmap("/client/img/generate_button_hover.png");
var generate_button;

var clear_button_img = new createjs.Bitmap("/client/img/clear_button.png");
var clear_button_hover_img = new createjs.Bitmap("/client/img/clear_button_hover.png");
var clear_button;

var node_font = "20px Arial";
var node_font_color = "#FFFFFF";

var line_color = "#FFFFFF";

var initialize = function() {
	stage = new createjs.Stage("creator");
	
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
	
	generate_button.addEventListener("mouseover", generate_button_listener);
	generate_button.addEventListener("click", generate_button_listener);
	generate_button.addEventListener("mouseout", generate_button_listener);
	
	clear_button.addEventListener("mouseover", clear_button_listener);
	clear_button.addEventListener("click", clear_button_listener);
	clear_button.addEventListener("mouseout", clear_button_listener);
	
	canvas = document.getElementById("creator");
	canvas.oncontextmenu = function() {
		return false;  
	} 
	
	stage.addChild(background);
	stage.addChild(generate_button);
	stage.addChild(clear_button);
	
	stage.update();
	stage.enableMouseOver();
	stage.addEventListener("click", add_node)
	code_box = document.getElementById("code_output");
	
	document.onkeydown = key_listener;
}

var add_node = function(event) {
	var size = prompt("Size of the planet", "start, large, medium, or small");
	
	if (size == "large") {
		if(number_starts >=2) {
			allow_starts = false;
			nodes.push(new node(large, event.stageX, event.stageY, []));
			nodes[nodes.length-1].update({units:20, owner:none, visible:true});
			if(selected == -1) {
				nodes[nodes.length-1].img.addEventListener("click", node_click_source);
			}
			else {
				nodes[nodes.length-1].img.addEventListener("click", adjacent_listener);
			}
			nodes[nodes.length-1].img.addEventListener("mouseover", node_in);
			nodes[nodes.length-1].img.addEventListener("mouseout", node_out);
		}
		else {
			alert("At least 2 start planets must be present.");
		}
	}
	else if (size == "medium") {
		if(number_starts >=2) {
			allow_starts = false;
			nodes.push(new node(medium, event.stageX, event.stageY, []));
			nodes[nodes.length-1].update({units:10, owner:none, visible:true});
			if(selected == -1) {
				nodes[nodes.length-1].img.addEventListener("click", node_click_source);
			}
			else {
				nodes[nodes.length-1].img.addEventListener("click", adjacent_listener);
			}
			nodes[nodes.length-1].img.addEventListener("mouseover", node_in);
			nodes[nodes.length-1].img.addEventListener("mouseout", node_out);
		}
		else {
			alert("At least 2 start planets must be present.");
		}
	}
	else if (size == "small") {
		if(number_starts >=2) {
			allow_starts = false;
			nodes.push(new node(small, event.stageX, event.stageY, []));
			nodes[nodes.length-1].update({units:5, owner:none, visible:true});
			if(selected == -1) {
				nodes[nodes.length-1].img.addEventListener("click", node_click_source);
			}
			else {
				nodes[nodes.length-1].img.addEventListener("click", adjacent_listener);
			}
			nodes[nodes.length-1].img.addEventListener("mouseover", node_in);
			nodes[nodes.length-1].img.addEventListener("mouseout", node_out);
		}
		else {
			alert("At least 2 start planets must be present.");
		}
	}
	else if (size == "start") {
		if(allow_starts == true) {
			number_starts++;
			nodes.push(new node(large, event.stageX, event.stageY, []));
			nodes[nodes.length-1].update({units:50, owner:player, visible:true});
			if(selected == -1) {
				nodes[nodes.length-1].img.addEventListener("click", node_click_source);
			}
			else {
				nodes[nodes.length-1].img.addEventListener("click", adjacent_listener);
			}
			nodes[nodes.length-1].img.addEventListener("mouseover", node_in);
			nodes[nodes.length-1].img.addEventListener("mouseout", node_out);
		}
		else {
			alert("At least 2 Start planets must be added first.");
		}
	}
	
	stage.update();
}


var node_click_source = function(event) {
	var button = event.nativeEvent.button;
	
	if(button == 0) {
		for(var i = 0; i < nodes.length; i++) {
			nodes[i].img.removeAllEventListeners();
		}
		selected = event.currentTarget.node_id;
		nodes[selected].show_target();
		stage.update();
		
		nodes[selected].img.addEventListener("click", adjacent_listener);
		for(var i = 0; i < nodes.length; i++){
			if (i != selected) {
				nodes[i].img.addEventListener("click", adjacent_listener);
				nodes[i].img.addEventListener("mouseover", node_in);
				nodes[i].img.addEventListener("mouseout", node_out);
			}
		}
	}
	else if(button == 2) {
		var clear_adjacent = event.currentTarget.node_id;
		delete_all_adjacent(clear_adjacent);
		stage.update();
	}
	
	event.stopPropagation();
}

var delete_all_adjacent = function(node_id) {
	for(var i = 0; i < nodes[node_id].adjacent.length; i++) {
		var index = nodes[nodes[node_id].adjacent[i]].adjacent.indexOf(node_id)
		nodes[nodes[node_id].adjacent[i]].adjacent.splice(index, 1);
	}
	for(var i = 0; i < lines.length; i++) {
		if(lines[i].connected_nodes[0] == node_id || lines[i].connected_nodes[1] == node_id) {
			stage.removeChild(lines[i]);
			lines.splice(i, 1)
			i--;
		}
	}
	nodes[node_id].adjacent = [];
}

var node_in = function(event) {
	var hover = event.currentTarget.node_id;
	nodes[hover].show_target();
	stage.update();
}

var node_out = function(event) {
	var hover = event.currentTarget.node_id;
	nodes[hover].hide_target();
	stage.update();
}

var adjacent_listener = function(event) {
	var adjacent = event.currentTarget.node_id;
	if(adjacent != selected) {
		for(var i = 0; i < nodes.length; i++) {
			nodes[i].img.removeAllEventListeners();
			nodes[i].img.addEventListener("click", node_click_source);
			nodes[i].img.addEventListener("mouseover", node_in);
			nodes[i].img.addEventListener("mouseout", node_out);
		}
		var already_adjacent = false;
		for(var i = 0; i < nodes[selected].adjacent.length; i++) {
			if(nodes[selected].adjacent[i] == adjacent) {
				already_adjacent = true;
				break;
			}
		}
		
		if(!already_adjacent) {
			nodes[selected].adjacent.push(adjacent);
			nodes[adjacent].adjacent.push(selected);
			
			lines.push(new createjs.Shape());
			lines[lines.length-1].graphics.setStrokeStyle(1).beginStroke(line_color).moveTo(nodes[selected].x, nodes[selected].y).lineTo(nodes[adjacent].x, nodes[adjacent].y).endStroke();
			lines[lines.length-1].connected_nodes = [selected, adjacent];
			stage.addChildAt(lines[lines.length-1], 1);
		}
		
		nodes[selected].hide_target();
		selected = -1;
		event.stopPropagation();
	}
	else {
		nodes[selected].hide_target();
		selected = -1;
		for(var i = 0; i < nodes.length; i++) {
			nodes[i].img.removeAllEventListeners();
			nodes[i].img.addEventListener("click", node_click_source);
			nodes[i].img.addEventListener("mouseover", node_in);
			nodes[i].img.addEventListener("mouseout", node_out);
		}
		event.stopPropagation();
	}
	stage.update();
}

var generate_button_listener = function(event) {
	if(event.type == "click") {
		generate_code();
		event.stopPropagation();
	}
	else if(event.type == "mouseover") {
		generate_button.image = generate_button_hover_img.image;
		stage.update();
	}
	else if(event.type == "mouseout") {
		generate_button.image = generate_button_img.image;
		stage.update();
	}
}

var clear_button_listener = function(event) {
	if(event.type == "click") {
		stage.removeAllChildren();
		nodes = [];
		lines = [];
		selected = -1;

		allow_starts = true;
		number_starts = 0;
		
		stage.addChild(background);
		stage.addChild(generate_button);
		stage.addChild(clear_button);
		
		stage.update();
		event.stopPropagation();
	}
	else if(event.type == "mouseover") {
		clear_button.image = clear_button_hover_img.image;
		stage.update();
	}
	else if(event.type == "mouseout") {
		clear_button.image = clear_button_img.image;
		stage.update();
	}
}

var generate_code = function(){
	var client_side = "create_nodes.push (function() {\n";
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
	
	code_box.value = "Client Side Code:\n" + client_side + "\n\nServer Side Code:\n" +server_side;
}

var key_listener = function(event) {
	var key_pressed = event.which;
	
	if (selected != -1) {
		if(key_pressed == 37 || key_pressed == 38 || key_pressed == 39 || key_pressed == 40) {
			//up arrow key
			if(key_pressed == 38) {
				nodes[selected].y = nodes[selected].y - 5;
				nodes[selected].img.y = nodes[selected].y;
				nodes[selected].text.y = nodes[selected].y;
				nodes[selected].target.y = nodes[selected].y;
			}
			//down arrow key
			else if(key_pressed == 40) {
				nodes[selected].y = nodes[selected].y + 5;
				nodes[selected].img.y = nodes[selected].y;
				nodes[selected].text.y = nodes[selected].y;
				nodes[selected].target.y = nodes[selected].y;
			}
			//left arrow key
			else if(key_pressed == 37) {
				nodes[selected].x = nodes[selected].x - 5;
				nodes[selected].img.x = nodes[selected].x;
				nodes[selected].text.x = nodes[selected].x;
				nodes[selected].target.x = nodes[selected].x;
			}
			//right arrow key
			else if(key_pressed == 39) {
				nodes[selected].x = nodes[selected].x + 5;
				nodes[selected].img.x = nodes[selected].x;
				nodes[selected].text.x = nodes[selected].x;
				nodes[selected].target.x = nodes[selected].x;
			}
			
			for(var i = 0; i < lines.length; i++) {
				if(lines[i].connected_nodes[0] == selected || lines[i].connected_nodes[1] == selected) {
					lines[i].graphics.clear();
					lines[i].graphics.setStrokeStyle(1).beginStroke(line_color).moveTo(nodes[lines[i].connected_nodes[0]].x, nodes[lines[i].connected_nodes[0]].y).lineTo(nodes[lines[i].connected_nodes[1]].x, nodes[lines[i].connected_nodes[1]].y).endStroke();
				}
			}
		}
		//d key
		else if(key_pressed == 68) {
			if(nodes[selected].owner == player && number_starts <= 2) {
				alert("Cannot remove start, at least 2 starts must be present");
			}
			else{
				if(nodes[selected].owner == player) {
					number_starts--;
				}
				
				delete_all_adjacent(selected);
				
				stage.removeChild(nodes[selected].img);
				stage.removeChild(nodes[selected].text);
				stage.removeChild(nodes[selected].target);
				nodes.splice(selected, 1);
				
				for(var i = 0; i < nodes.length; i++) {
					nodes[i].img.node_id = i;
					for(var j = 0; j < nodes[i].adjacent.length; j++){
						if(nodes[i].adjacent[j] > selected) {
							nodes[i].adjacent[j]--;
						}
					}
				}
				
				for(var i = 0; i < lines.length; i++) {
					if(lines[i].connected_nodes[0] > selected) {
						lines[i].connected_nodes[0]--;
					}
					if(lines[i].connected_nodes[1] > selected) {
						lines[i].connected_nodes[1]--;
					}
				}
				
				selected = -1;
				
				for(var i = 0; i < nodes.length; i++) {
					nodes[i].img.removeAllEventListeners();
					nodes[i].img.addEventListener("click", node_click_source);
					nodes[i].img.addEventListener("mouseover", node_in);
					nodes[i].img.addEventListener("mouseout", node_out);
				}
			}
		}
		stage.update();
	}
}