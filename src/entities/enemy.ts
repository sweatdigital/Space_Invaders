export class Enemy {
  x: number;
  y: number;
  width: number = 40;
  height: number = 30;
  type: number; // 1, 2, or 3 for different enemy types

  constructor(x: number, y: number, type: number) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Different colors based on enemy type
    let color: string;
    switch (this.type) {
      case 1:
        color = '#ff0000'; // Red for type 1
        break;
      case 2:
        color = '#ff6600'; // Orange for type 2
        break;
      case 3:
        color = '#ffcc00'; // Yellow for type 3
        break;
      default:
        color = '#ffffff';
    }
    
    ctx.fillStyle = color;
    
    // Draw enemy body
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y);
    ctx.lineTo(this.x + this.width - 10, this.y + this.height);
    ctx.lineTo(this.x + 10, this.y + this.height);
    ctx.closePath();
    ctx.fill();
    
    // Draw enemy eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x + 10, this.y + 10, 5, 5);
    ctx.fillRect(this.x + this.width - 15, this.y + 10, 5, 5);
    
    // Draw enemy mouth
    ctx.beginPath();
    ctx.moveTo(this.x + 15, this.y + 20);
    ctx.lineTo(this.x + this.width - 15, this.y + 20);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  }
}
