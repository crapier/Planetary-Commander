var timer = {
	time: 0,
	text: new createjs.Text("0:00", timer_font, timer_font_color),
	started: false
}

timer.setup = function(time) {
	this.time = time;
	this.started = true;
	this.already_finished = false;
	
	var min = Math.floor(this.time/60);
	var sec = this.time - Math.floor(this.time/60)*60;
	if(sec > 9) {
		this.text.text =  min + ":" + sec;
	}	
	else {
		this.text.text =  min + ":0" + sec;
	}
	
	this.text.x = timer_x;
	this.text.y = timer_y;
	
	stage.addChild(this.text);
	stage.update();
	this.interval = window.setInterval(function(){timer.count_down()}, 1000);
}

timer.restart = function(time) {
	this.time = time;
	this.already_finished = false;
	var min = Math.floor(this.time/60);
	var sec = this.time - Math.floor(this.time/60)*60;
	if(sec > 9) {
		this.text.text =  min + ":" + sec;
	}	
	else {
		this.text.text =  min + ":0" + sec;
	}
	stage.update();
}

timer.count_down = function() {
	if(this.time == 0) {
		if(this.already_finished == false) {
			end_turn();
		}
	}
	else {
		this.time--;
		var min = Math.floor(this.time/60);
		var sec = this.time - Math.floor(this.time/60)*60;
		if(sec > 9) {
			this.text.text =  min + ":" + sec;
		}	
		else {
			this.text.text =  min + ":0" + sec;
		}
		stage.update();
	}
}