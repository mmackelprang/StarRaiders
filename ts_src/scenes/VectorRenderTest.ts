import Phaser from 'phaser';
import { VectorRenderer } from '@systems/VectorRenderer';
import { Enemy } from '@entities/Enemy';
import { EnemyType } from '@utils/Constants';
import { Debug } from '@utils/Debug';

export class VectorRenderTestScene extends Phaser.Scene {
  private vectorRenderer!: VectorRenderer;
  private enemies: Enemy[] = [];
  private rotationSpeed: number = 0.3;
  private cameraAngle: number = 0;

  constructor() {
    super({ key: 'VectorRenderTest' });
  }

  create(): void {
    Debug.log('VectorRenderTest: Initializing 3D vector rendering test');

    // Create renderer
    this.vectorRenderer = new VectorRenderer(this);

    // Create test enemies at various positions and depths
    this.createTestEnemies();

    // Add instructions
    this.add
      .text(20, 20, 'Vector Renderer Test - Phase 8', {
        fontSize: '24px',
        color: '#00FFFF',
        fontFamily: 'monospace',
      });

    this.add
      .text(20, 60, 'LEFT/RIGHT: Rotate camera\nUP/DOWN: Move camera forward/back\nESC: Back to Title', {
        fontSize: '16px',
        color: '#00FF00',
        fontFamily: 'monospace',
      });

    // Enemy count and stats
    const statsY = this.scale.height - 100;
    this.add
      .text(20, statsY, `Enemies: ${this.enemies.length}`, {
        fontSize: '16px',
        color: '#FFFFFF',
        fontFamily: 'monospace',
      });

    // Set up input
    this.setupInput();
  }

  private createTestEnemies(): void {
    // Create a fighter close up
    this.enemies.push(
      new Enemy('fighter-1', EnemyType.FIGHTER, { x: -20, y: 0, z: 30 }, 1)
    );

    // Create a cruiser at medium distance
    this.enemies.push(
      new Enemy('cruiser-1', EnemyType.CRUISER, { x: 15, y: 5, z: 50 }, 2)
    );

    // Create a basestar far away
    this.enemies.push(
      new Enemy('basestar-1', EnemyType.BASESTAR, { x: 0, y: -10, z: 80 }, 3)
    );

    // Create a formation of fighters
    for (let i = 0; i < 3; i++) {
      this.enemies.push(
        new Enemy(`formation-${i}`, EnemyType.FIGHTER, 
          { x: -30 + i * 15, y: 10, z: 60 }, 1)
      );
    }

    // Create some distant enemies
    this.enemies.push(
      new Enemy('distant-1', EnemyType.CRUISER, { x: -40, y: -15, z: 100 }, 2)
    );
    this.enemies.push(
      new Enemy('distant-2', EnemyType.FIGHTER, { x: 40, y: 15, z: 120 }, 1)
    );

    Debug.log(`Created ${this.enemies.length} test enemies`);
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;

    // Return to title
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('Title');
    });
  }

  update(time: number, delta: number): void {
    const deltaSeconds = delta / 1000;

    // Handle camera rotation with arrow keys
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors) {
      if (cursors.left.isDown) {
        this.cameraAngle += this.rotationSpeed * deltaSeconds;
      }
      if (cursors.right.isDown) {
        this.cameraAngle -= this.rotationSpeed * deltaSeconds;
      }

      // Move camera forward/back
      const camera = this.vectorRenderer.getCamera();
      if (cursors.up.isDown) {
        camera.position.z -= 20 * deltaSeconds;
      }
      if (cursors.down.isDown) {
        camera.position.z += 20 * deltaSeconds;
      }
    }

    // Update camera rotation
    this.vectorRenderer.setCameraRotation(0, this.cameraAngle, 0);

    // Animate enemies (simple circular motion)
    for (const enemy of this.enemies) {
      enemy.update(deltaSeconds);
    }

    // Clear and render
    this.vectorRenderer.clear();

    // Render all enemies
    for (const enemy of this.enemies) {
      this.vectorRenderer.renderEnemy(enemy);
    }

    // Flush depth buffer (renders back to front)
    this.vectorRenderer.flush();
  }

  shutdown(): void {
    if (this.vectorRenderer) {
      this.vectorRenderer.destroy();
    }
  }
}
