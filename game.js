// Set up the canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Load images
let spidermanImage = new Image();
let backgroundImage = new Image();

spidermanImage.src = 'spiderman.png';  // Make sure the Spider-Man image is in the same folder
backgroundImage.src = 'background.jpg'; // Same for the background image

// Spider-Man position and properties
let spiderman = {
    x: 100,
    y: 500,
    width: 50,
    height: 50,
    speed: 5,
};

// Handle movement (left and right)
let leftPressed = false;
let rightPressed = false;

// Add event listeners to capture key presses
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "ArrowRight") rightPressed = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
});

// Function to draw the background
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Function to draw Spider-Man
function drawSpiderman() {
    ctx.drawImage(spidermanImage, spiderman.x, spiderman.y, spiderman.width, spiderman.height);
}

// Game update function
function updateGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background
    drawBackground();

    // Move Spider-Man based on key presses
    if (leftPressed && spiderman.x > 0) {
        spiderman.x -= spiderman.speed;
    }
    if (rightPressed && spiderman.x < canvas.width - spiderman.width) {
        spiderman.x += spiderman.speed;
    }

    // Draw Spider-Man
    drawSpiderman();

    // Repeat the update function
    requestAnimationFrame(updateGame);
}

// Start the game
updateGame();
