// ----------------
// GLOBAL VARIABLES
// ----------------

// easeljs stage
var stage;
// HTML reference to the stage
var canvas;
// Array of the current nodes on the screen
var nodes = [];
// Array of the current lines on the screen, lines are drawn behind nodes
var lines = [];
// Array of current movements to send to the server on end of turn
var movements = [];
// Array of current units that represent movements on the screen
var units_list = [];
// Current socket.io socket reference
var socket;
// ID of the currently selected node if there is one, -1 if no node is selected
var selected;
// If a node is selected this is the visible reprentation of how many units will be sent
// 		if a destination node is selected, trackes the mouse around selected node
var selection_units;
// The current number of units to send from the selected node, starts at max currently
var units_to_send;
// The time in milliseconds of the current animation if animating
var animation_time;
// List of units to be animating
var animation_list = [];
// Time interval for animations
var animation_interval;

// Counter for instruction pages
var counters = 1;

// Manifest for preloading
var manifest;
// Preloader
var preload;

// ------
// IMAGES
// ------

//These are all preloaded before the game appears on the stage
var start_menu_background;
var game_background;

var play_button_img;
var play_button_hover_img;
var instructions_button_img;
var instructions_button_hover_img;
var finalize_button_img;
var finalize_button_hover_img;
var bgm_mute_img;
var bgm_play_img;
var quit_img;
var quit_hover_img;
var next_button_img;
var next_button_hover_img;
var previous_button_img;
var previous_button_hover_img;

var back_button_img;
var back_button_hover_img;


// The actual buttons to use for the above button images, so that the image can be switched
//		for different states (hover or normal)
var play_button;
var instruction_button;
var finalize_button;
var bgm_button;
var quit_button;
var next_button;
var previous_button;
var back_button;

//pages
var page1,page2,page3,page4,page5,page6,page7,page8,page9,page10,page11,page12;

var small_target_source;
var medium_target_source;
var large_target_source;
var small_target_dest;
var medium_target_dest;
var large_target_dest;
var visible_player_small_node;
var visible_player_medium_node;
var visible_player_large_node;
var visible_opponent_small_node;
var visible_opponent_medium_node;
var visible_opponent_large_node;
var visible_unowned_small_node;
var visible_unowned_medium_node;
var visible_unowned_large_node;
var hidden_unknown_small_node;
var hidden_unknown_medium_node;
var hidden_unknown_large_node;
var hidden_opponent_small_node;
var hidden_opponent_medium_node;
var hidden_opponent_large_node;
var timer_background;
var units_img;
var units_opponent_img;
var five_units_img;
var ten_units_img;
var fifteen_units_img;
var twenty_units_img;
var twentyfive_units_img;
var thirty_units_img;
var thirtyfive_units_img;
var forty_units_img;
var fortyfive_units_img;
var fifty_units_img;
var five_units_opponent_img;
var ten_units_opponent_img;
var fifteen_units_opponent_img;
var twenty_units_opponent_img;
var twentyfive_units_opponent_img;
var thirty_units_opponent_img;
var thirtyfive_units_opponent_img;
var forty_units_opponent_img;
var fortyfive_units_opponent_img;
var fifty_units_opponent_img;
var units_target_img;
var text_thirty_background;
var text_fifty_background;
var text_hundred_background;
var text_hundred_background_red;

// ------
// SOUNDS
// ------

// To be used as the sound instance to play the bgm
var bgm_loop;

// ---------
// CONSTANTS
// ---------

var small = 0;
var medium = 1;
var large = 2;

var small_units_distance = 45;
var medium_units_distance = 50;
var large_units_distance = 70;

var none = 0;
var player = 1;
var opponent = 2;

var node_font = "18px Arial";
var node_font_color = "#FFFFFF";

var units_font = "18px Arial";
var units_font_color = "#FFFFFF";

var timer_font = "50px Arial";
var timer_font_color = "#006cff";
var timer_x = 30;
var timer_y = 625
var time_limit = 180;

var line_color = "#FFFFFF";

// --------
// MESSAGES (easlejs Text)
// --------

var loading_message = new createjs.Text("Loading - 0%", "50px Arial", "#006cff");
loading_message.x = 500;
loading_message.regX = loading_message.getMeasuredWidth()/2;
loading_message.y = 350;
loading_message.regY = loading_message.getMeasuredHeight()/2;
var loading_text_box;

var waiting = new createjs.Text("Waiting for other Player", "30px Arial", "#006cff");
waiting.x = 820;
waiting.regX = waiting.getMeasuredWidth()/2;
waiting.y = 660;
waiting.regY = waiting.getMeasuredHeight()/2;
var waiting_sending_text_box;

var sending = new createjs.Text("Sending units", "30px Arial", "#006cff");
sending.x = 820;
sending.regX = sending.getMeasuredWidth()/2;
sending.y = 660;
sending.regY = sending.getMeasuredHeight()/2;

var win_message = new createjs.Text("VICTORY", "100px Arial", "#006cff");
win_message.x = 500;
win_message.regX = win_message.getMeasuredWidth()/2;
win_message.y = 350;
win_message.regY = win_message.getMeasuredHeight()/2;
var win_message_text_box;

var lose_message = new createjs.Text("DEFEAT", "100px Arial", "#ff0000");
lose_message.x = 500;
lose_message.regX = lose_message.getMeasuredWidth()/2;
lose_message.y = 350;
lose_message.regY = lose_message.getMeasuredHeight()/2;
var win_message_text_box;

var player_match_message = new createjs.Text("Waiting for another Player.", "50px Arial", "#006cff");
player_match_message.x = 500;
player_match_message.regX = player_match_message.getMeasuredWidth()/2;
player_match_message.y = 350;
player_match_message.regY = player_match_message.getMeasuredHeight()/2;
var match_message_text_box;


var original_width;
var original_height;

// Handles resizing the window if the stage is to large
var handle_resize = function(event) {
	var width_scale = window.innerWidth/original_width;
	var height_scale = window.innerHeight/original_height;

	if(window.innerWidth < original_width && window.innerHeight < original_height) {
		if(width_scale < height_scale) {
			stage.scaleX = width_scale;
			stage.scaleY = width_scale;
			
			canvas.width = canvas.width*width_scale;
			canvas.height = canvas.height*width_scale;
		}
		else {
			stage.scaleX = height_scale;
			stage.scaleY = height_scale;
			
			canvas.width = original_width*height_scale;
			canvas.height = original_height*height_scale;
		}
	}
	else if(window.innerWidth < original_width) {
		stage.scaleX = width_scale;
		stage.scaleY = width_scale;
		
		canvas.width = original_width*width_scale;
		canvas.height = original_height*width_scale;
	}
	else if(window.innerHeight < original_height) {
		stage.scaleX = height_scale;
		stage.scaleY = height_scale;
		
		canvas.width = original_width*height_scale;
		canvas.height = original_height*height_scale;
	}
	else if(window.innerWidth > original_width && window.innerHeight > original_height) {
		if(width_scale < height_scale) {
			stage.scaleX = width_scale;
			stage.scaleY = width_scale;
			
			canvas.width = canvas.width*width_scale;
			canvas.height = canvas.height*width_scale;
		}
		else {
			stage.scaleX = height_scale;
			stage.scaleY = height_scale;
			
			canvas.width = original_width*height_scale;
			canvas.height = original_height*height_scale;
		}
	}
	else if(window.innerWidth > original_width) {
		stage.scaleX = width_scale;
		stage.scaleY = width_scale;
		
		canvas.width = original_width*width_scale;
		canvas.height = original_height*width_scale;
	}
	else if(window.innerHeight > original_height) {
		stage.scaleX = height_scale;
		stage.scaleY = height_scale;
		
		canvas.width = original_width*height_scale;
		canvas.height = original_height*height_scale;
	}
	stage.update();
}

var initialize = function() {
	// Get a easlejs reference to the canvas
	stage = new createjs.Stage("pcgame");
	stage.enableMouseOver();
	
	// Diable right clicking
	canvas = document.getElementById("pcgame");
	canvas.oncontextmenu = function() {
		return false;  
	} 
	original_width = canvas.width;
	original_height = canvas.height;
	
	// size the window and then set the listener for resizing
	handle_resize();
	window.onresize = handle_resize;
	
	document.addEventListener("keydown", full_screen_listener);
	
	// Show loading message while preloading
	var black_background = new createjs.Shape();
	black_background.graphics.beginFill("#000000").drawRect(0, 0, 1000, 700);
	stage.addChild(black_background);
	stage.addChild(loading_message);
	stage.update();
	
	// Manifest to load
	manifest = [
		//Images
		{src:"/client/img/start_menu_background.png", id:"bgs"},
		{src:"/client/img/background1.png", id:"bg1"},
		{src:"/client/img/play_button.png", id:"pb"},
		{src:"/client/img/play_button_hover.png", id:"pbh"},
		{src:"/client/img/instructions_button.png", id:"ib"},
		{src:"/client/img/instructions_button_hover.png", id:"ibh"},
		{src:"/client/img/finalize_button.png", id:"fb"},
		{src:"/client/img/finalize_button_hover.png", id:"fbh"},
		{src:"/client/img/next_button.png", id:"nb"},
		{src:"/client/img/next_button_hover.png", id:"nbh"},
		{src:"/client/img/previous_button.png", id:"prb"},
		{src:"/client/img/previous_button_hover.png", id:"prbh"},
		{src:"/client/img/back_button.png", id:"bkb"},
		{src:"/client/img/back_button_hover.png", id:"bkbh"},
		{src:"/client/img/sound_mute.png", id:"sm"},
		{src:"/client/img/sound_high.png", id:"sp"},
		{src:"/client/img/quit.png", id:"q"},
		{src:"/client/img/quit_hover.png", id:"qh"},
		{src:"/client/img/small_target_source.png", id:"sts"},
		{src:"/client/img/medium_target_source.png", id:"mts"},
		{src:"/client/img/large_target_source.png", id:"lts"},
		{src:"/client/img/small_target_dest.png", id:"std"},
		{src:"/client/img/medium_target_dest.png", id:"mtd"},
		{src:"/client/img/large_target_dest.png", id:"ltd"},
		{src:"/client/img/visible_small_player.png", id:"vsp"},
		{src:"/client/img/visible_medium_player.png", id:"vmp"},
		{src:"/client/img/visible_large_player.png", id:"vlp"},
		{src:"/client/img/visible_small_opponent.png", id:"vso"},
		{src:"/client/img/visible_medium_opponent.png", id:"vmo"},
		{src:"/client/img/visible_large_opponent.png", id:"vlo"},
		{src:"/client/img/visible_small_unowned.png", id:"vsu"},
		{src:"/client/img/visible_medium_unowned.png", id:"vmu"},
		{src:"/client/img/visible_large_unowned.png", id:"vlu"},
		{src:"/client/img/hidden_small_unknown.png", id:"hsu"},
		{src:"/client/img/hidden_medium_unknown.png", id:"hmu"},
		{src:"/client/img/hidden_large_unknown.png", id:"hlu"},
		{src:"/client/img/hidden_small_opponent.png", id:"hso"},
		{src:"/client/img/hidden_medium_opponent.png", id:"hmo"},
		{src:"/client/img/hidden_large_opponent.png", id:"hlo"},
		{src:"/client/img/timer_background.png", id:"tb"},
		{src:"/client/img/units.png", id:"u"},
		{src:"/client/img/units_opponent.png", id:"uo"},
		{src:"/client/img/five_units.png", id:"5u"},
		{src:"/client/img/ten_units.png", id:"10u"},
		{src:"/client/img/fifteen_units.png", id:"15u"},
		{src:"/client/img/twenty_units.png", id:"20u"},
		{src:"/client/img/twentyfive_units.png", id:"25u"},
		{src:"/client/img/thirty_units.png", id:"30u"},
		{src:"/client/img/thirtyfive_units.png", id:"35u"},
		{src:"/client/img/forty_units.png", id:"40u"},
		{src:"/client/img/fortyfive_units.png", id:"45u"},
		{src:"/client/img/fifty_units.png", id:"50u"},
		{src:"/client/img/five_units_opponent.png", id:"5uo"},
		{src:"/client/img/ten_units_opponent.png", id:"10uo"},
		{src:"/client/img/fifteen_units_opponent.png", id:"15uo"},
		{src:"/client/img/twenty_units_opponent.png", id:"20uo"},
		{src:"/client/img/twentyfive_units_opponent.png", id:"25uo"},
		{src:"/client/img/thirty_units_opponent.png", id:"30uo"},
		{src:"/client/img/thirtyfive_units_opponent.png", id:"35uo"},
		{src:"/client/img/forty_units_opponent.png", id:"40uo"},
		{src:"/client/img/fortyfive_units_opponent.png", id:"45uo"},
		{src:"/client/img/fifty_units_opponent.png", id:"50uo"},
		{src:"/client/img/units_target.png", id:"ut"},
		{src:"/client/img/text_thirty_background.png", id:"t30"},
		{src:"/client/img/text_fifty_background.png", id:"t50"},
		{src:"/client/img/text_hundred_background.png", id:"t100"},
		{src:"/client/img/text_hundred_background_red.png", id:"t100r"},
		//instruction images
		
		{src:"/client/img/instruction1.png", id:"p1"},
		{src:"/client/img/instruction2.png", id:"p2"},
		{src:"/client/img/instruction3.png", id:"p3"},
		{src:"/client/img/instruction4.png", id:"p4"},
		{src:"/client/img/instruction5.png", id:"p5"},
		{src:"/client/img/instruction6.png", id:"p6"},
		{src:"/client/img/instruction7.png", id:"p7"},
		{src:"/client/img/instruction8.png", id:"p8"},
		{src:"/client/img/instruction9.png", id:"p9"},
		{src:"/client/img/instruction10.png", id:"p10"},
		{src:"/client/img/instruction11.png", id:"p11"},
	
		//Sounds
		{src:"client/sound/button_over.mp3", id:"button_over"},
		{src:"client/sound/button_click.mp3", id:"button_click"},
		{src:"client/sound/planet_select.mp3", id:"source_click"},
		{src:"client/sound/destination_select.mp3", id:"dest_click"},
		{src:"client/sound/planet_deselect.mp3", id:"cancel"},
		{src:"client/sound/bgm1.mp3", id:"bgm1"}
	]
	
	// Preloader
	preload = new createjs.LoadQueue(true);
	preload.installPlugin(createjs.Sound)
	preload.addEventListener("complete", complete_handler);
	preload.addEventListener("progress", progress_handler);
	preload.loadManifest(manifest);
}

// Updates the loading message percentage
var progress_handler = function(event) {
	loading_message.text = "Loading - " + Math.ceil(event.progress*100) + "%";
	loading_message.regX = loading_message.getMeasuredWidth()/2;
	loading_message.regY = loading_message.getMeasuredHeight()/2; 
	stage.update();
}

var complete_handler = function(event) {
	// Assigned loaded images
	start_menu_background = new createjs.Bitmap(preload.getResult("bgs"));
	game_background = new createjs.Bitmap(preload.getResult("bg1"));
	play_button_img = new createjs.Bitmap(preload.getResult("pb"));
	play_button_hover_img = new createjs.Bitmap(preload.getResult("pbh"));
	instructions_button_img = new createjs.Bitmap(preload.getResult("ib"));
	instructions_button_hover_img = new createjs.Bitmap(preload.getResult("ibh"));
	finalize_button_img = new createjs.Bitmap(preload.getResult("fb"));
	finalize_button_hover_img = new createjs.Bitmap(preload.getResult("fbh"));
	next_button_img = new createjs.Bitmap(preload.getResult("nb"));
	next_button_hover_img = new createjs.Bitmap(preload.getResult("nbh"));
	back_button_img= new createjs.Bitmap(preload.getResult("bkb"));
	back_button_hover_img= new createjs.Bitmap(preload.getResult("bkbh"));
	previous_button_img = new createjs.Bitmap(preload.getResult("prb"));
	previous_button_hover_img = new createjs.Bitmap(preload.getResult("prbh"));	
	bgm_mute_img = new createjs.Bitmap(preload.getResult("sm"));
	bgm_play_img = new createjs.Bitmap(preload.getResult("sp"));
	quit_img = new createjs.Bitmap(preload.getResult("q"));
	quit_hover_img = new createjs.Bitmap(preload.getResult("qh"));
	small_target_source = new createjs.Bitmap(preload.getResult("sts"));
	medium_target_source = new createjs.Bitmap(preload.getResult("mts"));
	large_target_source = new createjs.Bitmap(preload.getResult("lts"));
	small_target_dest = new createjs.Bitmap(preload.getResult("std"));
	medium_target_dest = new createjs.Bitmap(preload.getResult("mtd"));
	large_target_dest = new createjs.Bitmap(preload.getResult("ltd"));
	visible_player_small_node = new createjs.Bitmap(preload.getResult("vsp"));
	visible_player_medium_node = new createjs.Bitmap(preload.getResult("vmp"));
	visible_player_large_node = new createjs.Bitmap(preload.getResult("vlp"));
	visible_opponent_small_node = new createjs.Bitmap(preload.getResult("vso"));
	visible_opponent_medium_node = new createjs.Bitmap(preload.getResult("vmo"));
	visible_opponent_large_node = new createjs.Bitmap(preload.getResult("vlo"));
	visible_unowned_small_node = new createjs.Bitmap(preload.getResult("vsu"));
	visible_unowned_medium_node = new createjs.Bitmap(preload.getResult("vmu"));
	visible_unowned_large_node = new createjs.Bitmap(preload.getResult("vlu"));
	hidden_unknown_small_node = new createjs.Bitmap(preload.getResult("hsu"));
	hidden_unknown_medium_node = new createjs.Bitmap(preload.getResult("hmu"));
	hidden_unknown_large_node = new createjs.Bitmap(preload.getResult("hlu"));
	hidden_opponent_small_node = new createjs.Bitmap(preload.getResult("hso"));
	hidden_opponent_medium_node = new createjs.Bitmap(preload.getResult("hmo"));
	hidden_opponent_large_node = new createjs.Bitmap(preload.getResult("hlo"));
	timer_background = new createjs.Bitmap(preload.getResult("tb"));
	units_img = new createjs.Bitmap(preload.getResult("u"));
	units_opponent_img = new createjs.Bitmap(preload.getResult("uo"));
	five_units_img = new createjs.Bitmap(preload.getResult("5u"));
	ten_units_img = new createjs.Bitmap(preload.getResult("10u"));
	fifteen_units_img = new createjs.Bitmap(preload.getResult("15u"));
	twenty_units_img = new createjs.Bitmap(preload.getResult("20u"));
	twentyfive_units_img = new createjs.Bitmap(preload.getResult("25u"));
	thirty_units_img = new createjs.Bitmap(preload.getResult("30u"));
	thirtyfive_units_img = new createjs.Bitmap(preload.getResult("35u"));
	forty_units_img = new createjs.Bitmap(preload.getResult("40u"));
	fortyfive_units_img = new createjs.Bitmap(preload.getResult("45u"));
	fifty_units_img = new createjs.Bitmap(preload.getResult("50u"));
	five_units_opponent_img = new createjs.Bitmap(preload.getResult("5uo"));
	ten_units_opponent_img = new createjs.Bitmap(preload.getResult("10uo"));
	fifteen_units_opponent_img = new createjs.Bitmap(preload.getResult("15uo"));
	twenty_units_opponent_img = new createjs.Bitmap(preload.getResult("20uo"));
	twentyfive_units_opponent_img = new createjs.Bitmap(preload.getResult("25uo"));
	thirty_units_opponent_img = new createjs.Bitmap(preload.getResult("30uo"));
	thirtyfive_units_opponent_img = new createjs.Bitmap(preload.getResult("35uo"));
	forty_units_opponent_img = new createjs.Bitmap(preload.getResult("40uo"));
	fortyfive_units_opponent_img = new createjs.Bitmap(preload.getResult("45uo"));
	fifty_units_opponent_img = new createjs.Bitmap(preload.getResult("50uo"));
	units_target_img = new createjs.Bitmap(preload.getResult("ut"));
	text_thirty_background = new createjs.Bitmap(preload.getResult("t30"));
	text_fifty_background = new createjs.Bitmap(preload.getResult("t50"));
	text_hundred_background = new createjs.Bitmap(preload.getResult("t100"));
	text_hundred_background_red = new createjs.Bitmap(preload.getResult("t100r"));
	//pages
	
	page1= new createjs.Bitmap(preload.getResult("p1"));
	page2= new createjs.Bitmap(preload.getResult("p2"));
	page3= new createjs.Bitmap(preload.getResult("p3"));
	page4= new createjs.Bitmap(preload.getResult("p4"));
	page5= new createjs.Bitmap(preload.getResult("p5"));
	page6= new createjs.Bitmap(preload.getResult("p6"));
	page7= new createjs.Bitmap(preload.getResult("p7"));
	page8= new createjs.Bitmap(preload.getResult("p8"));
	page9= new createjs.Bitmap(preload.getResult("p9"));
	page10= new createjs.Bitmap(preload.getResult("p10"));
	page11= new createjs.Bitmap(preload.getResult("p11"));
	page12= new createjs.Bitmap(preload.getResult("p12"));
	
	// Clear the screen
	stage.removeAllChildren();
	stage.update();
	
	// Show the start menu
	start_menu();
}

// Shows the main menu
var start_menu = function() {
	// Prepare message boxes
	waiting_sending_text_box = text_thirty_background.clone();
	waiting_sending_text_box.x = waiting.x - 5;
	waiting_sending_text_box.regX = waiting_sending_text_box.image.width/2;
	waiting_sending_text_box.y = waiting.y + 2;
	waiting_sending_text_box.regY = waiting_sending_text_box.image.height/2;
	
	win_message_text_box = text_hundred_background.clone();
	win_message_text_box.x = win_message.x;
	win_message_text_box.regX = win_message_text_box.image.width/2;
	win_message_text_box.y = win_message.y + 2;
	win_message_text_box.regY = win_message_text_box.image.height/2;
	
	lose_message_text_box = text_hundred_background_red.clone();
	lose_message_text_box.x = win_message.x;
	lose_message_text_box.regX = lose_message_text_box.image.width/2;
	lose_message_text_box.y = win_message.y + 2;
	lose_message_text_box.regY = lose_message_text_box.image.height/2;
	
	match_message_text_box = text_fifty_background.clone();
	match_message_text_box.x = player_match_message.x;
	match_message_text_box.regX = match_message_text_box.image.width/2;
	match_message_text_box.y = player_match_message.y + 2;
	match_message_text_box.regY = match_message_text_box.image.height/2;

	// Prepare all the button instances
	play_button = play_button_img.clone();
	instructions_button = instructions_button_img.clone();
	finalize_button = finalize_button_img.clone();
	next_button = next_button_img.clone();
	previous_button= previous_button_img.clone();
	back_button = back_button_img.clone();
	bgm_button = bgm_play_img.clone();
	bgm_button.playing = true;
	quit_button = quit_img.clone();
	
	play_button.x = 500;
	play_button.regX = play_button.image.width/2;
	play_button.y = 300;
	play_button.regY = play_button.image.height/2;
	
	instructions_button.x = 500;
	instructions_button.regX = instructions_button.image.width/2;
	instructions_button.y = 350;
	instructions_button.regY = instructions_button.image.height/2;
	
	finalize_button.x = 890;
	finalize_button.regX = finalize_button.image.width/2;
	finalize_button.y = 670;
	finalize_button.regY = finalize_button.image.height/2;
	
	next_button.x = 890;
	next_button.regX = next_button.image.width/2;
	next_button.y = 670;
	next_button.regY = next_button.image.height/2;
	
	previous_button.x = 150;
	previous_button.regX = previous_button.image.width/2;
	previous_button.y = 670;
	previous_button.regY = previous_button.image.height/2;
	
	
	back_button.x = 510;
	back_button.regX = back_button.image.width/2;
	back_button.y = 670;
	back_button.regY = back_button.image.height/2;


	bgm_button.x = 980;
	bgm_button.regX = bgm_button.image.width/2;
	bgm_button.y = 20;
	bgm_button.regY = bgm_button.image.height/2;
	// Add a hit box for the sound button
	var hit_box = new createjs.Shape();
	hit_box.graphics.beginFill("#000000").drawRect(0,0,bgm_button.image.width, bgm_button.image.height);
	bgm_button.hitArea = hit_box;
	
	quit_button.x = 25;
	quit_button.regX = quit_button.image.width/2;
	quit_button.y = 25;
	quit_button.regY = quit_button.image.height/2;
	var hit_circle = new createjs.Shape();
	hit_circle.graphics.beginFill("#000000").drawRect(0,0, quit_button.image.width, quit_button.image.height);
	quit_button.hitArea = hit_circle;

	// Add and show the main menu to the stage
	stage.addChild(start_menu_background);
	stage.addChild(play_button);
	stage.addChild(instructions_button);
	stage.addChild(bgm_button);
	stage.update();
	
	// Add appropriate listeners for the buttons
	play_button.addEventListener("mouseover", play_button_listener);
	play_button.addEventListener("click", play_button_listener);
	play_button.addEventListener("mouseout", play_button_listener);
	instructions_button.addEventListener("mouseover", instruction_button_listener);
	instructions_button.addEventListener("click", instruction_button_listener);
	instructions_button.addEventListener("mouseout", instruction_button_listener);
	bgm_button.addEventListener("click", bgm_control);
	quit_button.addEventListener("mouseover", quit_button_listener);
	quit_button.addEventListener("click", quit_button_listener);
	quit_button.addEventListener("mouseout", quit_button_listener);
	finalize_button.addEventListener("mouseover", finish_click_listener);
	finalize_button.addEventListener("click", finish_click_listener);
	finalize_button.addEventListener("mouseout", finish_click_listener);
	
	next_button.addEventListener("mouseover", next_click_listener);
	next_button.addEventListener("click", next_click_listener);
	next_button.addEventListener("mouseout", next_click_listener);
	
	previous_button.addEventListener("mouseover", previous_click_listener);
	previous_button.addEventListener("click", previous_click_listener);
	previous_button.addEventListener("mouseout", previous_click_listener);
	
	back_button.addEventListener("mouseover", back_click_listener);
	back_button.addEventListener("click", back_click_listener);
	back_button.addEventListener("mouseout", back_click_listener);
	// Try to begin playing the bgm music
	bgm_loop = createjs.Sound.play("bgm1", {loop:-1});
	// Set the volume of the bgm music
	bgm_loop.volume = 0.1;
}

// Returns to the main menu without unecessary recreation of buttons, sound, etc.
var return_to_menu = function() {
	// Add back just the menu
	stage.removeAllChildren();
	stage.addChild(start_menu_background);
	stage.addChild(play_button);
	// Move play button back to right spot
	play_button.x = 500;
	play_button.y = 300;
	stage.addChild(instructions_button);
	stage.addChild(bgm_button);
	stage.update();
	
	// Reset game variables
	selection_units = null;
	selected = -1;
	
	// Disconnect from the server if connected
	if(socket) {
		socket.disconnect();
	}
}

// check next image for instruction
var check_next = function(){
	stage.removeAllChildren();
	//stage.addChild(game_background);
	stage.addChild(bgm_button);
	stage.update();
	if(counters==1){
		stage.addChild(page1);
		stage.addChild(next_button);
		stage.addChild(back_button);
		next_button.image = next_button_img.image;
	
	}
	else if(counters == 2){
		stage.addChild(page2);
		stage.addChild(next_button);
		stage.addChild(previous_button);
		stage.addChild(back_button);
		next_button.image = next_button_img.image;
		previous_button.image= previous_button.image;
	}	
	else if(counters ==3){
		stage.addChild(page3);
		stage.addChild(next_button);
		stage.addChild(previous_button);
		stage.addChild(back_button);
		next_button.image = next_button_img.image;
		previous_button.image= previous_button.image;
	
	}
	else if(counters ==4){
		stage.addChild(page4);
		stage.addChild(next_button);
		stage.addChild(previous_button);
		stage.addChild(back_button);
		next_button.image = next_button_img.image;
		previous_button.image= previous_button.image;
	
	}
	else if(counters ==5){
		stage.addChild(page5);
		stage.addChild(next_button);
		stage.addChild(previous_button);
		stage.addChild(back_button);
		next_button.image = next_button_img.image;
		previous_button.image= previous_button.image;
	}
	else if(counters ==6){
		stage.addChild(page6);
		stage.addChild(next_button);
		stage.addChild(previous_button);
		stage.addChild(back_button);
		next_button.image = next_button_img.image;
		previous_button.image= previous_button.image;
	}
	else if(counters ==7){
		stage.addChild(page7);
		stage.addChild(next_button);
		stage.addChild(previous_button);
		stage.addChild(back_button);
		next_button.image = next_button_img.image;
		previous_button.image= previous_button.image;
	}
	else if(counters ==8){
		stage.addChild(page8);
		stage.addChild(next_button);
		stage.addChild(previous_button);
		stage.addChild(back_button);
		next_button.image = next_button_img.image;
		previous_button.image= previous_button.image;
	}
	else if(counters ==9){
		stage.addChild(page9);
		stage.addChild(next_button);
		stage.addChild(previous_button);
		stage.addChild(back_button);
		next_button.image = next_button_img.image;
		previous_button.image= previous_button.image;
	}
	else if(counters ==10){
		stage.addChild(page10);
		stage.addChild(next_button);
		stage.addChild(previous_button);
		stage.addChild(back_button);
		next_button.image = next_button_img.image;
		previous_button.image= previous_button.image;
		
	}
	else if(counters ==11){
		stage.addChild(page11);
		stage.addChild(previous_button);
		stage.addChild(back_button);
		previous_button.image= previous_button.image;
	}
	stage.update();
	
}

var start_instruction = function(){

	stage.removeAllChildren();
	stage.addChild(page1);

	stage.addChild(bgm_button);
	stage.addChild(next_button);
	stage.addChild(back_button);

	back_button.image= back_button_img.image;
	next_button.image = next_button_img.image;
	stage.update();

}

// Called by hitting the play button
var start_game = function() {
	// Clear the stage
	stage.removeAllChildren();
	
	// Add the background for gameplay
	stage.addChild(game_background);
	
	// Add the quit button
	stage.addChild(quit_button);
	
	// Add back the music button
	stage.addChild(bgm_button);
	
	// Clear the nodes and lines
	nodes = [];
	
	lines = [];
	
	// Add the waiting for other player message
	stage.addChild(player_match_message);
	stage.addChild(match_message_text_box);
	
	stage.update();
	
	// Connect to the server, forces new connection
	socket = io.connect('http://' + document.location.host, {'force new connection':true});
	// Wait for the server to send which map is being played this game
	socket.on("map_select", draw_map);
	
	// Add listeners for keyboard and mousewheel events, used to control units being sent
	document.addEventListener("keydown", key_listener);
	var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
	document.addEventListener(mousewheelevt, wheel_listener);
}

// Creates lines based on the current nodes
var create_lines = function() {
	// Index to edit and create the new line in the lines array
	index = 0;
	// Go through all the nodes and draw lines to any adjacent nodes
	for(var i = 0; i < nodes.length; i++) {
		// Go through the adjacent nodes
		for(var j = 0; j < nodes[i].adjacent.length; j++) {
			// Only need to draw a line if the node ID is greater than current
			//		to prevent repeate lines
			if(nodes[i].adjacent[j] > i) {
				lines.push(new createjs.Shape());
				lines[index].graphics.setStrokeStyle(1).beginStroke(line_color).moveTo(nodes[i].x, nodes[i].y).lineTo(nodes[nodes[i].adjacent[j]].x, nodes[nodes[i].adjacent[j]].y).endStroke();
				stage.addChildAt(lines[index], 1);
				index++;
			}
		}
	}
	
}

// Draws the map element for a certain map id from the sever
var draw_map = function(map_id) {
	// Remove matchmaking message
	stage.removeChild(player_match_message);
	stage.removeChild(match_message_text_box);
	
	// Draw appropriate nodes for map id
	create_nodes[map_id]();
	// Draw the lines for the nodes
	create_lines();
	
	// Stop the timer
	if(timer.started) {
		timer.started = false;
		window.clearInterval(timer.interval);
	}
	
	// Add listeners for updates and results messages from the server for this match
	socket.on("animations", animation_handler);
	socket.on("updates", update_handler);
	socket.on("results", result_handler);
}

// Array of different nodes for map creation
var create_nodes = []

// ----
// MAPS
// ----
// Each of the following creates a different map

create_nodes.push (function() {
	nodes.push(new node(large, 200, 150, [4, 6, 8, 14, 15]));
	nodes.push(new node(large, 850, 190, [5, 7, 10, 18, 22]));
	nodes.push(new node(large, 470, 550, [9, 11, 12, 20, 23]));
	nodes.push(new node(large, 490, 300, [6, 7, 9, 16, 17, 21]));
	nodes.push(new node(medium, 450, 100, [0, 13]));
	nodes.push(new node(medium, 700, 80, [1, 13]));
	nodes.push(new node(medium, 350, 220, [0, 3]));
	nodes.push(new node(medium, 650, 270, [1, 3]));
	nodes.push(new node(medium, 140, 340, [0, 19]));
	nodes.push(new node(medium, 420, 390, [2, 3]));
	nodes.push(new node(medium, 930, 360, [1, 24]));
	nodes.push(new node(medium, 280, 540, [2, 19]));
	nodes.push(new node(medium, 680, 520, [2, 24]));
	nodes.push(new node(small, 580, 70, [4, 5]));
	nodes.push(new node(small, 460, 150, [0, 17, 18]));
	nodes.push(new node(small, 230, 230, [0, 16, 20]));
	nodes.push(new node(small, 370, 270, [3, 15, 20]));
	nodes.push(new node(small, 460, 240, [3, 14, 18]));
	nodes.push(new node(small, 620, 210, [1, 14, 17]));
	nodes.push(new node(small, 240, 430, [8, 11]));
	nodes.push(new node(small, 370, 410, [2, 15, 16]));
	nodes.push(new node(small, 540, 350, [3, 22, 23]));
	nodes.push(new node(small, 660, 320, [1, 21, 23]));
	nodes.push(new node(small, 620, 500, [2, 21, 22]));
	nodes.push(new node(small, 820, 460, [10, 12]));
})

create_nodes.push (function() {
	nodes.push(new node(large, 200, 150, [3, 5]));
	nodes.push(new node(large, 850, 190, [3, 4]));
	nodes.push(new node(large, 470, 550, [4, 5]));
	nodes.push(new node(medium, 540, 100, [0, 1, 6]));
	nodes.push(new node(medium, 700, 400, [1, 2, 7]));
	nodes.push(new node(medium, 260, 380, [0, 2, 8]));
	nodes.push(new node(small, 500, 230, [3, 7, 8]));
	nodes.push(new node(small, 560, 320, [4, 6, 8]));
	nodes.push(new node(small, 400, 300, [5, 6, 7]));
})

create_nodes.push (function() {
	nodes.push(new node(large, 52, 57, [11, 18]));
	nodes.push(new node(large, 51, 586, [10, 21]));
	nodes.push(new node(large, 941, 596, [9, 20]));
	nodes.push(new node(large, 936, 54, [8, 19]));
	nodes.push(new node(large, 465, 146, [32, 33, 30]));
	nodes.push(new node(large, 482, 522, [35, 34, 31]));
	nodes.push(new node(large, 237, 306, [14, 32, 35, 37, 38]));
	nodes.push(new node(large, 690, 316, [17, 33, 34, 39, 40]));
	nodes.push(new node(medium, 821, 138, [3, 15, 40]));
	nodes.push(new node(medium, 803, 479, [2, 16, 39]));
	nodes.push(new node(medium, 186, 462, [1, 13, 38]));
	nodes.push(new node(medium, 159, 169, [0, 12, 37]));
	nodes.push(new node(small, 84, 252, [11, 14]));
	nodes.push(new node(small, 85, 392, [10, 14]));
	nodes.push(new node(medium, 150, 312, [12, 13, 6]));
	nodes.push(new node(small, 901, 241, [17, 8]));
	nodes.push(new node(small, 890, 388, [17, 9]));
	nodes.push(new node(medium, 815, 322, [7, 16, 15]));
	nodes.push(new node(medium, 232, 31, [0, 22]));
	nodes.push(new node(medium, 726, 23, [3, 23]));
	nodes.push(new node(medium, 702, 620, [2, 24]));
	nodes.push(new node(medium, 218, 618, [1, 25]));
	nodes.push(new node(small, 263, 121, [18, 26, 37]));
	nodes.push(new node(small, 714, 121, [19, 27, 40]));
	nodes.push(new node(small, 658, 535, [20, 28, 39]));
	nodes.push(new node(small, 293, 543, [21, 29, 38]));
	nodes.push(new node(small, 363, 70, [22, 30]));
	nodes.push(new node(small, 621, 74, [23, 30]));
	nodes.push(new node(small, 582, 590, [24, 31]));
	nodes.push(new node(small, 359, 591, [25, 31]));
	nodes.push(new node(medium, 477, 33, [27, 26, 4]));
	nodes.push(new node(medium, 483, 656, [28, 29, 5]));
	nodes.push(new node(medium, 390, 253, [6, 4, 36]));
	nodes.push(new node(medium, 547, 264, [4, 7, 36]));
	nodes.push(new node(medium, 533, 394, [7, 5, 36]));
	nodes.push(new node(medium, 393, 380, [6, 5, 36]));
	nodes.push(new node(large, 471, 319, [32, 35, 34, 33]));
	nodes.push(new node(medium, 285, 201, [11, 22, 6]));
	nodes.push(new node(medium, 299, 436, [10, 25, 6]));
	nodes.push(new node(medium, 688, 419, [9, 24, 7]));
	nodes.push(new node(medium, 757, 209, [8, 23, 7]));
})

create_nodes.push (function() {
	nodes.push(new node(large, 206, 181, [5, 7, 29]));
	nodes.push(new node(large, 870, 126, [4, 8, 23]));
	nodes.push(new node(large, 546, 525, [3, 6, 28]));
	nodes.push(new node(small, 474, 569, [2, 19]));
	nodes.push(new node(small, 794, 113, [1, 31]));
	nodes.push(new node(small, 287, 144, [0, 21]));
	nodes.push(new node(medium, 566, 427, [2, 10]));
	nodes.push(new node(medium, 186, 285, [0, 9]));
	nodes.push(new node(medium, 852, 186, [1, 11]));
	nodes.push(new node(small, 225, 299, [7, 18]));
	nodes.push(new node(small, 610, 427, [6, 16]));
	nodes.push(new node(small, 792, 188, [8, 17]));
	nodes.push(new node(medium, 515, 270, [13, 15, 14, 26, 27]));
	nodes.push(new node(small, 551, 227, [12, 17, 22]));
	nodes.push(new node(small, 444, 287, [12, 18, 20]));
	nodes.push(new node(small, 583, 309, [12, 16, 25]));
	nodes.push(new node(small, 658, 364, [15, 10]));
	nodes.push(new node(small, 682, 227, [13, 11]));
	nodes.push(new node(small, 317, 323, [9, 14]));
	nodes.push(new node(medium, 408, 415, [3, 20]));
	nodes.push(new node(medium, 459, 352, [19, 14, 32]));
	nodes.push(new node(medium, 369, 144, [5, 22]));
	nodes.push(new node(medium, 523, 149, [21, 13, 31]));
	nodes.push(new node(small, 924, 184, [24, 1]));
	nodes.push(new node(medium, 859, 271, [25, 23]));
	nodes.push(new node(medium, 720, 292, [15, 24, 30]));
	nodes.push(new node(large, 385, 220, [12]));
	nodes.push(new node(large, 529, 362, [12]));
	nodes.push(new node(small, 627, 570, [2, 30]));
	nodes.push(new node(small, 172, 100, [0, 32]));
	nodes.push(new node(small, 741, 442, [28, 25]));
	nodes.push(new node(small, 627, 70, [22, 4]));
	nodes.push(new node(small, 134, 386, [29, 20]));
})

create_nodes.push (function() {
	nodes.push(new node(large, 64, 77, [18, 17]));
	nodes.push(new node(large, 146, 539, [15, 16]));
	nodes.push(new node(large, 895, 49, [19, 22]));
	nodes.push(new node(large, 896, 550, [20, 21]));
	nodes.push(new node(large, 495, 306, [12, 9, 10, 5, 11]));
	nodes.push(new node(large, 552, 124, [4, 10, 11, 14, 32, 31]));
	nodes.push(new node(large, 667, 456, [9, 10, 23, 26, 25]));
	nodes.push(new node(large, 269, 243, [12, 11, 24, 28, 27]));
	nodes.push(new node(large, 390, 493, [12, 9, 13, 29, 30]));
	nodes.push(new node(medium, 518, 435, [4, 8, 6]));
	nodes.push(new node(medium, 622, 272, [6, 4, 5]));
	nodes.push(new node(medium, 344, 226, [5, 4, 7]));
	nodes.push(new node(medium, 381, 340, [8, 4, 7]));
	nodes.push(new node(medium, 379, 571, [8, 16]));
	nodes.push(new node(medium, 612, 83, [5, 35, 40]));
	nodes.push(new node(medium, 148, 457, [1, 29]));
	nodes.push(new node(medium, 226, 584, [1, 13]));
	nodes.push(new node(medium, 53, 145, [0, 27]));
	nodes.push(new node(medium, 192, 39, [0, 28]));
	nodes.push(new node(medium, 799, 44, [2, 31]));
	nodes.push(new node(medium, 874, 458, [3, 23]));
	nodes.push(new node(medium, 827, 576, [3, 26]));
	nodes.push(new node(medium, 884, 121, [2, 32]));
	nodes.push(new node(medium, 733, 402, [6, 20]));
	nodes.push(new node(medium, 208, 201, [7, 39, 36]));
	nodes.push(new node(medium, 739, 487, [6, 38, 34]));
	nodes.push(new node(medium, 588, 541, [6, 21]));
	nodes.push(new node(medium, 219, 324, [7, 17]));
	nodes.push(new node(medium, 305, 164, [7, 18]));
	nodes.push(new node(medium, 312, 473, [15, 8]));
	nodes.push(new node(medium, 318, 538, [8, 37, 33]));
	nodes.push(new node(medium, 587, 24, [5, 19]));
	nodes.push(new node(medium, 630, 179, [5, 22]));
	nodes.push(new node(small, 226, 436, [36, 30]));
	nodes.push(new node(small, 798, 383, [25, 35]));
	nodes.push(new node(small, 729, 204, [34, 14]));
	nodes.push(new node(small, 137, 282, [24, 33]));
	nodes.push(new node(small, 343, 626, [30, 38]));
	nodes.push(new node(small, 656, 591, [37, 25]));
	nodes.push(new node(small, 292, 79, [40, 24]));
	nodes.push(new node(small, 516, 57, [14, 39]));
})

// ^^^^^^^^^^^^^^
// NEW MAPS ABOVE
// --------------