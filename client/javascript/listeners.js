var play_button_listener = function(event) {
	if(event.type == 'mouseover') {
		play_button.image = play_button_hover_img.image;
		stage.update();
		
	} else if(event.type == 'mouseout') {
		play_button.image = play_button_img.image;
		stage.update();
	} else if(event.type == 'click') {
		stage.removeChild(start_menu_background);
		stage.removeChild(play_button);
		stage.removeChild(instructions_button);
		start_game();
	}
}

var instruction_button_listener = function(event) {
	if(event.type == 'mouseover') {
		instructions_button.image = instructions_button_hover_img.image;
		stage.update();
		
	} else if(event.type == 'mouseout') {
		instructions_button.image = instructions_button_img.image;
		stage.update();
	} else if(event.type == 'click') {
		window.open("http://" + window.location.hostname + ":" + window.location.port + "/client/instructions.html");
	}
}

var update_handler = function(updates) {
	for(var i = 0; i < updates.length; i++){
		nodes[i].update(updates[i]);
	}
	stage.addChild(finalize_button);
	finalize_button.image = finalize_button_img.image;
	stage.removeChild(waiting);
	stage.update();
	finalize_button.addEventListener("mouseover", finish_click_listener);
	finalize_button.addEventListener("click", finish_click_listener);
	finalize_button.addEventListener("mouseout", finish_click_listener);
	
	movements = [];
	for(var i = 0; i < units_list.length; i++){
		stage.removeChild(units_list[i].img);
		stage.removeChild(units_list[i].text);
	}
	units_list = [];
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player && nodes[i].visible == true){
			nodes[i].img.addEventListener("click", source_node_select);
			nodes[i].img.addEventListener("mouseover", node_in_source);
			nodes[i].img.addEventListener("mouseout", node_out_source);
		}
	}
	
	if(timer.started == false) {
		timer.setup(time_limit);
	}
	else {
		timer.restart(time_limit);
	}
}

var node_in_source = function(event) {
	var hover = event.currentTarget.node_id;
	nodes[hover].show_target_source();
	stage.update();
}

var node_out_source = function(event) {
	var hover = event.currentTarget.node_id;
	nodes[hover].hide_target_source();
	stage.update();
}

var node_in_dest = function(event) {
	var hover = event.currentTarget.node_id;
	nodes[hover].show_target_dest();
	stage.update();
}

var node_out_dest = function(event) {
	var hover = event.currentTarget.node_id;
	nodes[hover].hide_target_dest();
	stage.update();
}
	
var result_handler = function(message) {
	for(var i = 0; i < message.updates.length; i++){
		nodes[i].update(message.updates[i]);
	}
	
	if(message.results == "winner"){
		stage.addChild(win_message);
	}
	else if (message.results == "loser") {
		stage.addChild(lose_message);
	}
	
	socket.disconnect();
	
	if(selected >= 0) {
		nodes[selected].hide_target_source();
		nodes[selected].update({owner:player, units:selection_units.max, visible:true});
		stage.removeChild(selection_units.img);
		stage.removeChild(selection_units.text);
		canvas.onmousemove = null;
		selection_units = null;
		selected = -1;
	}

	for (var i = 0; i < nodes.length; i++) {
		nodes[i].img.removeAllEventListeners();
	}
	for (var i = 0; i < units_list.length; i++) {
		units_list[i].img.removeAllEventListeners();
		stage.removeChild(units_list[i].img);
		stage.removeChild(units_list[i].text);
	}
	finalize_button.removeAllEventListeners();
	stage.removeChild(finalize_button);
	stage.removeChild(waiting);
	
	
	timer.started = false;
	window.clearInterval(timer.interval);
	stage.removeChild(timer.text);
	
	stage.addChild(play_button);
	play_button.x = 890;
	play_button.y = 670;
	
	stage.update();
}

var source_node_select = function(event) {
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player){
			nodes[i].img.removeAllEventListeners();
		}
	}
	selected = event.currentTarget.node_id;
	
	nodes[selected].show_target_source();
	units_to_send = nodes[selected].units;
	selection_units = new create_selection_units(selected, units_to_send);
	nodes[selected].update({owner:player, units:0, visible:true});
	canvas.onmousemove = units_track_mouse;
	
	stage.update();
	nodes[selected].img.addEventListener("click", destination_node_select);
	
	for(var i = 0; i < nodes[selected].adjacent.length; i++){
		nodes[nodes[selected].adjacent[i]].img.addEventListener("click", destination_node_select);
		nodes[nodes[selected].adjacent[i]].img.addEventListener("mouseover", node_in_dest);
		nodes[nodes[selected].adjacent[i]].img.addEventListener("mouseout", node_out_dest);
	}
}

var destination_node_select = function(event) {
	nodes[selected].img.removeEventListener("click", destination_node_select);
	for(var i = 0; i < nodes[selected].adjacent.length; i++){
		nodes[nodes[selected].adjacent[i]].img.removeAllEventListeners();
	}
	
	var destination = event.currentTarget.node_id;
	
	nodes[selected].hide_target_source();
	nodes[destination].hide_target_dest();
	
	if(selected != destination){
		var send_units = units_to_send;
		if ( send_units == 0 ){
			send_units = 1;
		}
		movements.push(new movement(selected, destination, send_units));
		units_list.push(new units(selected, destination, send_units));
	}
	else {
		nodes[selected].update({owner:player, units:selection_units.max, visible:true});
	}
	
	stage.removeChild(selection_units.img);
	stage.removeChild(selection_units.text);
	canvas.onmousemove = null;
	selection_units = null;
	
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
				nodes[i].img.addEventListener("mouseover", node_in_source);
				nodes[i].img.addEventListener("mouseout", node_out_source);
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
	nodes[units_list[unit_id].source].img.addEventListener("mouseover", node_in_source);
	nodes[units_list[unit_id].source].img.addEventListener("mouseout", node_out_source);
}

var finish_click_listener = function(event) {
	if(event.type == 'mouseover') {
		finalize_button.image = finalize_button_hover_img.image;
		stage.update();
		
	} else if(event.type == 'mouseout') {
		finalize_button.image = finalize_button_img.image;
		stage.update();
	} else if(event.type == 'click') {
		end_turn();
	}
}

var end_turn = function() {
	socket.emit("movements", movements);
	finalize_button.removeEventListener("click", finish_click_listener);
	finalize_button.removeEventListener("mouseover", finish_click_listener);
	finalize_button.removeEventListener("mouseout", finish_click_listener);
	stage.removeChild(finalize_button);
	stage.addChild(waiting);
	
	timer.already_finished = true;
	
	if(selected >= 0) {
		nodes[selected].hide_target_source();
		nodes[selected].update({owner:player, units:selection_units.max, visible:true});
		stage.removeChild(selection_units.img);
		stage.removeChild(selection_units.text);
		canvas.onmousemove = null;
		selection_units = null;
		selected = -1;
	}
	stage.update();
	
	for(var i = 0; i < units_list.length; i++) {
		units_list[i].img.removeEventListener("click", units_click_listener);
	}
	
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player){
			nodes[i].img.removeAllEventListeners();
		}
	}
}

var key_listener = function(event) {
	//Tested this, confirmed working in FireFox and Chrome Internet Explorer 11
	var key_pressed = event.which;
	
	if(selected >= 0) {
		if(key_pressed >= 49 && key_pressed <= 57) {
			units_to_send = Math.floor(selection_units.max*(key_pressed-48)/10);
		}
		else if(key_pressed == 48) {
			units_to_send = selection_units.max;
		}
		if(units_to_send == 0) {
			units_to_send = 1;
		}
		selection_units.text.text = units_to_send;
		nodes[selected].update({owner:player, units:selection_units.max-units_to_send, visible:true});
		stage.update();
	}
}

var wheel_listener = function(event) {
	//wheelDelta is for chrome, detail is for firefox
	var wheelinfo;
	if(/Firefox/i.test(navigator.userAgent)) {
		wheelinfo = -1 * event.detail;
	}
	else {
		wheelinfo = event.wheelDelta;
	}
	
	if(selected >= 0) {
		if(wheelinfo < 0) {
			if(units_to_send > 1) {
				units_to_send--;
				nodes[selected].update({owner:player, units:nodes[selected].units+1, visible:true});
			}
		}
		else if(wheelinfo > 0) {
			if(units_to_send < selection_units.max) {
				units_to_send++;
				nodes[selected].update({owner:player, units:nodes[selected].units-1, visible:true});
			}
		}
		selection_units.text.text = units_to_send;
		
		stage.update();
	}
}