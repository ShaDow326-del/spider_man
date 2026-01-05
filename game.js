// ===== CANVAS SETUP =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

// ===== LOAD IMAGES =====
const spidermanImage = new Image();
const backgroundImage = new Image();

let loadedImages = 0;

spidermanImage.onload = imageLoaded;
backgroundImage.onload = imageLoaded;

spidermanImage.src = "spiderman.png";
backgroundImage.src = "background.jpg";

function imageLoaded() {
  loadedImages++;
  if (loadedImages === 2) {
    requestAnimationFrame(gameLoop);
  }
}

// ===== PLAYER =====
const spiderman = {
  x: 100,
  y: 420,
  width: 80,
  height: 80,
  speed: 6
};

// ===== CONTROLS =====
let left = false;
let right = false;

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") left = true;
  if (e.key === "ArrowRight") right = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") left = false;
  if (e.key === "ArrowRight") right = false;
});

// ===== GAME LOOP =====
function gameLoop() {
  // Clear screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  // Move Spider-Man
  if (left) spiderman.x -= spiderman.speed;
  if (right) spiderman.x += spiderman.speed;

  // Keep inside screen
  if (spiderman.x < 0) spiderman.x = 0;
  if (spiderman.x + spiderman.width > canvas.width) {
    spiderman.x = canvas.width - spiderman.width;
  }

  // Draw Spider-Man
  ctx.drawImage(
    spidermanImage,
    spiderman.x,
    spiderman.y,
    spiderman.width,
    spiderman.height
  );

  requestAnimationFrame(gameLoop);
}
