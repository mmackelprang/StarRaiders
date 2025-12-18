import Phaser from 'phaser';
import { VectorRenderer } from '@systems/VectorRenderer';
import { StarfieldManager } from '@systems/StarfieldManager';
import { CombatSystem } from '@systems/CombatSystem';
import { ExplosionManager } from '@systems/ExplosionManager';
import { StarbaseSystem } from '@systems/StarbaseSystem';
import { GalaxyManager } from '@systems/GalaxyManager';
import { Enemy } from '@entities/Enemy';
import { Torpedo, TorpedoDirection } from '@entities/Torpedo';
import { GameStateManager, GameStateType } from '@systems/GameStateManager';
import { InputManager, InputAction } from '@systems/InputManager';
import { SPEED_TABLE, EnemyType } from '@utils/Constants';
import { Debug } from '@utils/Debug';

export enum ViewDirection {
  FORE = 'FORE',
  AFT = 'AFT',
}

export class CombatViewScene extends Phaser.Scene {
  private vectorRenderer!: VectorRenderer;
  private starfieldManager!: StarfieldManager;
  private combatSystem!: CombatSystem;
  private explosionManager!: ExplosionManager;
  private gameStateManager!: GameStateManager;
  private inputManager!: InputManager;
  private starbaseSystem!: StarbaseSystem;
  private galaxyManager!: GalaxyManager;

  private enemies: Enemy[] = [];
  private viewDirection: ViewDirection = ViewDirection.FORE;

  // HUD elements
  private hudText!: Phaser.GameObjects.Text;
  private lockIndicators!: Phaser.GameObjects.Graphics;
  private positionIndicators!: Phaser.GameObjects.Graphics;
  private statusBar!: Phaser.GameObjects.Text;
  private pesclrDisplay!: Phaser.GameObjects.Text;

  // Lock status
  private hLock: boolean = false;
  private vLock: boolean = false;
  private rangeLock: boolean = false;
  private targetRange: number = 0;

  constructor() {
    super({ key: 'CombatView' });
  }

  init(data: { direction?: ViewDirection }): void {
    this.viewDirection = data.direction || ViewDirection.FORE;
    Debug.log(`CombatView: Initializing ${this.viewDirection} view`);
  }

  create(): void {
    this.gameStateManager = GameStateManager.getInstance();
    this.inputManager = InputManager.getInstance();
    this.inputManager.initialize(this);
    this.starbaseSystem = StarbaseSystem.getInstance();
    this.galaxyManager = GalaxyManager.getInstance();

    // Set state
    this.gameStateManager.setState(GameStateType.PLAYING);

    // Create rendering systems
    this.vectorRenderer = new VectorRenderer(this);
    this.starfieldManager = new StarfieldManager(this);
    this.combatSystem = new CombatSystem(this);
    this.explosionManager = new ExplosionManager(this);

    // Create HUD elements
    this.createHUD();
    this.createLockIndicators();
    this.createPositionIndicators();
    this.createStatusBar();
    this.createPESCLRDisplay();

    // Create test enemies for demonstration
    this.createTestEnemies();

    // Set up input
    this.setupInput();
    
    // Set up combat event handlers
    this.setupCombatEvents();
  }

  private createHUD(): void {
    const gameState = this.gameStateManager.getGameState();
    const velocity = gameState.player.velocity;
    const energy = gameState.player.energy;
    const kills = gameState.player.kills;
    const tracking = this.viewDirection === ViewDirection.FORE ? 'F' : 'A';

    const hudContent = `V: ${velocity.toString().padStart(2, '0')}    E: ${energy}    K: ${kills.toString().padStart(2, '0')}    T: ${tracking}`;

    this.hudText = this.add.text(20, 20, hudContent, {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    });
  }

  private createLockIndicators(): void {
    this.lockIndicators = this.add.graphics();
  }

  private drawLockIndicators(): void {
    this.lockIndicators.clear();

    const centerX = this.scale.width / 2;
    const bottomY = this.scale.height - 80;
    const spacing = 200;

    // H-Lock (left)
    this.drawCrosshair(centerX - spacing, bottomY, this.hLock);
    this.add.text(centerX - spacing, bottomY + 30, '(H-LOCK)', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Range Lock (center)
    this.drawCrosshair(centerX, bottomY, this.rangeLock);
    this.add.text(centerX, bottomY + 30, '(RANGE)', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Range display
    const rangeColor = this.getRangeColor();
    this.add.text(centerX, bottomY - 30, `R: ${Math.floor(this.targetRange)}`, {
      fontSize: '18px',
      color: rangeColor,
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // V-Lock (right)
    this.drawCrosshair(centerX + spacing, bottomY, this.vLock);
    this.add.text(centerX + spacing, bottomY + 30, '(V-LOCK)', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  private drawCrosshair(x: number, y: number, locked: boolean): void {
    const color = locked ? 0x00ff00 : 0x666666;
    const size = 15;

    this.lockIndicators.lineStyle(2, color, 1);

    // Circle
    this.lockIndicators.strokeCircle(x, y, size);

    // Crosshair lines
    this.lockIndicators.lineBetween(x - size, y, x + size, y);
    this.lockIndicators.lineBetween(x, y - size, x, y + size);
  }

  private getRangeColor(): string {
    if (this.targetRange >= 30 && this.targetRange <= 70) {
      return '#00FF00'; // Green - optimal
    } else if ((this.targetRange >= 15 && this.targetRange < 30) || 
               (this.targetRange > 70 && this.targetRange <= 90)) {
      return '#FFFF00'; // Yellow - acceptable
    } else {
      return '#FF0000'; // Red - poor
    }
  }

  private createPositionIndicators(): void {
    this.positionIndicators = this.add.graphics();
  }

  private drawPositionIndicators(): void {
    this.positionIndicators.clear();

    const bottomY = this.scale.height - 140;
    const leftX = 100;
    const rightX = this.scale.width - 100;

    // H-Position indicator (left)
    const hFilled = Math.abs(this.hLock ? 1 : 0);
    this.positionIndicators.lineStyle(2, 0xffffff, 1);
    this.positionIndicators.strokeCircle(leftX, bottomY, 12);
    if (hFilled) {
      this.positionIndicators.fillStyle(0xffffff, 1);
      this.positionIndicators.fillCircle(leftX, bottomY, 10);
    }
    this.add.text(leftX, bottomY + 25, '(H-POS)', {
      fontSize: '12px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // V-Position indicator (right)
    const vFilled = Math.abs(this.vLock ? 1 : 0);
    this.positionIndicators.lineStyle(2, 0xffffff, 1);
    this.positionIndicators.strokeCircle(rightX, bottomY, 12);
    if (vFilled) {
      this.positionIndicators.fillStyle(0xffffff, 1);
      this.positionIndicators.fillCircle(rightX, bottomY, 10);
    }
    this.add.text(rightX, bottomY + 25, '(V-POS)', {
      fontSize: '12px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  private createStatusBar(): void {
    const gameState = this.gameStateManager.getGameState();
    const shieldsStatus = gameState.player.shieldsActive ? 'ON' : 'OFF';
    const computerStatus = gameState.player.computerActive ? 'ON' : 'OFF';
    const shieldsColor = gameState.player.shieldsActive ? '#00FF00' : '#666666';
    const computerColor = gameState.player.computerActive ? '#00FF00' : '#666666';

    const statusContent = `[S] SHIELDS: ${shieldsStatus}   [T] COMPUTER: ${computerStatus}   [F] FORE  [A] AFT  [G] CHART`;

    this.statusBar = this.add.text(
      this.scale.width / 2,
      this.scale.height - 30,
      statusContent,
      {
        fontSize: '16px',
        color: '#FFFFFF',
        fontFamily: 'monospace',
      }
    );
    this.statusBar.setOrigin(0.5);
  }

  private createPESCLRDisplay(): void {
    // PESCLR system status display - placeholder
    this.pesclrDisplay = this.add.text(0, 0, '', { fontSize: '1px' });
  }

  private updatePESCLRDisplay(): void {
    const pesclrSystem = this.combatSystem.getPESCLRSystem();
    const gameState = this.gameStateManager.getGameState();
    const systems = gameState.player.systems;
    
    const startX = this.scale.width - 150;
    const startY = 60;
    const spacing = 25;
    
    // Create/update individual colored text for each system
    const systemLetters = ['P', 'E', 'S', 'C', 'L', 'R'];
    const systemKeys: (keyof typeof systems)[] = ['photon', 'engines', 'shields', 'computer', 'longRange', 'radio'];
    
    // We need to destroy and recreate these each frame for color updates
    // In a real implementation, we'd cache these and only update when status changes
    for (let i = 0; i < systemLetters.length; i++) {
      const letter = systemLetters[i];
      const key = systemKeys[i];
      const status = systems[key];
      const color = pesclrSystem.getSystemColor(status);
      
      const text = this.add.text(
        startX + (i * spacing),
        startY,
        letter,
        {
          fontSize: '20px',
          color: color,
          fontFamily: 'monospace',
          fontStyle: 'bold',
        }
      );
      text.setDepth(1000); // Ensure it's on top
      
      // Auto-destroy after this frame
      this.time.delayedCall(100, () => text.destroy());
    }
  }

  private createTestEnemies(): void {
    // Create enemies based on view direction
    if (this.viewDirection === ViewDirection.FORE) {
      // Front enemies
      this.enemies.push(
        new Enemy('target-1', EnemyType.FIGHTER, { x: 0, y: 0, z: 50 }, 1)
      );
      this.enemies.push(
        new Enemy('target-2', EnemyType.CRUISER, { x: -20, y: 5, z: 70 }, 2)
      );
      this.enemies.push(
        new Enemy('target-3', EnemyType.BASESTAR, { x: 15, y: -8, z: 90 }, 3)
      );
    } else {
      // Aft enemies
      this.enemies.push(
        new Enemy('pursuer-1', EnemyType.FIGHTER, { x: 0, y: 0, z: -40 }, 1)
      );
      this.enemies.push(
        new Enemy('pursuer-2', EnemyType.CRUISER, { x: 10, y: -5, z: -60 }, 2)
      );
    }

    // Set initial target range
    if (this.enemies.length > 0) {
      this.targetRange = Math.abs(this.enemies[0].position.z);
    }
  }

  private setupInput(): void {
    // Toggle shields
    this.inputManager.on(InputAction.TOGGLE_SHIELDS, () => {
      const gameState = this.gameStateManager.getGameState();
      gameState.player.shieldsActive = !gameState.player.shieldsActive;
      Debug.log(`Shields: ${gameState.player.shieldsActive ? 'ON' : 'OFF'}`);
    });

    // Toggle computer
    this.inputManager.on(InputAction.TOGGLE_COMPUTER, () => {
      const gameState = this.gameStateManager.getGameState();
      gameState.player.computerActive = !gameState.player.computerActive;
      Debug.log(`Computer: ${gameState.player.computerActive ? 'ON' : 'OFF'}`);
    });

    // Switch to fore view
    this.inputManager.on(InputAction.VIEW_FORE, () => {
      this.scene.restart({ direction: ViewDirection.FORE });
    });

    // Switch to aft view
    this.inputManager.on(InputAction.VIEW_AFT, () => {
      this.scene.restart({ direction: ViewDirection.AFT });
    });

    // Open galactic chart
    this.inputManager.on(InputAction.GALACTIC_CHART, () => {
      this.scene.start('GalacticChart');
    });

    // Open long-range scan
    this.inputManager.on(InputAction.LONG_RANGE_SCAN, () => {
      this.scene.start('LongRangeScan');
    });

    // Speed controls
    for (let i = 0; i <= 9; i++) {
      const action = `SPEED_${i}` as InputAction;
      this.inputManager.on(action, () => {
        this.setVelocity(i);
      });
    }
    
    // Fire torpedo
    this.inputManager.on(InputAction.FIRE_TORPEDO, () => {
      this.fireTorpedo();
    });

    // Docking
    this.inputManager.on(InputAction.DOCK, () => {
      this.attemptDocking();
    });
  }
  
  private setupCombatEvents(): void {
    // Handle torpedo hit
    this.events.on('torpedoHit', (torpedo: Torpedo, enemy: Enemy) => {
      // Get screen position for explosion
      const screenPos = this.vectorRenderer.projectToScreen(enemy.position);
      if (screenPos) {
        this.explosionManager.createExplosion(enemy.position, screenPos);
      }
    });
    
    // Handle enemy destroyed
    this.events.on('enemyDestroyed', (enemy: Enemy) => {
      // Remove enemy from list
      const index = this.enemies.findIndex(e => e.id === enemy.id);
      if (index !== -1) {
        this.enemies.splice(index, 1);
      }
    });
    
    // Handle torpedo fired
    this.events.on('torpedoFired', (torpedo: Torpedo) => {
      // Get screen position for muzzle flash
      const playerPos = { x: 0, y: 0, z: 0 };
      const screenPos = this.vectorRenderer.projectToScreen(playerPos);
      if (screenPos) {
        this.explosionManager.createMuzzleFlash(screenPos);
      }
    });
  }
  
  private fireTorpedo(): void {
    const gameState = this.gameStateManager.getGameState();
    const playerPosition = gameState.player.position;
    
    // Determine direction based on view
    const direction = this.viewDirection === ViewDirection.FORE 
      ? TorpedoDirection.FORE 
      : TorpedoDirection.AFT;
    
    // Get lock status for nearest enemy
    let lockStatus = { hLock: false, vLock: false, rangeLock: false };
    if (this.enemies.length > 0) {
      const target = this.enemies[0];
      lockStatus = this.combatSystem.calculateLockStatus(playerPosition, target.position);
    }
    
    // Fire the torpedo
    const torpedo = this.combatSystem.fireTorpedo(playerPosition, direction, lockStatus);
    
    if (torpedo) {
      Debug.log(`Fired torpedo! Locks: H:${lockStatus.hLock} V:${lockStatus.vLock} R:${lockStatus.rangeLock}`);
    }
  }

  private attemptDocking(): void {
    const gameState = this.gameStateManager.getGameState();
    const playerPosition = gameState.player.position;
    const playerVelocity = gameState.player.velocity;
    const currentSector = gameState.player.sector;

    // Attempt docking
    const result = this.starbaseSystem.attemptDocking(
      playerPosition,
      playerVelocity,
      currentSector
    );

    if (result.success) {
      Debug.log('Docking successful! All systems repaired and energy restored.');
      // Show success message
      this.showMessage(result.message, 0x00ff00);
      
      // Return to galactic chart after docking
      this.time.delayedCall(2000, () => {
        this.scene.start('GalacticChart');
      });
    } else {
      Debug.log(`Docking failed: ${result.message}`);
      // Show error message
      this.showMessage(result.message, 0xff0000);
    }
  }

  private showMessage(text: string, color: number): void {
    // Create centered message text
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const message = this.add.text(centerX, centerY, text, {
      fontSize: '24px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
    });
    message.setOrigin(0.5);

    // Fade out and destroy after 3 seconds
    this.tweens.add({
      targets: message,
      alpha: 0,
      duration: 1000,
      delay: 2000,
      onComplete: () => {
        message.destroy();
      },
    });
  }

  private setVelocity(level: number): void {
    const gameState = this.gameStateManager.getGameState();
    gameState.player.velocity = level;
    Debug.log(`Velocity set to: ${level} (${SPEED_TABLE[level]} metrons/sec)`);
  }

  update(time: number, delta: number): void {
    const deltaSeconds = delta / 1000;
    const gameState = this.gameStateManager.getGameState();

    // Update input manager
    this.inputManager.update();

    // Update combat system (torpedoes and collisions)
    this.combatSystem.update(deltaSeconds, this.enemies);

    // Update starfield based on velocity
    const velocity = SPEED_TABLE[gameState.player.velocity] || 0;
    this.starfieldManager.update(deltaSeconds, 0, velocity);

    // Update camera rotation based on view direction
    if (this.viewDirection === ViewDirection.AFT) {
      this.vectorRenderer.setCameraRotation(0, Math.PI, 0); // 180 degrees
    } else {
      this.vectorRenderer.setCameraRotation(0, 0, 0);
    }

    // Simple lock simulation (would be based on actual targeting in full game)
    this.updateLockStatus();

    // Clear and render
    this.vectorRenderer.clear();

    // Render all enemies
    for (const enemy of this.enemies) {
      this.vectorRenderer.renderEnemy(enemy);
    }

    // Render all torpedoes
    this.renderTorpedoes();

    // Flush depth buffer
    this.vectorRenderer.flush();

    // Update explosion effects
    this.explosionManager.update();

    // Update HUD
    this.updateHUD();

    // Redraw indicators
    this.drawLockIndicators();
    this.drawPositionIndicators();
    
    // Update PESCLR display
    this.updatePESCLRDisplay();
  }

  private updateLockStatus(): void {
    // Simplified lock logic for demonstration
    // In full game, this would be based on actual enemy positions and targeting computer
    if (this.enemies.length > 0) {
      const target = this.enemies[0];
      this.targetRange = Math.abs(target.position.z);

      // Simulate locks based on position
      this.hLock = Math.abs(target.position.x) < 5;
      this.vLock = Math.abs(target.position.y) < 5;
      this.rangeLock = this.targetRange >= 30 && this.targetRange <= 70;
    }
  }
  
  private renderTorpedoes(): void {
    const torpedoes = this.combatSystem.getTorpedoes();
    
    for (const torpedo of torpedoes) {
      // Project torpedo position to screen
      const screenPos = this.vectorRenderer.projectToScreen(torpedo.position);
      
      if (screenPos) {
        // Calculate torpedo endpoint (for trail effect)
        const trailLength = torpedo.getVisualLength(Math.abs(torpedo.position.z));
        const endX = screenPos.x - (torpedo.direction === TorpedoDirection.FORE ? trailLength : -trailLength);
        
        // Draw torpedo as a bright line
        const graphics = this.add.graphics();
        graphics.lineStyle(3, 0xffffff, 1.0);
        graphics.lineBetween(endX, screenPos.y, screenPos.x, screenPos.y);
        
        // Add glow effect
        graphics.lineStyle(6, 0xffffff, 0.3);
        graphics.lineBetween(endX, screenPos.y, screenPos.x, screenPos.y);
        
        // Clean up after rendering
        graphics.setDepth(50);
        this.time.delayedCall(100, () => graphics.destroy());
      }
    }
  }

  private updateHUD(): void {
    const gameState = this.gameStateManager.getGameState();
    const velocity = gameState.player.velocity;
    const energy = gameState.player.energy;
    const kills = gameState.player.kills;
    const tracking = this.viewDirection === ViewDirection.FORE ? 'F' : 'A';

    this.hudText.setText(
      `V: ${velocity.toString().padStart(2, '0')}    E: ${energy}    K: ${kills.toString().padStart(2, '0')}    T: ${tracking}`
    );

    // Update status bar
    const shieldsStatus = gameState.player.shieldsActive ? 'ON' : 'OFF';
    const computerStatus = gameState.player.computerActive ? 'ON' : 'OFF';

    this.statusBar.setText(
      `[S] SHIELDS: ${shieldsStatus}   [T] COMPUTER: ${computerStatus}   [F] FORE  [A] AFT  [G] CHART`
    );
  }

  shutdown(): void {
    if (this.vectorRenderer) {
      this.vectorRenderer.destroy();
    }
    if (this.starfieldManager) {
      this.starfieldManager.destroy();
    }
    if (this.combatSystem) {
      this.combatSystem.destroy();
    }
    if (this.explosionManager) {
      this.explosionManager.destroy();
    }
    
    // Remove event listeners
    this.events.off('torpedoHit');
    this.events.off('enemyDestroyed');
    this.events.off('torpedoFired');
    
    // Remove all input manager listeners to prevent memory leaks
    if (this.inputManager) {
      this.inputManager.off(InputAction.TOGGLE_SHIELDS);
      this.inputManager.off(InputAction.TOGGLE_COMPUTER);
      this.inputManager.off(InputAction.VIEW_FORE);
      this.inputManager.off(InputAction.VIEW_AFT);
      this.inputManager.off(InputAction.GALACTIC_CHART);
      this.inputManager.off(InputAction.LONG_RANGE_SCAN);
      this.inputManager.off(InputAction.FIRE_TORPEDO);
      this.inputManager.off(InputAction.DOCK);
      for (let i = 0; i <= 9; i++) {
        this.inputManager.off(`SPEED_${i}` as InputAction);
      }
    }
  }
}
