import { Player } from './entities/player';
import { Enemy } from './entities/enemy';
import { Bullet } from './entities/bullet';
import { Particle } from './entities/particle';
import { Shield } from './entities/shield';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private enemies: Enemy[] = [];
  private playerBullets: Bullet[] = [];
  private enemyBullets: Bullet[] = [];
  private particles: Particle[] = [];
  private shields: Shield[] = [];
  private score: number = 0;
  private lives: number = 3;
  private level: number = 1;
  private enemyDirection: number = 1;
  private enemySpeed: number = 1;
  private enemyMoveDownTimer: number = 0;
  private gameOver: boolean = false;
  private lastTime: number = 0;
  private enemyShootTimer: number = 0;
  private scoreElement: HTMLElement;
  private livesElement: HTMLElement;
  private animationFrameId: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.player = new Player(this.canvas.width / 2, this.canvas.height - 60);
    this.scoreElement = document.getElementById('score')!;
    this.livesElement = document.getElementById('lives')!;
    
    // Initialize event listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  start(): void {
    this.initializeGame();
    this.gameLoop(0);
  }

  private initializeGame(): void {
    // Create enemies
    this.createEnemies();
    
    // Create shields
    this.createShields();
    
    // Reset game state
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameOver = false;
    this.updateUI();
  }

  private createEnemies(): void {
    this.enemies = [];
    const rows = 5;
    const cols = 11;
    const enemyWidth = 40;
    const enemyHeight = 30;
    const startX = (this.canvas.width - (cols * (enemyWidth + 10))) / 2;
    const startY = 50;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (enemyWidth + 10);
        const y = startY + row * (enemyHeight + 10);
        const type = row < 1 ? 3 : row < 3 ? 2 : 1; // Different enemy types based on row
        this.enemies.push(new Enemy(x, y, type));
      }
    }
  }

  private createShields(): void {
    this.shields = [];
    const shieldCount = 4;
    const shieldWidth = 80;
    const gap = (this.canvas.width - (shieldCount * shieldWidth)) / (shieldCount + 1);
    
    for (let i = 0; i < shieldCount; i++) {
      const x = gap + i * (shieldWidth + gap);
      const y = this.canvas.height - 150;
      this.shields.push(new Shield(x, y, shieldWidth, 60));
    }
  }

  private gameLoop(timestamp: number): void {
    // Calculate delta time
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (!this.gameOver) {
      // Update game objects
      this.update(deltaTime);
      
      // Draw game objects
      this.draw();
      
      // Check for level completion
      if (this.enemies.length === 0) {
        this.nextLevel();
      }
    } else {
      this.drawGameOver();
    }
    
    // Continue game loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(deltaTime: number): void {
    // Update player
    this.player.update(deltaTime);
    
    // Keep player within canvas bounds
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x + this.player.width > this.canvas.width) {
      this.player.x = this.canvas.width - this.player.width;
    }
    
    // Update enemies
    this.updateEnemies(deltaTime);
    
    // Update bullets
    this.updateBullets(deltaTime);
    
    // Update particles
    this.updateParticles(deltaTime);
    
    // Check collisions
    this.checkCollisions();
    
    // Enemy shooting logic
    this.enemyShootTimer += deltaTime;
    if (this.enemyShootTimer > 1000 && this.enemies.length > 0) {
      this.enemyShoot();
      this.enemyShootTimer = 0;
    }
  }

  private updateEnemies(deltaTime: number): void {
    let moveDown = false;
    let reachedEdge = false;
    
    // Check if any enemy reached the edge
    for (const enemy of this.enemies) {
      if (
        (enemy.x <= 0 && this.enemyDirection < 0) ||
        (enemy.x + enemy.width >= this.canvas.width && this.enemyDirection > 0)
      ) {
        reachedEdge = true;
        break;
      }
    }
    
    // Change direction and move down if reached edge
    if (reachedEdge) {
      this.enemyDirection *= -1;
      moveDown = true;
      this.enemyMoveDownTimer = 500; // Time to move down
    }
    
    // Update enemy positions
    for (const enemy of this.enemies) {
      enemy.x += this.enemyDirection * this.enemySpeed;
      
      if (moveDown) {
        enemy.y += 20;
      }
      
      // Check if enemies reached the player
      if (enemy.y + enemy.height >= this.player.y) {
        this.gameOver = true;
      }
    }
  }

  private updateBullets(deltaTime: number): void {
    // Update player bullets
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      this.playerBullets[i].update(deltaTime);
      
      // Remove bullets that go off screen
      if (this.playerBullets[i].y < 0) {
        this.playerBullets.splice(i, 1);
      }
    }
    
    // Update enemy bullets
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      this.enemyBullets[i].update(deltaTime);
      
      // Remove bullets that go off screen
      if (this.enemyBullets[i].y > this.canvas.height) {
        this.enemyBullets.splice(i, 1);
      }
    }
  }

  private updateParticles(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(deltaTime);
      
      // Remove particles that have faded out
      if (this.particles[i].alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private checkCollisions(): void {
    // Player bullets vs enemies
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const bullet = this.playerBullets[i];
      
      // Check collision with enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        
        if (this.checkCollision(bullet, enemy)) {
          // Create explosion particles
          this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
          
          // Remove bullet and enemy
          this.playerBullets.splice(i, 1);
          this.enemies.splice(j, 1);
          
          // Increase score
          this.score += enemy.type * 10;
          this.updateUI();
          
          // Break out of inner loop since bullet is removed
          break;
        }
      }
    }
    
    // Enemy bullets vs player
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i];
      
      if (this.checkCollision(bullet, this.player)) {
        // Create explosion particles
        this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        
        // Remove bullet
        this.enemyBullets.splice(i, 1);
        
        // Decrease lives
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
          this.gameOver = true;
        }
      }
    }
    
    // Bullets vs shields
    for (const shield of this.shields) {
      // Player bullets vs shields
      for (let i = this.playerBullets.length - 1; i >= 0; i--) {
        if (shield.checkCollision(this.playerBullets[i])) {
          this.playerBullets.splice(i, 1);
        }
      }
      
      // Enemy bullets vs shields
      for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
        if (shield.checkCollision(this.enemyBullets[i])) {
          this.enemyBullets.splice(i, 1);
        }
      }
    }
  }

  private checkCollision(a: { x: number, y: number, width: number, height: number }, 
                         b: { x: number, y: number, width: number, height: number }): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private createExplosion(x: number, y: number): void {
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = Math.random() * 3 + 2;
      const color = `hsl(${Math.random() * 60 + 10}, 100%, 50%)`;
      this.particles.push(new Particle(x, y, vx, vy, size, color));
    }
  }

  private enemyShoot(): void {
    // Select a random enemy to shoot
    if (this.enemies.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.enemies.length);
      const enemy = this.enemies[randomIndex];
      
      // Create a new bullet
      const bullet = new Bullet(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height,
        0,
        5,
        '#ff0000'
      );
      
      this.enemyBullets.push(bullet);
    }
  }

  private draw(): void {
    // Draw player
    this.player.draw(this.ctx);
    
    // Draw enemies
    for (const enemy of this.enemies) {
      enemy.draw(this.ctx);
    }
    
    // Draw player bullets
    for (const bullet of this.playerBullets) {
      bullet.draw(this.ctx);
    }
    
    // Draw enemy bullets
    for (const bullet of this.enemyBullets) {
      bullet.draw(this.ctx);
    }
    
    // Draw particles
    for (const particle of this.particles) {
      particle.draw(this.ctx);
    }
    
    // Draw shields
    for (const shield of this.shields) {
      shield.draw(this.ctx);
    }
  }

  private drawGameOver(): void {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '48px "Courier New", Courier, monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 24);
    
    this.ctx.font = '24px "Courier New", Courier, monospace';
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 24);
    
    this.ctx.font = '18px "Courier New", Courier, monospace';
    this.ctx.fillText('Press SPACE to play again', this.canvas.width / 2, this.canvas.height / 2 + 60);
  }

  private nextLevel(): void {
    this.level++;
    this.enemySpeed += 0.5;
    this.createEnemies();
  }

  private updateUI(): void {
    this.scoreElement.textContent = `Score: ${this.score}`;
    this.livesElement.textContent = `Lives: ${this.lives}`;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft') {
      this.player.moveLeft();
    } else if (e.key === 'ArrowRight') {
      this.player.moveRight();
    } else if (e.key === ' ') {
      if (this.gameOver) {
        // Restart game
        this.initializeGame();
      } else {
        // Shoot
        this.playerShoot();
      }
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      this.player.stopMoving();
    }
  }

  private playerShoot(): void {
    // Limit shooting rate
    if (this.playerBullets.length < 3) {
      const bullet = new Bullet(
        this.player.x + this.player.width / 2,
        this.player.y,
        0,
        -8,
        '#33ff33'
      );
      
      this.playerBullets.push(bullet);
    }
  }
}
