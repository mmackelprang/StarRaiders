import Phaser from 'phaser';
import { GameStateManager, GameStateType } from '@systems/GameStateManager';
import { DifficultyLevel } from '@utils/Constants';
import { Debug } from '@utils/Debug';

export class TitleScene extends Phaser.Scene {
  private selectedDifficulty: number = 0;
  private difficulties: DifficultyLevel[] = [
    DifficultyLevel.NOVICE,
    DifficultyLevel.PILOT,
    DifficultyLevel.WARRIOR,
    DifficultyLevel.COMMANDER,
  ];
  private menuItems: Phaser.GameObjects.Text[] = [];
  private cursor!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private promptBlinkTimer: number = 0;

  constructor() {
    super({ key: 'Title' });
  }

  create(): void {
    Debug.log('TitleScene: Creating title screen');

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Title
    this.add
      .text(centerX, centerY - 250, 'STAR RAIDERS', {
        fontSize: '72px',
        color: '#FFFFFF',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle with stars
    this.add
      .text(centerX, centerY - 180, '★  ★  ★  ★  ★  ★  ★', {
        fontSize: '32px',
        color: '#00FFFF',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Difficulty selection label
    this.add
      .text(centerX, centerY - 80, 'SELECT DIFFICULTY LEVEL:', {
        fontSize: '24px',
        color: '#00FF00',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Create difficulty menu items
    const menuStartY = centerY - 20;
    const menuSpacing = 50;

    this.difficulties.forEach((difficulty, index) => {
      const text = this.add
        .text(centerX, menuStartY + index * menuSpacing, difficulty, {
          fontSize: '32px',
          color: '#00FF00',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5);
      this.menuItems.push(text);
    });

    // Cursor
    this.cursor = this.add
      .text(centerX - 200, menuStartY, '▶', {
        fontSize: '32px',
        color: '#FFFF00',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Prompt text
    this.promptText = this.add
      .text(centerX, centerY + 200, '[PRESS SPACE TO BEGIN MISSION]', {
        fontSize: '20px',
        color: '#00FFFF',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Stars at bottom
    this.add
      .text(centerX, centerY + 270, '* * * * * * * * * * * * * * * *', {
        fontSize: '20px',
        color: '#FFFFFF',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5);

    // Set up input
    this.setupInput();

    // Update menu selection
    this.updateSelection();
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;

    // Arrow keys for navigation
    this.input.keyboard.on('keydown-UP', () => {
      this.selectedDifficulty = Math.max(0, this.selectedDifficulty - 1);
      this.updateSelection();
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.selectedDifficulty = Math.min(
        this.difficulties.length - 1,
        this.selectedDifficulty + 1
      );
      this.updateSelection();
    });

    // Space or Enter to start game
    this.input.keyboard.on('keydown-SPACE', () => {
      this.startGame();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.startGame();
    });
  }

  private updateSelection(): void {
    // Update menu item colors
    this.menuItems.forEach((item, index) => {
      if (index === this.selectedDifficulty) {
        item.setColor('#FFFF00');
        item.setFontStyle('bold');
      } else {
        item.setColor('#00FF00');
        item.setFontStyle('normal');
      }
    });

    // Update cursor position
    const selectedItem = this.menuItems[this.selectedDifficulty];
    if (selectedItem) {
      this.cursor.setY(selectedItem.y);
    }
  }

  private startGame(): void {
    const difficulty = this.difficulties[this.selectedDifficulty];
    Debug.log(`Starting game with difficulty: ${difficulty}`);

    // Initialize game state
    const gameStateManager = GameStateManager.getInstance();
    gameStateManager.startNewGame(difficulty);

    // Transition to galactic chart (or later to gameplay scene)
    this.scene.start('GalacticChart');
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
