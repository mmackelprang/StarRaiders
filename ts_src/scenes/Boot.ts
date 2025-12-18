import Phaser from 'phaser';
import { GameStateManager } from '@systems/GameStateManager';
import { AssetLoader } from '@utils/AssetLoader';
import { Debug } from '@utils/Debug';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    Debug.log('BootScene: Preloading assets...');
    
    // Load essential assets
    AssetLoader.preloadImages(this);
    AssetLoader.preloadAudio(this);
    AssetLoader.preloadData(this);
  }

  create(): void {
    Debug.log('BootScene: Initializing game...');
    
    // Initialize game state manager
    const gameStateManager = GameStateManager.getInstance();
    
    Debug.log('BootScene: Game initialized, transitioning to title screen');
    
    // For now, just show a placeholder text since we don't have Title scene yet
    this.add.text(960, 540, 'Star Raiders\n\nPress any key to continue', {
      fontSize: '48px',
      color: '#00ffff',
      align: 'center'
    }).setOrigin(0.5);

    this.input.keyboard?.once('keydown', () => {
      Debug.log('Key pressed, starting galactic chart test...');
      // Transition to GalacticChartTest for Phase 6 testing
      this.scene.start('GalacticChartTest');
    });
  }
}
