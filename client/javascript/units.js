var units = function(source, destination, units) {
	this.source = source;
	this.destination = destination;
	this.units = units;
	
	if(nodes[source].x <= nodes[destination].x) {
		this.x = nodes[source].x + Math.floor((nodes[destination].x - nodes[source].x)/2);
	}
	else {
		this.x = nodes[destination].x + Math.floor((nodes[source].x - nodes[destination].x)/2);
	}
	if(nodes[source].y <= nodes[destination].y) {
		this.y = nodes[source].y + Math.floor((nodes[destination].y - nodes[source].y)/2);
	}
	else {
		this.y = nodes[destination].y + Math.floor((nodes[source].y - nodes[destination].y)/2);
	}
	
	this.img = units_img.clone();
	this.img.x = this.x;
	this.img.regX = this.img.image.width/2;
	this.img.y = this.y;
	this.img.regY = this.img.image.height/2;
	
	if(this.x <= nodes[destination].x && this.y <= nodes[destination].y) {
		this.img.rotation = Math.atan((nodes[destination].y - this.y)/(nodes[destination].x - this.x))*180/Math.PI;
	}
	else if(this.x <= nodes[destination].x && this.y >= nodes[destination].y) {
		this.img.rotation = -1 * Math.atan((this.y - nodes[destination].y)/(nodes[destination].x - this.x))*180/Math.PI;
	}
	else if(this.x >= nodes[destination].x && this.y <= nodes[destination].y) {
		this.img.rotation = 90 + Math.atan((this.x - nodes[destination].x)/(nodes[destination].y - this.y))*180/Math.PI;
	}
	else if(this.x >= nodes[destination].x && this.y >= nodes[destination].y) {
		this.img.rotation = -90 + -1 * Math.atan((this.x - nodes[destination].x)/(this.y - nodes[destination].y))*180/Math.PI;
	}
	
	this.img.units_id = units_list.length;
	
	this.text = new createjs.Text(this.units, units_font, units_font_color);
	this.text.x = this.x;
	this.text.regX = this.text.getMeasuredWidth()/2;
	this.text.y = this.y;
	this.text.regY = this.text.getMeasuredHeight()/2;
	
	stage.addChild(this.img);
	stage.addChild(this.text);
}

var create_selection_units = function(source, units) {
	this.source = source;
	this.units = units;
	this.max = nodes[source].units;
	
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

var units_track_mouse = function(event) {
	var mouse_x = event.clientX;
	var mouse_y = event.clientY;
	
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
	
	selection_units.img.x = selection_units.x;
	selection_units.img.y = selection_units.y;
	selection_units.text.x = selection_units.x;
	selection_units.text.y = selection_units.y;
	stage.update();
}