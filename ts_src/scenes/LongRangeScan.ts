import Phaser from 'phaser';
import { GameStateManager, GameStateType } from '@systems/GameStateManager';
import { GalaxyManager } from '@systems/GalaxyManager';
import { InputManager, InputAction } from '@systems/InputManager';
import { Enemy } from '@entities/Enemy';
import { EnemyType, SystemStatus } from '@utils/Constants';
import { Debug } from '@utils/Debug';

/**
 * Long-Range Scan Scene - Tactical top-down radar view
 * Shows player and enemies in current sector
 * Key features:
 * - Concentric range circles (10 metron intervals)
 * - Player always at center
 * - Enemies shown as letters (F, C, B)
 * - False echoes when L system damaged
 */
export class LongRangeScanScene extends Phaser.Scene {
  private gameStateManager!: GameStateManager;
  private galaxyManager!: GalaxyManager;
  private inputManager!: InputManager;

  // Graphics
  private radarGraphics!: Phaser.GameObjects.Graphics;
  private hudText!: Phaser.GameObjects.Text;

  // Radar properties
  private readonly radarCenterX: number = 960; // Screen center
  private readonly radarCenterY: number = 540;
  private readonly radarMaxRadius: number = 400; // Max display radius
  private readonly metronsPerCircle: number = 10; // Range circle interval
  private readonly maxRange: number = 100; // Max scan range in metrons

  // Enemies in current sector
  private enemies: Enemy[] = [];
  private falseEchoes: Array<{ x: number; y: number; type: EnemyType }> = [];

  // Text objects for reuse (to prevent memory leaks)
  private enemyMarkers: Phaser.GameObjects.Text[] = [];
  private falseEchoMarkers: Phaser.GameObjects.Text[] = [];
  private rangeLabels: Phaser.GameObjects.Text[] = [];
  private flickerTimer: number = 0;
  private readonly flickerInterval: number = 0.5; // seconds

  constructor() {
    super({ key: 'LongRangeScan' });
  }

  create(): void {
    this.gameStateManager = GameStateManager.getInstance();
    this.galaxyManager = GalaxyManager.getInstance();
    this.inputManager = InputManager.getInstance();
    this.inputManager.initialize(this);

    // Set state
    this.gameStateManager.setState(GameStateType.PLAYING);

    // Create radar display
    this.radarGraphics = this.add.graphics();

    // Create HUD
    this.createHUD();

    // Get enemies in current sector
    this.loadEnemiesInSector();

    // Generate false echoes if L system damaged
    this.generateFalseEchoes();

    // Setup input
    this.setupInput();

    // Initial draw
    this.drawRadar();
  }

  private createHUD(): void {
    const gameState = this.gameStateManager.getGameState();
    
    // Title
    this.add.text(this.radarCenterX, 50, 'LONG-RANGE SECTOR SCAN', {
      fontSize: '32px',
      color: '#00FF00',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Sector location
    const sectorText = `SECTOR: ${gameState.player.sector.x.toString().padStart(2, '0')},${gameState.player.sector.y.toString().padStart(2, '0')}`;
    this.add.text(1700, 50, sectorText, {
      fontSize: '24px',
      color: '#00FF00',
      fontFamily: 'monospace',
    });

    // Player stats HUD text (will be updated in update loop)
    this.hudText = this.add.text(1500, 900, '', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    });

    // Legend
    const legendX = 200;
    const legendY = 850;
    const legendText = [
      'LEGEND:',
      '▲ = Player (You)',
      'F = Fighter',
      'C = Cruiser',
      'B = Basestar',
      '· = Range Markers (10 metron intervals)',
    ];

    legendText.forEach((line, index) => {
      this.add.text(legendX, legendY + index * 30, line, {
        fontSize: '18px',
        color: '#00FF00',
        fontFamily: 'monospace',
      });
    });

    // Enemy count
    this.add.text(1500, 850, `ENEMIES: ${this.enemies.length}`, {
      fontSize: '20px',
      color: '#FF0000',
      fontFamily: 'monospace',
    });

    // Instructions
    this.add.text(this.radarCenterX, 1000, 'Press L to return to Combat View', {
      fontSize: '18px',
      color: '#FFFF00',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  private loadEnemiesInSector(): void {
    const gameState = this.gameStateManager.getGameState();
    const currentSector = gameState.player.sector;
    const sector = this.galaxyManager.getSector(currentSector);

    if (sector && sector.enemies.length > 0) {
      // Create Enemy instances from sector data
      this.enemies = sector.enemies.map(enemyData => 
        new Enemy(
          enemyData.id,
          enemyData.type,
          { x: Math.random() * 100 - 50, y: Math.random() * 100 - 50, z: Math.random() * 100 - 50 },
          enemyData.health
        )
      );
    }
  }

  private generateFalseEchoes(): void {
    const gameState = this.gameStateManager.getGameState();
    const lSystemStatus = gameState.player.systems.longRange;

    // No false echoes if system is operational
    if (lSystemStatus === SystemStatus.OPERATIONAL) {
      return;
    }

    // Generate false echoes based on damage level
    let falseEchoCount = 0;
    if (lSystemStatus === SystemStatus.DAMAGED) {
      falseEchoCount = Math.floor(Math.random() * 3) + 1; // 1-3 false echoes
    } else if (lSystemStatus === SystemStatus.DESTROYED) {
      falseEchoCount = Math.floor(Math.random() * 5) + 3; // 3-7 false echoes
    }

    for (let i = 0; i < falseEchoCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * this.maxRange;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const types = [EnemyType.FIGHTER, EnemyType.CRUISER, EnemyType.BASESTAR];
      const type = types[Math.floor(Math.random() * types.length)];

      this.falseEchoes.push({ x, y, type });
    }

    Debug.log(`Generated ${falseEchoCount} false echoes due to L system damage`);
  }

  private drawRadar(): void {
    this.radarGraphics.clear();

    // Draw range circles
    this.drawRangeCircles();

    // Draw enemies
    this.drawEnemies();

    // Draw false echoes
    this.drawFalseEchoes();

    // Draw player (always at center)
    this.drawPlayer();
  }

  private drawRangeCircles(): void {
    const numCircles = Math.floor(this.maxRange / this.metronsPerCircle);

    for (let i = 1; i <= numCircles; i++) {
      const metrons = i * this.metronsPerCircle;
      const radius = (metrons / this.maxRange) * this.radarMaxRadius;

      // Draw circle
      this.radarGraphics.lineStyle(1, 0x00FF00, 0.3);
      this.radarGraphics.strokeCircle(this.radarCenterX, this.radarCenterY, radius);

      // Draw dots on circle at cardinal directions
      const dotPositions = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
      dotPositions.forEach(angle => {
        const x = this.radarCenterX + Math.cos(angle) * radius;
        const y = this.radarCenterY + Math.sin(angle) * radius;
        this.radarGraphics.fillStyle(0x00FF00, 0.5);
        this.radarGraphics.fillCircle(x, y, 2);
      });

      // Range label - reuse existing labels or create new ones
      if (i % 2 === 0) { // Label every other circle
        const labelIndex = Math.floor(i / 2) - 1;
        if (labelIndex >= 0) {
          if (labelIndex >= this.rangeLabels.length) {
            const label = this.add.text(this.radarCenterX + radius + 10, this.radarCenterY - 10, `${metrons}m`, {
              fontSize: '14px',
              color: '#00FF00',
              fontFamily: 'monospace',
            });
            this.rangeLabels.push(label);
          } else {
            // Reuse existing label
            this.rangeLabels[labelIndex].setPosition(this.radarCenterX + radius + 10, this.radarCenterY - 10);
            this.rangeLabels[labelIndex].setText(`${metrons}m`);
            this.rangeLabels[labelIndex].setVisible(true);
          }
        }
      }
    }

    // Draw crosshair
    this.radarGraphics.lineStyle(1, 0x00FF00, 0.5);
    this.radarGraphics.lineBetween(
      this.radarCenterX - 20, this.radarCenterY,
      this.radarCenterX + 20, this.radarCenterY
    );
    this.radarGraphics.lineBetween(
      this.radarCenterX, this.radarCenterY - 20,
      this.radarCenterX, this.radarCenterY + 20
    );
  }

  private drawPlayer(): void {
    // Draw player as triangle at center
    const size = 15;
    this.radarGraphics.lineStyle(2, 0xFFFFFF, 1);
    this.radarGraphics.fillStyle(0xFFFFFF, 0.5);
    
    // Triangle pointing up
    const triangle = new Phaser.Geom.Triangle(
      this.radarCenterX, this.radarCenterY - size,
      this.radarCenterX - size / 2, this.radarCenterY + size / 2,
      this.radarCenterX + size / 2, this.radarCenterY + size / 2
    );
    
    this.radarGraphics.fillTriangleShape(triangle);
    this.radarGraphics.strokeTriangleShape(triangle);
  }

  private drawEnemies(): void {
    let markerIndex = 0;
    this.enemies.forEach(enemy => {
      // Calculate position on radar
      const distance = Math.sqrt(enemy.position.x * enemy.position.x + 
                                 enemy.position.y * enemy.position.y);
      
      // Only draw if within range
      if (distance <= this.maxRange) {
        const scale = this.radarMaxRadius / this.maxRange;
        const screenX = this.radarCenterX + enemy.position.x * scale;
        const screenY = this.radarCenterY + enemy.position.y * scale;

        // Get letter for enemy type
        const letter = this.getEnemyLetter(enemy.type);
        const color = this.getEnemyColor(enemy.type);

        // Reuse existing marker or create new one
        if (markerIndex >= this.enemyMarkers.length) {
          const marker = this.add.text(screenX, screenY, letter, {
            fontSize: '20px',
            color: color,
            fontFamily: 'monospace',
            fontStyle: 'bold',
          }).setOrigin(0.5);
          this.enemyMarkers.push(marker);
        } else {
          // Reuse existing marker
          const marker = this.enemyMarkers[markerIndex];
          marker.setPosition(screenX, screenY);
          marker.setText(letter);
          marker.setColor(color);
          marker.setVisible(true);
        }
        markerIndex++;
      }
    });

    // Hide unused markers
    for (let i = markerIndex; i < this.enemyMarkers.length; i++) {
      this.enemyMarkers[i].setVisible(false);
    }
  }

  private drawFalseEchoes(): void {
    this.falseEchoes.forEach((echo, index) => {
      const scale = this.radarMaxRadius / this.maxRange;
      const screenX = this.radarCenterX + echo.x * scale;
      const screenY = this.radarCenterY + echo.y * scale;

      const letter = this.getEnemyLetter(echo.type);

      // Draw with flickering effect
      const alpha = Math.random() > 0.5 ? 0.5 : 0.8;
      
      // Reuse existing marker or create new one
      if (index >= this.falseEchoMarkers.length) {
        const marker = this.add.text(screenX, screenY, letter, {
          fontSize: '20px',
          color: '#FFFF00', // Yellow for false echoes
          fontFamily: 'monospace',
          fontStyle: 'bold',
        }).setOrigin(0.5).setAlpha(alpha);
        this.falseEchoMarkers.push(marker);
      } else {
        // Reuse existing marker
        const marker = this.falseEchoMarkers[index];
        marker.setPosition(screenX, screenY);
        marker.setText(letter);
        marker.setAlpha(alpha);
        marker.setVisible(true);
      }
    });

    // Hide unused markers
    for (let i = this.falseEchoes.length; i < this.falseEchoMarkers.length; i++) {
      this.falseEchoMarkers[i].setVisible(false);
    }
  }

  private getEnemyLetter(type: EnemyType): string {
    switch (type) {
      case EnemyType.FIGHTER:
        return 'F';
      case EnemyType.CRUISER:
        return 'C';
      case EnemyType.BASESTAR:
        return 'B';
      default:
        return '?';
    }
  }

  private getEnemyColor(type: EnemyType): string {
    switch (type) {
      case EnemyType.FIGHTER:
        return '#FF0000'; // Red
      case EnemyType.CRUISER:
        return '#FF8800'; // Orange
      case EnemyType.BASESTAR:
        return '#FF00FF'; // Magenta
      default:
        return '#FFFFFF';
    }
  }

  private setupInput(): void {
    // Return to combat view
    this.inputManager.on(InputAction.LONG_RANGE_SCAN, () => {
      this.returnToCombatView();
    });

    // Also allow other view switches
    this.inputManager.on(InputAction.VIEW_FORE, () => {
      this.scene.start('CombatView', { direction: 'FORE' });
    });

    this.inputManager.on(InputAction.VIEW_AFT, () => {
      this.scene.start('CombatView', { direction: 'AFT' });
    });

    this.inputManager.on(InputAction.GALACTIC_CHART, () => {
      this.scene.start('GalacticChart');
    });

    this.inputManager.on(InputAction.HYPERSPACE, () => {
      this.scene.start('Hyperspace');
    });
  }

  private returnToCombatView(): void {
    Debug.log('Returning to Combat View');
    this.scene.start('CombatView', { direction: 'FORE' });
  }

  update(time: number, delta: number): void {
    // Update input manager
    this.inputManager.update();

    // Update HUD
    const gameState = this.gameStateManager.getGameState();
    const velocity = gameState.player.velocity;
    const energy = gameState.player.energy;
    const kills = gameState.player.kills;

    this.hudText.setText(
      `V: ${velocity.toString().padStart(2, '0')}  E: ${energy}  K: ${kills.toString().padStart(2, '0')}  T: L`
    );

    // Flicker false echoes using timer-based approach instead of random
    if (this.falseEchoes.length > 0) {
      this.flickerTimer += delta / 1000; // Convert to seconds
      if (this.flickerTimer >= this.flickerInterval) {
        this.flickerTimer = 0;
        this.drawRadar(); // Redraw at consistent intervals to create flicker effect
      }
    }
  }
  
  shutdown(): void {
    // Clean up all text objects to prevent memory leaks and WebGL errors
    for (const marker of this.enemyMarkers) {
      marker.destroy();
    }
    this.enemyMarkers = [];
    
    for (const marker of this.falseEchoMarkers) {
      marker.destroy();
    }
    this.falseEchoMarkers = [];
    
    for (const label of this.rangeLabels) {
      label.destroy();
    }
    this.rangeLabels = [];
    
    // Remove input listeners
    this.inputManager.off(InputAction.LONG_RANGE_SCAN);
    this.inputManager.off(InputAction.VIEW_FORE);
    this.inputManager.off(InputAction.VIEW_AFT);
    this.inputManager.off(InputAction.GALACTIC_CHART);
    this.inputManager.off(InputAction.HYPERSPACE);
  }
}
