// Timer instance
var timer = {
	time: 0,
	text: new createjs.Text("0:00", timer_font, timer_font_color),
	started: false
}

// Set up the timer and start it with a certain time
timer.setup = function(time) {
	this.time = time;
	this.started = true;
	this.already_finished = false;
	
	// Create the text for display
	var min = Math.floor(this.time/60);
	var sec = this.time - Math.floor(this.time/60)*60;
	if(sec > 9) {
		this.text.text =  min + ":" + sec;
	}	
	else {
		this.text.text =  min + ":0" + sec;
	}
	
	// Position the timer
	this.text.x = timer_x;
	this.text.y = timer_y;
	
	// Add the timer to the stage
	stage.addChild(this.text);
	stage.update();
	
	// Set the timer to update every second with the interval function
	this.interval = window.setInterval(function(){timer.count_down()}, 1000);
}

// Restart the timer with a certain time
timer.restart = function(time) {
	this.time = time;
	this.already_finished = false;
	
	// Create the text for display
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
	// If the timer is at zero
	if(this.time == 0) {
		// Only called once when the timer first reaches 0
		if(this.already_finished == false) {
			end_turn();
		}
	}
	// If the timer isn't at zero decremnt time and update the tiemr
	else {
		this.time--;
		// Create the new text for display
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