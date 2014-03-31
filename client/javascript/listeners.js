var play_button_listener = function(event) {
	if(menu == true) {
		if(event.type == 'mouseover') {
			stage.removeChild(play_button);
			stage.addChild(play_button_hover);
			play_button_hover.x = 500 - play_button_hover.image.width/2;
			play_button_hover.y = 300;
			stage.update();
			
		} else if(event.type == 'mouseout') {
			stage.removeChild(play_button_hover);
			stage.addChild(play_button);
			play_button.x = 500 - play_button.image.width/2;
			play_button.y = 300;
			stage.update();
		} else if(event.type == 'click') {
		menu = false;
		play_button_hover.removeEventListener("click", finish_click_listener);
		play_button.removeEventListener("mouseover", finish_click_listener);
		play_button_hover.removeEventListener("mouseout", finish_click_listener);
		stage.removeChild(start_menu_background);
		stage.removeChild(play_button);
		stage.removeChild(play_button_hover);
		stage.removeChild(instructions_button);
		start_game();
		}
	}
}

var instruction_button_listener = function(event) {
	if(menu == true) {
		if(event.type == 'mouseover') {
			stage.removeChild(instructions_button);
			stage.addChild(instructions_button_hover);
			instructions_button_hover.x = 500 - instructions_button_hover.image.width/2;
			instructions_button_hover.y = 350;
			stage.update();
			
		} else if(event.type == 'mouseout') {
			stage.removeChild(instructions_button_hover);
			stage.addChild(instructions_button);
			instructions_button.x = 500 - instructions_button.image.width/2;
			instructions_button.y = 350;
			stage.update();
		} else if(event.type == 'click') {
			window.open("http://" + window.location.hostname + ":" + window.location.port + "/client/instructions.html");
		}
	}
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
	finalize_button.addEventListener("mouseover", finish_click_listener);
	finalize_button_hover.addEventListener("click", finish_click_listener);
	finalize_button_hover.addEventListener("mouseout", finish_click_listener);
	movements = [];
	for(var i = 0; i < units_list.length; i++){
		stage.removeChild(units_list[i].img);
		stage.removeChild(units_list[i].text);
	}
	units_list = [];
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player && nodes[i].visible == true){
			nodes[i].img.addEventListener("click", source_node_select);
			nodes[i].img.addEventListener("mouseover", node_in);
			nodes[i].img.addEventListener("mouseout", node_out);
		}
	}
	timer.start(time_limit);
}

var handle_hover = function(event) {

	stage.removeChild(finalize_button);
	if(event.type == 'mouseover') {
		stage.addChild(finalize_button);
		finalize_button.x = 790;
		finalize_button.y = 750;
		finalize_button.style.color = '#ffffff';
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
	
	if(selected != destination){
		var send_units = Math.floor(percent.percent/100*nodes[selected].units);
		movements.push(new movement(selected, destination, send_units));
		units_list.push(new units(selected, destination, send_units));
		var update_source = {owner: -1, units: nodes[selected].units - send_units, visible: true};
		nodes[selected].update(update_source);
	}
	
	stage.update();
	selected = -1;
	
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player && nodes[i].visible == true){
			var movement_found = false;
			for(var j = 0; j < movements.length; j++) {
				if(movements[j].source == i && movements[j].units > 0) {
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
	for(var i = 0; i < units_list.length; i++) {
		units_list[i].img.addEventListener("click", units_click_listener);
	}
}

var units_click_listener = function(event) {
	var unit_id = event.currentTarget.units_id;
	
	stage.removeChild(units_list[unit_id].img);
	stage.removeChild(units_list[unit_id].text);
	
	for(var i = 0; i < movements.length; i++) {
		if(movements[i].source == units_list[unit_id].source){
			movements[i].units = 0;
		}
	}
	
	var update_source = {owner: -1, units:nodes[units_list[unit_id].source].units + units_list[unit_id].units, visible: true};
	nodes[units_list[unit_id].source].update(update_source);
	stage.update();
	
	nodes[units_list[unit_id].source].img.addEventListener("click", source_node_select);
	nodes[units_list[unit_id].source].img.addEventListener("mouseover", node_in);
	nodes[units_list[unit_id].source].img.addEventListener("mouseout", node_out);
}

var finish_click_listener = function(event) {
	if(menu == false) {
		if(event.type == 'mouseover') {
			stage.removeChild(finalize_button);
			stage.addChild(finalize_button_hover);
			finalize_button_hover.x = 790;
			finalize_button_hover.y = 750;
			stage.update();
			
		} else if(event.type == 'mouseout') {
			stage.removeChild(finalize_button_hover);
			stage.addChild(finalize_button);
			finalize_button.x = 790;
			finalize_button.y = 750;
			stage.update();
		} else if(event.type == 'click') {

			socket.emit("movements", {client_id:client_id, movements:movements});
			finalize_button_hover.removeEventListener("click", finish_click_listener);
			finalize_button.removeEventListener("mouseover", finish_click_listener);
			finalize_button_hover.removeEventListener("mouseout", finish_click_listener);
			stage.removeChild(finalize_button);
			stage.removeChild(finalize_button_hover);
			stage.addChild(waiting);
			
			window.clearInterval(timer.interval);
			stage.removeChild(timer.text);
			
			if(selected >= 0) {
				nodes[selected].hide_target();
			}
			stage.update();
			
			for(var i = 0; i < nodes.length; i++) {
				if(nodes[i].owner == player){
					nodes[i].img.removeEventListener("click", source_node_select);
					nodes[i].img.removeEventListener("mouseover", node_in);
					nodes[i].img.removeEventListener("mouseout", node_out);
				}
			}
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