export class Debug {
  private static enabled = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

  static log(...args: any[]): void {
    if (this.enabled) {
      console.log('[StarRaiders]', ...args);
    }
  }

  static warn(...args: any[]): void {
    if (this.enabled) {
      console.warn('[StarRaiders]', ...args);
    }
  }

  static error(...args: any[]): void {
    console.error('[StarRaiders]', ...args);
  }

  static drawBounds(graphics: Phaser.GameObjects.Graphics, bounds: Phaser.Geom.Rectangle): void {
    if (this.enabled) {
      graphics.lineStyle(2, 0xff0000, 1);
      graphics.strokeRectShape(bounds);
    }
  }
}
