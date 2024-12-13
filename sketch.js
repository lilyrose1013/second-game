// Class Definitions
class Character {
  constructor(name, health, attackPower) {
    this.name = name;
    this.health = health;
    this.attackPower = attackPower;
  }

  display(x, y) {
    fill(0);
    textSize(16);
    text(this.name, x + 50, y - 10);
    text(`HP: ${this.health}`, x + 50, y + 80);

    // Health bar
    fill(255, 0, 0);
    rect(x, y, 100, 20);
    fill(0, 255, 0);
    rect(x, y, map(this.health, 0, 100, 0, 100), 20);
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
  }

  heal(amount) {
    this.health += amount;
    if (this.health > 100) this.health = 100;
  }
}

class AttackEffect {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.alpha = 255;
  }

  display() {
    fill(this.color[0], this.color[1], this.color[2], this.alpha);
    noStroke();
    ellipse(this.x, this.y, 50);
    this.alpha -= 10;
    if (this.alpha <= 0) {
      attackEffect = null;
    }
  }
}

class Confetti {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = random(1, 3);
    this.size = random(5, 10);
  }

  display() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.size);
    this.y += this.speed; // Confetti falls down
    if (this.y > height) {
      this.y = random(-100, 0); // Reset position to top
    }
  }
}

// Game Action Functions
function playerAttack() {
  if (playerCooldown || gameOver) return;

  let damage = player.attackPower;
  attackEffect = new AttackEffect(350 + 50, 100 + 50, [255, 0, 0]); // Red effect

  enemy.takeDamage(damage);
  playerCooldown = true;

  setTimeout(() => {
    playerCooldown = false;
    if (enemy.health > 0) enemyAttack();
    checkGameOver();
  }, 1000);
}

function playerDefend() {
  if (playerCooldown || gameOver) return;

  playerDefending = true;

  setTimeout(() => {
    playerDefending = false;
    playerCooldown = false;
    if (enemy.health > 0) enemyAttack();
  }, 1000);
}

function playerPowerStrike() {
  if (specialCooldown || gameOver) return;

  let damage = player.attackPower * 2;
  attackEffect = new AttackEffect(350 + 50, 100 + 50, [0, 0, 255]); // Blue effect

  enemy.takeDamage(damage);
  specialCooldown = true;

  setTimeout(() => {
    specialCooldown = false;
    if (enemy.health > 0) enemyAttack();
    checkGameOver();
  }, 2000);
}

function playerHeal() {
  if (playerCooldown || gameOver) return;

  player.heal(20);
  attackEffect = new AttackEffect(50 + 50, 100 + 50, [0, 255, 0]); // Green effect

  playerCooldown = true;

  setTimeout(() => {
    playerCooldown = false;
    if (enemy.health > 0) enemyAttack();
    checkGameOver();
  }, 1000);
}

function enemyAttack() {
  if (gameOver) return;

  let damage = enemy.attackPower;

  if (playerDefending) damage *= 0.5;

  player.takeDamage(damage);
  checkGameOver();
}

function checkGameOver() {
  if (player.health <= 0) {
    gameOver = true;
    restartButton.show();
    endGameButton.show();
  } else if (enemy.health <= 0) {
    score += 10;
    nextLevelButton.show();
    highScore = Math.max(score, highScore);

    localStorage.setItem('highScore', highScore);
  }
}

function restartGame() {
  initializeGame();
  restartButton.hide();
  endGameButton.hide();
}

function nextLevel() {
  level += 1;
  initializeGame();
  nextLevelButton.hide();
}

function initializeGame() {
  gameOver = false;
  playerCooldown = false;
  playerDefending = false;
  specialCooldown = false;

  player = new Character("Player", 100, 10);
  let enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  enemy = new Character(enemyType.name, enemyType.health, enemyType.attackPower);

  confetti = [];
}

function showEndGameStats() {
  background(50);
  textAlign(CENTER);
  fill(255);
  textSize(32);
  text("Game Over", width / 2, height / 3);

  textSize(20);
  text(`Time Played: ${nf(elapsedTime, 2, 1)}s`, width / 2, height / 2);
  text(`Score: ${score}`, width / 2, height / 2 + 30);
  text(`High Score: ${highScore}`, width / 2, height / 2 + 60);

  gameOver = true;
  score = 0;
  elapsedTime = 0;

  attackButton.hide();
  defendButton.hide();
  powerStrikeButton.hide();
  healButton.hide();
  restartButton.hide();
  nextLevelButton.hide();
  endGameButton.hide();
}

// Global Variables
let player, enemy;
let attackButton, defendButton, powerStrikeButton, healButton, restartButton, nextLevelButton, endGameButton;
let difficultySelect;
let gameOver = false;
let playerCooldown = false;
let playerDefending = false;
let specialCooldown = false;
let level = 1;
let score = 0;
let highScore = 0;
let attackEffect = null;
let difficulty = "Medium";
let startTime, elapsedTime = 0;

const enemyTypes = [
  { name: "Poisoner", ability: "Poison", health: 100, attackPower: 10 },
  { name: "Healer", ability: "Heal", health: 120, attackPower: 8 },
  { name: "Defender", ability: "Defense Boost", health: 140, attackPower: 6 },
];

let confetti = [];

// p5.js Functions
function setup() {
  createCanvas(600, 500);

  highScore = localStorage.getItem('highScore') || 0;

  difficultySelect = createSelect();
  difficultySelect.position(20, 450);
  difficultySelect.option("Easy");
  difficultySelect.option("Medium");
  difficultySelect.option("Hard");
  difficultySelect.selected("Medium");

  attackButton = createButton("Attack").position(150, 450).mousePressed(playerAttack);
  defendButton = createButton("Defend").position(250, 450).mousePressed(playerDefend);
  powerStrikeButton = createButton("Power Strike").position(350, 450).mousePressed(playerPowerStrike);
  healButton = createButton("Heal").position(470, 450).mousePressed(playerHeal);
  restartButton = createButton("Restart").position(300, 400).mousePressed(restartGame).hide();
  nextLevelButton = createButton("Next Level").position(300, 350).mousePressed(nextLevel).hide();
  endGameButton = createButton("End Game").position(400, 400).mousePressed(showEndGameStats);

  initializeGame();
  startTime = millis();
}

function draw() {
  background(220);
  displayGameInfo();
  player.display(50, 100);
  enemy.display(350, 100);

  if (attackEffect) attackEffect.display();
  if (gameOver) displayEndEffects();
  confetti.forEach((c) => c.display());
}

function displayGameInfo() {
  textSize(20);
  textAlign(CENTER);
  text(`Battle Game - Level ${level}`, width / 2, 30);

  fill(0);
  textSize(16);
  textAlign(LEFT);
  text(`Score: ${score}`, 20, 50);
  text(`High Score: ${highScore}`, 20, 70);
  text(`Time: ${nf(elapsedTime, 2, 1)}s`, 20, 90);

  elapsedTime = gameOver ? elapsedTime : (millis() - startTime) / 1000;

  textAlign(CENTER);
  text(playerCooldown ? "Cooldown: Wait!" : "Your turn!", width / 2, 400);
}

function displayEndEffects() {
  if (player.health > 0) {
    for (let i = 0; i < 5; i++) {
      confetti.push(new Confetti(random(width), random(-50, 0), color(random(255), random(255), random(255))));
    }
    confetti.forEach((c) => c.display());
  } else {
    fill(255, 0, 0, 100);
    rect(0, 0, width, height);
    textAlign(CENTER);
    fill(0);
    textSize(32);
    text("Game Over", width / 2, height / 2);
  }
}
