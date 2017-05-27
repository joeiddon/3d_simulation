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
   //roll /= 10
   
   cam.yaw = yaw
   cam.pitch = pitch  * -1
   //cam.roll = roll
}

document.addEventListener("keydown", keyPress)

function keyPress(event){
	key = event.keyCode
	if (key == 67) resetWorld() 		    //c: the reset key
	if (key == 88) cam.z -= 0.5				//x	fly down
	if (key == 90) cam.z += 0.5				//z fly up
	if (key == 87) takeStep(cam.yaw)		//w	walk forward
	if (key == 83) takeStep(cam.yaw + 180)	//s walk backwards
	if (key == 65) takeStep(cam.yaw - 90)	//a walk left
	if (key == 68) takeStep(cam.yaw + 90)	//d walk right
	if (key == 69) cam.yaw   += lookStep			//e	//look left
	if (key == 81) cam.yaw   -= lookStep  			//q	//look right
	if (key == 82) cam.pitch += lookStep			//r	//look up
	if (key == 70) cam.pitch -= lookStep   			//f	//look down
	if (key == 89) cam.roll  += lookStep			//y //roll left
	if (key == 84) cam.roll  -= lookStep			//t //roll right
	
	renderWorld()
}


colors = ["#F19292", "yellow", "teal", "green", "cyan", "orange", "black"]

coordinates = [
{x: 3, y: 20, z: 1}, {x: 2, y: 20, z: 1}, {x: 2, y: 20, z: 0}, {x: 3, y: 20, z: 0}, {x: 3, y: 22, z: 0}, {x: 2, y: 22, z: 0},														  //dad chair
{x: -1 , y: 17, z: 0}, {x: -1.5, y: 17, z: 0}, {x: -1.5, y: 17.5, z: 0}, {x: -1, y: 17.5, z: 0}, {x: -1 , y: 17, z: 3}, {x: -1.5, y: 17, z: 3}, {x: -1.5, y: 17.5, z: 3}, {x: -1, y: 17.5, z: 3}, //tall collumn
{x: 0, y: 16, z: 0}, {x: 0, y: 15, z: 0}, {x: -1, y: 15, z: 0}, {x: -1, y: 16, z: 0},					//square on floor
{x: -4, y: 14, z: 0}, {x: -4, y: 23, z: 0}, {x: 4, y: 23, z: 0}, {x: 4, y: 14, z: 0},					//floor
{x: -4, y: 23, z: 0}, {x: 4, y: 23, z: 0}, {x: 4, y: 23, z: 2.5}, {x: -4, y: 23, z: 2.5},			    //back wall
{x: -1, y: 23, z: 1.8}, {x: 1, y: 23, z: 1.8}, {x: 0, y: 23, z: 0.3},									//triangle on back wall
{x: -10, y: 50, z: 0}, {x: -10, y: 60, z: 0}, {x: 10, y: 60, z: 0}, {x: 10, y: 50, z: 0}
]

faceVerticies = [
{v: [29,30,31,32], c: 5},
{v: [22,23,24,25], c: 0}, 					//back wall
{v: [26,27,28], c: 1},						//triangle on back wall
{v: [18,19,20,21], c: 2},					//floor
{v: [2,3,4,5], c: 3}, {v: [0,1,2,3], c: 3},																											//dad chair
{v: [6,7,8,9], c: 4}, {v: [8,9,13,12], c: 4}, {v: [7,8,12,11], c: 4}, {v: [6,9,13,10], c: 4}, {v: [10,11,12,13], c: 4}, {v: [6,7,11,10], c: 4},		//tall collumn
{v: [14,15,16,17], c: 5}					//square on floor
]

for (r = 0; r <= 100; r += 2){
	coordinates.push({x: -50 + r, y: 10, z: 0})
	coordinates.push({x: -50 + r, y: 110, z: 0})
	faceVerticies.unshift({v: [coordinates.length -1, coordinates.length-2], c: 6 })
}

for (r = 0; r <= 100; r += 2){
	coordinates.push({x: -50, y: 10 + r, z: 0})
	coordinates.push({x: 50, y: 10 + r, z: 0})
	faceVerticies.unshift({v: [coordinates.length -1, coordinates.length-2], c: 6 })
}


cam = {x: 0, y: 0, z: 3, pitch: 0, yaw: 0, roll: 0}		//coordinates of the camera
fov = 50 						//field of view in degrees

pixelsPerDegree = width / fov					//the amount of pixels that one degree spreads over
walkStep = 2
lookStep = 5

eyeDif = 0.28				//amount to shift cam by for different 


function takeStep(yaw){
	cam.x = walkStep * Math.sin(radFromDeg(yaw)) + cam.x
	cam.y = walkStep * Math.cos(radFromDeg(yaw)) + cam.y
}


function drawPoints(points, canvas){	//acctually does the drawing of the coordinates from the canvas coordinates fills in with reference to the shape index array
	if (canvas == 1){
	for (s = 0; s < faceVerticies.length; s++){
		shape = faceVerticies[s].v
		ctx1.strokeStyle = "black"
		ctx1.beginPath(points[shape[0]].y, height - points[shape[0]].x)
		for (p = 1; p < shape.length; p++){
			ctx1.lineTo(points[shape[p]].y, height - points[shape[p]].x)
			ctx1.stroke()
		}	
		ctx1.lineTo(points[shape[0]].y, height - points[shape[0]].x)
		ctx1.stroke()
		ctx1.closePath()
		ctx1.fillStyle = colors[faceVerticies[s].c]
		ctx1.fill()
	}
	}
	else {
	for (s = 0; s < faceVerticies.length; s++){
		shape = faceVerticies[s].v
		ctx2.strokeStyle = "black"
		ctx2.beginPath(points[shape[0]].y, height - points[shape[0]].x)
		for (p = 1; p < shape.length; p++){
			ctx2.lineTo(points[shape[p]].y, height - points[shape[p]].x)
			ctx2.stroke()
		}
		ctx2.lineTo(points[shape[0]].y, height - points[shape[0]].x)
		ctx2.stroke()
		ctx2.closePath()
		ctx2.fillStyle = colors[faceVerticies[s].c]
		ctx2.fill()
	}
	}
}


function renderObjects(){		//draws the 3d objects from their coordinates and cam position onto canvas in 2d
	
	worldTransate = (x,y,z) => (o => ({x: o.x + x, y: o.y + y, z: o.z + z}))


	xWorldRotate = (r) => (  o => ({x: o.x,  y: o.y * Math.cos(r) + o.z * Math.sin(r),  z:  -o.y * Math.sin(r) + o.z * Math.cos(r) })  )
	yWorldRotate = (r) => (  o => ({x: o.x * Math.cos(r) + o.z * Math.sin(r),  y: o.y,  z : -o.x * Math.sin(r) + o.z * Math.cos(r)})   )
	zWorldRotate = (r) => (  o => ({x: o.x * Math.cos(r) - o.y * Math.sin(r),  y: o.x * Math.sin(r) + o.y * Math.cos(r),  z: o.z})     )
	
	
	//RENDERING RIGHT WORLD 2D COORDINATE POSITIONS
	rightCoords = coordinates.map(o => ({x: o.x + eyeDif, y: o.y, z: o.z}) )
	
	transformedCoords = rightCoords.map(worldTransate(-cam.x, - cam.y, -cam.z)).map( zWorldRotate(radFromDeg(cam.yaw))).map(xWorldRotate(radFromDeg(cam.pitch))).map(worldTransate(cam.x,cam.y,cam.z))
	
	coordinateAngles = transformedCoords.map(angleFromCoord)
	
	canvasCoordinates = coordinateAngles.map(o => ( { x: width / 2 + (o.yaw * pixelsPerDegree), y: height / 2 - (o.pitch * pixelsPerDegree) } ))
	
	drawPoints(canvasCoordinates, 1)

	//RENDERING LEFT WORLD 2D COORDINATE POSITIONS
	leftCoords = coordinates.map(o => ({x: o.x - eyeDif, y: o.y, z: o.z}) )
	
	transformedCoords = leftCoords.map(worldTransate(-cam.x, - cam.y, -cam.z)).map( zWorldRotate(radFromDeg(cam.yaw))).map(xWorldRotate(radFromDeg(cam.pitch))).map(worldTransate(cam.x,cam.y,cam.z))
	
	coordinateAngles = transformedCoords.map(angleFromCoord)
	
	canvasCoordinates = coordinateAngles.map(o => ( { x: width / 2 + (o.yaw * pixelsPerDegree), y: height / 2 - (o.pitch * pixelsPerDegree) } ))
	
	drawPoints(canvasCoordinates, 2)
	
	
}

function angleFromCoord(coord){									   //takes a coordinate and returns the yaw and pitch angles from the camera
	yaw =  degFromRad( Math.atan2(coord.x - cam.x, coord.y - cam.y) )	
	pitch = degFromRad(Math.atan2(coord.z - cam.z, coord.y - cam.y) )

	return {yaw: yaw, pitch: pitch}
}

function moduloCamViewpoint(){
	while (cam.yaw <= -180) cam.yaw += 360
	while (cam.yaw > 180) cam.yaw -= 360
	while (cam.pitch <= -180) cam.pitch += 360
	while (cam.pitch > 180) cam.pitch -= 360
}

function renderWorld(){			 //draws the world from given cam perspective and object coodinates
	document.getElementById("data").innerText = "Camera \xa0 x: " + padLeft(cam.x) + ", y: " + padLeft(cam.y) + ", z: " + padLeft(cam.z) + ", yaw: " + padLeft(cam.yaw) +  ", pitch: " + padLeft(cam.pitch) + ", roll: " + padLeft(cam.roll)
	
	clearScreen()
	
	moduloCamViewpoint()
	renderObjects()
	renderCrosshairs()
}

setInterval(renderWorld, 10)

//SHORT USEFULL FUNCTIONS THAT ARE USED BUT ALREADY WORK //SHORT USEFULL FUNCTIONS THAT ARE USED BUT ALREADY WORK//SHORT USEFULL FUNCTIONS THAT ARE USED BUT ALREADY WORK//SHORT USEFULL FUNCTIONS THAT ARE USED BUT ALREADY WORK//SHORT USEFULL FUNCTIONS THAT ARE USED BUT ALREADY WORK//SHORT USEFULL FUNCTIONS THAT ARE USED BUT ALREADY WORK
function resetWorld(){
	cam = {x: 0, y: 0, z: 3, pitch: 0, yaw: 0}		//coordinates of the camera
}

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
