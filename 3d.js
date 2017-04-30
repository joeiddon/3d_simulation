cnvs = document.getElementById("cnvs")
ctx = cnvs.getContext("2d")

var width, height

cnvs.width = width = 720
cnvs.height = height = 480

coords = [{x: 1, y: 5, z: 3}, {x: 0, y: 5, z: 3}, {x: 0, y: 5, z: 2}, {x: 1, y: 5, z: 2}]
camera = {x: 0, y: 0, z: 2}

var pixAngleRatio = 10

function drawPoint(horizontalAngle, verticalAngle){
	ctx.fillRect(width / 2 + horizontalAngle * pixAngleRatio, height / 2 - verticalAngle * pixAngleRatio, 2 , 2)
}

function drawPoints(angles){
	x = width / 2 + angles[0].h * pixAngleRatio
	y = height / 2 - angles[0].v * pixAngleRatio
	ctx.beginPath(x,y)	
	for (a = 1; a < angles.length; a ++){
		x = width / 2 + angles[a].h * pixAngleRatio
		y = height / 2 - angles[a].v * pixAngleRatio
		ctx.lineTo(x,y)
	}
	x = width / 2 + angles[0].h * pixAngleRatio
	y = height / 2 - angles[0].v * pixAngleRatio
	ctx.lineTo(x,y)	
	ctx.closePath()
	ctx.fillStyle = "teal"
	ctx.fill()	
}

function degFromRad(rad){
	return rad * (180 / Math.PI)
}

function cls(){
	ctx.clearRect(0, 0, width, height)
}


function drawLine(xStart, yStart, xFin, yFin){
   ctx.beginPath();
   ctx.moveTo(xStart, yStart);
   ctx.lineTo(xFin, yFin);
   ctx.stroke();
}

function drawCross(x, y, l){
	drawLine( width/2 + x + l, height / 2 + y, width / 2 + x - l, height /2 + y)
	drawLine(width /2 + x, height / 2 + y + l,width / 2 + x, height /2 + y - l)
}



function project(){
	cls()
	
	drawCross(0, 0, 30)
	
	for (a = 113.09; a <= 3 * 113.09; a += 113.09){
		drawCross(a, 0, 5)
		drawCross(-1 * a, 0, 5)
		drawCross(0, a, 5)
		drawCross(0, -1 * a, 5)
	}
	
	
	angles = []
	
	for (c = 0; c < coords.length; c++){
		coord = coords[c]		
		horizontalAngle = degFromRad(Math.atan((coord.x - camera.x) / (coord.y - camera.y)))
		verticalAngle = degFromRad(Math.atan((coord.z - camera.z) / (coord.y - camera.y)))
		drawPoint(horizontalAngle, verticalAngle)
		//console.log(horizontalAngle)
		//console.log(verticalAngle)
		
		angles.push({h : horizontalAngle, v : verticalAngle})
	}
	
	drawPoints(angles)
	
}
project()


setInterval(project, 1500)

