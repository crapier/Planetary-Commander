var play_button_listener = function(event) {
	stage.removeChild(start_menu_background);
	stage.removeChild(play_button);
	stage.removeChild(instructions_button);
	start_game();
}

var instruction_button_listener = function(event) {
	window.open("http://" + window.location.hostname + ":" + window.location.port + "/client/instructions.html");
}

var set_client_id = function(id) {
	client_id = id;
}

var update_handler = function(updates) {
	for(var i = 0; i < updates.length; i++){
		nodes[i].update(updates[i]);
	}
	stage.addChild(finalize_button);
	stage.removeChild(waiting);
	stage.update();
	finalize_button.addEventListener("click", finish_click_listener);
	movements = [];
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player && nodes[i].visible == true){
			nodes[i].img.addEventListener("click", source_node_select);
			nodes[i].img.addEventListener("mouseover", node_in);
			nodes[i].img.addEventListener("mouseout", node_out);
		}
	}
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
	
var result_handler = function(message) {
	for(var i = 0; i < message.updates.length; i++){
		nodes[i].update(message.updates[i]);
	}
	var result_text;
	if(message.results == "winner"){
		result_text = new createjs.Text("You Won!", "100px Arial", "#0000FF");
	}
	else if (message.results == "loser") {
		result_text = new createjs.Text("You Lost...", "100px Arial", "#FF0000");
	}
	result_text.x = 500 - result_text.getMeasuredWidth()/2;
	result_text.y = 400 - result_text.getMeasuredHeight()/2;
	stage.addChild(result_text);
	stage.update();
}

var source_node_select = function(event) {
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player){
			nodes[i].img.removeEventListener("click", source_node_select);
			nodes[i].img.removeEventListener("mouseover", node_in);
			nodes[i].img.removeEventListener("mouseout", node_out);
		}
	}
	selected = event.currentTarget.node_id;

	nodes[selected].img.addEventListener("click", destination_node_select);
	for(var i = 0; i < nodes[selected].adjacent.length; i++){
		nodes[nodes[selected].adjacent[i]].img.addEventListener("click", destination_node_select);
		nodes[nodes[selected].adjacent[i]].img.addEventListener("mouseover", node_in);
		nodes[nodes[selected].adjacent[i]].img.addEventListener("mouseout", node_out);
	}
}

var destination_node_select = function(event) {
	nodes[selected].img.removeEventListener("click", destination_node_select);
	for(var i = 0; i < nodes[selected].adjacent.length; i++){
		nodes[nodes[selected].adjacent[i]].img.removeEventListener("click", destination_node_select);
		nodes[nodes[selected].adjacent[i]].img.removeEventListener("mouseover", node_in);
		nodes[nodes[selected].adjacent[i]].img.removeEventListener("mouseout", node_out);
	}
	
	var destination = event.currentTarget.node_id;
	
	nodes[selected].hide_target();
	nodes[destination].hide_target();
	stage.update();
	
	if(selected != destination){
		movements.push(new movement(selected, destination, Math.floor(percent.percent/100*nodes[selected].units)));
	}
	
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player && nodes[i].visible == true){
			var movement_found = false;
			for(var j = 0; j < movements.length; j++) {
				if(movements[j].source == i) {
					movement_found = true;
				}
			}
			if(!movement_found){
				nodes[i].img.addEventListener("click", source_node_select);
				nodes[i].img.addEventListener("mouseover", node_in);
				nodes[i].img.addEventListener("mouseout", node_out);
			}
		}
	}
}

var finish_click_listener = function(event) {
	socket.emit("movements", {client_id:client_id, movements:movements});
	finalize_button.removeEventListener("click", finish_click_listener);
	stage.removeChild(finalize_button);
	stage.addChild(waiting);
	stage.update();
	
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player){
			nodes[i].img.removeEventListener("click", source_node_select);
		}
	}
}

var percent_key_listener = function(event) {
	//Tested this, confirmed working in FireFox and Chrome Internet Explorer 11
	var key_pressed = event.which;
	
	if(key_pressed >= 49 && key_pressed <= 57) {
		percent.update((key_pressed-48)*10);
		stage.update();
	}
	else if(key_pressed == 48) {
		percent.update(100);
		stage.update();
	}
}