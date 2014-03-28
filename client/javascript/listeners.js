var set_client_id = function(id) {
	client_id = id;
}

var update_handler = function(updates) {
	console.log(updates);
	for(var i = 0; i < updates.length; i++){
		nodes[i].update(updates[i]);
	}
	stage.update();
	finish.shape.addEventListener("click", finish_click_listener);
	movements = [];
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player && nodes[i].visible == true){
			nodes[i].shape.addEventListener("click", source_node_select);
		}
	}
}
	
var result_handler = function(results) {
	var results;
	if(results == "winner"){
		results = new createjs.Text("You Won!", "100px Arial", "#0000FF");
	}
	else if (results == "loser") {
		results = new createjs.Text("You Lost...", "100px Arial", "#FF0000");
	}
	results.x = 500 - results.getMeasuredWidth()/2;
	results.y = 400 - results.getMeasuredHeight()/2;
	stage.addChild(results);
	stage.update();
}

var source_node_select = function(event) {
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player){
			nodes[i].shape.removeEventListener("click", source_node_select);
		}
	}
	selected = event.currentTarget.node_id;
	
	nodes[selected].shape.graphics.clear().setStrokeStyle(3).beginStroke("black").beginFill(visible_player).drawCircle(nodes[selected].x, nodes[selected].y, nodes[selected].size);
	stage.update();

	nodes[selected].shape.addEventListener("click", destination_node_select);
	for(var i = 0; i < nodes[selected].adjacent.length; i++){
		nodes[nodes[selected].adjacent[i]].shape.addEventListener("click", destination_node_select);
	}
}

var destination_node_select = function(event) {
	nodes[selected].shape.removeEventListener("click", destination_node_select);
	for(var i = 0; i < nodes[selected].adjacent.length; i++){
		nodes[nodes[selected].adjacent[i]].shape.removeEventListener("click", destination_node_select);
	}
	
	nodes[selected].shape.graphics.clear().beginFill(visible_player).drawCircle(nodes[selected].x, nodes[selected].y, nodes[selected].size);
	stage.update();
	
	var destination = event.currentTarget.node_id;
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
				nodes[i].shape.addEventListener("click", source_node_select);
			}
		}
	}
}

var finish_click_listener = function(event) {
	socket.emit("movements", {client_id:client_id, movements:movements});
	finish.shape.removeEventListener("click", finish_click_listener);
	
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player){
			nodes[i].shape.removeEventListener("click", source_node_select);
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