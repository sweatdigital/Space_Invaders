export class Shield {
  x: number;
  y: number;
  width: number;
  height: number;
  blocks: { x: number, y: number, size: number, health: number }[] = [];
  blockSize: number = 10;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    // Create shield blocks
    this.createBlocks();
  }

  private createBlocks(): void {
    const cols = Math.floor(this.width / this.blockSize);
    const rows = Math.floor(this.height / this.blockSize);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Create a shield shape (with a gap in the middle bottom)
        if (!(row >= rows - 2 && col >= Math.floor(cols / 2) - 1 && col <= Math.floor(cols / 2) + 1)) {
          this.blocks.push({
            x: this.x + col * this.blockSize,
            y: this.y + row * this.blockSize,
            size: this.blockSize,
            health: 3
          });
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const block of this.blocks) {
      // Color based on health
      let color: string;
      switch (block.health) {
        case 3:
          color = '#33ff33'; // Green
          break;
        case 2:
          color = '#ffcc00'; // Yellow
          break;
        case 1:
          color = '#ff6600'; // Orange
          break;
        default:
          color = '#33ff33';
      }
      
      ctx.fillStyle = color;
      ctx.fillRect(block.x, block.y, block.size, block.size);
    }
  }

  checkCollision(bullet: { x: number, y: number, width: number, height: number }): boolean {
    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const block = this.blocks[i];
      
      if (
        bullet.x < block.x + block.size &&
        bullet.x + bullet.width > block.x &&
        bullet.y < block.y + block.size &&
        bullet.y + bullet.height > block.y
      ) {
        // Reduce block health
        block.health--;
        
        // Remove block if health is depleted
        if (block.health <= 0) {
          this.blocks.splice(i, 1);
        }
        
        return true;
      }
    }
    
    return false;
  }
}
