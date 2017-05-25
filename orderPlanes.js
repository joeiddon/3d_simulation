/* jshint esversion:6 */

// WHAT DOES IT DO?
// Decides what order to draw two planes in relative to a camera position


// ISSUES:
// - Split into different functions so you can understand
//   you can probably just combine this into one sort function
// - The function "plane1First" returns:
//     + true for plane1
//     + false for plane0
//     + true/false if it doesn't matter
//   TODO: Ideally, it should return a third value if it doesn't matter. This
//         would allow you to ignore it when sorting the list.
//         Otherwise you could get an A>B, B>C, C>A error...
// - The bounded planes must not intersect each other



// USAGE:
// Given
//   - 2 planes (p0, p1) defined by at least three points each (more is fine)
//   - camera position
// plane0 = new Plane([
//                     {x:p0[0].x, y:p0[0].y, z:p0[0].z},
//                     {x:p0[1].x, y:p0[1].y, z:p0[1].z},
//                     {x:p0[2].x, y:p0[2].y, z:p0[2].z}, ...
//                    ])
// plane1 = new Plane([{ ... (copy above) ... }, {...}, {...}])
//
// if(plane1First(plane0, plane1, camera)){
//   // DRAW Plane1 FIRST
// } else {
//   // DRAW Plane0 FIRST
// }


/* Returns the vector from a {x:, y:, z:} to b {x:, y:, z:} */
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
  Takes points [{x:, y:, z:}...] and returns an 'Plane' object
  which has those points and a normal {x:, y:, z:}

  eg:
  var aPlane = new Plane( [{x:1, y:1, z:1},
                           {x:2, y:1, z:1},
                           {x:1, y:3, z:1}] );
 */
function Plane(points){
  if(points.length < 3) throw "Not enough points for a Plane.";
  this.points = points;
  // Create two vectors which are the two sides of the
  // triangle that meet at p1.
  p1Top2 = vectorFromAtoB(points[0], points[1]);
  p1Top3 = vectorFromAtoB(points[0], points[2]);
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
  // if a . b == 0  then they are parallel
}



/* Returns true or false depending on whether the two points
   (point1, point2) are split by the plane (dividingPlane).
 */
function arePointsOnSameSideOfPlane(dividingPlane, point1, point2){
  // First calculate vectors from each of the points to a point
  // on the plane.
  point1ToPlane = vectorFromAtoB(point1, dividingPlane.points[0]);
  point2ToPlane = vectorFromAtoB(point2, dividingPlane.points[0]);

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



/* Goes through a list of points and returns true if they are all on the same
   side of a given plane
 */
function areAllPointsOnSameSide(dividingPlane, listOfPoints){
  for(let checkIndex = 0 ; checkIndex < listOfPoints.length ; checkIndex++){

    if(!arePointsOnSameSideOfPlane(dividingPlane, listOfPoints[0],
                                   listOfPoints[checkIndex])) return false;
  }
  return true;
}


/*
  Returns true=1  if plane1 should be drawn in front of plane0
  Returns false=0 if plane0 should be drawn in front of plane1

  Camera is a {x:, y:, z:} of the camera position
 */

function plane1First(plane0, plane1, camera){
  // Standard Cases                       Case | Draw Which First?
  //   Case1 | Case2 | Case3 | Case4      1    | either
  //   \  /  | 1  /  | \  0  | 1  0       2    | 0
  //    \/   |  \/   |  \/   |  \/        3    | 1
  //    /\   |  /\   |  /\   |  /\        4    | either
  //   0Ca1  | 0Ca\  | /Ca1  | /Ca\       5    | either
  //                                      6    | either
  // Parallel Cases                       7    | 0
  //   Case5 | Case6 | Case7 | Case8      8    | 1
  //   ----0 | ----1 | Ca    | Ca         9    | 0
  //      Ca |    Ca | ----0 | ----1      10   | 1
  //   ----1 | ----0 | 1 --- | 0 ---      11   | 0
  //                                      12   | 1
  // Cases where one face lies on
  // the intersect:
  //   Case9 | Case10 | Case11 | Case12
  //   \  /  | \  0   | 1  /   | \  /
  //    1/   |  1/    |  \0    |  \0
  //    /1   |  /1    |  0\    |  0\
  //   0Ca\  | /Ca\   | /Ca\   | /Ca1


  // Use just the first point in the list to elimiate Case[2,3,7,8]
  p0AndCamera = arePointsOnSameSideOfPlane(plane1, plane0.points[0], camera);
  p1AndCamera = arePointsOnSameSideOfPlane(plane0, plane1.points[0], camera);
  if( p0AndCamera && !p1AndCamera) return 0; // Case2/7/9/11
  if(!p0AndCamera &&  p1AndCamera) return 1; // Case3/8/10/11

  // At this point:
  // Case[2,3,7,8] have been dealt with
  // Case[1,4,5,6] still haven't be dealt with at all
  // Case[9,10,11,12] have been partially dealt with (depending
  //                  on which side planeX.points[0] was on)

  // We don't care about the return value for Case[1,4,5,6] so we
  // only need to sort out Case[9,10,11,12]

  if( p0AndCamera &&  p1AndCamera){
    // This must be:
    //  Case[1,5,6] -> draw either first
    //  Case9       -> draw 0 first
    //  Case12      -> draw 1 first
    if(areAllPointsOnSameSide(plane1, plane0.points)) return 0;// Case9
    if(areAllPointsOnSameSide(plane0, plane1.points)) return 1;// Case12
    return 1;// Case[1,5,6]
  }
  if(!p0AndCamera && !p1AndCamera){
    // This must be:
    //  Case4  -> draw either first
    //  Case10 -> draw 1 first
    //  Case11 -> draw 0 first
    if(areAllPointsOnSameSide(plane1, plane0.points)) return 1;// Case10
    if(areAllPointsOnSameSide(plane0, plane1.points)) return 0;// Case11
    return 0; // Case4
  }


}
