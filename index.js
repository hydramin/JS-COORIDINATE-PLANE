'use strict';
// Import stylesheets
import './style.css';

// Write Javascript code!
/*Defining the coordinate system unit length*/
const unit = 30;
const xmax = unit * 12;
const ymax = unit * 12;

const canvas = document.getElementById('canvas');
canvas.width = xmax;
canvas.height = ymax;

const ctx = canvas.getContext('2d');

/* Draw the x and y coordinates */
ctx.beginPath();
ctx.moveTo(0, ymax / 2);
ctx.lineTo(xmax, ymax / 2);

ctx.moveTo(xmax / 2, 0);
ctx.lineTo(xmax / 2, ymax);
ctx.stroke();

/* put the tick marks for each unit, horizontally and vertically */
function htick(xo, yo) {
  ctx.beginPath();
  ctx.moveTo(xo, yo);
  ctx.lineWidth = 1;
  ctx.lineTo(xo + 3, yo);
  ctx.stroke();
}

function vtick(xo, yo) {
  ctx.beginPath();
  ctx.moveTo(xo, yo);
  ctx.lineWidth = 1;
  ctx.lineTo(xo, yo + 3);
  ctx.stroke();
}

for (let i = 0; i <= ymax; i += unit) {
  htick(xmax / 2, i);
}

for (let i = 0; i <= xmax; i += unit) {
  vtick(i, ymax / 2);
}

// given (0,0) means (xmax/2,ymax/2)
// +x means adding to x + n.unit
// -x means minusing x - n.unit
// put a point (x,y)

const origin = { x: xmax / 2, y: ymax / 2 };

/* represents a point in the coordinate system, not on the canvas  */
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // projection of the point on the x axis and y axis
  proj() {
    return {
      xp: new Point(this.x, 0),
      yp: new Point(0, this.y),
    };
  }
}

/* represents a circle on the 2d coordinate system */
class Circle {
  constructor(x, y, r) {
    this.center = new Point(x, y);
    this.radius = r;
  }

  //given (x,y) return object {isOn:bool, isIn:bool}
  // isOn = true if (x,y) on circle else not
  // isIn = true if (x,y) inside circle else outside
  eqn(x, y) {
    const val = (x - this.center.x) ** 2 + (y - this.center.y) ** 2;
    const rsq = this.radius ** 2;
    return {
      isOn: val === rsq,
      isIn: val < rsq,
    };
  }

  // gives y0 and y1 (absent for left and right tangent points, a circle has 2 values for a given x in its domain)
  f(x) {
    const y0 =
      Math.sqrt(this.radius ** 2 - (x - this.center.x) ** 2) + this.center.y;
    const y1 =
      -Math.sqrt(this.radius ** 2 - (x - this.center.x) ** 2) + this.center.y;
    return [new Point(x, y0), new Point(x, y1)];
  }

  /* fetches the range and domain of the circle as a Point */
  getData() {
    return {
      max: applyVector(this.center, new Vector(0, this.radius)),
      min: applyVector(this.center, new Vector(0, -this.radius)),
      left: applyVector(this.center, new Vector(-this.radius, 0)),
      right: applyVector(this.center, new Vector(this.radius, 0)),
    };
  }

  /* prints the equation of the circle */
  prtEqn() {
    const plus = (n) => (-n > 0 ? `+${-n}` : `${-n}`);
    return `(x${plus(this.center.x)})^2 + (y${plus(this.center.y)})^2 = ${
      this.radius ** 2
    }`;
  }
}

/* Represents a vector */
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

/* scales a given length on the coordinate system to the actual pixle length
ln is length on the coordinate system, not a pixle length */
function scaleLen(ln) {
  return ln * unit;
}

/* given a point on the coordinate system it locates the actual pixle location on the canvas
with respect to the origin of the coordinate system */
function transformPt(pt) {
  return new Point(origin.x + pt.x * unit, origin.y - pt.y * unit);
}

/* draws a point on the coordinate system */
function putPoint(x, y, color = 'red', size = 1) {
  ctx.beginPath();
  const pt = transformPt(new Point(x, y));
  ctx.strokeStyle = color;
  ctx.arc(pt.x, pt.y, size, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}

/* Given a Circle object it draws the circle in the coordinate system
config - is used to customize the circle:
    from: 0,                -> Starting angle in radian
    to: Math.PI * 2,        -> Ending angle in radian
    color: 'black',         -> Stroke color
    counterClockwise: false -> Stroke direction
 */
function drawCircle(c, config) {
  const _default = {
    from: 0,
    to: Math.PI * 2,
    color: 'black',
    counterClockwise: false,
  };
  const newConfig = { ..._default, ...config };
  const drawCir = function (x, y, r, from, to, color, counterClockwise) {
    //print the center
    putPoint(x, y);
    //draw the circle
    ctx.beginPath();
    const transformedPt = transformPt(new Point(x, y));
    const c = new Circle(transformedPt.x, transformedPt.y, scaleLen(r));
    ctx.arc(c.center.x, c.center.y, c.radius, from, to, counterClockwise);
    ctx.strokeWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  drawCir(
    c.center.x,
    c.center.y,
    c.radius,
    newConfig.from,
    newConfig.to,
    newConfig.color,
    newConfig.counterClockwise
  );
}

/* given a Point object and a Vector object, it moves the point by the vector specified */
function applyVector(point, vector) {
  const x = point.x + vector.x;
  const y = point.y + vector.y;
  return new Point(x, y);
}

/*Given two circles on the coordinate plane, it translates one circle to the origin and 
translate the other circle by the vector used to translate the first circle
returns object {c0:Circle, c1:Circle, vr: Vector}, where c0 is the one on the origin, vr is the reverse vector
translating one circle to the origin allows easy calculation of  the intersection points*/
function translateCirclesToOrigin(c1, c2) {
  //translate circles to origin with vector using c1 as ref
  const v = new Vector(-c1.center.x, -c1.center.y);
  const vr = new Vector(c1.center.x, c1.center.y);
  // translate to origin
  // const vb = new Vector(c1.x, c1.y);
  // back to original location
  // transform circles by first vector
  const newCenter = applyVector(c1.center, v);
  const newCircle = new Circle(newCenter.x, newCenter.y, c1.radius);
  const newCenter2 = applyVector(c2.center, v);
  const newCircle2 = new Circle(newCenter2.x, newCenter2.y, c2.radius);

  return { c0: newCircle, c1: newCircle2, vr: vr };
}

/* Calculates and spits out the intersection points of two intersecting circles
For now function does not accomodate inscribed circle and tangent circle
returns object {p0:Point, p1:Point} sorted on their x value*/
function calcCircleIntersection(circle1, circle2) {
  const { c0, c1, vr } = translateCirclesToOrigin(circle1, circle2);
  console.log(`asdf`)
  const p1 = c1.center.x;
  const p2 = c1.center.y;
  const r1 = c0.radius;
  const r2 = c1.radius;
  const q = p1 ** 2 + p2 ** 2 + r1 ** 2 - r2 ** 2;
  //calculate quadratic coefficients
  const a = p1 ** 2 / p2 ** 2 + 1;
  const b = -((q * p1) / p2 ** 2);
  const c = (q / (2 * p2)) ** 2 - r1 ** 2;

  const discrimenant = b ** 2 - 4 * a * c;
  const x1 = (-b + Math.sqrt(discrimenant)) / (2 * a);
  const x2 = (-b - Math.sqrt(discrimenant)) / (2 * a);

  const y1_1 = Math.sqrt(r1 ** 2 - x1 ** 2);
  const y1_2 = -Math.sqrt(r1 ** 2 - x1 ** 2);
  const y2_1 = Math.sqrt(r1 ** 2 - x2 ** 2);
  const y2_2 = -Math.sqrt(r1 ** 2 - x2 ** 2);

  const potentialCoords = [
    new Point(x1, y1_1),
    new Point(x1, y1_2),
    new Point(x2, y2_1),
    new Point(x2, y2_2),
  ].sort((p1, p2) => p1.x >= p2.x);

  // remove duplicates and get the solution values
  const solSet = potentialCoords.filter((pt, ind, arr) => {
    const { x, y } = pt;
    //keep the ones that satisfy x^2 + y^2 = r^2 and the other equation
    const eq1 = (a, b) => {/*console.log(`a -> ${a}, b -> ${b}`);*/return a ** 2 + b ** 2 === r1 ** 2};
    const eq2 = (a, b) => {console.log(`a -> ${a}, p1 -> ${p1}, b -> ${b}, p2 -> ${p2}`);return (a - p1) ** 2 + (b - p2) ** 2 === r2 ** 2};
    let isNotSeen = ind === arr.findIndex((pt2) => x === pt2.x && y === pt2.y);
    return eq1(x, y) && eq2(x, y) && isNotSeen;
  });

  // loops through list of points and creates the object key dynamically
  const sol = solSet.reduce((acc, nxt, ind) => {
    const _nxt = applyVector(nxt, vr);
    return { ...acc, ...{ [`p${ind}`]: _nxt } };
  }, {});
  return sol;
  //===========================================================
}

/*Calculates the distance between two points*/
function distance(p1, p2) {
  const d = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  return d;
}

/*Draws a line between two points*/
function drawLine(p0, p1) {
  const _p0 = transformPt(p0);
  const _p1 = transformPt(p1);
  ctx.beginPath();
  ctx.moveTo(_p0.x, _p0.y);
  ctx.lineTo(_p1.x, _p1.y);
  ctx.strokeWidth = 1;
  ctx.strokeStyle = 'red';
  ctx.stroke();
}

// calculate area of intersecting circles
// assumes the circles are intersecting at 2 points
// takes the p1,p2, intersection points of the circles and c0,c1 two circles.
function intersectionArea(p1, p2, c0, c1) {
  const d = distance(p1, p2);

  const partialArea = (c) => {
    const th1 = Math.asin(d / (2 * c.radius)) * 2;
    const sectorArea = (th1 * c.radius ** 2) / 2;
    const triangleArea = (d / 2) * Math.sqrt(c.radius ** 2 - (0.5 * d) ** 2);
    const at = sectorArea - triangleArea;
  };

  return partialArea(p1, p2, c0) + partialArea(p1, p2, c1);
}

// the angle depends on the size of the radius
function pointToAngleRad2(c, pt, toDegree = false) {
  //if circle is not centered on the origin, move the circle to the origin.
  const v1 = new Vector(-c.center.x, -c.center.y);
  const ptt = applyVector(pt, v1);
  // console.log("vector ",v1)
  // console.log("1 pt ", pt)
  // console.log("2 pt",ptt)
  // putPoint(ptt.x,ptt.y,"red");

  const quadrantal = (x, y) => {
    if (y === 0) {
      if (x > 0) {
        return 0;
      } else if (x < 0) {
        return -Math.PI;
      }
    } else if (x === 0) {
      if (y > 0) {
        return 0;
      } else if (y < 0) {
        return -Math.PI * 2;
      }
    }
  };

  const getQuadrant = (x, y) => {
    if (x > 0 && y >= 0) {
      // 1st
      console.log('1st quadrant reached');
      return 0;
    } else if (x < 0 && y > 0) {
      // 2nd
      console.log('second quadrant reached');
      return -Math.PI;
    } else if (x < 0 && y < 0) {
      // 3rd
      console.log('third quadrant reached');
      return -Math.PI;
    } else if (x > 0 && y < 0) {
      // 4th
      console.log('third quadrant reached');
      return -2 * Math.PI;
    } else {
      return quadrantal(x, y);
    }
  };

  const inRad = -Math.atan(ptt.y / ptt.x) + getQuadrant(ptt.x, ptt.y);
  // console.log(`base => ${Math.atan(pt.y/pt.x)* (180 / Math.PI)} \ninRad: ${inRad* (180 / Math.PI) }`);
  return !toDegree ? inRad : inRad * (180 / Math.PI);
}

// p0, p1 are the intersection of the circles, c0, c1 are the intersecting circles
//shade all the overlapping pixles, assume p0.x <= p1.x
// c0 , c1 are circles, and p0, p1 are the points of intersection
function shadeOverlap(c0, c1, p0, p1) {
  // get c0 and draw a curve from p0 to p1
  let conf1 = {
    from: pointToAngleRad2(c0, p0),
    to: pointToAngleRad2(c0, p1),
    counterClockwise: true,
    color: 'Red',
  };
  drawCircle(c0, conf1);
  ctx.fill();
  // get c1 and draw a curve from p1 to p0
  let conf2 = {
    from: pointToAngleRad2(c1, p1),
    to: pointToAngleRad2(c1, p0),
    counterClockwise: true,
    color: 'Red',
  };
  drawCircle(c1, conf2);
  ctx.fill();
}

// const c0 = new Circle(1, 1, 1);
// const c1 = new Circle(2, -1, 2);

const c0 = new Circle(1, 1, 1);
const c1 = new Circle(1, -1, 2);

// const c0 = new Circle(1, 1, 1);
// const c1 = new Circle(0, -1, 2);

// const c0 = new Circle(1, 1, 1);
// const c1 = new Circle(3, 1, 2);

// const c0 = new Circle(1, 1, 1);
// const c1 = new Circle(-1, 1, 2);

drawCircle(c0);
drawCircle(c1);
const { p0, p1 } = calcCircleIntersection(c0, c1);
console.log(p0,p1);
// putPoint(p0.x,p0.y,"Red", 3)

// shadeOverlap(c0, c1, p0, p1);

// let y = 5;
// setInterval(() => console.log(++y), 1000);
