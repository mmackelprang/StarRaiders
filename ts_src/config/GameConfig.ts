import Phaser from 'phaser';
import { BootScene } from '@scenes/Boot';
import { StarfieldTestScene } from '@scenes/StarfieldTest';
import { GalacticChartTestScene } from '@scenes/GalacticChartTest';
import { GalacticChartScene } from '@scenes/GalacticChart';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false
    }
  },
  fps: {
    target: 60,
    forceSetTimeOut: true
  },
  scene: [BootScene, StarfieldTestScene, GalacticChartTestScene, GalacticChartScene]  // Will add more scenes in later phases
};
