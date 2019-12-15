/* jshint esversion:6 */


// Tests plane0, plane1, camera gives the expected.
// If the order doesn't matter, pass in 10 as the expected
function test(plane0, plane1, camera, expected){
  plane0 = new Plane(plane0);
  plane1 = new Plane(plane1);
  camera = arrayToObject(camera);
  if(plane1First(plane0, plane1, camera) != expected && expected != 10){
    console.error("Test failed", plane0, plane1, camera, expected);
  }
}

function arrayToObject(arr){ // [x, y, z] -> {x:x, y:y, z:z}
    if(arr.length != 3) throw "Need 3 values for (x, y, z).";
    return {x: arr[0], y: arr[1], z:arr[2]};
}

shape1 = [[-1,  2, 0], [ 0,  1, 1], [ 0,  1, -1]].map(arrayToObject);
shape2 = [[-1, -2, 0], [ 0, -1, 1], [ 0, -1, -1]].map(arrayToObject);
shape3 = [[ 2,  1, 0], [ 3,  2, 1], [ 3,  2, -1]].map(arrayToObject);
shape4 = [[ 2, -1, 0], [ 3, -2, 1], [ 3, -2, -1]].map(arrayToObject);

shape5 = [[0,  1, 0], [1,  1, 1], [1,  1, -1]].map(arrayToObject);
shape6 = [[0, -1, 0], [1, -1, 1], [1, -1, -1]].map(arrayToObject);


let tmp = crossProduct({x:1, y:1, z:1}, {x:1, y:1, z:-1});
if(tmp.x != -2 || tmp.y != 2 || tmp.z !== 0) throw "Cross product wrong.";


tmp = new Plane(shape2);
if(tmp.norm.x / tmp.norm.y != -1)
  throw "This shape should have a norm of the form (n,-n,0).";

for(let tmp2 of shape2)
  if(!isPointOnPlane(tmp2, tmp))
    throw "All points of shape2 should be on shape2's plane.";

for(let tmp2 of shape4)
  if(isPointOnPlane(tmp2, tmp))
    throw "All points on shape4 should not be on shape2's plane.";

if(arePointsOnSameSideOfPlane(new Plane(shape2), {x:2, y:-1, z:0},
                              {x: 0, y: 0, z: 0}))
  throw "These points should be split by this plane!";

// Without complicated shaped with points ON the intersect.
test(shape1, shape2, [0, 0, 0], 10); // Case1
test(shape1, shape3, [0, 0, 0], 0);  // Case2
test(shape4, shape2, [0, 0, 0], 1);  // Case3
test(shape4, shape3, [0, 0, 0], 10); // Case4


test(shape5, shape6, [0,  0, 0], 10); // Case5
test(shape6, shape5, [0,  0, 0], 10); // Case6
test(shape5, shape6, [0,  2, 0], 0); // Case7
test(shape5, shape6, [0, -2, 0], 1); // Case8


test(shape1, shape2.concat(shape3), [0, 0, 0], 0); // Case9
test(shape4, shape2.concat(shape3), [0, 0, 0], 1); // Case10
test(shape1.concat(shape4), shape3, [0, 0, 0], 0); // Case11
test(shape1.concat(shape4), shape2, [0, 0, 0], 1); // Case12

// WITH POINTS ON THE intersect
shape7  = [[0,  1, 0], [1, 0, 1], [1, 0, -1]].map(arrayToObject);
shape8  = [[0, -1, 0], [1, 0, 1], [1, 0, -1]].map(arrayToObject);
shape9  = [[2,  1, 0], [1, 0, 1], [1, 0, -1]].map(arrayToObject);
shape10 = [[2, -1, 0], [1, 0, 1], [1, 0, -1]].map(arrayToObject);
test(shape7,  shape8, [0, 0, 0], 10); // Case1
test(shape7,  shape9, [0, 0, 0], 0);  // Case2
test(shape10, shape8, [0, 0, 0], 1);  // Case3
test(shape10, shape9, [0, 0, 0], 10); // Case4
test(shape7, shape2.concat(shape9), [0, 0, 0], 0); // Case9
test(shape10, shape2.concat(shape9), [0, 0, 0], 1); // Case10
test(shape1.concat(shape10), shape9, [0, 0, 0], 0); // Case11
test(shape1.concat(shape10), shape8, [0, 0, 0], 1); // Case12
