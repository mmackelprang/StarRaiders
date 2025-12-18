import Phaser from 'phaser';
import { StarfieldManager } from '@systems/StarfieldManager';

export class StarfieldTestScene extends Phaser.Scene {
  private starfieldManager!: StarfieldManager;
  private velocityX: number = 0;
  private velocityY: number = 0;
  private instructionsText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'StarfieldTest' });
  }

  create(): void {
    // Create starfield
    this.starfieldManager = new StarfieldManager(this);

    // Instructions
    this.instructionsText = this.add.text(20, 20, 
      'Arrow Keys: Move stars\n0-9: Set speed (0=stop, 9=max)', 
      { 
        fontSize: '16px', 
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 10 }
      }
    );
    this.instructionsText.setDepth(1000);

    // Stats display
    this.statsText = this.add.text(20, 100, '', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });
    this.statsText.setDepth(1000);

    // Set up input
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      // Speed keys 0-9
      if (event.key >= '0' && event.key <= '9') {
        const speed = parseInt(event.key);
        // Set velocity based on current arrow key state
        const cursors = this.input.keyboard?.createCursorKeys();
        if (cursors) {
          this.velocityX = (cursors.right.isDown ? 1 : 0) - (cursors.left.isDown ? 1 : 0);
          this.velocityY = (cursors.down.isDown ? 1 : 0) - (cursors.up.isDown ? 1 : 0);
          this.velocityX *= speed;
          this.velocityY *= speed;
        }
      }
    });
  }

  update(time: number, delta: number): void {
    // Get current input for direction
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors) {
      const dirX = (cursors.right.isDown ? 1 : 0) - (cursors.left.isDown ? 1 : 0);
      const dirY = (cursors.down.isDown ? 1 : 0) - (cursors.up.isDown ? 1 : 0);
      
      // Apply direction if there's movement
      if (dirX !== 0 || dirY !== 0) {
        const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        if (speed > 0) {
          this.velocityX = dirX * speed;
          this.velocityY = dirY * speed;
        }
      }
    }

    // Update starfield
    const deltaTime = delta / 1000; // Convert to seconds
    this.starfieldManager.update(deltaTime, this.velocityX, this.velocityY);

    // Update stats
    this.statsText.setText(
      `Velocity X: ${this.velocityX.toFixed(1)}\n` +
      `Velocity Y: ${this.velocityY.toFixed(1)}\n` +
      `Speed: ${Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY).toFixed(1)}\n` +
      `FPS: ${this.game.loop.actualFps.toFixed(0)}`
    );
  }
}
