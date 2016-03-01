// Original game from:
// http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
// Slight modifications by Gregorio Robles <grex@gsyc.urjc.es>
// to meet the criteria of a canvas class for DAT @ Univ. Rey Juan Carlos

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// princess image
var princessReady = false;
var princessImage = new Image();
princessImage.onload = function () {
	princessReady = true;
};
princessImage.src = "images/princess.png";

// stones image
var stonesReady = false;
var stoneImage = new Image();
stoneImage.onload = function () {
	stonesReady = true;
};
stoneImage.src = "images/stone.png";

// monsters image
var monstersReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monstersReady = true;
};
monsterImage.src = "images/monster.png";

// Game objects
var level = 1;

var hero = {
	speed: 256 // movement in pixels per second
};
var lastHeroPos = {};

var princess = {};
var princessesCaught = 0;

var stones = [];
var numStones = 3;

var monsters = [];
var numMonsters = 1;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

var touching = function (object1, object2) {
	if (
		object1.x <= (object2.x + 24)
		&& object2.x <= (object1.x + 24)
		&& object1.y <= (object2.y + 24)
		&& object2.y <= (object1.y + 24)
	) {
		return true;
	}
	return false;
}

var touchingMultipleObjects = function(objects){
	for (var i = 0; i < objects.length; i++){
		if (touching(hero, objects[i])){
			return true;
		}
	}
	return false;
}

// Add stones
var addStones = function(){
	stones = [];
	var stone = {};
	var stonesAdded = 0;
	while (stonesAdded < numStones) {
		stone.x = 64 + (Math.random() * (canvas.width - 128));
		stone.y = 64 + (Math.random() * (canvas.height - 128));

		if (!touching(stone, princess) && !touching(stone, hero)){
			stones.push(stone);
			++stonesAdded;
		}
		stone = {};
	}
}

// Add stones
var addMonsters = function(){
	monsters = [];
	var monster = {};
	var monstersAdded = 0;
	while (monstersAdded < numMonsters) {
		monster.x = 64 + (Math.random() * (canvas.width - 128));
		monster.y = 64 + (Math.random() * (canvas.height - 128));

		if (!touching(monster, princess) && !touching(monster, hero)){
			monsters.push(monster);
			++monstersAdded;
		}
		monster = {};
	}
}

// Reset the game when the player catches a princess
var reset = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	// Throw the princess somewhere on the screen randomly
	princess.x = 64 + (Math.random() * (canvas.width - 128));
	princess.y = 64 + (Math.random() * (canvas.height - 128));
	numStones = (level/2) * 3;
	numMonsters = (level/2);

	addStones();
	addMonsters();

	var state = {
		'level': level,
    'hero': hero,
    'princess': princess,
    'princessesCaught': princessesCaught,
  }
};

// Update game objects
var update = function (modifier) {
	lastHeroPos.x = hero.x;
	lastHeroPos.y = hero.y;

	if (38 in keysDown) { // Player holding up
		if (hero.y >= 32) {
			hero.y -= hero.speed * modifier;
		}
	}
	if (40 in keysDown) { // Player holding down
		if (hero.y <= (canvas.height - 64)) {
			hero.y += hero.speed * modifier;
		}
	}
	if (37 in keysDown) { // Player holding left
		if (hero.x >= 32) {
			hero.x -= hero.speed * modifier;
		}
	}
	if (39 in keysDown) { // Player holding right
		if (hero.x <= (canvas.width - 64)) {
			hero.x += hero.speed * modifier;
		}
	}

	// Are they touching?
	if (touchingMultipleObjects(stones)) {
		hero.x = lastHeroPos.x;
		hero.y = lastHeroPos.y;
	}

	if (touchingMultipleObjects(monsters)) {
		princessesCaught = 0;
		level = 0;
		reset();
	}

	if (touching(hero, princess)) {
		++princessesCaught;
		if (((princessesCaught % 5) == 0) && (princessesCaught !== 0)) {
			++level;
		}
		reset();
	}
	saveState();
};

// Draw elements
var drawStones = function(){
	for (var i = 0; i < stones.length; i++){
		ctx.drawImage(stoneImage, stones[i].x, stones[i].y);
	}
}

var drawMonsters = function(){
	for (var i = 0; i < monsters.length; i++){
		ctx.drawImage(monsterImage, monsters[i].x, monsters[i].y);
	}
}

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (princessReady) {
		ctx.drawImage(princessImage, princess.x, princess.y);
	}

	if (stonesReady) {
		drawStones();
	}

	if (monstersReady) {
		drawMonsters();
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Princesses caught: " + princessesCaught + ", Level " + level, 32, 32);
};

// State

var saveState = function() {
	var state = {
		'level': level,
		'hero': hero,
		'princess': princess,
		'princessesCaught': princessesCaught,
	}
	localStorage['state'] = JSON.stringify(state);
}

var loadState = function(){
	var loaded = false;
	if (localStorage['state']){
    var loadedState = JSON.parse(localStorage['state'])
		level = loadedState.level;
    hero = loadedState.hero;
		princess = loadedState.princess;
		princessesCaught = loadedState.princessesCaught;
		loaded = true;
	}
	return loaded;
}

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;
};

// Let's play this game!
loadState();
reset();

var then = Date.now();
//The setInterval() method will wait a specified number of milliseconds, and then execute a specified function, and it will continue to execute the function, once at every given time-interval.
//Syntax: setInterval("javascript function",milliseconds);
setInterval(main, 1); // Execute as fast as possible
