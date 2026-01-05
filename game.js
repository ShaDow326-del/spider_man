const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

const spiderman = new Image();
spiderman.src = "spiderman.png";

spiderman.onload = () => {
  draw();
};

function draw() {
  // Black background (temporary)
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 🔴 Crop ONE good frame from sprite sheet
  const sx = 0;   // source x
  const sy = 0;   // source y
  const sw = 80;  // source width
  const sh = 80;  // source height

  // 🔵 Draw BIG on screen
  const scale = 4;

  const dw = sw * scale;
  const dh = sh * scale;

  const dx = canvas.width / 2 - dw / 2;
  const dy = canvas.height / 2 - dh / 2;

  ctx.drawImage(
    spiderman,
    sx, sy, sw, sh,
    dx, dy, dw, dh
  );
}
