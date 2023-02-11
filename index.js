'use strict';
// Import stylesheets
import './style.css';

// Write Javascript code!
const unit = 30;
const xmax = unit * 12;
const ymax = unit * 12;

const canvas = document.getElementById('canvas');
canvas.width = xmax;
canvas.height = ymax;

const ctx = canvas.getContext('2d');

// draw the x and y lines
ctx.beginPath();
ctx.moveTo(0, ymax / 2);
ctx.lineTo(xmax, ymax / 2);

ctx.moveTo(xmax / 2, 0);
ctx.lineTo(xmax / 2, ymax);
ctx.stroke();

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

  // gives y0 and y1 (absent for left and right tangent points)
  f(x) {
    const y0 =
      Math.sqrt(this.radius ** 2 - (x - this.center.x) ** 2) + this.center.y;
    const y1 =
      -Math.sqrt(this.radius ** 2 - (x - this.center.x) ** 2) + this.center.y;
    return [new Point(x, y0), new Point(x, y1)];
  }

  prtEqn() {
    const plus = (n) => (-n > 0 ? `+${-n}` : `${-n}`);
    return `(x${plus(this.center.x)})^2 + (y${plus(this.center.y)})^2 = ${
      this.radius ** 2
    }`;
  }
}

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function scaleLen(ln) {
  return ln * unit;
}

function transformPt(pt) {
  return new Point(origin.x + pt.x * unit, origin.y - pt.y * unit);
}

function putPoint(x, y, color = 'red', size = 1) {
  ctx.beginPath();
  const pt = transformPt(new Point(x, y));
  ctx.strokeStyle = color;
  ctx.arc(pt.x, pt.y, size, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}

// putPoint(1, 1);
// putPoint(-1, 1);
// putPoint(1, -1);
// putPoint(-1, -1);
// putPoint(0, 0);

function drawCircle(x, y, r) {
  //print the center
  putPoint(x, y);
  //draw the circle
  ctx.beginPath();
  const transformedPt = transformPt(new Point(x, y));
  const c = new Circle(transformedPt.x, transformedPt.y, scaleLen(r));
  ctx.arc(c.center.x, c.center.y, c.radius, 0, 2 * Math.PI);
  ctx.strokeWidth = 1;
  ctx.strokeStyle = 'black';
  ctx.stroke();
}

function applyVector(point, vector) {
  // console.log(circle, vector);
  const x = point.x + vector.x;
  const y = point.y + vector.y;
  return new Point(x, y);
}

// drawCircle(1, 1, 1);
// drawCircle(2, -1, 2);

function calcCircleIntersection(c1, c2) {
  // console.log(`calc intersection (c1, c2) =>`, c1, c2);
  //takes the scaled up and translated circle
  //one of the circles (c1) must be at (0,0)
  const p1 = c2.center.x;
  const p2 = c2.center.y;
  const r1 = c1.radius;
  const r2 = c2.radius;
  const q = p1 ** 2 + p2 ** 2 + r1 ** 2 - r2 ** 2;
  // console.log('constants --> ', p1, p2, r1, r2, q);

  //calculate quadratic coefficients
  const a = p1 ** 2 / p2 ** 2 + 1;
  const b = -((q * p1) / p2 ** 2);
  const c = (q / (2 * p2)) ** 2 - r1 ** 2;
  // console.log(a, b, c);

  const discrimenant = b ** 2 - 4 * a * c;
  // console.log('discriminant ==> ' + discrimenant);
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
    const eq1 = (a, b) => a ** 2 + b ** 2 === c1.radius ** 2;
    const eq2 = (a, b) => (a - p1) ** 2 + (b - p2) ** 2 === c2.radius ** 2;
    let isNotSeen = ind === arr.findIndex((pt2) => x === pt2.x && y === pt2.y);
    return eq1(x, y) && eq2(x, y) && isNotSeen;
  });

  // console.log('Solution set ==> ', solSet);
  const sol = solSet.reduce((acc, nxt, ind) => {
    return { ...acc, ...{ [`p${ind}`]: nxt } };
  }, {});
  // console.log('0000 ==> ', sol);

  // console.log(`(x1,y1) => (${x1},${y1_1})`);
  // console.log(`(x1,y1) => (${x1},${y1_2})`);
  // console.log(`(x2,y2) => (${x2},${y2_1})`);
  // console.log(`(x2,y2) => (${x2},${y2_2})`);
  // console.log(sol)
  return sol;
}

// calculate and locate intersection points
function translateCirclesToOrigin(c1, c2) {
  //translate circles to origin with vector using c1 as ref
  const v = new Vector(-c1.center.x, -c1.center.y); // translate to origin
  // const vb = new Vector(c1.x, c1.y); // back to original location
  // transform circles by first vector
  const newCenter = applyVector(c1.center, v);
  const newCircle = new Circle(newCenter.x, newCenter.y, c1.radius);
  const newCenter2 = applyVector(c2.center, v);
  const newCircle2 = new Circle(newCenter2.x, newCenter2.y, c2.radius);

  return { c0: newCircle, c1: newCircle2 };
}

function distance(p1, p2) {
  const d = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  return d;
}

const { c0, c1 } = translateCirclesToOrigin(
  new Circle(1, 1, 1),
  new Circle(2, -1, 2)
);

drawCircle(c0.center.x, c0.center.y, c0.radius);
drawCircle(c1.center.x, c1.center.y, c1.radius);

const { p0, p1 } = calcCircleIntersection(c0, c1);
const dist = distance(p0, p1);
// console.log('dist in units = ', dist);
// console.log('dist in pixles = ', dist * unit);

function drawLine(p0, p1) {
  // console.log('<><><>', p0, p1);
  const _p0 = transformPt(p0);
  const _p1 = transformPt(p1);
  ctx.beginPath();
  ctx.moveTo(_p0.x, _p0.y);
  ctx.lineTo(_p1.x, _p1.y);
  ctx.strokeWidth = 1;
  ctx.strokeStyle = 'red';
  ctx.stroke();
}

drawLine(p0, p1);

// calculate area of intersecting circles
// first circle (x1,y1) and r1, chord dist = d,

const d = dist;
const th1 = Math.asin(d / (2 * c0.radius)) * 2;
const a1 = (th1 * c0.radius ** 2) / 2;
const a2 = (d / 2) * Math.sqrt(c0.radius ** 2 - (0.5 * d) ** 2);

// console.log(`area in units sq ${a1 + a2}`);
// console.log(`area in pixles sq ${(a1 + a2) * 30 * 30}`);

//shade all the overlapping pixles, assume p0.x < p1.x
function shadeOverlap(c0, c1, p0, p1) {
  // console.log('input >>>', c0, c1, p0, p1);
  const div = 4;
  // transform points and the circles to pixle representation
  // const _p0 = transformPt(p0);
  // const _p1 = transformPt(p1);
  // const _c0_cntr = transformPt(c0.center);
  // const _c1_cntr = transformPt(c1.center);
  // const _c0 = new Circle(_c0_cntr.x, _c0_cntr.y, c0.radius * unit);
  // const _c1 = new Circle(_c1_cntr.x, _c1_cntr.y, c1.radius * unit);
  console.log('points >> ', p0, p1);
  // get distance of the domain of the intersection
  const pxDist = distance(p0.proj().xp, p1.proj().xp);
  // num of rectangles to divide the domain of overlap
  const pxDelta = pxDist / div;
  // console.log('dist div delta >>', pxDist, div, pxDelta);
  // generate the points in a list, fist point from p0.x, last point p1.x
  const xlist = [p0.x];
  for (let i = 0; i < div - 1; i++) {
    const prv = xlist[xlist.length - 1];
    xlist.push(prv + pxDelta);
  }
  xlist.push(p1.x);
  console.log(`pxDelta => ${pxDelta}`);
  console.log(
    'xlist => ',
    xlist.map((v) => +v.toFixed(2))
  );
  // produce the corresponding y values on the curves of the intersecting circles
  // final list of points same length as xlist , eliminate the other y value
  console.log('range => ', p0.y, p1.y);
  const y0list = xlist.map((x) =>
    c0.f(x).filter((pt) => {
      pt.x = +pt.x.toFixed(2);
      pt.y = +pt.y.toFixed(2);
      console.log(
        `(${pt.x},${pt.y}) => ${pt.y} >= ${p0.y} && ${pt.y} <= ${p1.y} => ${
          pt.y >= p0.y && pt.y <= p1.y
        }`
      );
      putPoint(pt.x, pt.y, 'blue', 4);
      return pt.y >= p0.y && pt.y <= p1.y;
    })
  );
  const y1list = xlist.map((x) => c1.f(x));

  console.log('=> ', y0list);
  // console.log(y1list);
}

shadeOverlap(c0, c1, p0, p1);
