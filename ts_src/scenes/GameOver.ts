import Phaser from 'phaser';
import { GameStateManager } from '@systems/GameStateManager';
import { Debug } from '@utils/Debug';

export enum GameOverReason {
  VICTORY = 'VICTORY',
  STARBASES_DESTROYED = 'STARBASES_DESTROYED',
  SHIP_DESTROYED = 'SHIP_DESTROYED',
  ENERGY_DEPLETED = 'ENERGY_DEPLETED',
}

export class GameOverScene extends Phaser.Scene {
  private reason: GameOverReason = GameOverReason.VICTORY;
  private promptText!: Phaser.GameObjects.Text;
  private promptBlinkTimer: number = 0;

  constructor() {
    super({ key: 'GameOver' });
  }

  init(data: { reason: GameOverReason }): void {
    this.reason = data.reason || GameOverReason.VICTORY;
    Debug.log(`GameOverScene: Reason = ${this.reason}`);
  }

  create(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    if (this.reason === GameOverReason.VICTORY) {
      this.createVictoryScreen(centerX, centerY);
    } else {
      this.createDefeatScreen(centerX, centerY);
    }

    // Prompt text
    this.promptText = this.add
      .text(centerX, centerY + 250, '[PRESS SPACE FOR MISSION RATING]', {
        fontSize: '20px',
        color: '#00FFFF',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Set up input
    this.setupInput();
  }

  private createVictoryScreen(centerX: number, centerY: number): void {
    // Stars
    this.add
      .text(centerX, centerY - 200, '★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★', {
        fontSize: '32px',
        color: '#FFD700',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Main title
    this.add
      .text(centerX, centerY - 100, 'MISSION', {
        fontSize: '64px',
        color: '#00FF00',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY - 20, 'COMPLETE', {
        fontSize: '64px',
        color: '#00FF00',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Stars
    this.add
      .text(centerX, centerY + 80, '★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★', {
        fontSize: '32px',
        color: '#FFD700',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Message
    this.add
      .text(centerX, centerY + 160, 'ALL ZYLON FORCES DESTROYED!', {
        fontSize: '24px',
        color: '#00FF00',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);
  }

  private createDefeatScreen(centerX: number, centerY: number): void {
    const gameState = GameStateManager.getInstance().getGameState();

    // Border
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0xff0000, 1);
    graphics.strokeRect(centerX - 300, centerY - 150, 600, 250);

    // Main title
    this.add
      .text(centerX, centerY - 100, 'MISSION FAILED', {
        fontSize: '48px',
        color: '#FF0000',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Reason-specific message
    let message1 = '';
    let message2 = '';

    switch (this.reason) {
      case GameOverReason.STARBASES_DESTROYED:
        message1 = 'ALL STARBASES DESTROYED';
        message2 = 'THE GALAXY HAS FALLEN TO THE ZYLON EMPIRE';
        break;
      case GameOverReason.SHIP_DESTROYED:
        message1 = 'STARSHIP DESTROYED';
        message2 = 'CRITICAL SYSTEMS FAILURE';
        break;
      case GameOverReason.ENERGY_DEPLETED:
        message1 = 'ENERGY DEPLETED';
        message2 = 'UNABLE TO MAINTAIN LIFE SUPPORT';
        break;
    }

    this.add
      .text(centerX, centerY - 20, message1, {
        fontSize: '24px',
        color: '#FF0000',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 20, message2, {
        fontSize: '20px',
        color: '#FF0000',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Statistics
    const statsY = centerY + 140;
    this.add
      .text(centerX, statsY, `ENEMIES DESTROYED: ${gameState.player.kills}`, {
        fontSize: '18px',
        color: '#FFFFFF',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, statsY + 30, `TIME SURVIVED: ${String(gameState.missionTime).padStart(4, '0')} CENTONS`, {
        fontSize: '18px',
        color: '#FFFFFF',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;

    this.input.keyboard.on('keydown-SPACE', () => {
      this.goToRanking();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.goToRanking();
    });
  }

  private goToRanking(): void {
    Debug.log('Transitioning to Ranking screen');
    this.scene.start('Ranking');
  }

  update(time: number, delta: number): void {
    // Blink prompt text
    this.promptBlinkTimer += delta;
    if (this.promptBlinkTimer >= 500) {
      this.promptText.setVisible(!this.promptText.visible);
      this.promptBlinkTimer = 0;
    }
  }
}
