import Phaser from 'phaser';

export class AssetLoader {
  static preloadImages(scene: Phaser.Scene): void {
    // Placeholder - will add actual assets in later phases
    // Example: scene.load.image('player', 'assets/images/player.png');
  }

  static preloadAudio(scene: Phaser.Scene): void {
    // Load all WAV audio files from assets/audio directory
    const audioPath = 'ts_src/assets/audio';
    
    // Combat sounds
    scene.load.audio('torpedo_fire', `${audioPath}/torpedo_fire.wav`);
    scene.load.audio('explosion', `${audioPath}/explosion.wav`);
    scene.load.audio('shield_impact', `${audioPath}/shield_impact.wav`);
    
    // System sounds
    scene.load.audio('shield_activate', `${audioPath}/shield_activate.wav`);
    
    // Navigation sounds
    scene.load.audio('hyperspace_enter', `${audioPath}/hyperspace_enter.wav`);
    scene.load.audio('hyperspace_exit', `${audioPath}/hyperspace_exit.wav`);
    scene.load.audio('docking', `${audioPath}/docking.wav`);
    
    // Alert sounds
    scene.load.audio('low_energy_alert', `${audioPath}/low_energy_alert.wav`);
    scene.load.audio('starbase_attack_alert', `${audioPath}/starbase_attack_alert.wav`);
    
    // Game outcome sounds
    scene.load.audio('victory', `${audioPath}/victory.wav`);
    scene.load.audio('defeat', `${audioPath}/defeat.wav`);
  }

  static preloadData(scene: Phaser.Scene): void {
    // Load JSON configuration files
    // Example: scene.load.json('difficulty', 'assets/data/difficulty.json');
  }
}
