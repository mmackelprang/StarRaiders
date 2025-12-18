import Phaser from 'phaser';
import { GameStateManager } from '@systems/GameStateManager';
import { GalaxyManager } from '@systems/GalaxyManager';
import { RankingSystem } from '@utils/RankingSystem';
import { Debug } from '@utils/Debug';

export class RankingScene extends Phaser.Scene {
  private promptText!: Phaser.GameObjects.Text;
  private promptBlinkTimer: number = 0;

  constructor() {
    super({ key: 'Ranking' });
  }

  create(): void {
    Debug.log('RankingScene: Calculating player rank');

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const gameState = GameStateManager.getInstance().getGameState();
    const galaxyManager = GalaxyManager.getInstance();
    const galaxyData = galaxyManager.getGalaxyData();

    // Calculate score
    const score = RankingSystem.calculateScore(
      galaxyData.enemiesDestroyed,
      galaxyData.totalEnemies,
      galaxyData.totalStarbases - galaxyData.starbasesDestroyed,
      galaxyData.totalStarbases,
      gameState.missionTime,
      gameState.player.energy,
      gameState.difficulty
    );

    // Get rank
    const rank = RankingSystem.getRankForScore(score);
    const rankTitle = RankingSystem.formatRankTitle(rank);

    // Header
    this.add
      .text(centerX, 80, 'MISSION PERFORMANCE EVALUATION', {
        fontSize: '32px',
        color: '#00FFFF',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Statistics box
    this.createStatisticsBox(centerX, 160, gameState, galaxyData, score);

    // Stars
    this.add
      .text(centerX, centerY + 120, '★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★', {
        fontSize: '24px',
        color: '#FFD700',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Rank label
    this.add
      .text(centerX, centerY + 170, 'YOUR RANK:', {
        fontSize: '28px',
        color: '#00FF00',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Rank box
    const rankBoxY = centerY + 230;
    const graphics = this.add.graphics();
    
    // Determine rank color
    const rankColor = score >= 336 ? 0x00ffff : score >= 144 ? 0x00ff00 : score >= 48 ? 0xffff00 : 0xff0000;
    graphics.lineStyle(4, rankColor, 1);
    graphics.strokeRect(centerX - 280, rankBoxY - 40, 560, 80);

    this.add
      .text(centerX, rankBoxY, rankTitle, {
        fontSize: '36px',
        color: `#${rankColor.toString(16).padStart(6, '0')}`,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Stars
    this.add
      .text(centerX, rankBoxY + 80, '★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★', {
        fontSize: '24px',
        color: '#FFD700',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Encouragement for low ranks
    if (score < 48) {
      this.add
        .text(centerX, rankBoxY + 130, 'TIP: Try a lower difficulty or focus on defending starbases!', {
          fontSize: '16px',
          color: '#FFFF00',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);
    }

    // Prompt text
    this.promptText = this.add
      .text(centerX, this.scale.height - 80, '[PRESS SPACE TO RETURN TO TITLE SCREEN]', {
        fontSize: '20px',
        color: '#00FFFF',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Set up input
    this.setupInput();
  }

  private createStatisticsBox(
    centerX: number,
    startY: number,
    gameState: any,
    galaxyData: any,
    score: number
  ): void {
    const boxWidth = 800;
    const boxHeight = 380;
    const boxX = centerX - boxWidth / 2;
    const boxY = startY;

    // Draw box
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ffff, 1);
    graphics.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Content
    const textX = boxX + 40;
    let currentY = boxY + 30;
    const lineHeight = 25;

    // Mission Parameters
    this.add.text(textX, currentY, 'MISSION PARAMETERS:', {
      fontSize: '18px',
      color: '#00FFFF',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    currentY += lineHeight + 5;

    this.add.text(textX, currentY, `Difficulty Level:       ${gameState.difficulty}`, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    });
    currentY += lineHeight;

    this.add.text(textX, currentY, `Starting Enemy Forces:  ${galaxyData.totalEnemies} Ships`, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    });
    currentY += lineHeight;

    this.add.text(textX, currentY, `Starting Starbases:     ${galaxyData.totalStarbases}`, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    });
    currentY += lineHeight + 10;

    // Performance Metrics
    this.add.text(textX, currentY, 'PERFORMANCE METRICS:', {
      fontSize: '18px',
      color: '#00FFFF',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    currentY += lineHeight + 5;

    const enemyPercent = galaxyData.totalEnemies > 0 
      ? Math.floor((galaxyData.enemiesDestroyed / galaxyData.totalEnemies) * 100)
      : 0;
    this.add.text(textX, currentY, `Enemies Destroyed:      ${galaxyData.enemiesDestroyed} / ${galaxyData.totalEnemies}        ${enemyPercent}%`, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    });
    currentY += lineHeight;

    const starbasesRemaining = galaxyData.totalStarbases - galaxyData.starbasesDestroyed;
    const starbasePercent = galaxyData.totalStarbases > 0
      ? Math.floor((starbasesRemaining / galaxyData.totalStarbases) * 100)
      : 0;
    this.add.text(textX, currentY, `Starbases Remaining:    ${starbasesRemaining} / ${galaxyData.totalStarbases}        ${starbasePercent}%`, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    });
    currentY += lineHeight;

    const energyEfficiency = gameState.player.energy > 4000 ? 'EXCELLENT' 
      : gameState.player.energy > 2000 ? 'GOOD'
      : gameState.player.energy > 1000 ? 'FAIR'
      : 'POOR';
    this.add.text(textX, currentY, `Energy Efficiency:      ${energyEfficiency}`, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    });
    currentY += lineHeight;

    this.add.text(textX, currentY, `Time Taken:             ${String(gameState.missionTime).padStart(4, '0')} Centons`, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    });
    currentY += lineHeight + 10;

    // Score Calculation
    this.add.text(textX, currentY, 'SCORE CALCULATION:', {
      fontSize: '18px',
      color: '#00FFFF',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    currentY += lineHeight + 5;

    const baseScore = galaxyData.enemiesDestroyed * 10 + starbasesRemaining * 20;
    const multiplier = RankingSystem.getDifficultyMultiplier(gameState.difficulty);
    
    this.add.text(textX, currentY, `Base Score:             +${baseScore} pts`, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    });
    currentY += lineHeight;

    this.add.text(textX, currentY, `Difficulty Bonus:       ×${multiplier.toFixed(1)}`, {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    });
    currentY += lineHeight;

    graphics.lineStyle(1, 0xffffff, 1);
    graphics.lineBetween(textX, currentY + 5, textX + 500, currentY + 5);
    currentY += lineHeight;

    this.add.text(textX, currentY, `TOTAL SCORE:            ${score} pts`, {
      fontSize: '18px',
      color: '#FFFF00',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;

    this.input.keyboard.on('keydown-SPACE', () => {
      this.returnToTitle();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.returnToTitle();
    });
  }

  private returnToTitle(): void {
    Debug.log('Returning to title screen');
    this.scene.start('Title');
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
