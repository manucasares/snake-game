const canvas = document.querySelector('#canvas');
const scoreEl = document.querySelector('#score');

canvas.width = 100;
canvas.height = 100;

// Constants
const FPS = 20;
const SNAKE_COLOR = '#00FF00';
const FOOD_COLOR = '#FFE600';
const ZOOM_LS_KEY = 'zoom_value';

const DIRECTION_UP = 'UP';
const DIRECTION_DOWN = 'DOWN';
const DIRECTION_LEFT = 'LEFT';
const DIRECTION_RIGHT = 'RIGHT';
//

// Rendering vars
let oldRenderTime;
let secondsPassedFromLastRender;
let renderedOneTime = false;
//

let snakeDirection = DIRECTION_RIGHT;
let nextSnakeDirection = DIRECTION_RIGHT;
let segmentToAdd = null;
let canvasZoom = Number(localStorage.getItem(ZOOM_LS_KEY)) || 5;

const context = canvas.getContext('2d');

const snakeBody = [
  {
    x: 14,
    y: 10,
  },
  {
    x: 13,
    y: 10,
  },
  {
    x: 12,
    y: 10,
  },
  {
    x: 11,
    y: 10,
  },
  {
    x: 10,
    y: 10,
  },
];

let foodPosition = generateFoodPosition();

let isGameOver = false;

function gameLoop(currentRenderTime) {
  if (isGameOver) return;

  window.requestAnimationFrame(gameLoop);

  secondsPassedFromLastRender = (currentRenderTime - oldRenderTime) / 1000;

  if (secondsPassedFromLastRender < 1 / FPS || renderedOneTime) return;

  oldRenderTime = currentRenderTime;

  // DEBUG
  // renderedOneTime = true;

  clearCanvas();
  update();
  draw();
}

function update() {
  updateSnake();
}

function updateSnake() {
  snakeDirection = nextSnakeDirection;

  for (let i = snakeBody.length - 1; i >= 0; i--) {
    const isHead = i === 0;

    if (isHead) {
      changeHeadPosition();

      const hasCollided = checkForCollision();
      if (hasCollided) {
        gameOver();
        break;
      }

      const isEating = checkIfIsEating();
      if (isEating) {
        segmentToAdd = { ...snakeBody.at(-1) };
        foodPosition = generateFoodPosition();
        scoreEl.textContent = Number(scoreEl.textContent) + 1;
      }

      break;
    }

    snakeBody[i] = { ...snakeBody[i - 1] };
  }

  if (segmentToAdd) {
    snakeBody.push(segmentToAdd);
    segmentToAdd = null;
  }
}

function changeHeadPosition() {
  const head = snakeBody[0];

  switch (snakeDirection) {
    case DIRECTION_UP:
      head.y -= 1;
      break;

    case DIRECTION_DOWN:
      head.y += 1;
      break;

    case DIRECTION_LEFT:
      head.x -= 1;
      break;

    case DIRECTION_RIGHT:
      head.x += 1;
      break;

    default:
      break;
  }
}

function checkForCollision() {
  const { x: headX, y: headY } = snakeBody[0];

  // Checking collision with boundaries
  if (headX >= canvas.width || headY >= canvas.height || headX < 0 || headY < 0) {
    return true;
  }

  // Checking for collision in the snake itself
  // We begin at index 2 because we don't need to check head itself and the segment before,
  // is not possible to collide with snakeBody[1]
  for (let i = 2; i < snakeBody.length; i++) {
    const segment = snakeBody[i];
    if (segment.x === headX && segment.y === headY) {
      return true;
    }
  }

  return false;
}

function checkIfIsEating() {
  return snakeBody[0].x === foodPosition.x && snakeBody[0].y === foodPosition.y;
}

function generateFoodPosition() {
  let x, y, isCollidingWithSnakeBody;

  do {
    x = Math.floor(Math.random() * canvas.width);
    y = Math.floor(Math.random() * canvas.height);

    isCollidingWithSnakeBody = snakeBody.some(seg => seg.x === x && seg.y === y);
  } while (isCollidingWithSnakeBody);

  return { x, y };
}

function draw() {
  drawSnake();
  drawFood();
}

function drawSnake() {
  snakeBody.forEach(({ x, y }) => {
    context.fillStyle = SNAKE_COLOR;
    context.fillRect(x, y, 1, 1);
  });
}

function drawFood() {
  context.fillStyle = FOOD_COLOR;
  context.fillRect(foodPosition.x, foodPosition.y, 1, 1);
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function gameOver() {
  alert("You've lost!");
  isGameOver = true;
  window.location.reload();
}

window.addEventListener('keydown', ({ key }) => {
  switch (key) {
    case 'ArrowUp':
      if (snakeDirection === DIRECTION_UP || snakeDirection === DIRECTION_DOWN) break;
      nextSnakeDirection = DIRECTION_UP;
      break;

    case 'ArrowDown':
      if (snakeDirection === DIRECTION_UP || snakeDirection === DIRECTION_DOWN) break;
      nextSnakeDirection = DIRECTION_DOWN;
      break;

    case 'ArrowLeft':
      if (snakeDirection === DIRECTION_RIGHT || snakeDirection === DIRECTION_LEFT) break;
      nextSnakeDirection = DIRECTION_LEFT;
      break;

    case 'ArrowRight':
      if (snakeDirection === DIRECTION_RIGHT || snakeDirection === DIRECTION_LEFT) break;
      nextSnakeDirection = DIRECTION_RIGHT;
      break;

    default:
      break;
  }
});

// == Zoom feature == //
const addZoomBtn = document.querySelector('#add_zoom');
const subZoomBtn = document.querySelector('#sub_zoom');

addZoomBtn.addEventListener('click', () => changeZoom(true));
subZoomBtn.addEventListener('click', () => changeZoom(false));

function changeZoom(add) {
  if (add) {
    canvasZoom += 0.5;
  } else {
    canvasZoom -= 0.5;
  }

  canvas.style.zoom = canvasZoom;
  saveZoomOnLs();
}

function saveZoomOnLs() {
  canvas.style.zoom = canvasZoom;

  localStorage.setItem(ZOOM_LS_KEY, canvasZoom);
}

window.addEventListener('load', () => {
  saveZoomOnLs();
});
// == //

window.requestAnimationFrame(gameLoop);
