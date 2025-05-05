import './style.css';
import { Game } from './game';

// Create canvas element
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
canvas.id = 'gameCanvas';

// Replace app content with canvas
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <div class="game-container">
    <h1>Space Invaders</h1>
    <div class="canvas-container"></div>
    <div class="controls">
      <p>Use ← → to move and SPACE to shoot</p>
      <p id="score">Score: 0</p>
      <p id="lives">Lives: 3</p>
    </div>
  </div>
`;

document.querySelector('.canvas-container')!.appendChild(canvas);

// Initialize game
const game = new Game(canvas);
game.start();
