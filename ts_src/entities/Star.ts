import Phaser from 'phaser';

export class Star extends Phaser.GameObjects.Graphics {
  public vx: number = 0;
  public vy: number = 0;
  public layer: number = 1;
  public brightness: number = 1.0;
  private size: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, size: number, brightness: number, layer: number) {
    super(scene);
    this.setPosition(x, y);
    this.size = size;
    this.brightness = brightness;
    this.layer = layer;
    this.draw();
  }

  private draw(): void {
    this.clear();
    const color = Math.floor(255 * this.brightness);
    const hexColor = (color << 16) | (color << 8) | color; // RGB same value = grayscale
    this.fillStyle(hexColor, 1.0);
    this.fillCircle(0, 0, this.size);
  }

  update(deltaTime: number, velocityX: number, velocityY: number, speedMultiplier: number): void {
    // Move based on velocity and layer speed multiplier
    const layerSpeed = this.getLayerSpeedMultiplier();
    this.x -= velocityX * layerSpeed * speedMultiplier * deltaTime;
    this.y -= velocityY * layerSpeed * speedMultiplier * deltaTime;
  }

  private getLayerSpeedMultiplier(): number {
    switch (this.layer) {
      case 1:
        return 1.0; // 100%
      case 2:
        return 0.5; // 50%
      case 3:
        return 0.25; // 25%
      case 4:
        return 0.1; // 10%
      default:
        return 1.0;
    }
  }

  reset(x: number, y: number): void {
    this.setPosition(x, y);
  }
}
