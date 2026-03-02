// ===== CANVAS SETUP =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ===== ASSETS =====
const heroImg = new Image();
const bgImg = new Image();
heroImg.src = "spiderman_single.png";
bgImg.src = "background.png";

// ===== GAME BALANCE CONSTANTS =====
const WEB_BASE_DAMAGE = 10;
const WEB_DAMAGE_LEVEL_SCALING = 2;
const ENEMY_COLLISION_DAMAGE = 8;
const ENEMY_SPAWN_BASE_DELAY = 1200;   // ms
const ENEMY_SPAWN_RANDOM_DELAY = 600;  // ms added randomly
const FLOATER_BASE_FONT_SIZE = 14;     // px, grows with combo

// ===== GAME STATE =====
const STATE = { START: "start", PLAYING: "playing", PAUSED: "paused", GAMEOVER: "gameover" };
let gameState = STATE.START;
let score = 0;
let combo = 1;
let comboTimer = 0;
let comboTimeout = 180; // frames (~3 s at 60 FPS) before combo resets
let websShot = 0;
let bestCombo = 1;
let animFrame = null;
let frameCount = 0;
let level = 1;
let screenShake = 0;
let screenShakeIntensity = 0;

// ===== PLAYER =====
const player = {
  x: 50,
  y: 0,
  width: 100,
  height: 185,
  speed: 6,
  velX: 0,
  velY: 0,
  jumping: false,
  facingRight: true,
  health: 100,
  maxHealth: 100,
  invincible: 0,        // remaining frames of invincibility (countdown)
  flashTimer: 0
};

// ===== PHYSICS =====
const GRAVITY = 0.65;
let groundY = 0;

// ===== INPUT STATE =====
const keys = { left: false, right: false, jump: false, web: false };
let jumpConsumed = false;

// ===== ENEMIES =====
let enemies = [];
function spawnEnemy() {
  const side = Math.random() > 0.5 ? canvas.width - 110 : 10;
  enemies.push({
    x: side,
    y: 0,
    width: 90,
    height: 170,
    velX: side > canvas.width / 2 ? -2.5 - level * 0.3 : 2.5 + level * 0.3,
    health: 60 + level * 20,
    maxHealth: 60 + level * 20,
    hitFlash: 0,
    alive: true
  });
}

// ===== WEBS =====
let webs = [];
let webCooldown = 0;

function shootWeb() {
  if (webCooldown > 0) return;
  const wx = player.facingRight ? player.x + player.width : player.x;
  const wy = player.y + player.height * 0.35;
  const vx = player.facingRight ? 12 : -12;
  webs.push({ x: wx, y: wy, velX: vx, radius: 5, life: 80 });
  webCooldown = 25;
  websShot++;
}

// ===== PARTICLES =====
let particles = [];

function spawnParticles(x, y, color, count, speed) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = (Math.random() * speed) + 1;
    particles.push({
      x, y,
      velX: Math.cos(angle) * spd,
      velY: Math.sin(angle) * spd - 1,
      life: 30 + Math.random() * 30,
      maxLife: 60,
      color,
      radius: 2 + Math.random() * 3
    });
  }
}

// ===== SCORE FLOATERS =====
let floaters = [];
function addFloater(x, y, text, color) {
  floaters.push({ x, y, text, color, life: 50, velY: -1.5 });
}

// ===== CONTROLS: KEYBOARD =====
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = true;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = true;
  if ((e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") && !jumpConsumed) {
    keys.jump = true;
    jumpConsumed = true;
  }
  if (e.key === "f" || e.key === "F") keys.web = true;
  if ((e.key === "p" || e.key === "P") && gameState === STATE.PLAYING) togglePause();
  if (e.key === "Escape" && gameState === STATE.PLAYING) togglePause();
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
  if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
    keys.jump = false;
    jumpConsumed = false;
  }
  if (e.key === "f" || e.key === "F") keys.web = false;
});

// ===== CONTROLS: MOBILE BUTTONS =====
function setupMobileBtn(id, keyName) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const down = () => { keys[keyName] = true; btn.classList.add("active"); };
  const up   = () => { keys[keyName] = false; btn.classList.remove("active"); };
  btn.addEventListener("touchstart", e => { e.preventDefault(); down(); }, { passive: false });
  btn.addEventListener("touchend",   e => { e.preventDefault(); up(); },   { passive: false });
  btn.addEventListener("mousedown",  down);
  btn.addEventListener("mouseup",    up);
}

setupMobileBtn("btnLeft",  "left");
setupMobileBtn("btnRight", "right");
setupMobileBtn("btnJump",  "jump");

const btnWeb = document.getElementById("btnWeb");
if (btnWeb) {
  btnWeb.addEventListener("touchstart", e => { e.preventDefault(); shootWeb(); btnWeb.classList.add("active"); }, { passive: false });
  btnWeb.addEventListener("touchend",   e => { e.preventDefault(); btnWeb.classList.remove("active"); },           { passive: false });
  btnWeb.addEventListener("mousedown",  () => { shootWeb(); btnWeb.classList.add("active"); });
  btnWeb.addEventListener("mouseup",    () => btnWeb.classList.remove("active"));
}

// ===== OVERLAY BUTTONS =====
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("resumeBtn").addEventListener("click", togglePause);
document.getElementById("restartBtn").addEventListener("click", startGame);

// ===== GAME FLOW =====
function startGame() {
  score = 0;
  combo = 1;
  comboTimer = 0;
  bestCombo = 1;
  websShot = 0;
  level = 1;
  frameCount = 0;
  enemies = [];
  webs = [];
  particles = [];
  floaters = [];
  screenShake = 0;

  player.x = 80;
  player.health = player.maxHealth;
  player.velX = 0;
  player.velY = 0;
  player.jumping = false;
  player.facingRight = true;
  player.invincible = 0;
  groundY = canvas.height - player.height - 20;
  player.y = groundY;

  spawnEnemy();

  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("gameOverScreen").classList.add("hidden");
  document.getElementById("pauseScreen").classList.add("hidden");
  document.getElementById("hud").classList.remove("hidden");

  // Show mobile controls on touch devices
  if (isTouchDevice()) {
    document.getElementById("mobileControls").classList.remove("hidden");
  }

  gameState = STATE.PLAYING;
  if (animFrame) cancelAnimationFrame(animFrame);
  loop();
}

function isTouchDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

function togglePause() {
  if (gameState === STATE.PLAYING) {
    gameState = STATE.PAUSED;
    document.getElementById("pauseScreen").classList.remove("hidden");
  } else if (gameState === STATE.PAUSED) {
    gameState = STATE.PLAYING;
    document.getElementById("pauseScreen").classList.add("hidden");
  }
}

function endGame(won) {
  gameState = STATE.GAMEOVER;
  document.getElementById("hud").classList.add("hidden");
  document.getElementById("mobileControls").classList.add("hidden");
  document.getElementById("finalScore").textContent = score;
  document.getElementById("finalCombo").textContent = bestCombo + "x";
  document.getElementById("finalWebs").textContent = websShot;

  const icon = document.getElementById("gameOverIcon");
  const title = document.getElementById("gameOverTitle");
  const msg = document.getElementById("gameOverMessage");

  if (won) {
    icon.textContent = "🏆";
    title.textContent = "YOU WIN!";
    msg.textContent = "Venom has been defeated! New York is safe.";
    title.className = "overlay-title neon-text";
  } else {
    icon.textContent = "💀";
    title.textContent = "GAME OVER";
    msg.textContent = "Spider-Man fell in battle...";
    title.className = "overlay-title neon-text-red";
  }

  document.getElementById("gameOverScreen").classList.remove("hidden");
}

// ===== UPDATE =====
function update() {
  frameCount++;
  groundY = canvas.height - player.height - 20;

  // Deduct cooldowns
  if (webCooldown > 0) webCooldown--;
  if (player.invincible > 0) player.invincible--;
  if (screenShake > 0) screenShake--;

  // Combo timer
  if (combo > 1) {
    comboTimer--;
    if (comboTimer <= 0) {
      combo = 1;
      document.getElementById("comboDisplay").classList.add("hidden");
    }
  }

  // Web fire (hold or press)
  if (keys.web) {
    shootWeb();
    keys.web = false; // single shot per press
  }

  // Player movement
  if (keys.left) {
    player.velX = -player.speed;
    player.facingRight = false;
  } else if (keys.right) {
    player.velX = player.speed;
    player.facingRight = true;
  } else {
    player.velX *= 0.75; // friction
  }

  if (keys.jump && !player.jumping) {
    player.velY = -15;
    player.jumping = true;
    spawnParticles(player.x + player.width / 2, groundY + player.height, "#aaaaff", 8, 3);
  }

  player.velY += GRAVITY;
  player.x += player.velX;
  player.y += player.velY;

  // Ground collision
  if (player.y >= groundY) {
    player.y = groundY;
    player.velY = 0;
    if (player.jumping) {
      player.jumping = false;
    }
  }

  // Bounds
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  // Update HUD
  document.getElementById("scoreValue").textContent = score;
  document.getElementById("levelValue").textContent = level;
  if (combo > 1) {
    document.getElementById("comboValue").textContent = combo + "x";
    document.getElementById("comboDisplay").classList.remove("hidden");
  }

  // Update webs
  for (let i = webs.length - 1; i >= 0; i--) {
    const w = webs[i];
    w.x += w.velX;
    w.life--;
    if (w.life <= 0 || w.x < 0 || w.x > canvas.width) {
      webs.splice(i, 1);
      continue;
    }
    // Web hits enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (!e.alive) continue;
      if (w.x > e.x && w.x < e.x + e.width && w.y > e.y && w.y < e.y + e.height) {
        const dmg = WEB_BASE_DAMAGE + level * WEB_DAMAGE_LEVEL_SCALING;
        e.health -= dmg;
        e.hitFlash = 12;
        webs.splice(i, 1);
        score += 10 * combo;
        addFloater(e.x + e.width / 2, e.y, "+" + (10 * combo), "#ffdd44");
        spawnParticles(w.x, w.y, "#ffffff", 10, 4);
        combo++;
        comboTimer = comboTimeout;
        if (combo > bestCombo) bestCombo = combo;
        if (e.health <= 0) {
          e.alive = false;
          score += 50 * combo;
          addFloater(e.x + e.width / 2, e.y - 20, "DEFEATED! +" + (50 * combo), "#ff4444");
          spawnParticles(e.x + e.width / 2, e.y + e.height / 2, "#ff4444", 25, 6);
          screenShake = 18;
          screenShakeIntensity = 6;
          enemies.splice(j, 1);
          level++;
          setTimeout(spawnEnemy, ENEMY_SPAWN_BASE_DELAY);
          setTimeout(spawnEnemy, ENEMY_SPAWN_BASE_DELAY + Math.random() * ENEMY_SPAWN_RANDOM_DELAY);
        }
        break;
      }
    }
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.y = groundY;
    e.x += e.velX;

    if (e.hitFlash > 0) e.hitFlash--;

    // Bounce off walls
    if (e.x <= 0) { e.x = 0; e.velX = Math.abs(e.velX); }
    if (e.x + e.width >= canvas.width) { e.x = canvas.width - e.width; e.velX = -Math.abs(e.velX); }

    // Enemy hits player
    if (player.invincible <= 0 &&
        player.x < e.x + e.width &&
        player.x + player.width > e.x &&
        player.y < e.y + e.height &&
        player.y + player.height > e.y) {
      player.health -= ENEMY_COLLISION_DAMAGE;
      player.invincible = 60;
      combo = 1;
      comboTimer = 0;
      document.getElementById("comboDisplay").classList.add("hidden");
      screenShake = 20;
      screenShakeIntensity = 8;
      spawnParticles(player.x + player.width / 2, player.y + player.height / 2, "#ff3333", 15, 5);

      if (player.health <= 0) {
        player.health = 0;
        endGame(false);
        return;
      }
    }
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.velX;
    p.y += p.velY;
    p.velY += 0.15;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Update floaters
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.y += f.velY;
    f.life--;
    if (f.life <= 0) floaters.splice(i, 1);
  }
}

// ===== DRAW =====
function draw() {
  // Screen shake offset
  let shakeX = 0, shakeY = 0;
  if (screenShake > 0) {
    shakeX = (Math.random() - 0.5) * screenShakeIntensity;
    shakeY = (Math.random() - 0.5) * screenShakeIntensity;
  }

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // Background
  if (bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    // Dark overlay for readability
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // Fallback gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#0a0a1a");
    grad.addColorStop(0.6, "#0f0f2a");
    grad.addColorStop(1, "#050510");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // City silhouette
    drawCitySilhouette();
  }

  // Ground
  drawGround();

  // Particles
  drawParticles();

  // Webs
  drawWebs();

  // Enemies
  for (const e of enemies) drawEnemy(e);

  // Player
  drawPlayer();

  // Score floaters
  drawFloaters();

  // Health bars (on canvas, above sprites)
  drawHealthBars();

  ctx.restore();
}

function drawCitySilhouette() {
  ctx.fillStyle = "rgba(15, 15, 40, 0.9)";
  const buildings = [
    { x: 0, w: 80, h: 160 }, { x: 90, w: 60, h: 120 }, { x: 160, w: 100, h: 200 },
    { x: 270, w: 70, h: 140 }, { x: 350, w: 90, h: 180 }, { x: 450, w: 60, h: 100 },
    { x: 520, w: 120, h: 220 }, { x: 650, w: 80, h: 160 }, { x: 740, w: 70, h: 130 },
    { x: 820, w: 100, h: 190 }, { x: 930, w: 60, h: 110 }, { x: 1000, w: 90, h: 170 },
    { x: 1100, w: 80, h: 150 }, { x: 1190, w: 110, h: 200 }
  ];
  const ground = canvas.height - 30;
  for (const b of buildings) {
    const scaledH = b.h * (canvas.height / 600);
    ctx.fillRect(b.x, ground - scaledH, b.w, scaledH);
    // Windows
    ctx.fillStyle = "rgba(255, 220, 100, 0.15)";
    for (let wy = ground - scaledH + 10; wy < ground - 10; wy += 20) {
      for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 14) {
        if (Math.random() > 0.3) ctx.fillRect(wx, wy, 6, 8);
      }
    }
    ctx.fillStyle = "rgba(15, 15, 40, 0.9)";
  }
}

function drawGround() {
  const gy = groundY + player.height;
  // Ground gradient
  const grad = ctx.createLinearGradient(0, gy, 0, gy + 20);
  grad.addColorStop(0, "#334");
  grad.addColorStop(1, "#111");
  ctx.fillStyle = grad;
  ctx.fillRect(0, gy, canvas.width, canvas.height - gy);
  // Glowing edge
  ctx.fillStyle = "rgba(80, 100, 200, 0.3)";
  ctx.fillRect(0, gy, canvas.width, 2);
}

function drawPlayer() {
  const alpha = player.invincible > 0 ? (Math.sin(frameCount * 0.4) > 0 ? 0.4 : 1.0) : 1.0;
  ctx.globalAlpha = alpha;

  if (heroImg.complete && heroImg.naturalWidth > 0) {
    ctx.save();
    if (!player.facingRight) {
      ctx.scale(-1, 1);
      ctx.drawImage(heroImg, -player.x - player.width, player.y, player.width, player.height);
    } else {
      ctx.drawImage(heroImg, player.x, player.y, player.width, player.height);
    }
    ctx.restore();
  } else {
    // Fallback silhouette
    ctx.fillStyle = "#cc1111";
    ctx.beginPath();
    ctx.ellipse(player.x + player.width / 2, player.y + player.height * 0.3,
                player.width * 0.35, player.height * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#aa0000";
    ctx.fillRect(player.x + 10, player.y + player.height * 0.45, player.width - 20, player.height * 0.55);
  }

  ctx.globalAlpha = 1.0;
}

function drawEnemy(e) {
  ctx.save();
  if (e.hitFlash > 0 && Math.floor(e.hitFlash / 3) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  // Enemy silhouette (dark figure)
  ctx.fillStyle = e.hitFlash > 0 ? "#8833ff" : "#331133";
  ctx.beginPath();
  ctx.ellipse(e.x + e.width / 2, e.y + e.height * 0.28,
              e.width * 0.35, e.height * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = e.hitFlash > 0 ? "#aa44ff" : "#220022";
  ctx.fillRect(e.x + 8, e.y + e.height * 0.45, e.width - 16, e.height * 0.55);

  // Neon eye glow
  ctx.fillStyle = e.hitFlash > 0 ? "#ffffff" : "#cc00ff";
  ctx.shadowColor = "#aa00ff";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(e.x + e.width * 0.35, e.y + e.height * 0.22, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(e.x + e.width * 0.65, e.y + e.height * 0.22, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  ctx.globalAlpha = 1.0;
  ctx.restore();
}

function drawWebs() {
  for (const w of webs) {
    const alpha = w.life / 80;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#aaaaff";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(w.x - w.velX * 3, w.y);
    ctx.lineTo(w.x, w.y);
    ctx.stroke();
    // Web head
    ctx.fillStyle = "#ddddff";
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    ctx.globalAlpha = 1.0;
  }
}

function drawParticles() {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}

function drawFloaters() {
  for (const f of floaters) {
    const alpha = Math.min(1, f.life / 25);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = f.color;
    ctx.font = `bold ${Math.round(FLOATER_BASE_FONT_SIZE + combo)}px Orbitron, sans-serif`;
    ctx.textAlign = "center";
    ctx.shadowColor = f.color;
    ctx.shadowBlur = 10;
    ctx.fillText(f.text, f.x, f.y);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
  }
  ctx.globalAlpha = 1.0;
  ctx.textAlign = "left";
}

function drawHealthBars() {
  const barW = Math.min(200, canvas.width * 0.22);
  const barH = 8;
  const radius = 4;
  const margin = 16;
  const yPos = canvas.height - 60;

  // Player health bar
  drawBar(margin, yPos, barW, barH, radius,
    player.health / player.maxHealth, "#cc1111", "#ff4444", "❤ SPIDER-MAN");

  // Enemy health bars (top right)
  let ey = yPos;
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    drawBar(canvas.width - margin - barW, ey - i * 30, barW, barH, radius,
      e.health / e.maxHealth, "#551177", "#aa44ff", "💀 ENEMY");
  }
}

function drawBar(x, y, w, h, r, pct, bgColor, fillColor, label) {
  // Label
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "bold 10px Orbitron, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(label, x, y - 4);

  // Background track
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();

  // Fill
  const fillW = Math.max(0, w * pct);
  if (fillW > 0) {
    const grad = ctx.createLinearGradient(x, y, x + fillW, y);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, fillColor);
    ctx.fillStyle = grad;
    ctx.shadowColor = fillColor;
    ctx.shadowBlur = 8;
    roundRect(ctx, x, y, fillW, h, r);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
  }

  // Border
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, r);
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ===== GAME LOOP =====
function loop() {
  if (gameState === STATE.PLAYING) {
    update();
    draw();
  } else if (gameState === STATE.PAUSED) {
    // Just redraw static frame when paused
    draw();
  }
  if (gameState !== STATE.GAMEOVER) {
    animFrame = requestAnimationFrame(loop);
  }
}
