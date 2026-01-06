const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== LOAD IMAGE =====
const hero = new Image();
const venom = new Image();
hero.src = "spiderman_single.png";
venom.src = "venom.png"; // You'll need to upload a Venom image

// ===== PLAYER =====
const player = {
  x: 50,
  y: canvas.height - 220,
  width: 120,
  height: 220,
  speed: 6,
  velY: 0,
  jumping: false,
  webbing: false,
  health: 100
};

const gravity = 0.9;
let ground = canvas.height - 20;
let left = false;
let right = false;
let jump = false;
let webX = -10; // Web position, off screen initially
let webY = -10; // Web position, off screen initially

// ===== ENEMY (VENOM) =====
const venomEnemy = {
  x: canvas.width - 180,
  y: canvas.height - 220,
  width: 150,
  height: 220,
  health: 200
};

// ===== CONTROLS =====
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") left = true;
  if (e.key === "ArrowRight") right = true;
  if (e.key === " " || e.key === "ArrowUp") jump = true;
  if (e.key === "f" || e.key === "F") shootWeb();
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") left = false;
  if (e.key === "ArrowRight") right = false;
  if (e.key === " " || e.key === "ArrowUp") jump = false;
});

// ===== GAME LOOP =====
function update() {
  ground = canvas.height - player.height - 20;

  // Movement
  if (left) player.x -= player.speed;
  if (right) player.x += player.speed;

  // Jumping
  if (jump && !player.jumping) {
    player.velY = -16;
    player.jumping = true;
  }

  player.velY += gravity;
  player.y += player.velY;

  if (player.y >= ground) {
    player.y = ground;
    player.velY = 0;
    player.jumping = false;
  }

  // Web movement
  if (player.webbing) {
    webX += 5;
    if (webX > canvas.width) {
      webX = -10; // Reset off-screen
    }
    if (
      webX >= venomEnemy.x &&
      webX <= venomEnemy.x + venomEnemy.width &&
      webY >= venomEnemy.y
    ) {
      venomEnemy.health -= 10;
      if (venomEnemy.health <= 0) {
        gameOver("You defeated Venom!");
      }
    }
  }

  // Bounds for movement
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
}

function shootWeb() {
  player.webbing = true;
  webX = player.x + player.width;
  webY = player.y + player.height / 2;
}

function draw() {
  // Background
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#444";
  ctx.fillRect(0, ground + player.height - 10, canvas.width, 10);

  // Spider-Man
  ctx.drawImage(hero, player.x, player.y, player.width, player.height);

  // Web
  if (player.webbing) {
    ctx.fillStyle = "white";
    ctx.fillRect(webX, webY, 20, 5); // Web drawn as a rectangle
  }

  // Venom (enemy)
  ctx.drawImage(venom, venomEnemy.x, venomEnemy.y, venomEnemy.width, venomEnemy.height);

  // Display Health Bar
  ctx.fillStyle = "red";
  ctx.fillRect(20, 20, player.health * 2, 20);
  ctx.fillStyle = "green";
  ctx.fillRect(20, 50, venomEnemy.health, 20);

  // Check for game over
  if (player.health <= 0) {
    gameOver("Game Over. Spider-Man lost!");
  }
}

// Game Over and cutscene
function gameOver(message) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "50px Arial";
  ctx.fillText(message, canvas.width / 2 - 200, canvas.height / 2);

  // Show end message
  setTimeout(() => {
    alert("Game Over!");
    window.location.reload(); // Reload the game
  }, 2000);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

hero.onload = () => {
  loop();
};
venom.onload = () => {
  // Ensure venom is loaded
  venomEnemy.y = ground;
};  if (e.key === "ArrowRight") right = true;
  if (e.key === " " || e.key === "ArrowUp") jump = true;
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") left = false;
  if (e.key === "ArrowRight") right = false;
  if (e.key === " " || e.key === "ArrowUp") jump = false;
});

// ===== TOUCH CONTROLS (ANDROID) =====
canvas.addEventListener("touchstart", e => {
  const x = e.touches[0].clientX;
  if (x < window.innerWidth / 2) left = true;
  else right = true;
});

canvas.addEventListener("touchend", () => {
  left = false;
  right = false;
  jump = true;
  setTimeout(() => jump = false, 120);
});

// ===== GAME LOOP =====
function update() {
  ground = canvas.height - player.height - 20;

  if (left) player.x -= player.speed;
  if (right) player.x += player.speed;

  if (jump && !player.jumping) {
    player.velY = -16;
    player.jumping = true;
  }

  player.velY += gravity;
  player.y += player.velY;

  if (player.y >= ground) {
    player.y = ground;
    player.velY = 0;
    player.jumping = false;
  }

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
  ctx.drawImage(hero, player.x, player.y, player.width, player.height);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

hero.onload = () => {
  player.y = canvas.height - player.height - 20;
  loop();
};  if (e.key === "ArrowLeft") left = false;
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
