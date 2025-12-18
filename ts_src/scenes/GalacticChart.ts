import Phaser from 'phaser';
import { GalaxyManager } from '@systems/GalaxyManager';
import { GameStateManager, GameStateType } from '@systems/GameStateManager';
import { InputManager, InputAction } from '@systems/InputManager';
import { GALAXY_SIZE } from '@utils/Constants';
import { SectorCoordinate } from '@/types/GalaxyTypes';

export class GalacticChartScene extends Phaser.Scene {
  private galaxyManager!: GalaxyManager;
  private gameStateManager!: GameStateManager;
  private inputManager!: InputManager;
  
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private cursorGraphics!: Phaser.GameObjects.Graphics;
  private iconContainer!: Phaser.GameObjects.Container;
  private hudText!: Phaser.GameObjects.Text;
  
  private cellSize: number = 40; // pixels per cell
  private gridOffsetX: number = 100;
  private gridOffsetY: number = 100;
  
  private cursorPosition: SectorCoordinate = { 
    x: Math.floor(GALAXY_SIZE / 2), 
    y: Math.floor(GALAXY_SIZE / 2) 
  };
  private cursorPulse: number = 0;
  private lastMoveTime: number = 0;
  private readonly moveDelay: number = 150; // milliseconds between moves

  constructor() {
    super({ key: 'GalacticChart' });
  }

  create(): void {
    this.galaxyManager = GalaxyManager.getInstance();
    this.gameStateManager = GameStateManager.getInstance();
    this.inputManager = InputManager.getInstance();
    this.inputManager.initialize(this);

    // Set state
    this.gameStateManager.setState(GameStateType.GALACTIC_CHART);

    // Create UI elements
    this.createGrid();
    this.createCursor();
    this.createIcons();
    this.createHUD();

    // Set up input handlers
    this.setupInput();
  }

  private createGrid(): void {
    this.gridGraphics = this.add.graphics();
    this.drawGrid();
  }

  private drawGrid(): void {
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, 0x333333, 1);

    // Draw vertical lines
    for (let x = 0; x <= GALAXY_SIZE; x++) {
      const screenX = this.gridOffsetX + x * this.cellSize;
      this.gridGraphics.lineBetween(
        screenX,
        this.gridOffsetY,
        screenX,
        this.gridOffsetY + GALAXY_SIZE * this.cellSize
      );
    }

    // Draw horizontal lines
    for (let y = 0; y <= GALAXY_SIZE; y++) {
      const screenY = this.gridOffsetY + y * this.cellSize;
      this.gridGraphics.lineBetween(
        this.gridOffsetX,
        screenY,
        this.gridOffsetX + GALAXY_SIZE * this.cellSize,
        screenY
      );
    }
  }

  private createCursor(): void {
    this.cursorGraphics = this.add.graphics();
    this.updateCursor();
  }

  private updateCursor(): void {
    this.cursorGraphics.clear();
    
    // Pulsing effect (0.5 to 1.0)
    const alpha = 0.5 + Math.sin(this.cursorPulse) * 0.5;
    
    this.cursorGraphics.lineStyle(3, 0xffffff, alpha);
    const screenX = this.gridOffsetX + this.cursorPosition.x * this.cellSize;
    const screenY = this.gridOffsetY + this.cursorPosition.y * this.cellSize;
    
    this.cursorGraphics.strokeRect(screenX, screenY, this.cellSize, this.cellSize);
  }

  private createIcons(): void {
    this.iconContainer = this.add.container(0, 0);
    this.updateIcons();
  }

  private updateIcons(): void {
    this.iconContainer.removeAll(true);
    const galaxy = this.galaxyManager.getGalaxyData();

    for (let x = 0; x < GALAXY_SIZE; x++) {
      for (let y = 0; y < GALAXY_SIZE; y++) {
        const sector = galaxy.sectors[x][y];
        const screenX = this.gridOffsetX + x * this.cellSize + this.cellSize / 2;
        const screenY = this.gridOffsetY + y * this.cellSize + this.cellSize / 2;

        // Player
        if (sector.hasPlayer) {
          const playerText = this.add.text(screenX, screenY, '>>', {
            fontSize: '16px',
            color: '#ffffff',
          });
          playerText.setOrigin(0.5);
          this.iconContainer.add(playerText);
        }

        // Starbase
        if (sector.starbase) {
          const color = sector.starbase.underAttack ? '#ff0000' : '#0000ff';
          const starbaseText = this.add.text(screenX, screenY, 'BB', {
            fontSize: '14px',
            color: color,
          });
          starbaseText.setOrigin(0.5);
          this.iconContainer.add(starbaseText);
        }

        // Enemies
        if (sector.enemies.length > 0) {
          const enemyCount = sector.enemies.length;
          const enemySymbol = enemyCount > 1 ? 'RR' : 'R';
          const enemyText = this.add.text(screenX, screenY, enemySymbol, {
            fontSize: '14px',
            color: '#ff0000',
          });
          enemyText.setOrigin(0.5);
          this.iconContainer.add(enemyText);
        }
      }
    }
  }

  private createHUD(): void {
    const hudX = this.gridOffsetX + GALAXY_SIZE * this.cellSize + 50;
    const hudY = 100;

    const galaxy = this.galaxyManager.getGalaxyData();
    const gameState = this.gameStateManager.getGameState();

    // Create comprehensive HUD
    const hudContent = [
      'GALACTIC CHART',
      '',
      `Difficulty: ${gameState.difficulty}`,
      `Enemies: ${galaxy.totalEnemies - galaxy.enemiesDestroyed}/${galaxy.totalEnemies}`,
      `Starbases: ${galaxy.totalStarbases - galaxy.starbasesDestroyed}/${galaxy.totalStarbases}`,
      `Kills: ${gameState.player.kills}`,
      '',
      'Controls:',
      'Arrow Keys: Move cursor',
      'H: Hyperspace',
      'G/F: Close chart',
      '',
      'Selected Sector:',
      '', // Will be updated in update()
    ].join('\n');

    this.hudText = this.add.text(hudX, hudY, hudContent, {
      fontSize: '16px',
      color: '#00ff00',
      lineSpacing: 4,
    });
  }

  private setupInput(): void {
    this.inputManager.on(InputAction.NAV_UP, () => {
      this.moveCursor(0, -1);
    });
    this.inputManager.on(InputAction.NAV_DOWN, () => {
      this.moveCursor(0, 1);
    });
    this.inputManager.on(InputAction.NAV_LEFT, () => {
      this.moveCursor(-1, 0);
    });
    this.inputManager.on(InputAction.NAV_RIGHT, () => {
      this.moveCursor(1, 0);
    });

    // Close chart
    this.inputManager.on(InputAction.GALACTIC_CHART, () => {
      this.closeChart();
    });
    this.inputManager.on(InputAction.VIEW_FORE, () => {
      this.closeChart();
    });
    
    // Switch to Long Range Scan
    this.inputManager.on(InputAction.LONG_RANGE_SCAN, () => {
      this.scene.start('LongRangeScan');
    });

    // Hyperspace to selected sector
    this.inputManager.on(InputAction.HYPERSPACE, () => {
      this.initiateHyperspace();
    });

    // DEBUG: Test GameOver screens with V key (Victory) and D key (Defeat)
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-V', () => {
        console.log('DEBUG: Testing Victory screen');
        this.scene.start('GameOver', { reason: 'VICTORY' });
      });
      this.input.keyboard.on('keydown-D', () => {
        console.log('DEBUG: Testing Defeat screen');
        this.scene.start('GameOver', { reason: 'STARBASES_DESTROYED' });
      });
    }
  }

  private moveCursor(dx: number, dy: number): void {
    const now = Date.now();
    if (now - this.lastMoveTime < this.moveDelay) {
      return; // Debounce rapid moves
    }
    this.lastMoveTime = now;
    
    this.cursorPosition.x = Phaser.Math.Clamp(this.cursorPosition.x + dx, 0, GALAXY_SIZE - 1);
    this.cursorPosition.y = Phaser.Math.Clamp(this.cursorPosition.y + dy, 0, GALAXY_SIZE - 1);
    this.updateCursor();
  }

  private closeChart(): void {
    this.gameStateManager.setState(GameStateType.PLAYING);
    // Return to combat view
    this.scene.start('CombatView', { direction: 'FORE' });
  }

  private initiateHyperspace(): void {
    // Will be implemented in Phase 15
    console.log('Hyperspace to:', this.cursorPosition);
  }

  update(time: number, delta: number): void {
    this.inputManager.update();
    this.cursorPulse += delta / 1000; // Update pulse animation
    this.updateCursor();
    this.updateSectorInfo();
  }
  
  private updateSectorInfo(): void {
    const galaxy = this.galaxyManager.getGalaxyData();
    const gameState = this.gameStateManager.getGameState();
    const sector = galaxy.sectors[this.cursorPosition.x][this.cursorPosition.y];
    
    // Build sector info
    const sectorInfo = [];
    
    if (sector.enemies.length === 0 && !sector.starbase) {
      sectorInfo.push('Empty');
    } else {
      if (sector.enemies.length > 0) {
        sectorInfo.push(`Enemies: ${sector.enemies.length}`);
      }
      if (sector.starbase) {
        const status = sector.starbase.underAttack ? ' (UNDER ATTACK)' : '';
        sectorInfo.push(`Starbase${status}`);
      }
    }
    
    if (sector.hasPlayer) {
      sectorInfo.push('Current Location');
    }
    
    // Update HUD text
    const hudContent = [
      'GALACTIC CHART',
      '',
      `Difficulty: ${gameState.difficulty}`,
      `Enemies: ${galaxy.totalEnemies - galaxy.enemiesDestroyed}/${galaxy.totalEnemies}`,
      `Starbases: ${galaxy.totalStarbases - galaxy.starbasesDestroyed}/${galaxy.totalStarbases}`,
      `Kills: ${gameState.player.kills}`,
      '',
      'Controls:',
      'Arrow Keys: Move cursor',
      'H: Hyperspace',
      'G/F: Close chart',
      '',
      `Selected Sector (${this.cursorPosition.x},${this.cursorPosition.y}):`,
      sectorInfo.join(', ') || 'Empty',
    ].join('\n');
    
    this.hudText.setText(hudContent);
  }
  
  shutdown(): void {
    // Remove input listeners to prevent memory leaks
    this.inputManager.off(InputAction.NAV_UP);
    this.inputManager.off(InputAction.NAV_DOWN);
    this.inputManager.off(InputAction.NAV_LEFT);
    this.inputManager.off(InputAction.NAV_RIGHT);
    this.inputManager.off(InputAction.GALACTIC_CHART);
    this.inputManager.off(InputAction.VIEW_FORE);
    this.inputManager.off(InputAction.LONG_RANGE_SCAN);
    this.inputManager.off(InputAction.HYPERSPACE);
  }
}
