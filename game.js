// 슈퍼마리오 간단 구현 (WASD 이동, E키 달리기)

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;

const GROUND_HEIGHT = 60;
const GRAVITY = 0.7;
const MOVE_SPEED = 2.2;
const RUN_SPEED = 4.2;
const JUMP_POWER = 12;

let keys = {};

const player = {
  x: 100,
  y: CANVAS_HEIGHT - GROUND_HEIGHT - 48,
  vx: 0,
  vy: 0,
  width: 32,
  height: 48,
  onGround: true,
  color: '#e33',
};

const obstacles = [
  { x: 350, y: CANVAS_HEIGHT - GROUND_HEIGHT - 24, width: 40, height: 24 },
  { x: 520, y: CANVAS_HEIGHT - GROUND_HEIGHT - 56, width: 40, height: 56 },
  { x: 700, y: CANVAS_HEIGHT - GROUND_HEIGHT - 12, width: 32, height: 36 },
];

let cameraX = 0;
let obstacleTimer = 0;
const OBSTACLE_INTERVAL = 120; // 프레임 간격

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawPlayer(ctx) {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x - cameraX, player.y, player.width, player.height);
}

function drawGround(ctx) {
  ctx.fillStyle = '#3a3';
  ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
}

function drawObstacles(ctx) {
  ctx.fillStyle = '#964B00';
  for (const obs of obstacles) {
    ctx.fillRect(obs.x - cameraX, obs.y, obs.width, obs.height);
  }
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function updatePlayer() {
  let speed = keys['e'] ? RUN_SPEED : MOVE_SPEED;
  player.vx = 0;
  if (keys['a']) player.vx = -speed;
  if (keys['d']) player.vx = speed;

  if (keys['w'] && player.onGround) {
    player.vy = -JUMP_POWER;
    player.onGround = false;
  }

  // 무한 스크롤: 플레이어는 화면 중앙 근처에 고정, 실제 위치는 cameraX로 이동
  let nextX = player.x + player.vx;
  let collided = false;
  for (const obs of obstacles) {
    if (isColliding({ ...player, x: nextX }, obs)) {
      collided = true;
      break;
    }
  }
  if (!collided) player.x = nextX;

  player.y += player.vy;
  let yCollided = false;
  for (const obs of obstacles) {
    if (isColliding(player, obs)) {
      if (player.vy > 0) {
        player.y = obs.y - player.height;
        player.vy = 0;
        player.onGround = true;
        yCollided = true;
      } else if (player.vy < 0) {
        player.y = obs.y + obs.height;
        player.vy = 0;
      }
    }
  }
  if (!yCollided) {
    if (!player.onGround) player.vy += GRAVITY;
  }

  // 땅 충돌
  if (player.y >= CANVAS_HEIGHT - GROUND_HEIGHT - 48) {
    player.y = CANVAS_HEIGHT - GROUND_HEIGHT - 48;
    player.vy = 0;
    player.onGround = true;
  } else if (!yCollided) {
    player.onGround = false;
  }

  // 화면 밖 방지 (왼쪽만)
  if (player.x < cameraX) player.x = cameraX;

  // 카메라 이동: 플레이어가 화면 중앙보다 오른쪽이면 카메라 이동
  const centerX = cameraX + CANVAS_WIDTH / 2 - player.width / 2;
  if (player.x > centerX) {
    cameraX = player.x - CANVAS_WIDTH / 2 + player.width / 2;
  }
}

function updateObstacles() {
  // 장애물 생성
  obstacleTimer++;
  if (obstacleTimer > OBSTACLE_INTERVAL) {
    obstacleTimer = 0;
    // 장애물 높이와 폭을 랜덤하게, 넘을 수 있도록 제한
    const minHeight = 20;
    const maxHeight = 60;
    const minWidth = 30;
    const maxWidth = 70;
    const height = getRandomInt(minHeight, maxHeight);
    const width = getRandomInt(minWidth, maxWidth);
    // y는 땅 위에 놓이거나, 점프해서 넘을 수 있는 높이로
    const yOptions = [CANVAS_HEIGHT - GROUND_HEIGHT - 48 - height, CANVAS_HEIGHT - GROUND_HEIGHT - 48 - height - getRandomInt(0, 40)];
    const y = yOptions[getRandomInt(0, yOptions.length - 1)];
    const x = cameraX + CANVAS_WIDTH + getRandomInt(0, 80);
    obstacles.push({ x, y, width, height });
  }
  // 화면 밖(왼쪽) 장애물 제거
  while (obstacles.length && obstacles[0].x + obstacles[0].width < cameraX) {
    obstacles.shift();
  }
}

function gameLoop(ctx) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawGround(ctx);
  drawObstacles(ctx);
  updatePlayer();
  updateObstacles();
  drawPlayer(ctx);
  requestAnimationFrame(() => gameLoop(ctx));
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  gameLoop(ctx);

  document.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
  });
  document.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
  });
});
