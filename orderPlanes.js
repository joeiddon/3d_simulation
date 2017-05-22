/* jshint esversion:6 */

// WHAT DOES IT DO?
// Decides what order to draw two planes in relative to a camera position


// ISSUES:
// - Really inefficient, split into different functions so you can understand
//   you can probably just combine this into one arrow function
// - The planes must not intersect each other.
// - What happens if point1 lies on plane?!


// USAGE:
// Given two planes (p0, p1) defined by three points {x:, y:, z:}
// and a camera position {x:, y:, z:}
//
// plane0 = new Plane(
//                     {x:p0[0].x, y:p0[0].y, z:p0[0].z},
//                     {x:p0[1].x, y:p0[1].y, z:p0[1].z},
//                     {x:p0[2].x, y:p0[2].y, z:p0[2].z}
//                   )
// plane1 = new Plane({ ... (copy above) ... }, {...}, {...})
//
// if(plane1First(plane0, plane1, camera)){
//   // DRAW Plane1 FIRST
// } else {
//   // DRAW Plane0 FIRST
// }








/* Returns the vector from a {x:, y:, z:} to be {x:, y:, z:} */
function vectorFromAtoB(a, b){
  return {
    x: b.x - a.x,
    y: b.y - a.y,
    z: b.z - a.z
  };
}

/* Returns the dot product a . b
  a . b = a.x * b.x + a.y * b.y + a.z * b.z
 */
function dotProduct(a, b){
  return a.x * b.x + a.y * b.y + a.z * b.z;
}


/* Returns the cross product a x b
  a x b = |   i   j   k|
          | a.x a.y a.z|
          | b.x b.y b.z|
        =   i(a.y * b.z - b.y * a.z)
          - j(a.x * b.z - b.x * a.z)
          + k(a.x * b.y - b.x * a.y)
*/
function crossProduct(a, b){
  return {
    x: a.y * b.z - b.y * a.z,
    y: a.x * b.z - b.x * a.z,
    z: a.x * b.y - b.x * a.y
  };
}


/*
  Takes three points {x:, y:, z:} and returns an 'Plane' object
  which has a point {x:, y:, z:} and a normal {x:, y:, z:}

  eg:
  var aPlane = new Plane( {x:1, y:1, z:1},
                          {x:2, y:1, z:1},
                          {x:1, y:3, z:1} );
 */
function Plane(point1, point2, point3){
  this.point = point1;
  // Create two vectors which are the two sides of the
  // triangle that meet at p1.
  p1Top2 = vectorFromAtoB(point1, point2);
  p1Top3 = vectorFromAtoB(point1, point3);
  // If you do the cross product of two vectors, you get
  // a vector that is at right angles to the two vectors.
  // In this case, this is a normal to the plane.
  this.norm = crossProduct(p1Top2, p1Top3);
}


/* Returns whether the two vectors point in roughly the same
   direction.

   Are they both pointing at or away from their intersect?
 */
function pointingInSameDirection(a, b){
  // The dot product a . b is |a||b| cos (t) where t is the
  // angle between the two vectors.
  // In english:
  //      a . b gives the product of the two lengths of the
  //      vectors, multiplied by the cos of the angle between
  //      them.
  // Their angle is:
  //      0 < t < 90    if broadly pointing in same direction
  //      90 < t < 180  if broadly pointing in different direction
  // But cos(t) > 0 for 0 < t < 90
  // and cos(t) < 0 for 90 < t < 180
  // So:
  // a . b > 0  if a and b are pointing broadly in same direction
  // a . b < 0  if a and b are pointing broadly in different direction
  return dotProduct(a, b) > 0;
}



/* Returns true or false depending on whether the two points
   (point1, point2) are split by the plane (dividingPlane).
 */

function arePointsOnSameSideOfPlane(dividingPlane, point1, point2){
  // First calculate vectors from each of the points to a point
  // on the plane.
  point1ToPlane = vectorFromAtoB(point1, dividingPlane.point);
  point2ToPlane = vectorFromAtoB(point2, dividingPlane.point);

  // If the points are on the same side of the plane
  // then:
  //        1) They both point in same direction as the normal
  //        2) They both point in opposite direction as the normal
  // If the points are on different sides of the plane
  // then one points in the direction of the normal and the
  // other points away from the normal

  // The return values can be (f, f), (t, f), (f, t), (t, t)
  // The respective sum is    0+0=0   1+0=1   0+1=1   1+1=2
  // So if the sum is 1, they are on different sides
  // If the sum is 0 or 2, they are on the same side
  return (pointingInSameDirection(point1ToPlane, dividingPlane.norm) +
          pointingInSameDirection(point2ToPlane, dividingPlane.norm) != 1);
}


/*
  Returns true=1  if plane1 should be drawn in front of plane0
  Returns false=0 if plane0 should be drawn in front of plane1

  Camera is a {x:, y:, z:} of the camera position
 */

function plane1First(plane0, plane1, camera){
  // Case1 | Case2 | Case3 | Case4
  // \  /  | 1  /  | \  0  | 1  0
  //  \/   |  \/   |  \/   |  \/
  //  /\   |  /\   |  /\   |  /\
  // 0Ca1  | 0Ca\  | /Ca1  | /Ca\

  // Case5 | Case6 | Case7 | Case8
  // ----0 | ----1 | Ca    | Ca
  //    Ca |    Ca | ----0 | ----1
  // ----1 | ----0 | 1 --- | 0 ---
  p0AndCamera = arePointsOnSameSideOfPlane(plane1, plane0.point, camera);
  p1AndCamera = arePointsOnSameSideOfPlane(plane0, plane1.point, camera);
  if( p0AndCamera &&  p1AndCamera) return 1; // Case1/5/6 - doesn't matter
  if( p0AndCamera && !p1AndCamera) return 0; // Case2/7
  if(!p0AndCamera &&  p1AndCamera) return 1; // Case3/8
  if(!p0AndCamera && !p1AndCamera) return 0; // Case4 - doesn't matter

  // Although the above method is more readable, the order doesn't
  // matter in Case1/4/5/6 so we can ignore lines 1 and 4.
  // Looking at the input and return value from Case2/7 and Case3/8,
  // we only need to return !p1AndCamera
  // So p0AndCamera doesn't even need to be calculated!

}
