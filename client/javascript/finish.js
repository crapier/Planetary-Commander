var finish_color = "#00FF00"
var finish_font = "40px Arial";
var finish_font_color = "#000000";

var finish_button = function(x, y){
	this.percent = 50;
	this.shape = new createjs.Shape();
	this.shape.graphics.beginStroke("black").beginFill(finish_color).rect(x, y, 148, 85);
	stage.addChild(this.shape);
	this.text = new createjs.Text("Finish!", finish_font, finish_font_color);
	this.text.x = x + 20;
	this.text.y = y + 20;
	stage.addChild(this.text);
}