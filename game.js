const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

const spiderman = new Image();
spiderman.src = "spiderman_single.png";

spiderman.onload = () => {
  draw();
};

function draw() {
  // background (temporary)
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw your Spider-Man
  ctx.drawImage(
    spiderman,
    canvas.width / 2 - 150,
    canvas.height / 2 - 200,
    300,
    400
  );
}
