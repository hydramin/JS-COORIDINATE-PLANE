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

