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