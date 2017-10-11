class mass{ //general class for calculating the movement of masses
	constructor(x, y, obj, gravConst, xVel, yVel, mass){ //constructor, these are all the vars it can have
		this.obj = obj; //the real object (in my case, paragraph elements) that this class represents
		this.accelerationX = 0; //accelerations
		this.accelerationY = 0; //both set to 0 initially, can't set in constructor
		this.velocityX = xVel || 0; //IF THESE ARE UNDEFINED THEY'LL DEFAULT TO 0
		this.velocityY = yVel || 0;
		this.x = x || 0; //x location
		this.y = y || 0; //y location
		this.mass = mass || 1; //how much the mass weighs
		this.G = gravConst || 150; //multiplyer for gravity calculations
	}

	move(x, y){ //move an amount
		this.x += x || this.velocityX; //if no movement is specified it'll move based on velocity
		this.y += y || this.velocityY;
		if (this.x < 0) {this.x = 0; this.velocityX = -this.velocityX*0.1;} //bounces off the wall lightly
		if (this.y < 0) {this.y = 0; this.velocityY = -this.velocityY*0.1;}
		if (this.x > 1000) {this.x = 1000; this.velocityX = -this.velocityX*0.1;}
		if (this.y > 1000) {this.y = 1000; this.velocityY = -this.velocityY*0.1;}
	}

	accelerate(x, y){ //changes the velocity
		this.velocityX += x || this.accelerationX;
		this.velocityY += y || this.accelerationY;
		this.move(); //calls move so that position is changed too
	}

	jerk(masses){ //other objs = array, adds up the acceleration due to all other masses passed into this func
		var gSums = [0,0];
		var numOfMasses = masses.length; //for loops are faster if you initialize this before
		for (var m = 0; m < numOfMasses; m++){
			var mas = masses[m];
			if (mas != this){ //CAN'T DIVIDE BY 0 SO I GOTTA CHECK THIS
				var xDistance = mas.x - this.x;
				var yDistance = mas.y - this.y;
				var totalDist = this.distance(xDistance, yDistance); //BECAUSE IT'S THE TOTAL DISTANCE THAT MATTERS TO EACH COMPONENT, NOT JUST EACH COMPONENT DISTANCE
				if (totalDist != Infinity && totalDist != NaN && totalDist != 0){ //checks if gs are actual numbers and if it's not 0
					var gForce = (mas.mass * this.G) / (totalDist ** 2); //because g = GM/r**2
					gSums[0] += ((xDistance/totalDist) * gForce) / this.mass; //x component, divided by the mass because f = ma so a = f/m
					gSums[1] += ((yDistance/totalDist) * gForce) / this.mass; //y component
				}
			}
		}
		this.accelerationX = gSums[0];
		this.accelerationY = gSums[1]; //now you can call this.accelerate to accelerate the mass
	}

	distance(xDist, yDist){ //utility for calculating distance
		return Math.sqrt(xDist**2 + yDist**2);
	}
}

//------Html Generation------{
	function makeBody(){ //makes the html
		var bod = document.createElement('body');
		bod.bgColor = 'black';
		var box = document.createElement('div');
		box.style = 'height: 1000; width: 1000; position: absolute; top:0; left:0; border: 1px solid white';
		var button = document.createElement('button');
		button.innerText = 'Pause';
		button.style = 'position: absolute; top:0; left:1050; height: 100px; width: 200px; -webkit-user-select: none; background-color: Transparent; color: white';
		button.style.fontSize = 50;
		button.onclick = function(){
			if (ANIMATE == true){
			this.innerText = 'Play';
			}
			else{
				this.innerText = 'Pause';
			}
			ANIMATE = !ANIMATE;
		}
		bod.appendChild(box);
		bod.appendChild(button);
		document.body = bod;
	}
//}

//------Mass Generation------{
	function generateMass(x, y, text){
		dot = document.createElement('p');
		dot.innerText = text;
		dot.style = 'margin-top: 0px; margin-bottom: 0px; margin-right: 0px; margin-left: 0px; -webkit-user-select: none;'; //-webkit-user-select: none; MAKES THE TEXT UNSELECTABLE (because selecting and dragging maeans you can mouseup without touching the body)
		dot.style.position = 'absolute';
		randHexString = parseInt(Math.random()*0xFFFF).toString(16)
		dot.style.color = ('#FF' + randHexString + randHexString).substr(0,7);
		document.body.appendChild(dot);

		m = new mass(x + WOW_X_MID, y + WOW_Y_MID, dot);
		return m;
	}

	function drawObj(mas){ //move a mass' element obj based on mass' x and y coords
		mas.obj.style.top = toPx(mas.y);
		mas.obj.style.left = toPx(mas.x);
	}

	function toPx(n){
		return n.toString()+'px';
	}
//}

//------Main------{
	makeBody(); //make the layout for everything

	var ANIMATE = true; //global, tells attract() that everthing is being animated
	var FPS = 50; //THE FPS OF THE SIMULATION, higher makes it actually go faster btw

	var CURRENT_WOW = null; //variable where the current wow object will be kept as it's being made (only called wow because they were originally text that said 'wow')
	var WOW_Y_MID = 8.25; //global, half the height of the wow
	var WOW_X_MID = 3.75; //global, half the width of the wow
	document.body.onmousedown = wowGenDown;
	document.body.onmouseup = wowGenUp;

	le = generateMass(0,0,'le'); //test vars
	le.mass = 6;
	xd = generateMass(100, 100, 'xd');
	xd.mass = 6;
	AH = generateMass(200, 300, 'AH');
	AH.mass = 10;
	masses = [le, xd, AH];
	//masses = [];

	window.setInterval(attract, (1/FPS)*1000, masses); //start the attracting
	//document.body.onclick = function(){attract(masses); console.log(xd.accelerationX, xd.accelerationY);};
//}

//------Mass generation mouse events------{
	function wowGenDown(event){ //when mouse goes down, takes a mouse event (EVENTS ARE ALWAYS PASSED IN BY HANDLERS)
		var x = event.clientX; //clientY and clientY are the x and y coords of the mouseevent
		var y = event.clientY;
		if (x < 1000 && y < 1000){
			CURRENT_WOW = generateMass(event.clientX, event.clientY, '*'); 
			drawObj(CURRENT_WOW); //draws it so it doesn't apear at 0,0
		}
	}
	function wowGenUp(event){ //when mouse goes up
		if (CURRENT_WOW != null){ //if there is a wow to be made
			CURRENT_WOW.velocityX = (CURRENT_WOW.x - WOW_X_MID - event.clientX) / 5; //checks the distance between when the cursor went down and where it is now, SUBTRACTS NUMBERS BECAUSE THE COORDS HAVE BEEN CHANGED A BIT SO THAT IT'S MASS COORDS ARE IN THE CENTER OF THE POINT
			CURRENT_WOW.velocityY = (CURRENT_WOW.y - WOW_Y_MID - event.clientY) / 5;//velocity is proportional to the change in cursor position
			masses.push(CURRENT_WOW);
		}
		if (masses.length % 10 == 0){ //just prints number of masses for reference
			console.log(masses.length);
		}
		CURRENT_WOW = null;
	}
//}

//------Mass Movement------{
	function attract(masses){ //moves everything
		if (ANIMATE == true){ //only move everything if it's not paused
			var numOfMasses = masses.length;
			for (var m = 0; m < numOfMasses; m++){
				var mas = masses[m];
				mas.jerk(masses);
			}
			for (var m = 0; m < numOfMasses; m++){ //HAVE TO CALC ALL ACCELERATIONS FIRST AND THEN MOVE EVERYTHING
				mas = masses[m];
				mas.accelerate();
				drawObj(mas);
			}
		}
	}
//}