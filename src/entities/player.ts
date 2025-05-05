export class Player {
  x: number;
  y: number;
  width: number = 50;
  height: number = 30;
  speed: number = 5;
  velocity: number = 0;

  constructor(x: number, y: number) {
    this.x = x - this.width / 2;
    this.y = y;
  }

  update(deltaTime: number): void {
    this.x += this.velocity;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Draw player ship
    ctx.fillStyle = '#33ff33';
    
    // Ship body
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.closePath();
    ctx.fill();
    
    // Ship cockpit
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x + this.width / 2 - 5, this.y + 10, 10, 10);
    
    // Ship thrusters
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(this.x + 10, this.y + this.height, 5, 5);
    ctx.fillRect(this.x + this.width - 15, this.y + this.height, 5, 5);
  }

  moveLeft(): void {
    this.velocity = -this.speed;
  }

  moveRight(): void {
    this.velocity = this.speed;
  }

  stopMoving(): void {
    this.velocity = 0;
  }
}
