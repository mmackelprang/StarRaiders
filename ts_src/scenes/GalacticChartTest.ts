import Phaser from 'phaser';
import { GalaxyManager } from '@systems/GalaxyManager';
import { GameStateManager } from '@systems/GameStateManager';
import { DifficultyLevel } from '@utils/Constants';

export class GalacticChartTestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GalacticChartTest' });
  }

  create(): void {
    // Initialize galaxy with a test seed for consistent results
    const galaxyManager = GalaxyManager.getInstance();
    galaxyManager.initializeGalaxy(DifficultyLevel.NOVICE, 12345);

    // Initialize game state
    const gameStateManager = GameStateManager.getInstance();
    gameStateManager.startNewGame(DifficultyLevel.NOVICE);

    // Show instructions
    const instructionsText = this.add.text(960, 540, 
      'Press G to open Galactic Chart\nPress ESC to return to this screen', 
      { 
        fontSize: '32px', 
        color: '#ffffff',
        align: 'center',
        backgroundColor: '#000000',
        padding: { x: 20, y: 20 }
      }
    );
    instructionsText.setOrigin(0.5);

    // Listen for G key to open chart
    this.input.keyboard?.on('keydown-G', () => {
      this.scene.launch('GalacticChart');
    });

    // Listen for ESC to return to this screen
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.scene.isActive('GalacticChart')) {
        this.scene.stop('GalacticChart');
      }
    });
  }
}
