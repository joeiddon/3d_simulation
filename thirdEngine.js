//cam = {x: , y: ,z: , yaw: ,pitch: ,roll: ,fov: }

//world = {{verts: [{x: ,y: ,z: }, {x: ,y: ,z: }, ...], c: }, {verts: [{x: ,y: ,z: }, {x: ,y: ,z: }, ...], c: }, ...}
var testWorld = {{verts: [{x: 10,y: 10,z: 10}, {x: 10,y: 10,z: 10}], c: "blue"}, {verts: [{x: 50,y: 50,z: 50}, {x: 50,y: 50,z: 50}], c: "red"}}

function render(world, camera, canvas){
	world.sort((a,b) => (distanceBetween(centroid(a.verts), cam) > distanceBetween(centroid(b.verts), cam)))
	return world
	//var transformedCoords = coordinates.map(worldTransate(-cam.x, - cam.y, -cam.z)).map( zWorldRotate(radFromDeg(cam.yaw))).map(xWorldRotate(radFromDeg(cam.pitch))).map( yWorldRotate(radFromDeg(cam.roll))).map(worldTransate(cam.x,cam.y,cam.z))	
}

var centroid = function(verts){
	centr = {x: 0, y: 0, z: 0}
	verts.forEach(function (v){centr.x+=v.x;centr.y+=v.y;centr.z+=v.z})
	return {x: centr.x/verts.length, y: centr.y/verts.length, z: centr.z/verts.length}
}
var distanceBetween = (co1, co2) => Math.sqrt(Math.pow(co2.x - co1.x , 2) + Math.pow(co2.y - co1.y , 2) + Math.pow(co2.z - co1.z , 2))
var worldTransate = (x,y,z) => (o => ({x: o.x + x, y: o.y + y, z: o.z + z}))
var	xWorldRotate = (r) => (  o => ({x: o.x,  y: o.y * Math.cos(r) + o.z * Math.sin(r),  z:  -o.y * Math.sin(r) + o.z * Math.cos(r) })  )
var	yWorldRotate = (r) => (  o => ({x: o.x * Math.cos(r) + o.z * Math.sin(r),  y: o.y,  z : -o.x * Math.sin(r) + o.z * Math.cos(r)})   )
var	zWorldRotate = (r) => (  o => ({x: o.x * Math.cos(r) - o.y * Math.sin(r),  y: o.x * Math.sin(r) + o.y * Math.cos(r),  z: o.z})     )