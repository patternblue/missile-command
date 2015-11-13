$(document).ready(theMain);
// global constants
var CANVAS_WIDTH = 540;
var CANVAS_HEIGHT = 480;
var GROUND_LEVEL = CANVAS_HEIGHT*0.95;
var FPS = 30;

var reticle_img;
var $canvas = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "' id='canvas'></canvas>");
var context = $canvas.get(0).getContext("2d");
loadResources();
function loadResources(){
	reticle_img = new Image();
	reticle_img.src = 'img/reticle.png';
}

function draw(){
	context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	//Draw sky
	context.fillStyle = "#000000"; 
	console.log('ran');
	context.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT); 
	// draw each argument
	for (var i in arguments){
		// if arg is an array, draw each element
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
	for (var i in arguments){
		// if arg is an array, update each element
		if(arguments[i].constructor === Array){
			arguments[i].forEach(function(item){
				item.update();
			});
		}else{
			arguments[i].update();
		}
	}
}

function collide(a, b){
	return a.x < b.x + b.width/2 + a.width/2 &&
		a.x + a.width/2 + b.width/2 > b.x &&
		a.y < b.y + b.height/2 + a.height/2 &&
		a.y + a.height/2 + b.height/2 > b.y;
}

function Land(x, y, width, height, color){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.draw = function(){
		context.fillStyle = color;
		context.fillRect(this.x,this.y,this.width,this.height);
	}
}

function City(aCity){
	aCity.active = true;
	aCity.draw = function(){
		context.fillStyle = aCity.color;
		context.fillRect(aCity.x, aCity.y, aCity.width/3, -aCity.height);
		context.fillRect(aCity.x + aCity.width/3, aCity.y, aCity.width/3, -aCity.height*2);
		context.fillRect(aCity.x + aCity.width*(2/3), aCity.y, aCity.width/3, -aCity.height*0.5);
	}
	return aCity;
}

function Launchpad(aLaunchpad){
	aLaunchpad.draw = function(){
		context.fillStyle = aLaunchpad.color;
		context.beginPath();
				//   _______
				//  /		\
				// /_________\
		// lower left corner
		context.moveTo(aLaunchpad.x - aLaunchpad.width/2, aLaunchpad.y + aLaunchpad.height/2);
		// line to lower right corner
		context.lineTo(aLaunchpad.x + aLaunchpad.width/2, aLaunchpad.y + aLaunchpad.height/2);
		// line to top right corner
		context.lineTo(aLaunchpad.x + aLaunchpad.width*(0.3), aLaunchpad.y - aLaunchpad.height/2);
		// line to top left corner
		context.lineTo(aLaunchpad.x - aLaunchpad.width*(0.3), aLaunchpad.y - aLaunchpad.height/2);
		context.closePath();
		context.fill();
	}
	return aLaunchpad;
}

function Missile(oneMissile){
	oneMissile.active = true;
	oneMissile.launched = false;
	oneMissile.vx = 0;
	oneMissile.vy = 0;
	oneMissile.ax = 0;
	oneMissile.ay = 0;
	oneMissile.width = 4;
	oneMissile.height = 7;
	// a Target object
	oneMissile.targetCoord = Target({});
	// an array
	oneMissile.trail = [];

	oneMissile.inBounds = function(){
		return oneMissile.x >= 0 && oneMissile.x <= CANVAS_WIDTH && oneMissile.y >= 0 && oneMissile.y <= CANVAS_HEIGHT;
	}
	oneMissile.launch = function(xTarget, yTarget){
		var sx = xTarget - oneMissile.x;
		var sy = yTarget - oneMissile.y;
		// equation for getting the same diagonal velocity whereever you click
		var ds = Math.sqrt(sx*sx + sy*sy);
		// set initial change in velocity as the value for acceleration/frame
		oneMissile.ax = sx/ds;
		oneMissile.ay = sy/ds;
	}
	oneMissile.update = function(){
		oneMissile.vx += oneMissile.ax*oneMissile.accerationFactor;
		oneMissile.vy += oneMissile.ay*oneMissile.accerationFactor;
		oneMissile.x += oneMissile.vx;
		oneMissile.y += oneMissile.vy;
		oneMissile.active = oneMissile.active && oneMissile.inBounds();
	}
	oneMissile.draw = function(){
		context.fillStyle = oneMissile.color;
		context.fillRect(this.x, this.y, 2, -this.height);
		context.fillRect(this.x - this.width/2, this.y - this.height*0.3, 2, this.height*0.4);
		context.fillRect(this.x + this.width/2, this.y - this.height*0.3, 2, this.height*0.4);
	}
	return oneMissile;
}
function setUpMissiles(launchPad, speed){
	var missiles = [];
	var startingCoords = [];
	var perRow = 0;
	var xcoord = launchPad.x;
	var ycoord = launchPad.y - launchPad.height/2;
	var xLeft = xcoord;
	while (perRow < 4){
		for (var i = 0; i <= perRow; i++){
			missiles.push(Missile({
				color: '#ffffff',
				x: xcoord,
				y: ycoord,
				accerationFactor: speed
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
	return missiles;
}
function Explosion(anExplosion){
	anExplosion.age = 0;
	anExplosion.radius = 0;
	anExplosion.update = function(radius){
		anExplosion.age++;
		// set blast radius to expand 
		anExplosion.radius = 20*Math.sin(Math.PI*(anExplosion.age)/FPS);
		if(anExplosion.radius < 0){
			anExplosion.radius = 0;
			anExplosion.active = false;
		}
		anExplosion.width = anExplosion.radius*2;
		anExplosion.height = anExplosion.radius*2;
	}
	anExplosion.draw = function(){
		context.fillStyle = '#d89a33';
		context.beginPath();
		context.arc(anExplosion.x, anExplosion.y, anExplosion.radius, 0, 2*Math.PI);
		context.fill();
	}
	return anExplosion;
}


function Reticle(){
	//this updates every time mouse moves, not at framerate
	this.active = true;
	this.width = 14;
	this.height = 14;
	this.update = function(aCanvas, evt){
		// get mouse position
		var rect = aCanvas.getBoundingClientRect();
		// rect.left is the left margin
		// rect.top is the top margin
		var xOnCanvas = evt.clientX - rect.left;
		var yOnCanvas = evt.clientY - rect.top;
		if(this.checkBound(xOnCanvas, 0, CANVAS_WIDTH)){
			this.x = xOnCanvas; 
		}
		if(this.checkBound(yOnCanvas, 0, GROUND_LEVEL)){
			this.y = yOnCanvas; 
		}
	}
	this.checkBound = function(xOrY, lowerBound, upperBound){
		return xOrY >= lowerBound && xOrY <= upperBound;
	}
	this.draw = function(){
		context.drawImage(reticle_img,
			0, 0, 16, 16,
			this.x - this.width/2, this.y - this.height/2, this.width, this.height);
	}
}

function Target(aTarget){
	aTarget.width = 20;
	aTarget.height = 20;
	aTarget.update = function(xPos, yPos){
		aTarget.x = xPos;
		aTarget.y = yPos;
	}
	aTarget.draw = function(){
		context.strokeStyle = '#006604';
		context.beginPath();
		context.moveTo(aTarget.x - aTarget.width/4, aTarget.y - aTarget.height/4);
		context.lineTo(aTarget.x + aTarget.width/4, aTarget.y + aTarget.height/4);
		context.stroke();
		context.moveTo(aTarget.x + aTarget.width/4, aTarget.y - aTarget.height/4);
		context.lineTo(aTarget.x - aTarget.width/4, aTarget.y + aTarget.height/4);
		context.stroke();
	}
	return aTarget;
}

function theMain(){
	$canvas.appendTo('body');
	var canvas = document.getElementById('canvas');

	//land
	var badlands = new Land(0, GROUND_LEVEL, CANVAS_WIDTH, CANVAS_HEIGHT-GROUND_LEVEL, "#994400");

	//launchpads
	var allLaunchpads = [];
	for(var i = 0; i<3; i++){
		allLaunchpads.push(Launchpad({
			x: (CANVAS_WIDTH*0.15)/2, 
			y: GROUND_LEVEL, 
			width: CANVAS_WIDTH*0.15, 
			height: CANVAS_HEIGHT*0.05, 
			color: "#994400"
		}));
	}
	// space out the launchpads, set different heights
	allLaunchpads[1].x = CANVAS_WIDTH*(0.5);
	allLaunchpads[1].height = (CANVAS_HEIGHT*0.03)/2;
	allLaunchpads[2].x = CANVAS_WIDTH - allLaunchpads[2].width/2;

	// cities
	allCities = [];
	for(var i = 0; i<4; i++){
		allCities.push(City({
			x: 0, 
			y: GROUND_LEVEL, 
			width: CANVAS_WIDTH*0.08, 
			height: Math.random()*(CANVAS_HEIGHT*0.04 - CANVAS_HEIGHT*0.02) + CANVAS_HEIGHT*0.02, 
			color: "#3388ff"
		}));
	}
	// space out the cities
	allCities[0].x = allLaunchpads[0].x + allLaunchpads[0].width/2 + 0.2*(allLaunchpads[1].x - (allLaunchpads[1].width/2 + allLaunchpads[0].x + allLaunchpads[0].width/2));
	allCities[1].x = allLaunchpads[0].x + allLaunchpads[0].width/2 + 0.6*(allLaunchpads[1].x - (allLaunchpads[1].width/2 + allLaunchpads[0].x + allLaunchpads[0].width/2));
	allCities[2].x = allLaunchpads[1].x + allLaunchpads[1].width/2 + 0.2*(allLaunchpads[2].x - (allLaunchpads[2].width/2 + allLaunchpads[1].x + allLaunchpads[1].width/2));
	allCities[3].x = allLaunchpads[1].x + allLaunchpads[1].width/2 + 0.6*(allLaunchpads[2].x - (allLaunchpads[2].width/2 + allLaunchpads[1].x + allLaunchpads[1].width/2));


	var allStructures = [badlands, allLaunchpads[0], allLaunchpads[1], allLaunchpads[2], allCities[0], allCities[1], allCities[2], allCities[3]];
	var myReticle = new Reticle();
	//make interceptor missiles
	var interceptorSpeed = 0.8;
	var interceptorMissiles1 = setUpMissiles(allLaunchpads[0], interceptorSpeed);
	var interceptorMissiles2 = setUpMissiles(allLaunchpads[1], interceptorSpeed);
	var interceptorMissiles3 = setUpMissiles(allLaunchpads[2], interceptorSpeed);
	var allInterceptors = interceptorMissiles1.concat(interceptorMissiles2).concat(interceptorMissiles3);

	// make enemy missiles
	var enemyMissiles = [];
	var enemyMissileSpeed = Math.random()*0.03;
	var enemiesCount = 10;

	for (var i = 0; i < enemiesCount; i++){
		enemyMissiles.push(Missile({
			color: '#ff3322',
			// start enemies from top
			x: Math.random()*CANVAS_WIDTH,
			y: 0,
			accerationFactor: enemyMissileSpeed
		}));
	}

	// make explosions arrays
	var allExplosions = [];
	var allExplosiveThings = [];
	// reticle updates when mouse moves
	document.onmousemove = function(event){
		myReticle.update(canvas, event);
	}

	// click to set target and launch missile
	var allTargets = [];
	$canvas.on('click', function(){
		var interceptorsToLaunch = allInterceptors.filter(function(missile){
			return missile.vx === 0 && missile.vy === 0;
		});
		// launch if I still have ammo left
		if(interceptorsToLaunch.length){

			// randomly decide which of the interceptors to launch, make a Target object on it
			var missileIndex = Math.floor(Math.random()*interceptorsToLaunch.length);
			interceptorsToLaunch[missileIndex].targetCoord.update(myReticle.x, myReticle.y);
			interceptorsToLaunch[missileIndex].targetCoord.active = true;
			allTargets.push(interceptorsToLaunch[missileIndex].targetCoord);
			// launch interceptor!
			var xTarget = interceptorsToLaunch[missileIndex].targetCoord.x;
			var yTarget = interceptorsToLaunch[missileIndex].targetCoord.y;
			interceptorsToLaunch[missileIndex].launch(xTarget, yTarget);
		}
	});

	//Game Loop
	alert('Play now!');
	setInterval(function() {

		// handler for collisions b/w interceptor and its target
		allInterceptors.forEach(function(interceptor){
			if(collide(interceptor, interceptor.targetCoord)){
				interceptor.active = false;
				interceptor.targetCoord.active = false;
				allExplosions.push(Explosion({
					active: true,
					x: interceptor.targetCoord.x,
					y: interceptor.targetCoord.y
				}));
			}
		});

		// handler for collisions b/w enemy missiles and land/city/launchpad
		enemyMissiles.forEach(function(missile){
			allStructures.forEach(function(structure){
				if(collide(missile, structure)){
					// explode missile here
					missile.active = false;
					allExplosions.push(Explosion({
						active: true,
						x: missile.x,
						y: missile.y
					}));
				}
			});
		});

		// handler for collisions b/w explosions and allExplosiveThings (city, missile)
		allExplosiveThings = allCities.concat(allInterceptors).concat(enemyMissiles);
		allExplosions.forEach(function(explosion, i, explosionArray){
			allExplosiveThings.forEach(function(explosiveThing){
				if(collide(explosion, explosiveThing)){
					// explode item here
					explosiveThing.active = false;
					explosionArray.push(Explosion({
						active: true,
						x: explosiveThing.x,
						y: explosiveThing.y
					}));
				}
			});
		});

		// filter the arrays for only the active ones
		allInterceptors = allInterceptors.filter(function(missile){
			return missile.active;
		});
		enemyMissiles = enemyMissiles.filter(function(missile){
			return missile.active;
		});
		allTargets = allTargets.filter(function(target){
			return target.active;
		});
		allCities = allCities.filter(function(city){
			return city.active;
		});
		allExplosions = allExplosions.filter(function(explosion){
			return explosion.active;
		});	

		// fire enemy missiles! (randomly every frame update)
		if(Math.random() < 0.03){
			// launch only the missiles that are still idle
			var enemyMissilesToLaunch = enemyMissiles.filter(function(missile){
				return missile.vx === 0 && missile.vy === 0;
			});
			// launch enemy to a random spot on the ground
			if(enemyMissilesToLaunch.length){
				enemyMissilesToLaunch[0].launch(Math.random()*CANVAS_WIDTH, CANVAS_HEIGHT);
			}
		}
		update(allInterceptors, enemyMissiles, allExplosions);
		draw(badlands, allLaunchpads, allCities, allInterceptors, enemyMissiles, myReticle, allTargets, allExplosions);
	}, 1000/FPS);

}
