$(document).ready(theMain);

var CANVAS_WIDTH = 540;
var CANVAS_HEIGHT = 480;
var groundLevel = CANVAS_HEIGHT*0.95;
var FPS = 30;
var $canvas = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "' id='canvas'></canvas>");
var canvas = $canvas.get(0).getContext("2d");

function draw(){
	canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	//Draw sky
	canvas.fillStyle = "black"; 
	canvas.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT); 
	// draw each argument
	for (var i in arguments){
		if(arguments[i].constructor === Array){
			arguments[i].forEach(function(item){
				item.draw();
			});
		}else{
			arguments[i].draw();
		}
	}
}

function update(){

}

function Land(x, y, width, height, color){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.draw = function(){
		canvas.fillStyle = color;
		canvas.fillRect(this.x,this.y,this.width,this.height);
	}
}
function Launchpad(x, y, width, height, color){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	// this.armMissiles = function(){

	// }
	this.draw = function(){
		canvas.fillStyle = color;
		canvas.beginPath();
				//   _______
				//  /		\
				// /_________\

		canvas.moveTo(this.x, this.y);
		canvas.lineTo(this.x + this.width, this.y);
		canvas.lineTo(this.x + this.width*0.8, this.y - this.height);
		canvas.lineTo(this.x + this.width*0.2, this.y - this.height);
		canvas.closePath();
		canvas.fill();
	}
}

function Missile(oneMissile){
	oneMissile.active = true;
	// oneMissile.x
	// oneMissile.y
	oneMissile.vx = 0;
	oneMissile.vy = 0;
	oneMissile.ax = 0;
	oneMissile.ay = 0;
	oneMissile.width = 4;
	oneMissile.height = 7;
	oneMissile.inBounds = function(){

	}
	oneMissile.trail = [];// an array
	oneMissile.explode = function(){

	}
	oneMissile.update = function(){
		oneMissile.x += oneMissile.vx;
		oneMissile.y += oneMissile.vy;
		oneMissile.active = oneMissile.active && oneMissile.inBounds;
	}
	oneMissile.draw = function(){
		canvas.fillStyle = "#26e";
		canvas.fillRect(this.x, this.y - this.height, 2, this.height*0.8);
		canvas.fillRect(this.x - this.width/2, this.y, 2, -this.height*0.4);
		canvas.fillRect(this.x + this.width/2, this.y, 2, -this.height*0.4);
	}
	return oneMissile;
}
function setUpMissiles(launchPad){
	var missiles = [];
	var startingCoords = [];
	var perRow = 0;
	var xcoord = launchPad.x + launchPad.width/2;
	var ycoord = launchPad.y - launchPad.height;
	var xLeft = xcoord;
	while (perRow < 4){
		for (var i = 0; i <= perRow; i++){
			// startingCoords.push([xcoord, ycoord]);
			missiles.push(Missile({
				x: xcoord,
				y: ycoord
			}));

			if(perRow !== 0){
				xcoord += missiles[0].width*1.7;
			}
		}
		xLeft -= (missiles[0].width/2)*1.7;
		xcoord = xLeft;
		ycoord += missiles[0].height*1.4;
		perRow++;
	}

	// startingCoords.forEach(function(coord){
	// 	missiles[i].push(Missile({
	// 		x: coord[0],
	// 		y: coord[1]
	// 	}));
	// });
	// for (var i in startingCoords){
	// 	missiles[i].push(Missile({
	// 		x: startingCoords[i][0],
	// 		y: startingCoords[i][1]
	// 	}));
	// }
	return missiles;
}
function Explosion(){

}

function Reticle(){
	
}

function Target(){

}

function City(){

}

function theMain(){
	$canvas.appendTo('body');

	//land
	var badlands = new Land(0, groundLevel, CANVAS_WIDTH, CANVAS_HEIGHT-groundLevel, "#999900");
	//launchpad
	var launchPad1 = new Launchpad(0, groundLevel, CANVAS_WIDTH*0.15, CANVAS_HEIGHT*0.05, "#999900");
	var launchPad2 = new Launchpad(CANVAS_WIDTH*(0.5-0.075), groundLevel, CANVAS_WIDTH*0.15, CANVAS_HEIGHT*0.03, "#999900");
	var launchPad3 = new Launchpad(CANVAS_WIDTH*0.85, groundLevel, CANVAS_WIDTH*0.15, CANVAS_HEIGHT*0.05, "#999900");

	//make missiles
	var interceptorMissiles1 = setUpMissiles(launchPad1);
	var interceptorMissiles2 = setUpMissiles(launchPad2);
	var interceptorMissiles3 = setUpMissiles(launchPad3);

	//Game Loop
	setInterval(function() {
		update();
		draw(badlands, launchPad1, launchPad2, launchPad3, interceptorMissiles1, interceptorMissiles2, interceptorMissiles3);
	}, 1000/FPS);
}
