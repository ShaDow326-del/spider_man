const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

// ===== LOAD IMAGES =====
const background = new Image();
const spiderman = new Image();

let loaded = 0;
background.onload = checkLoaded;
spiderman.onload = checkLoaded;

background.src = "background.jpg";
spiderman.src = "spiderman.png";

function checkLoaded() {
  loaded++;
  if (loaded === 2) requestAnimationFrame(gameLoop);
}

// ===== PLAYER =====
const player = {
  x: 100,
  y: 420,
  width: 64,
  height: 64,
  speed: 5,

  // sprite sheet frame
  frameX: 0,
  frameY: 0,
  frameWidth: 64,
  frameHeight: 80
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
