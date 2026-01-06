const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

// ===== LOAD IMAGE =====
const hero = new Image();
hero.src = "spiderman_single.png";

// ===== PLAYER =====
const player = {
  x: 100,
  y: 250,
  width: 120,
  height: 220,
  speed: 5,
  velY: 0,
  jumping: false
};

const gravity = 0.8;
const ground = 350;

// ===== CONTROLS =====
let left = false;
let right = false;
let jump = false;

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") left = true;
  if (e.key === "ArrowRight") right = true;
  if (e.key === " " || e.key === "ArrowUp") jump = true;
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") left = false;
  if (e.key === "ArrowRight") right = false;
  if (e.key === " " || e.key === "ArrowUp") jump = false;
});

// ===== GAME LOOP =====
function update() {
  // Movement
  if (left) player.x -= player.speed;
  if (right) player.x += player.speed;

  // Jump
  if (jump && !player.jumping) {
    player.velY = -15;
    player.jumping = true;
  }

  // Gravity
  player.velY += gravity;
  player.y += player.velY;

  // Ground collision
  if (player.y > ground) {
    player.y = ground;
    player.velY = 0;
    player.jumping = false;
  }

  // Bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
}

function draw() {
  // Background
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#444";
  ctx.fillRect(0, ground + player.height - 10, canvas.width, 10);

  // Spider-Man
  ctx.drawImage(
    hero,
    player.x,
    player.y,
    player.width,
    player.height
  );
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

hero.onload = () => {
  loop();
};
