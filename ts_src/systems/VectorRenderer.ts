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
   * Draw a fighter ship in a TIE-style silhouette
   * Central pod with vertical wings on left and right
   */
  private drawFighter(x: number, y: number, size: number): void {
    const podWidth = size * 0.3;
    const podHeight = size * 0.6;
    const wingWidth = size * 0.35;
    const wingHeight = size * 0.9;
    const strutWidth = size * 0.08;
 
    // Left wing
    this.graphics.fillRect(
      x - podWidth / 2 - wingWidth,
      y - wingHeight / 2,
      wingWidth,
      wingHeight,
    );
 
    // Right wing
    this.graphics.fillRect(
      x + podWidth / 2,
      y - wingHeight / 2,
      wingWidth,
      wingHeight,
    );
 
    // Central pod
    this.graphics.fillRect(
      x - podWidth / 2,
      y - podHeight / 2,
      podWidth,
      podHeight,
    );
 
    // Upper strut
    this.graphics.fillRect(
      x - strutWidth / 2,
      y - wingHeight / 2,
      strutWidth,
      (wingHeight - podHeight) / 2,
    );
 
    // Lower strut
    this.graphics.fillRect(
      x - strutWidth / 2,
      y + podHeight / 2,
      strutWidth,
      (wingHeight - podHeight) / 2,
    );
  }
 
  /**
   * Draw a cruiser in a bird-of-prey style silhouette
   * Swept wings with a central forward "beak"
   */
  private drawCruiser(x: number, y: number, size: number): void {
    const half = size / 2;
    const wingSpan = size * 1.2;
    const wingSweep = size * 0.4;
 
    this.graphics.beginPath();
 
    // Nose / beak
    this.graphics.moveTo(x, y - half);
 
    // Left forward wing tip
    this.graphics.lineTo(x - wingSpan / 2, y - wingSweep / 2);
 
    // Left rear wing
    this.graphics.lineTo(x - wingSpan * 0.6, y + half);
 
    // Tail / engine section
    this.graphics.lineTo(x, y + half * 0.6);
 
    // Right rear wing
    this.graphics.lineTo(x + wingSpan * 0.6, y + half);
 
    // Right forward wing tip
    this.graphics.lineTo(x + wingSpan / 2, y - wingSweep / 2);
 
    this.graphics.closePath();
    this.graphics.fillPath();
  }
 
  /**
   * Draw a basestar as a thick saucer shape
   */
  private drawBasestar(x: number, y: number, size: number): void {
    const radius = size / 2;
    const domeRadius = size * 0.25;
    const notchWidth = size * 0.2;
    const notchHeight = size * 0.08;
 
    // Main saucer body (flattened disc)
    this.graphics.fillEllipse(x, y, size, size * 0.6);
 
    // Central dome
    this.graphics.fillEllipse(
      x,
      y - radius * 0.1,
      domeRadius * 2,
      domeRadius,
    );
 
    // Front notch
    this.graphics.fillRect(
      x - notchWidth / 2,
      y - radius * 0.6 - notchHeight / 2,
      notchWidth,
      notchHeight,
    );
 
    // Rear notch
    this.graphics.fillRect(
      x - notchWidth / 2,
      y + radius * 0.6 - notchHeight / 2,
      notchWidth,
      notchHeight,
    );
 
    // Left notch
    this.graphics.fillRect(
      x - size / 2 - notchHeight / 2,
      y - notchWidth / 2,
      notchHeight,
      notchWidth,
    );
 
    // Right notch
    this.graphics.fillRect(
      x + size / 2 - notchHeight / 2,
      y - notchWidth / 2,
      notchHeight,
      notchWidth,
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
   * Project a 3D position to screen coordinates
   * Returns null if position is off screen or behind camera
   */
  projectToScreen(position: Vector3D): { x: number; y: number } | null {
    const screenWidth = this.scene.scale.width;
    const screenHeight = this.scene.scale.height;
    
    const projected = Math3D.project3DTo2D(
      position,
      this.camera,
      screenWidth,
      screenHeight
    );
    
    if (projected === null) {
      return null;
    }
    
    return { x: projected.x, y: projected.y };
  }

  /**
   * Destroy the renderer
   */
  destroy(): void {
    this.graphics.destroy();
  }
}
