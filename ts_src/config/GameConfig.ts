import Phaser from 'phaser';
import { BootScene } from '@scenes/Boot';
import { TitleScene } from '@scenes/Title';
import { GameOverScene } from '@scenes/GameOver';
import { RankingScene } from '@scenes/Ranking';
import { StarfieldTestScene } from '@scenes/StarfieldTest';
import { GalacticChartTestScene } from '@scenes/GalacticChartTest';
import { GalacticChartScene } from '@scenes/GalacticChart';
import { VectorRenderTestScene } from '@scenes/VectorRenderTest';
import { CombatViewScene } from '@scenes/CombatView';

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
  scene: [
    BootScene,
    TitleScene,
    GameOverScene,
    RankingScene,
    GalacticChartScene,
    CombatViewScene,
    StarfieldTestScene,
    GalacticChartTestScene,
    VectorRenderTestScene
  ]
};
