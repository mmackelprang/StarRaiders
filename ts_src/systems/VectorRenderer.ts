import Phaser from 'phaser';
import { Enemy } from '@entities/Enemy';
import { Math3D, Camera3D, ProjectedPoint } from '@utils/Math3D';
import { Vector3D } from '@utils/Types';
import { EnemyType } from '@utils/Constants';

interface RenderableObject {
  depth: number;
  renderFunc: () => void;
}

export class VectorRenderer {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private camera: Camera3D;
  private depthBuffer: RenderableObject[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.camera = Math3D.createDefaultCamera();
  }

  /**
   * Set camera position
   */
  setCameraPosition(position: Vector3D): void {
    this.camera.position = { ...position };
  }

  /**
   * Set camera rotation
   */
  setCameraRotation(pitch: number, yaw: number, roll: number = 0): void {
    this.camera.rotation = { pitch, yaw, roll };
  }

  /**
   * Get the camera
   */
  getCamera(): Camera3D {
    return this.camera;
  }

  /**
   * Clear the renderer
   */
  clear(): void {
    this.graphics.clear();
    this.depthBuffer = [];
  }

  /**
   * Render an enemy
   */
  renderEnemy(enemy: Enemy): void {
    const screenWidth = this.scene.scale.width;
    const screenHeight = this.scene.scale.height;

    // Project 3D position to 2D screen
    const projected = Math3D.project3DTo2D(
      enemy.position,
      this.camera,
      screenWidth,
      screenHeight
    );

    if (projected === null) {
      return; // Off screen or behind camera
    }

    // Determine sprite size based on distance
    const baseSize = enemy.getBaseSpriteSize();
    const screenSize = baseSize * projected.scale;

    // Clamp size
    const clampedSize = Math3D.clamp(screenSize, 4, 64);

    // Calculate brightness based on distance (optional)
    const brightness = Math3D.clamp(1.0 - projected.depth / 100, 0.5, 1.0);

    // Add to depth buffer for sorting
    this.depthBuffer.push({
      depth: projected.depth,
      renderFunc: () => this.drawEnemySprite(
        projected.x,
        projected.y,
        clampedSize,
        enemy.getColor(),
        brightness,
        enemy.type
      ),
    });
  }

  /**
   * Draw all objects in the depth buffer (back to front)
   */
  flush(): void {
    // Sort by depth (furthest first)
    this.depthBuffer.sort((a, b) => b.depth - a.depth);

    // Render each object
    for (const obj of this.depthBuffer) {
      obj.renderFunc();
    }

    // Clear depth buffer
    this.depthBuffer = [];
  }

  /**
   * Draw an enemy sprite (triangular vector shape)
   */
  private drawEnemySprite(
    x: number,
    y: number,
    size: number,
    color: number,
    brightness: number,
    type: EnemyType
  ): void {
    // Adjust color for brightness
    const r = ((color >> 16) & 0xff) * brightness;
    const g = ((color >> 8) & 0xff) * brightness;
    const b = (color & 0xff) * brightness;
    const finalColor = ((r << 16) | (g << 8) | b) >>> 0;

    this.graphics.fillStyle(finalColor, 1.0);

    switch (type) {
      case EnemyType.FIGHTER:
        this.drawFighter(x, y, size);
        break;
      case EnemyType.CRUISER:
        this.drawCruiser(x, y, size);
        break;
      case EnemyType.BASESTAR:
        this.drawBasestar(x, y, size);
        break;
    }
  }

  /**
   * Draw a fighter ship (simple triangle)
   */
  private drawFighter(x: number, y: number, size: number): void {
    this.graphics.beginPath();
    this.graphics.moveTo(x, y - size / 2); // Top
    this.graphics.lineTo(x - size / 3, y + size / 2); // Bottom left
    this.graphics.lineTo(x + size / 3, y + size / 2); // Bottom right
    this.graphics.closePath();
    this.graphics.fillPath();
  }

  /**
   * Draw a cruiser (larger triangle with wings)
   */
  private drawCruiser(x: number, y: number, size: number): void {
    this.graphics.beginPath();
    this.graphics.moveTo(x, y - size / 2); // Top point
    this.graphics.lineTo(x - size / 2, y); // Left wing
    this.graphics.lineTo(x - size / 4, y + size / 2); // Bottom left
    this.graphics.lineTo(x + size / 4, y + size / 2); // Bottom right
    this.graphics.lineTo(x + size / 2, y); // Right wing
    this.graphics.closePath();
    this.graphics.fillPath();
  }

  /**
   * Draw a basestar (large X shape)
   */
  private drawBasestar(x: number, y: number, size: number): void {
    const halfSize = size / 2;
    const quarterSize = size / 4;

    // Draw center square
    this.graphics.fillRect(x - quarterSize / 2, y - quarterSize / 2, quarterSize, quarterSize);

    // Draw four arms
    // Top
    this.graphics.fillTriangle(
      x, y - halfSize,
      x - quarterSize / 2, y - quarterSize / 2,
      x + quarterSize / 2, y - quarterSize / 2
    );
    // Bottom
    this.graphics.fillTriangle(
      x, y + halfSize,
      x - quarterSize / 2, y + quarterSize / 2,
      x + quarterSize / 2, y + quarterSize / 2
    );
    // Left
    this.graphics.fillTriangle(
      x - halfSize, y,
      x - quarterSize / 2, y - quarterSize / 2,
      x - quarterSize / 2, y + quarterSize / 2
    );
    // Right
    this.graphics.fillTriangle(
      x + halfSize, y,
      x + quarterSize / 2, y - quarterSize / 2,
      x + quarterSize / 2, y + quarterSize / 2
    );
  }

  /**
   * Draw a simple 3D wireframe box (for debugging)
   */
  drawDebugBox(position: Vector3D, size: number, color: number = 0x00ff00): void {
    const screenWidth = this.scene.scale.width;
    const screenHeight = this.scene.scale.height;

    // Define 8 corners of the box
    const halfSize = size / 2;
    const corners: Vector3D[] = [
      { x: position.x - halfSize, y: position.y - halfSize, z: position.z - halfSize },
      { x: position.x + halfSize, y: position.y - halfSize, z: position.z - halfSize },
      { x: position.x + halfSize, y: position.y + halfSize, z: position.z - halfSize },
      { x: position.x - halfSize, y: position.y + halfSize, z: position.z - halfSize },
      { x: position.x - halfSize, y: position.y - halfSize, z: position.z + halfSize },
      { x: position.x + halfSize, y: position.y - halfSize, z: position.z + halfSize },
      { x: position.x + halfSize, y: position.y + halfSize, z: position.z + halfSize },
      { x: position.x - halfSize, y: position.y + halfSize, z: position.z + halfSize },
    ];

    // Project all corners
    const projected: (ProjectedPoint | null)[] = corners.map((corner) =>
      Math3D.project3DTo2D(corner, this.camera, screenWidth, screenHeight)
    );

    // Draw edges
    this.graphics.lineStyle(1, color, 1);

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Front face
      [4, 5], [5, 6], [6, 7], [7, 4], // Back face
      [0, 4], [1, 5], [2, 6], [3, 7], // Connecting edges
    ];

    for (const [i, j] of edges) {
      const p1 = projected[i];
      const p2 = projected[j];
      if (p1 && p2) {
        this.graphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
      }
    }
  }

  /**
   * Destroy the renderer
   */
  destroy(): void {
    this.graphics.destroy();
  }
}
