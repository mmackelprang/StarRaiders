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
    
    // Transition to title screen
    this.scene.start('Title');
  }
}
