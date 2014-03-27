var node = function(size, x, y, adjacent) {
	this.units = -1;
	this.owner = none;
	this.adjacent = adjacent;
	this.visible = false;
	this.size = size;
	this.x = x;
	this.y = y;
	
	if(x >= 0 && y >= 0) { 
		this.shape = new createjs.Shape();
		this.shape.node_id = nodes.length;
		switch(size) {
			case small:
				this.shape.graphics.beginFill(hidden_none).drawCircle(x, y, small);
				stage.addChild(this.shape);
				break;
			case medium:
				this.shape.graphics.beginFill(hidden_none).drawCircle(x, y, medium);
				stage.addChild(this.shape);
				break;
			case large:
				this.shape.graphics.beginFill(hidden_none).drawCircle(x, y, large);
				stage.addChild(this.shape);
				break;
			default:
		}
		this.text = new createjs.Text(this.units, node_font, node_font_color);
		this.text.x = x - this.text.getMeasuredWidth()/2;
		this.text.y = y - this.text.getMeasuredHeight()/2;
	}
}

node.prototype.update = function(update) {
	if(update.owner != -1) {
		this.owner = update.owner;
	}
	if(update.owner != -1) {
		this.units = update.units;
	}
	
	this.text.text = this.units;
	
	this.visible = update.visible;
	if(this.visible == false) {
		stage.removeChild(this.text);
		switch(this.owner) {
			case none:
				this.shape.graphics.clear().beginFill(hidden_none).drawCircle(this.x, this.y, this.size);
				break;
			case player:
				this.shape.graphics.clear().beginFill(hidden_player).drawCircle(this.x, this.y, this.size);
				break;
			case opponent:
				this.shape.graphics.clear().beginFill(hidden_opponent).drawCircle(this.x, this.y, this.size);
				break;
			default:
		}
	}
	else if(this.visible == true) {
		stage.addChild(this.text);
		switch(this.owner) {
			case none:
				this.shape.graphics.clear().beginFill(visible_none).drawCircle(this.x, this.y, this.size);
				break;
			case player:
				this.shape.graphics.clear().beginFill(visible_player).drawCircle(this.x, this.y, this.size);
				break;
			case opponent:
				this.shape.graphics.clear().beginFill(visible_opponent).drawCircle(this.x, this.y, this.size);
				break;
			default:
		}
	}
}
