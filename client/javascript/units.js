// Units class for showing current movements
var units = function(source, destination, units) {
	this.source = source;
	this.destination = destination;
	this.units = units;
	
	// Calculate the roatation for the unit visual
	var rotation;
	if(nodes[source].x <= nodes[destination].x && nodes[source].y <= nodes[destination].y) {
		rotation = Math.atan((nodes[destination].y - nodes[source].y)/(nodes[destination].x - nodes[source].x))*180/Math.PI;
	}
	else if(nodes[source].x <= nodes[destination].x && nodes[source].y >= nodes[destination].y) {
		rotation = -1 * Math.atan((nodes[source].y - nodes[destination].y)/(nodes[destination].x - nodes[source].x))*180/Math.PI;
	}
	else if(nodes[source].x >= nodes[destination].x && nodes[source].y <= nodes[destination].y) {
		rotation = 90 + Math.atan((nodes[source].x - nodes[destination].x)/(nodes[destination].y - nodes[source].y))*180/Math.PI;
	}
	else if(nodes[source].x >= nodes[destination].x && nodes[source].y >= nodes[destination].y) {
		rotation = -90 + -1 * Math.atan((nodes[source].x - nodes[destination].x)/(nodes[source].y - nodes[destination].y))*180/Math.PI;
	}
	
	// Calcualte the position for the unit visual
	if(nodes[source].size == small) {
		this.x = nodes[source].x + small_units_distance*Math.cos(rotation*Math.PI/180);
		this.y = nodes[source].y + small_units_distance*Math.sin(rotation*Math.PI/180);
	}
	else if(nodes[source].size == medium) {
		this.x = nodes[source].x + medium_units_distance*Math.cos(rotation*Math.PI/180);
		this.y = nodes[source].y + medium_units_distance*Math.sin(rotation*Math.PI/180);
	}
	else if(nodes[source].size == large) {
		this.x = nodes[source].x + large_units_distance*Math.cos(rotation*Math.PI/180);
		this.y = nodes[source].y + large_units_distance*Math.sin(rotation*Math.PI/180);
	}
	
	// Create and place the unit visual based on position and roation above
	this.img = units_img.clone();
	this.img.x = this.x;
	this.img.regX = this.img.image.width/2;
	this.img.y = this.y;
	this.img.regY = this.img.image.height/2;
	this.img.rotation = rotation;
	
	this.img.units_id = units_list.length;
	
	this.text = new createjs.Text(this.units, units_font, units_font_color);
	this.text.x = this.x;
	this.text.regX = this.text.getMeasuredWidth()/2;
	this.text.y = this.y;
	this.text.regY = this.text.getMeasuredHeight()/2;
	
	stage.addChild(this.img);
	stage.addChild(this.text);
}

// Unit class for showing current number of units to be sent from current selection
var create_selection_units = function(source, units) {
	this.source = source;
	this.units = units;
	this.max = nodes[source].units;
	
	// Calcualte the default position
	if(nodes[source].size == small) {
		this.x = nodes[source].x + small_units_distance;
		this.y = nodes[source].y;
	}
	else if(nodes[source].size == medium) {
		this.x = nodes[source].x + medium_units_distance;
		this.y = nodes[source].y;
	}
	else if(nodes[source].size == large) {
		this.x = nodes[source].x + large_units_distance;
		this.y = nodes[source].y;
	}
	
	// Create unit visual and place according to above position
	this.img = units_img.clone();
	this.img.x = this.x;
	this.img.regX = this.img.image.width/2;
	this.img.y = this.y;
	this.img.regY = this.img.image.height/2;
	
	this.text = new createjs.Text(this.units, units_font, units_font_color);
	this.text.x = this.x;
	this.text.regX = this.text.getMeasuredWidth()/2;
	this.text.y = this.y;
	this.text.regY = this.text.getMeasuredHeight()/2;
	
	stage.addChild(this.img);
	stage.addChild(this.text);
}

// Tracks the mouse and moves the selection_units which is an instance created from the
//		above create_selection_units constructor
var units_track_mouse = function(event) {
	// The position of the mouse
	var mouse_x = event.stageX/stage.scaleX;
	var mouse_y = event.stageY/stage.scaleY;
	
	// Calculate the rotation of the visual
	var rotation;
	if(nodes[selection_units.source].x <= mouse_x && nodes[selection_units.source].y <= mouse_y) {
		rotation = Math.atan((mouse_y - nodes[selection_units.source].y)/(mouse_x - nodes[selection_units.source].x))*180/Math.PI;
	}
	else if(nodes[selection_units.source].x <= mouse_x && nodes[selection_units.source].y >= mouse_y) {
		rotation = -1 * Math.atan((nodes[selection_units.source].y - mouse_y)/(mouse_x - nodes[selection_units.source].x))*180/Math.PI;
	}
	else if(nodes[selection_units.source].x >= mouse_x && nodes[selection_units.source].y <= mouse_y) {
		rotation = 90 + Math.atan((nodes[selection_units.source].x - mouse_x)/(mouse_y - nodes[selection_units.source].y))*180/Math.PI;
	}
	else if(nodes[selection_units.source].x >= mouse_x && nodes[selection_units.source].y >= mouse_y) {
		rotation = -90 + -1 * Math.atan((nodes[selection_units.source].x - mouse_x)/(nodes[selection_units.source].y - mouse_y))*180/Math.PI;
	}
	
	selection_units.img.rotation = rotation;
	
	// Calculate the position of the visual
	if(nodes[selected].size == small) {
		selection_units.x = nodes[selection_units.source].x + small_units_distance*Math.cos(rotation*Math.PI/180);
		selection_units.y = nodes[selection_units.source].y + small_units_distance*Math.sin(rotation*Math.PI/180);
	}
	else if(nodes[selected].size == medium) {
		selection_units.x = nodes[selection_units.source].x + medium_units_distance*Math.cos(rotation*Math.PI/180);
		selection_units.y = nodes[selection_units.source].y + medium_units_distance*Math.sin(rotation*Math.PI/180);
	}
	else if(nodes[selected].size == large) {
		selection_units.x = nodes[selection_units.source].x + large_units_distance*Math.cos(rotation*Math.PI/180);
		selection_units.y = nodes[selection_units.source].y + large_units_distance*Math.sin(rotation*Math.PI/180);
	}
	
	// Update the position of the visual
	selection_units.img.x = selection_units.x;
	selection_units.img.y = selection_units.y;
	selection_units.text.x = selection_units.x;
	selection_units.text.y = selection_units.y;
	stage.update();
}

// Class for animation object
var animation_unit = function(movement) {
	this.source = movement.source;
	this.destination = movement.destination;
	this.units = movement.units;
	
	// Calculate rotation
	var rotation;
	if(nodes[this.source].x <= nodes[this.destination].x && nodes[this.source].y <= nodes[this.destination].y) {
		rotation = Math.atan((nodes[this.destination].y - nodes[this.source].y)/(nodes[this.destination].x - nodes[this.source].x))*180/Math.PI;
	}
	else if(nodes[this.source].x <= nodes[this.destination].x && nodes[this.source].y >= nodes[this.destination].y) {
		rotation = -1 * Math.atan((nodes[this.source].y - nodes[this.destination].y)/(nodes[this.destination].x - nodes[this.source].x))*180/Math.PI;
	}
	else if(nodes[this.source].x >= nodes[this.destination].x && nodes[this.source].y <= nodes[this.destination].y) {
		rotation = 90 + Math.atan((nodes[this.source].x - nodes[this.destination].x)/(nodes[this.destination].y - nodes[this.source].y))*180/Math.PI;
	}
	else if(nodes[this.source].x >= nodes[this.destination].x && nodes[this.source].y >= nodes[this.destination].y) {
		rotation = -90 + -1 * Math.atan((nodes[this.source].x - nodes[this.destination].x)/(nodes[this.source].y - nodes[this.destination].y))*180/Math.PI;
	}
	
	// Set start and stop positions
	this.start_x = nodes[this.source].x;
	this.start_y = nodes[this.source].y;
	
	this.end_x = nodes[this.destination].x;
	this.end_y = nodes[this.destination].y;
	
	// Set image based on owner of source planet
	if(nodes[this.source].owner == player && nodes[this.source].visible == true) {
		if(this.units <= 7) {
			this.img = five_units_img.clone();
		}
		else if(this.units > 7 && this.units <= 12) {
			this.img = ten_units_img.clone();
		}
		else if(this.units > 12 && this.units <= 17) {
			this.img = fifteen_units_img.clone();
		}
		else if(this.units > 17 && this.units <= 22) {
			this.img = twenty_units_img.clone();
		}
		else if(this.units > 22 && this.units <= 27) {
			this.img = twentyfive_units_img.clone();
		}
		else if(this.units > 27 && this.units <= 32) {
			this.img = thirty_units_img.clone();
		}
		else if(this.units > 32 && this.units <= 37) {
			this.img = thirtyfive_units_img.clone();
		}
		else if(this.units > 37 && this.units <= 42) {
			this.img = forty_units_img.clone();
		}
		else if(this.units > 42 && this.units <= 47) {
			this.img = forty_units_img.clone();
		}
		else if(this.units > 47) {
			this.img = fortyfive_units_img.clone();
		}
	}
	else {
		if(this.units <= 7) {
			this.img = five_units_opponent_img.clone();
		}
		else if(this.units > 7 && this.units <= 12) {
			this.img = ten_units_opponent_img.clone();
		}
		else if(this.units > 12 && this.units <= 17) {
			this.img = fifteen_units_opponent_img.clone();
		}
		else if(this.units > 17 && this.units <= 22) {
			this.img = twenty_units_opponent_img.clone();
		}
		else if(this.units > 22 && this.units <= 27) {
			this.img = twentyfive_units_opponent_img.clone();
		}
		else if(this.units > 27 && this.units <= 32) {
			this.img = thirty_units_opponent_img.clone();
		}
		else if(this.units > 32 && this.units <= 37) {
			this.img = thirtyfive_units_opponent_img.clone();
		}
		else if(this.units > 37 && this.units <= 42) {
			this.img = forty_units_opponent_img.clone();
		}
		else if(this.units > 42 && this.units <= 47) {
			this.img = forty_units_opponent_img.clone();
		}
		else if(this.units > 47) {
			this.img = fortyfive_units_opponent_img.clone();
		}
		if(nodes[this.source].visible == true) {
			nodes[this.source].update({owner:opponent, units:nodes[this.source].units-this.units, visible:true});
		}
		else {
			nodes[this.source].update({owner:opponent, units:-1, visible:false});
		}
	}
	// Set image location and rotation
	this.img.x = this.start_x;
	this.img.y = this.start_y;
	this.img.regX = this.img.image.width/2;
	this.img.regY = this.img.image.height/2;
	this.img.rotation = rotation;
	
	// Set text, text location
	this.text = new createjs.Text(this.units, units_font, units_font_color);
	this.text.x = this.start_x;
	this.text.regX = this.text.getMeasuredWidth()/2;
	this.text.y = this.start_y;
	this.text.regY = this.text.getMeasuredHeight()/2;
	
	// Set units target, target location
	this.target = units_target_img.clone();
	this.target.x = this.start_x;
	this.target.regX = this.target.image.width/2;
	this.target.y = this.start_y;
	this.target.regY = this.target.image.width/2;
	
	// Add to stage below nodes
	stage.addChildAt(this.img, stage.getChildIndex(nodes[0].img));
	stage.addChildAt(this.text, stage.getChildIndex(nodes[0].img));
	stage.addChildAt(this.target, stage.getChildIndex(nodes[0].img));
}

// Moves the animation object to correct spot for animation time
animation_unit.prototype.animate = function(time) {
	this.img.x = (this.end_x - this.start_x)/500 * time + this.start_x;
	this.img.y = (this.end_y - this.start_y)/500 * time + this.start_y;
	this.text.x = (this.end_x - this.start_x)/500 * time + this.start_x;
	this.text.y = (this.end_y - this.start_y)/500 * time + this.start_y;
	this.target.x = (this.end_x - this.start_x)/500 * time + this.start_x;
	this.target.y = (this.end_y - this.start_y)/500 * time + this.start_y;
}

// Calls animations on an interval
var call_animations = function() {
	for(var i = 0; i < animation_list.length; i++) {
		animation_list[i].animate(animation_time);
	}
	if(animation_time == 100) {
		stage.removeChild(sending);
	}
	else if(animation_time == 200) {
		stage.addChild(sending);
	}
	else if(animation_time == 300) {
		stage.removeChild(sending);
	}
	else if(animation_time == 400) {
		stage.addChild(sending);
	}
	stage.update();
	animation_time++;
	if(animation_time > 500) {
		clearInterval(animation_interval);
		done_animating();
	}
}