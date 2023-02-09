// Import stylesheets
import './style.css';

// Write Javascript code!
const unit = 30;
const xmax = unit * 12;
const ymax = unit * 12;

const canvas = document.getElementById("canvas");
canvas.width = xmax;
canvas.height = ymax;

const ctx = canvas.getContext("2d");

// draw the x and y lines
ctx.beginPath()
ctx.moveTo(0,ymax/2)
ctx.lineTo(xmax,ymax/2)

ctx.moveTo(xmax/2,0)
ctx.lineTo(xmax/2,ymax)
ctx.stroke()

function htick(xo,yo) {
  ctx.beginPath()
  ctx.moveTo(xo,yo)
  ctx.lineWidth = 1
  ctx.lineTo(xo+3,yo)
  ctx.stroke()
}

function vtick(xo,yo) {
  ctx.beginPath()
  ctx.moveTo(xo,yo)
  ctx.lineWidth = 1
  ctx.lineTo(xo,yo+3)
  ctx.stroke()
}

for(let i=0;i<=ymax;i+=unit) {
  htick(xmax/2,i)
}

for(let i=0;i<=xmax;i+=unit) {
  vtick(i,ymax/2)
}

// given (0,0) means (xmax/2,ymax/2)
// +x means adding to x + n.unit
// -x means minusing x - n.unit
// put a point (x,y)

const origin = {x:xmax/2, y:ymax/2}

function Point (x,y) {
  this.x = origin.x + x * unit
  this.y = origin.y - y * unit
}

function Circle (x,y,r) {
  const pt = new Point(x,y)
  this.x = pt.x
  this.y = pt.y
  this.r = scaleLen(r)
}

function scaleLen(ln) {
  return ln * unit
}

function putPoint(x,y) {
  ctx.beginPath()
  const pt = new Point(x,y)
  ctx.strokeStyle = "red"
  ctx.arc(pt.x,pt.y,1,0,2*Math.PI)
  ctx.fill()
  ctx.stroke()
}

putPoint(1,1)
putPoint(-1,1)
putPoint(1,-1)
putPoint(-1,-1)
putPoint(0,0)

function drawCircle(x,y,r) {
  ctx.beginPath()
  const c = new Circle(x,y,r)
  ctx.arc(c.x,c.y,c.r,0,2*Math.PI)
  ctx.strokeWidth = 1
  ctx.strokeStyle = "black"
  ctx.stroke()
}

drawCircle(1,1,1)
drawCircle(2,-1,2)


