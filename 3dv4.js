cnvs = document.getElementById("cnvs")
ctx = cnvs.getContext("2d")

var width, height

cnvs.width = width = 1440
cnvs.height = height = 900

document.addEventListener("keydown", keyPress)

function keyPress(event){
	key = event.keyCode
	if (key == 88) cam.z -= walkStep		//x	fly down
	if (key == 90) cam.z += walkStep		//z fly up
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
	if (key == 187) fov += 10				//+ increase fov
	if (key == 189) fov -= 10				//- reduce fov
	
	renderWorld()
}

var arrToObj = (a) => ({x:a[0], y:a[1], z:a[2]})
//coordinates = stl.match(/vertex\s+(.*)/gm).map(l => f(l.match(/[-]*\d+/g).map(i => parseFloat(i))))

colors = ["#F19292", "yellow", "teal", "green", "cyan", "orange", "black", "#c6b9cc"]

coordinates = []

stlLines = stl.split("\n")

for (l = 0; l < stlLines.length; l ++){
	blocks = stlLines[l].trim().split(" ")
	if (blocks[0] != "vertex") continue
	blocks.splice(0,1)
	coordinates.push(arrToObj(blocks.map(i => parseFloat(i))))
}
	
	

faceVerticies = []

for (c = 0; c < coordinates.length; c += 3){
	faceVerticies.push({v: [c, c + 1, c + 2], c: 7})
}

/*
for (r = 0; r <= 100; r += 2){
	coordinates.push({x: r, y: 0, z: 0})
	coordinates.push({x: r, y: 100, z: 0})
	faceVerticies.unshift({v: [coordinates.length -1, coordinates.length-2], c: 6 })
}

for (r = 0; r <= 100; r += 2){
	coordinates.push({x: 0, y: r, z: 0})
	coordinates.push({x: 100, y: r, z: 0})
	faceVerticies.unshift({v: [coordinates.length -1, coordinates.length-2], c: 6 })
}
*/

cam = {x: 0, y: -50, z: 20, pitch: 0, yaw: 0, roll: 0, fov: 80}		//camera
walkStep = 5
lookStep = 5
wireframe = false


function takeStep(yaw){
	cam.x = walkStep * Math.sin(radFromDeg(yaw)) + cam.x
	cam.y = walkStep * Math.cos(radFromDeg(yaw)) + cam.y
}

distanceBetween = (co1, co2) => Math.sqrt(Math.pow(co2.x - co1.x , 2) + Math.pow(co2.y - co1.y , 2) + Math.pow(co2.z - co1.z , 2))

function centroidFace(face){	
	face = face.map(co => coordinates[co])
	avgCo = {x: 0, y: 0, z: 0}
	for (c = 0; c < face.length; c++){
		cord = face[c]
		avgCo.x += cord.x
		avgCo.y += cord.y
		avgCo.z += cord.z
	}
	return {x: avgCo.x / face.length, y: avgCo.y / face.length, z: avgCo.z / face.length}
}

function sortFaceVerticies(a, b){
	if ( distanceBetween(cam, centroidFace(a.v)) >  distanceBetween(cam, centroidFace(b.v)) ) return -1
	return 1
}

function drawPoints(canvasCoordinates){	//acctually does the drawing of the coordinates from the canvas coordinates fills in with reference to the shape index array
	if (!wireframe) sortedFaces = faceVerticies.sort(sortFaceVerticies)
	sortedFaces = faceVerticies
	for (s = 0; s < sortedFaces.length; s++){
		shape = sortedFaces[s].v
		ctx.beginPath(canvasCoordinates[shape[0]].x, canvasCoordinates[shape[0]].y)
		for (p = 1; p < shape.length; p++){
			ctx.lineTo(canvasCoordinates[shape[p]].x, canvasCoordinates[shape[p]].y)
		}
		ctx.lineTo(canvasCoordinates[shape[0]].x, canvasCoordinates[shape[0]].y)
		ctx.strokeStyle = "black"
		ctx.stroke()
		ctx.closePath()
		if (!wireframe){
			ctx.fillStyle = colors[sortedFaces[s].c]
			ctx.fill()
		}
	}
}

function renderObjects(){				//draws the 3d objects from their coordinates and cam position onto canvas in 2d


	worldTransate = (x,y,z) => (o => ({x: o.x + x, y: o.y + y, z: o.z + z}))


	xWorldRotate = (r) => (  o => ({x: o.x,  y: o.y * Math.cos(r) + o.z * Math.sin(r),  z:  -o.y * Math.sin(r) + o.z * Math.cos(r) })  )
	yWorldRotate = (r) => (  o => ({x: o.x * Math.cos(r) + o.z * Math.sin(r),  y: o.y,  z : -o.x * Math.sin(r) + o.z * Math.cos(r)})   )
	zWorldRotate = (r) => (  o => ({x: o.x * Math.cos(r) - o.y * Math.sin(r),  y: o.x * Math.sin(r) + o.y * Math.cos(r),  z: o.z})     )
	
	transformedCoords = coordinates.map(worldTransate(-cam.x, - cam.y, -cam.z)).map( zWorldRotate(radFromDeg(cam.yaw))).map(xWorldRotate(radFromDeg(cam.pitch))).map( yWorldRotate(radFromDeg(cam.roll))).map(worldTransate(cam.x,cam.y,cam.z))

	coordinateAngles = transformedCoords.map(angleFromCoord)
	
	canvasCoordinates = coordinateAngles.map(o => ( { x: width / 2 + (o.yaw * (width / cam.fov) ), y: height / 2 - (o.pitch * (width / cam.fov) ) } ))
	
	drawPoints(canvasCoordinates)
}

function angleFromCoord(coord){									   //takes a coordinate and returns the yaw and pitch angles from the camera
	yaw =  degFromRad( Math.atan2(coord.x - cam.x, coord.y - cam.y) )	
	pitch = degFromRad(Math.atan2(coord.z - cam.z, coord.y - cam.y) )

	return {yaw: yaw, pitch: pitch}
}

mapWidth = width / 5
mapHeight = height / 5
border = 0.6
gap = 5
arrowLength = 110

function renderMiniMap(){										//renders the minimap
	
	ctx.fillStyle = "black"
	ctx.fillRect(width - gap, gap, -mapWidth + border * -2, mapHeight + border * 2)
	ctx.fillStyle = "white"
	ctx.fillRect(width - border - gap, border + gap, -mapWidth, mapHeight)
	
	centerX = width - border - gap - mapWidth / 2
	centerY = border + gap + mapHeight / 2
	scale = 0.5
	pointLower = 70
	
	
	for (f = 0; f < faceVerticies.length; f++){
		face = faceVerticies[f]
		shape = face.v
		
		ctx.strokeStyle = "black"
		ctx.beginPath(centerX + coordinates[shape[0]].x * scale	, centerY  + coordinates[shape[0]].y * -1 * scale + pointLower)
		for (p = 1; p < shape.length; p++){
			ctx.lineTo(centerX + coordinates[shape[p]].x * scale, centerY  + coordinates[shape[p]].y * -1 * scale + pointLower)
			ctx.stroke()
		}
		ctx.lineTo(centerX + coordinates[shape[0]].x * scale, centerY  + coordinates[shape[0]].y * -1 * scale + pointLower)
		ctx.stroke()
		ctx.closePath()
		ctx.fillStyle = colors[face.c]
		ctx.fill()
	}
	
	drawLine(centerX - mapWidth / 2, centerY + pointLower, centerX + mapWidth / 2, centerY + pointLower)
	drawLine(centerX, centerY - (mapHeight / 2 + pointLower) + pointLower, centerX, centerY + mapHeight / 2)
	
	ctx.fillStyle = "#00ffed"
	ctx.fillRect(centerX + cam.x * scale -2 , centerY + cam.y * scale * -1 - 2 + pointLower, 4, 4)
	
	
	
	ctx.fillStyle = "rgbA(107,255,125,0.5)"
	ctx.beginPath(centerX + cam.x * scale, centerY + cam.y * scale * -1 + pointLower)
	ctx.lineTo(centerX + (Math.sin(radFromDeg(cam.yaw - 0.5 * cam.fov)) * arrowLength) + cam.x * scale, centerY - (Math.cos(radFromDeg(cam.yaw - 0.5 * cam.fov)) * arrowLength) + cam.y * scale * -1 + pointLower)
	ctx.arc(centerX + cam.x * scale, centerY + cam.y * scale * -1 + pointLower, arrowLength, radFromDeg(-90 - cam.fov * 0.5 + cam.yaw), radFromDeg(-90 + cam.fov * 0.5 + cam.yaw) )
	//ctx.lineTo(centerX + (Math.sin(radFromDeg(cam.yaw + 0.5 * fov)) * arrowLength) + cam.x, centerY - (Math.cos(radFromDeg(cam.yaw + 0.5 * fov)) * arrowLength) + cam.y * -1 )
	ctx.lineTo(centerX + cam.x * scale, centerY + cam.y * scale * -1 + pointLower)
	ctx.closePath()
	ctx.fill()
	
}

function moduloCamViewpoint(){
	while (cam.yaw <= -180) cam.yaw += 360
	while (cam.yaw > 180) cam.yaw -= 360
	while (cam.pitch <= -180) cam.pitch += 360
	while (cam.pitch > 180) cam.pitch -= 360
}

fontSize = 15

function renderHUD(){
	ctx.font = fontSize.toString() + "px " + "aerial"
	ctx.fillStyle = "red"
	rows = [
	["Camera:", ""],
	["x:", padLeft(cam.x)],
	["y:", padLeft(cam.y)],
	["z:", padLeft(cam.z)],
	["yaw:", padLeft(cam.yaw)],
	["pitch:", padLeft(cam.pitch)],
	["roll:", padLeft(cam.roll)],
	["fov:", padLeft(cam.fov)],
	]
	
	tableWidth = 70
	
	for (r = 0; r < rows.length; r++){
		ctx.textAlign = "left"
		ctx.fillText(rows[r][0], width - (mapWidth + 2 * border + gap), (mapHeight + 2 * border + gap) + r * fontSize + fontSize)
		ctx.textAlign = "right"
		ctx.fillText(rows[r][1], width - (mapWidth + 2 * border + gap) + tableWidth, (mapHeight + 2 * border + gap) + r * fontSize + fontSize)
	}
}


function renderWorld(){											//draws the world from given cam perspective and object coodinates
	document.getElementById("data").innerText = "Camera \xa0 x: " + padLeft(cam.x) + ", y: " + padLeft(cam.y) + ", z: " + padLeft(cam.z) + ", yaw: " + padLeft(cam.yaw) +  ", pitch: " + padLeft(cam.pitch) + ", roll: " + padLeft(cam.roll)
	
	
	moduloCamViewpoint()
	
	clearScreen()
	renderObjects()
	renderCrosshairs()
	renderMiniMap()
	renderHUD()
}

renderWorld()

//setInterval(renderWorld, 100)



//SHORT SPECIFIC FUNCTIONS//SHORT SPECIFIC FUNCTIONS//SHORT SPECIFIC FUNCTIONS//SHORT SPECIFIC FUNCTIONS//SHORT SPECIFIC FUNCTIONS//SHORT SPECIFIC FUNCTIONS//SHORT SPECIFIC FUNCTIONS//SHORT SPECIFIC FUNCTIONS

function centroidFace(face){									//returns centroid coordiante of  a face
	face = face.map(co => coordinates[co])
	avgCo = {x: 0, y: 0, z: 0}
	for (c = 0; c < face.length; c++){
		cord = face[c]
		avgCo.x += cord.x
		avgCo.y += cord.y
		avgCo.z += cord.z
	}
	return {x: avgCo.x / face.length, y: avgCo.y / face.length, z: avgCo.z / face.length}
}

function sortFaceVerticies(a, b){								//orderes face verticies a and b
	if ( distanceBetween(cam, centroidFace(a.v)) >  distanceBetween(cam, centroidFace(b.v)) ) return -1
	return 1
}
	
function padLeft(num){											//returns string of number padded from left to make a 5 charachter string
	return ("\xa0\xa0\xa0\xa0" + parseFloat(num.toFixed(0))).slice(-5)
}

function padRight(string, length){									//pads a string to a 7 charachter string
	return (string + "\xa0\xa0\xa0\xa0\xa0\xa0").slice(0,5)
}

function drawLine(xStart, yStart, xFin, yFin){					//draws a line on the canvas
   ctx.beginPath();
   ctx.moveTo(xStart, yStart);
   ctx.lineTo(xFin, yFin);
   ctx.stroke();
}

function drawCross(x, y, l){									//draws a cross on canvas in relation to the midpoint
	drawLine( width/2 + x + l, height / 2 + y, width / 2 + x - l, height /2 + y)
	drawLine(width /2 + x, height / 2 + y + l,width / 2 + x, height /2 + y - l)
}

function renderCrosshairs(){									//draws the two axis and center crosshar
	drawCross(0, 0, 30)
	for (a = 113.09; a <= 20 * 113.09; a += 113.09){
		drawCross(a, 0, 5)
		drawCross(-1 * a, 0, 5)
		drawCross(0, a, 5)
		drawCross(0, -1 * a, 5)
	}
}

function degFromRad(rad){										//returns degree angle from radian angle
	return rad * (180 / Math.PI)
}

function radFromDeg(deg){
	return deg * ( Math.PI / 180)
}

function clearScreen(){											//returns canvas to balank screen
	ctx.clearRect(0, 0, width, height)
}
