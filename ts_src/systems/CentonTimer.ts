import Phaser from 'phaser';
import { CENTONS_PER_MINUTE } from '@utils/Constants';

export class CentonTimer {
  private centons: number = 0;
  private lastUpdateTime: number = 0;
  private running: boolean = false;
  private eventEmitter: Phaser.Events.EventEmitter;

  constructor() {
    this.eventEmitter = new Phaser.Events.EventEmitter();
  }

  start(): void {
    this.running = true;
    this.lastUpdateTime = Date.now();
  }

  stop(): void {
    this.running = false;
  }

  reset(): void {
    this.centons = 0;
    this.lastUpdateTime = Date.now();
  }

  update(): void {
    if (!this.running) return;

    const now = Date.now();
    const deltaSeconds = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // 100 centons per minute = 100 centons per 60 seconds
    const deltaCentons = deltaSeconds * (CENTONS_PER_MINUTE / 60);
    this.centons += deltaCentons;

    this.eventEmitter.emit('centonUpdate', this.centons);
  }

  getCentons(): number {
    return Math.floor(this.centons);
  }

  on(event: string, callback: Function, context?: any): void {
    this.eventEmitter.on(event, callback, context);
  }
}
