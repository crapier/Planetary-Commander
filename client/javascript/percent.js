var percent_display = function(start, x, y){
	this.percent = start;
	this.text = new createjs.Text(this.percent + "%", percent_font, percent_font_color);
	this.text.x = x;
	this.text.y = y;
	stage.addChild(this.text);
}

percent_display.prototype.update = function(update) {
	this.percent = update;
	this.text.text = this.percent + "%";
}