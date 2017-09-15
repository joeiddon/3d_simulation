function render(world, cam, canvas, wireframe){
	var ctx = canvas.getContext("2d")
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	
	//order the faces in the world **furthest to closest**
	if (!wireframe) world.sort((a,b) => (distanceBetween(centroid(a.verts), cam) < distanceBetween(centroid(b.verts), cam)))
	
	for (var f = 0; f < world.length; f++){
		
		//align coordinates to camera view angle	
		var canvasVerts = world[f].verts.map(translate(-cam.x, -cam.y, -cam.z)).map(zAxisRotate(toRad(cam.yaw))).map(yAxisRotate(toRad(cam.roll))).map(xAxisRotate(toRad(cam.pitch))).map(translate(cam.x,cam.y,cam.z))		
		
		//convert the coordinates to yaw pitch angles from cam center
		canvasVerts = canvasVerts.map(c => ({yaw: toDeg(Math.atan2(c.x - cam.x, c.y - cam.y)), pitch: toDeg(Math.atan2(c.z - cam.z, c.y - cam.y))}) )
		
		//convert angles to canvas coordinates
		canvasVerts = canvasVerts.map(a => ({x: canvas.width/2 + (a.yaw * (canvas.width/cam.fov)), y: canvas.height/2 - (a.pitch * (canvas.width/cam.fov))}) )
		
		//draw the face on the canvas
		drawFace(canvasVerts, world[f].col, ctx, wireframe)
	}
}

function drawFace(verts, col, ctx, wireframe){
	ctx.beginPath(verts[0].x, verts[0].y)
	for (var v = 0; v < verts.length; v++){
		ctx.lineTo(verts[v].x, verts[v].y)
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

//var angleToCoord = (cam, coord) => ({yaw: toDeg(Math.atan2(coord.x - cam.x, coord.y - cam.y)), pitch: toDeg(Math.atan2(coord.z - cam.z, coord.y - cam.y))})
var distanceBetween = (co1, co2) => Math.sqrt(Math.pow(co2.x - co1.x , 2) + Math.pow(co2.y - co1.y , 2) + Math.pow(co2.z - co1.z , 2))
var translate = (x,y,z) => (o => ({x: o.x + x, y: o.y + y, z: o.z + z}))
var	xAxisRotate = (d) => (o => ({x: o.x,                                    y: o.y * Math.cos(d) + o.z * Math.sin(d),  z: -o.y * Math.sin(d) + o.z * Math.cos(d)}))
var yAxisRotate = (d) => (o => ({x: o.x * Math.cos(d) + o.z * Math.sin(d),  y: o.y,                                    z: -o.x * Math.sin(d) + o.z * Math.cos(d)}))
var	zAxisRotate = (d) => (o => ({x: o.x * Math.cos(d) - o.y * Math.sin(d),  y: o.x * Math.sin(d) + o.y * Math.cos(d),  z:  o.z})                                  )
var toDeg = (r) => r * (180 / Math.PI)
var toRad = (d) => d * (Math.PI / 180)
var copyFace = f => ({})