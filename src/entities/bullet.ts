export class Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number = 4;
  height: number = 10;
  color: string;

  constructor(x: number, y: number, vx: number, vy: number, color: string) {
    this.x = x - this.width / 2;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
  }

  update(deltaTime: number): void {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Add glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;
  }
}
