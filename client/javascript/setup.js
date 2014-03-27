var stage;
var nodes = [];
var movements = [];
var percent;
var finish;
var socket;
var selected
var client_id;

var large = 40;
var medium = 20;
var small = 13;

var none = 0;
var player = 1;
var opponent = 2;

var visible_player = "#0000FF";;
var visible_opponent = "#FF0000";
var visible_none = "#808080";
var hidden_player = "#6666FF";;
var hidden_opponent = "#FF6666";
var hidden_none = "#A6A6A6";

var node_font = "20px Arial";
var node_font_color = "#000000";

var percent_font = "50px Arial";
var percent_font_color = "#000000";

function initialize() {
	stage = new createjs.Stage("pcgame");
	create_nodes();
	create_lines();
	percent = new percent_display(50, 10, 740);
	finish = new finish_button(845, 710);
	stage.update();
	
	socket = io.connect('http://' + document.location.host);
	socket.on("updates", update_handler);
	socket.on("results", result_handler);
	socket.on("client_id", set_client_id);
}

function create_lines() {
	for(var i = 0; i < nodes.length; i++) {
		for(var j = 0; j < nodes[i].adjacent.length; j++) {
			if(nodes[i].adjacent[j] > i) {
				var line = new createjs.Shape();
				line.graphics.setStrokeStyle(1).beginStroke("black").moveTo(nodes[i].x, nodes[i].y).lineTo(nodes[nodes[i].adjacent[j]].x, nodes[nodes[i].adjacent[j]].y).endStroke();
				stage.addChildAt(line, 0);
			}
		}
	}
}

function create_nodes() {
	nodes.push(new node(large, 200, 150, [15, 6, 8, 4, 14]));
	nodes.push(new node(large, 850, 190, [5, 18, 7, 22, 10]));
	nodes.push(new node(large, 470, 550, [11, 20, 9, 23, 12]));
	nodes.push(new node(large, 490, 300, [17, 6, 16, 9, 21, 7]));
	nodes.push(new node(medium, 450, 100, [0, 13]));
	nodes.push(new node(medium, 700, 80, [13, 1]));
	nodes.push(new node(medium, 350, 220, [0, 3]));
	nodes.push(new node(medium, 650, 270, [1, 3]));
	nodes.push(new node(medium, 140, 340, [0, 19]));
	nodes.push(new node(medium, 420, 390, [2, 3]));
	nodes.push(new node(medium, 930, 360, [1, 24]));
	nodes.push(new node(medium, 280, 540, [19, 2]));
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
}