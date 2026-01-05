const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

const img = new Image();
img.src = "spiderman.png";

// 🔧 CHANGE THESE NUMBERS
let sx = 200;   // move RIGHT
let sy = 100;   // move DOWN
const sw = 80;
const sh = 80;

const scale = 4;

img.onload = () => draw();

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    img,
    sx, sy, sw, sh,
    canvas.width / 2 - (sw * scale) / 2,
    canvas.height / 2 - (sh * scale) / 2,
    sw * scale,
    sh * scale
  );
}
