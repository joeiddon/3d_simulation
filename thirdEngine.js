//cam = {x: ,y: ,z: , yaw: ,pitch: ,roll: ,fov: }
//world = [{verts: [{x: ,y: ,z: }, {x: ,y: ,z: }, ...], col: }, {verts: [{x: ,y: ,z: }, {x: ,y: ,z: }, ...], col: }, ...]

function render(world, cam, canvas, wireframe){
	var ctx = canvas.getContext("2d")
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	
	//order the faces in the world **furthest to closest**
	if (!wireframe) world.sort((a,b) => (distance(centroid(b.verts), cam) - distance(centroid(a.verts), cam)))
	
	for (var f = 0; f < world.length; f++){
		
		//align coordinates to camera view angle	
		var alignedCoords = world[f].verts.map(translate(-cam.x, -cam.y, -cam.z)).map(zAxisRotate(toRad(cam.yaw))).map(yAxisRotate(toRad(cam.roll))).map(xAxisRotate(toRad(cam.pitch))).map(translate(cam.x,cam.y,cam.z))

		//convert the coordinates to yaw pitch angles from cam center line
		var canvasAngles = alignedCoords.map(c => ({yaw: toDeg(Math.atan2(c.x - cam.x, c.y - cam.y)), pitch: toDeg(Math.atan2(c.z - cam.z, c.y - cam.y))}) )
		
		//convert angles to canvas coordinates
		var canvasCoords = canvasAngles.map(a => ({x: canvas.width/2 + (a.yaw * (canvas.width/cam.fov)), y: canvas.height/2 - (a.pitch * (canvas.width/cam.fov))}))

        if (!canvasCoords.some(c => onScreen(c, cnvs.width, cnvs.height))) continue

		//draw the face on the canvas
		drawFace(canvasCoords, world[f].col, ctx, wireframe)
	}
}

function drawFace(coords, col, ctx, wireframe){
	ctx.beginPath(coords[0].x, coords[0].y)
	for (var c = 0; c < coords.length; c++){
		ctx.lineTo(coords[c].x, coords[c].y)
	}
	ctx.closePath()
	ctx.strokeStyle = wireframe ? "white" : "black"
	ctx.stroke()
	if (!wireframe){
		ctx.fillStyle = col
		ctx.fill()
	}
}

function angleToCoord(cam, coord){									   //takes a coordinate and returns the yaw and pitch angles from the camera
	var yaw =   toDeg(Math.atan2(coord.x - cam.x, coord.y - cam.y))
	var pitch = toDeg(Math.atan2(coord.z - cam.z, coord.y - cam.y))
	return {yaw: yaw, pitch: pitch}
}

function centroid(verts){
	centr = {x: 0, y: 0, z: 0}
	verts.forEach(function (v){centr.x+=v.x;centr.y+=v.y;centr.z+=v.z})
	return {x: centr.x/verts.length, y: centr.y/verts.length, z: centr.z/verts.length}
}

var onScreen = (c, w, h) => c.x > 0 && c.y > 0 && c.x < w && c.y < h
var distance = (co1, co2) => Math.sqrt(Math.pow(co2.x - co1.x , 2) + Math.pow(co2.y - co1.y , 2) + Math.pow(co2.z - co1.z , 2))
var translate = (x,y,z) => (o => ({x: o.x + x, y: o.y + y, z: o.z + z}))
var xAxisRotate = (r) => (o => ({x: o.x,                                    y: o.y * Math.cos(r) + o.z * Math.sin(r),  z: -o.y * Math.sin(r) + o.z * Math.cos(r)}))
var yAxisRotate = (r) => (o => ({x: o.x * Math.cos(r) + o.z * Math.sin(r),  y: o.y,                                    z: -o.x * Math.sin(r) + o.z * Math.cos(r)}))
var zAxisRotate = (r) => (o => ({x: o.x * Math.cos(r) - o.y * Math.sin(r),  y: o.x * Math.sin(r) + o.y * Math.cos(r),  z:  o.z})                                  )
var toDeg = (r) => r * (180 / Math.PI)
var toRad = (d) => d * (Math.PI / 180)
