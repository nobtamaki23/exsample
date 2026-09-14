const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");

const BALL_RADIUS = 8;
const PADDLE_WIDTH = 75;
const PADDLE_HEIGHT = 10;
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 7;
const BRICK_WIDTH = 55;
const BRICK_HEIGHT = 18;
const BRICK_PADDING = 8;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 20;

let score = 0;
let lives = 3;
let running = false;
let gameOver = false;

let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
let rightPressed = false;
let leftPressed = false;

let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballDX = 3;
let ballDY = -3;

const bricks = [];
function initBricks() {
  for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
    bricks[c] = [];
    for (let r = 0; r < BRICK_ROW_COUNT; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}
initBricks();

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  } else if (e.key === " ") {
    if (gameOver) {
      resetGame();
    }
    running = !running;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

function mouseMoveHandler(e) {
  const rect = canvas.getBoundingClientRect();
  const relativeX = e.clientX - rect.left;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - PADDLE_WIDTH / 2;
    if (paddleX < 0) paddleX = 0;
    if (paddleX + PADDLE_WIDTH > canvas.width) paddleX = canvas.width - PADDLE_WIDTH;
  }
}

function collisionDetection() {
  for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
    for (let r = 0; r < BRICK_ROW_COUNT; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          ballX > b.x &&
          ballX < b.x + BRICK_WIDTH &&
          ballY > b.y &&
          ballY < b.y + BRICK_HEIGHT
        ) {
          ballDY = -ballDY;
          b.status = 0;
          score++;
          scoreEl.textContent = score;
          if (score === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT) {
            running = false;
            gameOver = true;
            drawMessage("クリア！ スペースキーでリスタート");
          }
        }
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "#f00";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - PADDLE_HEIGHT - 5, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillStyle = "#0f0";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
    for (let r = 0; r < BRICK_ROW_COUNT; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
        const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
        ctx.fillStyle = `hsl(${r * 40}, 80%, 55%)`;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawMessage(text) {
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height - 30;
  ballDX = 3 * (Math.random() > 0.5 ? 1 : -1);
  ballDY = -3;
  paddleX = (canvas.width - PADDLE_WIDTH) / 2;
}

function resetGame() {
  score = 0;
  lives = 3;
  gameOver = false;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  initBricks();
  resetBall();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  if (running && !gameOver) {
    if (ballX + ballDX > canvas.width - BALL_RADIUS || ballX + ballDX < BALL_RADIUS) {
      ballDX = -ballDX;
    }
    if (ballY + ballDY < BALL_RADIUS) {
      ballDY = -ballDY;
    } else if (ballY + ballDY > canvas.height - BALL_RADIUS - PADDLE_HEIGHT - 5) {
      if (ballX > paddleX && ballX < paddleX + PADDLE_WIDTH) {
        const hitPos = (ballX - paddleX) / PADDLE_WIDTH - 0.5;
        ballDX = hitPos * 6;
        ballDY = -Math.abs(ballDY);
      } else if (ballY + ballDY > canvas.height - BALL_RADIUS) {
        lives--;
        livesEl.textContent = lives;
        if (lives <= 0) {
          running = false;
          gameOver = true;
          drawMessage("ゲームオーバー スペースキーでリスタート");
        } else {
          resetBall();
          running = false;
        }
      }
    }

    if (rightPressed) {
      paddleX = Math.min(paddleX + 5, canvas.width - PADDLE_WIDTH);
    } else if (leftPressed) {
      paddleX = Math.max(paddleX - 5, 0);
    }

    ballX += ballDX;
    ballY += ballDY;
  } else if (!gameOver) {
    drawMessage("スペースキーでスタート");
  }

  requestAnimationFrame(draw);
}

draw();
