const main = document.getElementById('main');
const snake = document.getElementsByClassName('snake');
const food = document.getElementById('food');
const levelCount = document.getElementById('level-count');
const scoreCount = document.getElementById('score-count');
const highscoreCount = document.getElementById('highscore-count');
const restart = document.getElementById('restart');
const pauseElem = document.getElementById('pause');
const instructions = document.getElementById('instructions');
const instructionText = document.getElementById('instruction-text');
const gameOverElem = document.getElementById('game-over');

const gameDimensions = 400;
const gameWidth = gameDimensions;
const gameHeight = gameDimensions;
const startCoordinate = gameDimensions / 2;
const startY = startCoordinate;
const startX = startCoordinate;

const snakeDimensions = 10;
const snakeWidth = snakeDimensions;
const snakeHeight = snakeDimensions;

const foodDimensions = snakeDimensions;

const arrows = {
  left: 37,
  up: 38,
  right: 39,
  down: 40
};

const allowedDirections = {
  37: [38, 40],
  39: [38, 40],
  38: [37, 39],
  40: [37, 39]
};

const snakeArray = [
  [startX, startY],
  [startX - snakeWidth, startY],
  [startX - 2 * snakeWidth, startY],
  [startX - 3 * snakeWidth, startY]
];

let pause = true;
let foodPosition = [];
let gameInterval;
let timeout;
let animation;
let highscore = 0;
let score = 0;
let level = 1;
let fps = 15;
let lastKeyPress = new Date();
let currentDirections = [39];

document.addEventListener('keydown', keyAction);
restart.addEventListener('click', () => location.reload());
pauseElem.addEventListener('click', togglePause);
instructions.addEventListener('click', toggleInstructions);

function startGame() {
  highscore = localStorage.getItem('highscore');
  highscoreCount.innerHTML = highscore || 0;
  putFood();
  drawSnake();
  gameInterval = window.setInterval(autoMove, 1000 / fps);
}

function autoMove() {
  const currentArray = snakeArray;
  if (pause === false) {
    const snakeFrontCoord = {
      left: currentArray[0][0],
      top: currentArray[0][1]
    };
    move(currentDirections[0], snakeFrontCoord);
  }
}

function keyAction(e) {
  e.preventDefault();
  const key = e.keyCode;
  const lastDirection = currentDirections[currentDirections.length - 1];
  if (e.keyCode === 32) {
    togglePause();
  } else if (Object.values(arrows).includes(key)) {
    if (pause === true) {
      togglePause();
    }
    if (
      allowedDirections[lastDirection].find(allowed => key === allowed) ===
      undefined
    ) {
      return;
    }
    currentDirections.push(key);
  }
}

function drawSnake() {
  [...snake].forEach(item => main.removeChild(item));
  snakeArray.forEach((item, i) => {
    const elem = document.createElement('div');
    elem.className = 'snake';
    if (i === 0) {
      elem.id = 'head';
    }
    elem.style.left = item[0] + 'px';
    elem.style.top = item[1] + 'px';
    main.appendChild(elem);
  });
}

function putFood() {
  const randomX =
    Math.floor((Math.random() * gameWidth) / foodDimensions) * foodDimensions;
  if (randomX <= foodDimensions || randomX >= gameWidth - foodDimensions) {
    return putFood();
  }
  const randomY =
    Math.floor((Math.random() * gameHeight) / foodDimensions) * foodDimensions;
  if (randomY <= foodDimensions || randomY >= gameHeight - foodDimensions) {
    return putFood();
  }
  if (
    snakeArray.find(elem => elem[0] === randomX && elem[1] === randomY) !==
    undefined
  ) {
    return putFood();
  }
  foodPosition = [randomX, randomY];
  food.style.left = randomX + 'px';
  food.style.top = randomY + 'px';
}

function move(direction, coord) {
  const first = snakeArray[0];
  if (direction === arrows.left) {
    snakeArray.unshift([coord.left - snakeWidth, first[1]]);
  } else if (direction === arrows.right) {
    snakeArray.unshift([coord.left + snakeWidth, first[1]]);
  } else if (direction === arrows.up) {
    snakeArray.unshift([first[0], coord.top - snakeHeight]);
  } else if (direction === arrows.down) {
    snakeArray.unshift([first[0], coord.top + snakeHeight]);
  }
  if (currentDirections.length > 1) {
    currentDirections.shift();
  }
  if (JSON.stringify(snakeArray[0]) != JSON.stringify(foodPosition)) {
    snakeArray.pop();
  } else {
    updateScore();
    putFood();
  }
  const newFirst = snakeArray[0];
  if (isInside(newFirst) && doesNotTouch(newFirst)) {
    drawSnake();
  } else {
    gameOver();
  }
}

function updateScore() {
  score = score + 10;
  scoreCount.innerHTML = score;
  if (highscore < score) {
    highscoreCount.innerHTML = score;
  }
  if (score % 100 === 0) {
    updateLevel();
    window.clearInterval(gameInterval);
    gameInterval = window.setInterval(autoMove, 1000 / fps);
  }
}

function updateLevel() {
  level = level + 1;
  levelCount.innerHTML = level;
  fps = fps + 5;
}

function togglePause() {
  pause = !pause;
  pause ? (pauseElem.innerHTML = 'Continue') : (pauseElem.innerHTML = 'Pause');
}

function toggleInstructions() {
  const isVisible = instructionText.style.display === 'block';
  instructionText.style.display = isVisible ? 'none' : 'block';
}

function isInside(snakeFront) {
  const [snakeLeft, snakeTop] = snakeFront;
  if (
    snakeLeft >= 0 &&
    snakeLeft + snakeWidth <= gameWidth &&
    snakeTop >= 0 &&
    snakeTop + snakeHeight <= gameHeight
  ) {
    return true;
  }
  return false;
}

function doesNotTouch(snakeFront) {
  const [snakeLeft, snakeTop] = snakeFront;
  const currentArray = snakeArray;
  if (
    currentArray
      .slice(1)
      .find(elem => elem[0] === snakeLeft && elem[1] === snakeTop) === undefined
  ) {
    return true;
  }
  return false;
}

function disablePauseElement() {
  pauseElem.removeEventListener('click', togglePause);
  pauseElem.classList.add('disabled');
}

function gameOver() {
  clearInterval(gameInterval);
  gameOverElem.style.display = 'block';
  disablePauseElement();

  document.removeEventListener('keydown', keyAction);
  if (score > highscore) {
    localStorage.setItem('highscore', score);
  }
}

startGame();
