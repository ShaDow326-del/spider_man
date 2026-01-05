const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const spiderman = new Image();
spiderman.src = "spiderman.png";

spiderman.onload = () => {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // DEBUG background
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 🔴 DRAW ONE FIXED FRAME FROM YOUR SPRITE SHEET
  // These numbers are MANUAL and SAFE
  ctx.drawImage(
    spiderman,
    0,    // sx
    0,    // sy
    80,   // sw
    80,   // sh
    200,  // dx
    300,  // dy
    80,   // dw
    80    // dh
  );

  console.log("Spider-Man drawn");
};

spiderman.onerror = () => {
  alert("Spider-Man image failed to load");
};
// ===== CONTROLS =====
let left = false;
let right = false;

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") left = true;
  if (e.key === "ArrowRight") right = true;
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") left = false;
  if (e.key === "ArrowRight") right = false;
});

// ===== GAME LOOP =====
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Movement
  if (left) {
    player.x -= player.speed;
    player.frameY = 0; // walking row
  }
  if (right) {
    player.x += player.speed;
    player.frameY = 0;
  }

  // Animation
  if (left || right) {
    player.frameX = (player.frameX + 1) % 6;
  } else {
    player.frameX = 0;
  }

  // Draw ONE frame from sprite sheet
  ctx.drawImage(
    spiderman,
    player.frameX * player.frameWidth,
    player.frameY * player.frameHeight,
    player.frameWidth,
    player.frameHeight,
    player.x,
    player.y,
    player.width,
    player.height
  );

  requestAnimationFrame(gameLoop);
}
