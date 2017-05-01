cnvs = document.getElementById("cnvs")
ctx = cnvs.getContext("2d")

document.addEventListener("keydown", keyPress)

function keyPress(event){
	key = event.keyCode
	if (key == 81) cam.z += 0.5	//q
	if (key == 69) cam.z -= 0.5	//e
	if (key == 87) cam.y += 0.5	//w
	if (key == 83) cam.y -= 0.5	//s
	if (key == 65) cam.x -= 0.5	//a
	if (key == 68) cam.x += 0.5	//d
	project(cam)
}

var width, height

cnvs.width = width = 720
cnvs.height = height = 480

colors = ["teal", "green", "green", "cyan", "cyan", "cyan", "cyan", "cyan", "cyan", "orange"]

coords = [{x: 3, y: 5, z: 1}, {x: 2, y: 5, z: 1}, {x: 2, y: 5, z: 0}, {x: 3, y: 5, z: 0}, {x: 3, y: 7, z: 0}, {x: 2, y: 7, z: 0},														  //dad chair
{x: -1 , y: 2, z: 0}, {x: -1.5, y: 2, z: 0}, {x: -1.5, y: 2.5, z: 0}, {x: -1, y: 2.5, z: 0}, {x: -1 , y: 2, z: 3}, {x: -1.5, y: 2, z: 3}, {x: -1.5, y: 2.5, z: 3}, {x: -1, y: 2.5, z: 3}, //tall collumn
{x: 0, y: 1, z: 0}, {x: 0, y: 0, z: 0}, {x: -1, y: 0, z: 0}, {x: -1, y: 1, z: 0},					//flat shape on 0,0
{x: -3, y: -1, z: 0}, {x: -3, y: 8, z: 0}, {x: 4, y: 8, z: 0}, {x: 4, y: -1, z: 0}]					//floor
shapeIndexs = [[18,19,20,21], [2,3,4,5], [0,1,2,3], [6,7,8,9], [8,9,13,12], [7,8,12,11], [6,9,13,10], [10,11,12,13], [6,7,11,10], [14,15,16,17]]
cam = {x: 0, y: -8, z: 3}
var pixAngleRatio = 18		//the amount of pixels that one degree spreads over


function drawPoint(horizontalAngle, verticalAngle){		//draws a single point from its angles from the center line( y axis )
	ctx.fillRect(width / 2 + horizontalAngle * pixAngleRatio, height / 2 - verticalAngle * pixAngleRatio, 2 , 2)
}

function drawPoints(points){	//acctually does the drawing of the coordinates from the canvas coordinates fills in with reference to the shape index array
	for (s = 0; s < shapeIndexs.length; s++){
		shape = shapeIndexs[s]
		ctx.strokeStyle = "black"
		ctx.beginPath(points[shape[0]].x, points[shape[0]].y)
		ctx.lineTo(points[shape[1]].x, points[shape[1]].y)
		ctx.stroke()
		ctx.lineTo(points[shape[2]].x, points[shape[2]].y)
		ctx.stroke()
		ctx.lineTo(points[shape[3]].x, points[shape[3]].y)
		ctx.stroke()
		ctx.lineTo(points[shape[0]].x, points[shape[0]].y)
		ctx.stroke()
		ctx.closePath()
		ctx.fillStyle = colors[s]
		ctx.fill()
	}
}

function drawAngles(angles){		//draws a set of 3d coordinates from their vertical and horizontal angles from the center line (y axis)
	points = []
	for (a = 0; a < angles.length; a ++){
		points.push({x: width / 2 + angles[a].h * pixAngleRatio, y: height / 2 - angles[a].v * pixAngleRatio})
	}
	drawPoints(points)
}
	

function degFromRad(rad){			//returns degree angle from radian angle
	return rad * (180 / Math.PI)
}

function clearScreen(){				//returns canvas to balank screen
	ctx.clearRect(0, 0, width, height)
}


function drawLine(xStart, yStart, xFin, yFin){	//draws a line on the canvas
   ctx.beginPath();
   ctx.moveTo(xStart, yStart);
   ctx.lineTo(xFin, yFin);
   ctx.stroke();
}

function drawCross(x, y, l){	 //draws a cross on canvas in relation to the midpoint
	drawLine( width/2 + x + l, height / 2 + y, width / 2 + x - l, height /2 + y)
	drawLine(width /2 + x, height / 2 + y + l,width / 2 + x, height /2 + y - l)
}

function drawAxis(){			//draws the two axis and center crosshar
	drawCross(0, 0, 30)
	for (a = 113.09; a <= 3 * 113.09; a += 113.09){
		drawCross(a, 0, 5)
		drawCross(-1 * a, 0, 5)
		drawCross(0, a, 5)
		drawCross(0, -1 * a, 5)
	}
}

function drawWorld(camera){		//draws the 3d objects from their coordinates and camera position onto canvas in 2d
	angles = []
	for (c = 0; c < coords.length; c++){
		coord = coords[c]		
		horizontalAngle = degFromRad(Math.atan((coord.x - camera.x) / Math.sqrt((coord.x - camera.x) * (coord.x - camera.x) + (coord.y - camera.y) * (coord.y - camera.y) )))
		verticalAngle = degFromRad(Math.atan((coord.z - camera.z) / (coord.y - camera.y)))
		//drawPoint(horizontalAngle, verticalAngle)
		//console.log(horizontalAngle)
		//console.log(verticalAngle)
		angles.push({h : horizontalAngle, v : verticalAngle})
	}
	drawAngles(angles)
}

function project(camera){			 //draws the world from given camera perspective and object coodinates
	document.getElementById("data").innerText = parseInt(cam.x) + "," + parseInt(cam.y) + "," + parseInt(cam.z)

	clearScreen()
	
	drawWorld(camera)	
	drawAxis()
	drawAxis()
}

project(cam)


//setInterval(project, 1500)

