var node = function(size, x, y, adjacent) {
	this.units = -1;
	this.owner = none;
	this.adjacent = adjacent;
	this.visible = false;
	this.size = size;
	this.x = x;
	this.y = y;
	this.targeted_source = false;
	this.targeted_dest = false;
	
	switch(this.size) {
		case small:
			this.img = hidden_unknown_small_node.clone();
			this.target_source = small_target_source.clone();
			this.target_dest = small_target_source.clone();
			break;
		case medium:
			this.img = hidden_unknown_medium_node.clone();
			this.target_source = medium_target_source.clone();
			this.target_dest = medium_target_source.clone();
			break;
		case large:
			this.img = hidden_unknown_large_node.clone();		
			this.target_source = large_target_source.clone();
			this.target_dest = large_target_source.clone();
			break;
		default:
	}
	this.img.x = this.x;
	this.img.regX = this.img.image.width/2;
	this.img.y = this.y;
	this.img.regY = this.img.image.width/2;
	stage.addChild(this.img);
	
	this.target_source.x = this.x;
	this.target_source.regX = this.target_source.image.width/2;
	this.target_source.y = this.y;
	this.target_source.regY = this.target_source.image.width/2;
	
	this.target_dest.x = this.x;
	this.target_dest.regX = this.target_dest.image.width/2;
	this.target_dest.y = this.y;
	this.target_dest.regY = this.target_dest.image.width/2;
	
	this.img.node_id = nodes.length;
	
	this.text = new createjs.Text(this.units, node_font, node_font_color);
	this.text.x = this.x;
	this.text.regX = this.text.getMeasuredWidth()/2;
	this.text.y = this.y;
	this.text.regY = this.text.getMeasuredHeight()/2;
}

node.prototype.show_target_source = function() {
	if(this.targeted_source == false) {
		this.targeted_source = true;
		stage.addChildAt(this.target_source, stage.getChildIndex(this.img));
	}
}

node.prototype.hide_target_source = function() {
	if(this.targeted_source == true) {
		this.targeted_source = false;
		stage.removeChild(this.target_source);
	}
}

node.prototype.show_target_dest = function() {
	if(this.targeted_dest == false) {
		this.targeted_dest = true;
		stage.addChildAt(this.target_dest, stage.getChildIndex(this.img));
	}
}

node.prototype.hide_target_dest = function() {
	if(this.targeted_dest == true) {
		this.targeted_dest = false;
		stage.removeChild(this.target_dest);
	}
}

node.prototype.update = function(update) {
	if(update.owner != -1) {
		this.owner = update.owner;
	}
	if(update.units != -1) {
		this.units = update.units;
	}
	
	this.text.text = this.units;
	this.text.x = this.x;
	this.text.regX = this.text.getMeasuredWidth()/2;
	this.text.y = this.y;
	this.text.regY = this.text.getMeasuredHeight()/2;
	
	this.visible = update.visible;
	if(this.visible == false) {
		stage.removeChild(this.text);
		switch(this.owner) {
			case none:
				switch(this.size) {
					case small:
						this.img.image = hidden_unknown_small_node.image;
						break;
					case medium:
						this.img.image = hidden_unknown_medium_node.image;
						break;
					case large:
						this.img.image = hidden_unknown_large_node.image;
						break;
					default:
				}
				break;
			case player:
				switch(this.size) {
					case small:
						this.img.image = hidden_opponent_small_node.image;
						break;
					case medium:
						this.img.image = hidden_opponent_medium_node.image;
						break;
					case large:
						this.img.image = hidden_opponent_large_node.image;
						break;
					default:
				}
				break;
			case opponent:
				switch(this.size) {
					case small:
						this.img.image = hidden_opponent_small_node.image;
						break;
					case medium:
						this.img.image = hidden_opponent_medium_node.image;
						break;
					case large:
						this.img.image = hidden_opponent_large_node.image;
						break;
					default:
				}
				break;
			default:
		}
	}
	else if(this.visible == true) {
		stage.addChild(this.text);
		switch(this.owner) {
			case none:
				switch(this.size) {
					case small:
						this.img.image = visible_unowned_small_node.image;
						break;
					case medium:
						this.img.image = visible_unowned_medium_node.image;
						break;
					case large:
						this.img.image = visible_unowned_large_node.image;
						break;
					default:
				}
				break;
			case player:
				switch(this.size) {
					case small:
						this.img.image = visible_player_small_node.image;
						break;
					case medium:
						this.img.image = visible_player_medium_node.image;
						break;
					case large:
						this.img.image = visible_player_large_node.image;
						break;
					default:
				}
				break;
			case opponent:
				switch(this.size) {
					case small:
						this.img.image = visible_opponent_small_node.image;
						break;
					case medium:
						this.img.image = visible_opponent_medium_node.image;
						break;
					case large:
						this.img.image = visible_opponent_large_node.image;
						break;
					default:
				}
				break;
			default:
		}
	}
}
