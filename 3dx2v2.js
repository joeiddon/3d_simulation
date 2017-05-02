cnvs1 = document.getElementById("cnvs1") 	
ctx1 = cnvs1.getContext("2d")
cnvs2 = document.getElementById("cnvs2")
ctx2 = cnvs2.getContext("2d")

var width, height

cnvs1.width = cnvs2.width = width =  900 //Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
cnvs2.height = cnvs1.height = height = 720 //Math.max(document.documentElement.clientHeight, window.innerHeight || 0) / 2 - 100

window.addEventListener("deviceorientation", phoneOrientation, true); 

cam = {x: 0, y: 0, z: 3, pitch: 0, yaw: 0}		//coordinates of the camera

function phoneOrientation(event){
   pitch = (event.gamma / Math.abs(event.gamma) * 90) - event.gamma
   roll = event.beta
   yaw = event.alpha
   if (pitch < 0) yaw = (yaw + 180) % 360;
  
   yaw = (yaw - 180) * -1
   
   //angle /= 10
   //tilt /= 10
   roll /= 10
   
   cam.yaw = yaw
   cam.pitch = pitch  * -1
}

window.addEventListener("keydown", keyPress)

function keyPress(event){
	key = event.keyCode
	if (key == 88) cam.z -= 0.5				//x	fly down
	if (key == 90) cam.z += 0.5				//z fly up
	if (key == 87) takeStep(cam.yaw)		//w	walk forward
	if (key == 83) takeStep(cam.yaw + 180)	//s walk backwards
	if (key == 65) takeStep(cam.yaw - 90)	//a walk left
	if (key == 68) takeStep(cam.yaw + 90)	//d walk right
	if (key == 69) cam.yaw   += 3				//e	//look left
	if (key == 81) cam.yaw   -= 3  			    //q	//look right
	if (key == 82) cam.pitch += 3				//r	//look up
	if (key == 70) cam.pitch -= 3   			//f	//look down
	
	renderWorld()
}

colors = ["#F19292", "yellow", "teal", "green", "green", "cyan", "cyan", "cyan", "cyan", "cyan", "cyan", "orange"]

coordinates = [{x: 3, y: 20, z: 1}, {x: 2, y: 20, z: 1}, {x: 2, y: 20, z: 0}, {x: 3, y: 20, z: 0}, {x: 3, y: 22, z: 0}, {x: 2, y: 22, z: 0},														  //dad chair
{x: -1 , y: 17, z: 0}, {x: -1.5, y: 17, z: 0}, {x: -1.5, y: 17.5, z: 0}, {x: -1, y: 17.5, z: 0}, {x: -1 , y: 17, z: 3}, {x: -1.5, y: 17, z: 3}, {x: -1.5, y: 17.5, z: 3}, {x: -1, y: 17.5, z: 3}, //tall collumn
{x: 0, y: 16, z: 0}, {x: 0, y: 15, z: 0}, {x: -1, y: 15, z: 0}, {x: -1, y: 16, z: 0},					//flat shape on 0,0
{x: -4, y: 14, z: 0}, {x: -4, y: 23, z: 0}, {x: 4, y: 23, z: 0}, {x: 4, y: 14, z: 0},					//floor
{x: -4, y: 23, z: 0}, {x: 4, y: 23, z: 0}, {x: 4, y: 23, z: 2.5}, {x: -4, y: 23, z: 2.5},					//back wall
{x: -1, y: 23, z: 1.8}, {x: 1, y: 23, z: 1.8}, {x: 0, y: 23, z: 0.3}]									//triangle on back wall

shapeIndexs = [[22,23,24,25], [26,27,28], [18,19,20,21], [2,3,4,5], [0,1,2,3], [6,7,8,9], [8,9,13,12], [7,8,12,11], [6,9,13,10], [10,11,12,13], [6,7,11,10], [14,15,16,17]]
pixAngleRatio = 18					//the amount of pixels that one degree spreads over
step = 0.5
var eyeDif = 0.28				//amount to shift cam by for different 

function takeStep(yaw){
	cam.x = step * Math.sin(radFromDeg(yaw)) + cam.x
	cam.y = step * Math.cos(radFromDeg(yaw)) + cam.y
}

function drawPoints(points, canvas){	//acctually does the drawing of the coordinates from the canvas coordinates fills in with reference to the shape index array
	if (canvas == 1){
	for (s = 0; s < shapeIndexs.length; s++){
		shape = shapeIndexs[s]
		ctx1.strokeStyle = "black"
		ctx1.beginPath(points[shape[0]].y, height - points[shape[0]].x)
		for (p = 1; p < shape.length; p++){
			ctx1.lineTo(points[shape[p]].y, height - points[shape[p]].x)
			ctx1.stroke()
		}	
		ctx1.lineTo(points[shape[0]].y, height - points[shape[0]].x)
		ctx1.stroke()
		ctx1.closePath()
		ctx1.fillStyle = colors[s]
		ctx1.fill()
	}
	}
	else {
	for (s = 0; s < shapeIndexs.length; s++){
		shape = shapeIndexs[s]
		ctx2.strokeStyle = "black"
		ctx2.beginPath(points[shape[0]].y, height - points[shape[0]].x)
		for (p = 1; p < shape.length; p++){
			ctx2.lineTo(points[shape[p]].y, height - points[shape[p]].x)
			ctx2.stroke()
		}
		ctx2.lineTo(points[shape[0]].y, height - points[shape[0]].x)
		ctx2.stroke()
		ctx2.closePath()
		ctx2.fillStyle = colors[s]
		ctx2.fill()
	}
	}
}


function renderObjects(){		//draws the 3d objects from their coordinates and cam position onto canvas in 2d
	
	//RENDERING RIGHT WORLD 2D COORDINATE POSITIONS
	rightCoords = coordinates.map(o => ({x: o.x + eyeDif, y: o.y, z: o.z}) )
	
	xWorldRotate = (r) => (o => ({x: o.x,  y: ( (o.y - cam.y) * Math.cos(r) + ((o.z - cam.z) * Math.sin(r)) ) + cam.y ,  z: ( ( -1 * (o.y - cam.y) * Math.sin(r)) + ((o.z - cam.z) * Math.cos(r)) ) + cam.z }))
	zWorldRotate = (r) => (o => ({x: ( ((o.x - cam.x) * Math.cos(r)) - ((o.y - cam.y) * Math.sin(r))) + cam.x ,  y: ( ((o.x - cam.x) * Math.sin(r)) + ((o.y - cam.y) * Math.cos(r)) ) + cam.y,  z: o.z}))
	
	transformedCoords = rightCoords.map( xWorldRotate(radFromDeg(cam.pitch)) ).map( zWorldRotate(radFromDeg(cam.yaw) ))
	
	coordinateAngles = transformedCoords.map(o => ({yaw: degFromRad(Math.atan((o.x - cam.x) / Math.sqrt((o.x - cam.x) * (o.x - cam.x) + (o.y - cam.y) * (o.y - cam.y) ))), pitch: degFromRad(Math.atan((o.z - cam.z) / (o.y - cam.y))) })  )
	
	canvasCoordinates = coordinateAngles.map(o => ( { x: width / 2 + (o.yaw * pixAngleRatio), y: height / 2 - (o.pitch * pixAngleRatio) } ))
	
	drawPoints(canvasCoordinates, 1)

	//RENDERING LEFT WORLD 2D COORDINATE POSITIONS
	leftCoords = coordinates.map(o => ({x: o.x - eyeDif, y: o.y, z: o.z}) )
	
	xWorldRotate = (r) => (o => ({x: o.x,  y: ( (o.y - cam.y) * Math.cos(r) + ((o.z - cam.z) * Math.sin(r)) ) + cam.y ,  z: ( ( -1 * (o.y - cam.y) * Math.sin(r)) + ((o.z - cam.z) * Math.cos(r)) ) + cam.z }))
	zWorldRotate = (r) => (o => ({x: ( ((o.x - cam.x) * Math.cos(r)) - ((o.y - cam.y) * Math.sin(r))) + cam.x ,  y: ( ((o.x - cam.x) * Math.sin(r)) + ((o.y - cam.y) * Math.cos(r)) ) + cam.y,  z: o.z}))
	
	transformedCoords = leftCoords.map( xWorldRotate(radFromDeg(cam.pitch)) ).map( zWorldRotate(radFromDeg(cam.yaw) ))
	
	coordinateAngles = transformedCoords.map(o => ({yaw: degFromRad(Math.atan((o.x - cam.x) / Math.sqrt((o.x - cam.x) * (o.x - cam.x) + (o.y - cam.y) * (o.y - cam.y) ))), pitch: degFromRad(Math.atan((o.z - cam.z) / (o.y - cam.y))) })  )
	
	canvasCoordinates = coordinateAngles.map(o => ( { x: width / 2 + (o.yaw * pixAngleRatio), y: height / 2 - (o.pitch * pixAngleRatio) } ))
	
	drawPoints(canvasCoordinates, 2)
	
	
}


function renderWorld(){			 //draws the world from given cam perspective and object coodinates
	document.getElementById("data").innerText = "Camera \xa0 x: " + padLeft(cam.x) + ", y: " + padLeft(cam.y) + ", z: " + padLeft(cam.z) + ", yaw: " + padLeft(cam.yaw) +  ", pitch: " + padLeft(cam.pitch)

	clearScreen()
	
	renderObjects()
	renderCrosshairs()
}

setInterval(renderWorld, 10)


//SHORT USEFULL FUNCTIONS THAT ARE USED BUT ALREADY WORK //SHORT USEFULL FUNCTIONS THAT ARE USED BUT ALREADY WORK//SHORT USEFULL FUNCTIONS THAT ARE USED BUT ALREADY WORK//SHORT USEFULL FUNCTIONS THAT ARE USED BUT ALREADY WORK//SHORT USEFULL FUNCTIONS THAT ARE USED BUT ALREADY WORK//SHORT USEFULL FUNCTIONS THAT ARE USED BUT ALREADY WORK

function padLeft(num){		//returns string of number padded from left to make a 5 charachter string
	return ("\xa0\xa0\xa0\xa0" + parseInt(num)).slice(-5)
}

function radFromDeg(deg){
	return deg * ( Math.PI / 180)
}

function degFromRad(rad){			//returns degree angle from radian angle
	return rad * (180 / Math.PI)
}

function clearScreen(){				//returns canvas to balank screen
	ctx1.clearRect(0, 0, width, height)
	ctx2.clearRect(0, 0, width, height)
}

function drawPoint(horizontalAngle, verticalAngle){		//draws a single point from its angles from the center line( y axis )
	ctx.fillRect(width / 2 + horizontalAngle * pixAngleRatio, height / 2 - verticalAngle * pixAngleRatio, 2 , 2)
}

function drawLine(xStart, yStart, xFin, yFin){	//draws a line on the canvas
   ctx1.beginPath();
   ctx1.moveTo(xStart, yStart);
   ctx1.lineTo(xFin, yFin);
   ctx1.stroke();
   ctx2.beginPath();
   ctx2.moveTo(xStart, yStart);
   ctx2.lineTo(xFin, yFin);
   ctx2.stroke();
}


function drawCross(x, y, l){	 //draws a cross on canvas in relation to the midpoint
	drawLine( width/2 + x + l, height / 2 + y, width / 2 + x - l, height /2 + y)
	drawLine(width /2 + x, height / 2 + y + l,width / 2 + x, height /2 + y - l)
}

function renderCrosshairs(){			//draws the two axis and center crosshar
	drawCross(0, 0, 30)
	for (a = 113.09; a <= 3 * 113.09; a += 113.09){
		drawCross(a, 0, 5)
		drawCross(-1 * a, 0, 5)
		drawCross(0, a, 5)
		drawCross(0, -1 * a, 5)
	}
}


//USELESS FUNCTIONS//USELESS FUNCTIONS//USELESS FUNCTIONS//USELESS FUNCTIONS//USELESS FUNCTIONS//USELESS FUNCTIONS//USELESS FUNCTIONS//USELESS FUNCTIONS//USELESS FUNCTIONS//USELESS FUNCTIONS//USELESS FUNCTIONS//USELESS FUNCTIONS//USELESS FUNCTIONS//USELESS FUNCTIONS


function rotateCoordRoundX(deg){
	deg = radFromDeg(deg)
	for (c = 0; c < coords.length; c++){		
		coord = coords[c]
		coord.y -= cam.y
		coord.z -= cam.z
		yCo = coord.y						//translate each point as if cam was at the origin
		zCo = coord.z
		coord.y = yCo * Math.cos(deg) - zCo * Math.sin(deg)			//rotate around origin for that point
		coord.z = yCo * Math.sin(deg) + zCo * Math.cos(deg)
		coord.y += cam.y					//translate each point back
		coord.z += cam.z
	}	
}

function rotateCoordRoundZ(deg){
	deg = radFromDeg(deg)
	for (c = 0; c < coords.length; c++){		
		coord = coords[c]
		coord.x -= cam.x
		coord.y -= cam.y
		xCo = coord.x						//translate each point as if cam was at the origin
		yCo = coord.y
		coord.x = xCo * Math.cos(deg) + yCo * Math.sin(deg)			//rotate around origin for that point
		coord.y = xCo * -1 * Math.sin(deg) + yCo * Math.cos(deg)
		coord.x += cam.x					//translate each point back
		coord.y += cam.y
	}	
}

function rotateCnvses(deg){
	ctx1.translate(width / 2, height / 2)
	ctx1.rotate(deg * Math.PI / 180)
	ctx1.translate(-1 * width / 2, - 1 * height / 2)
	ctx2.translate(width / 2, height / 2)
	ctx2.rotate(deg * Math.PI / 180)
	ctx2.translate(-1 * width / 2, - 1 * height / 2)
//put these in project...
	ctx1.setTransform(1, 0, 0, 1, 0, 0)
	ctx2.setTransform(1, 0, 0, 1, 0, 0)
}
