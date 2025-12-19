import Phaser from 'phaser';
import { VectorRenderer } from '@systems/VectorRenderer';
import { StarfieldManager } from '@systems/StarfieldManager';
import { CombatSystem } from '@systems/CombatSystem';
import { ExplosionManager } from '@systems/ExplosionManager';
import { StarbaseSystem } from '@systems/StarbaseSystem';
import { GalaxyManager } from '@systems/GalaxyManager';
import { EnergySystem } from '@systems/EnergySystem';
import { PESCLRSystem } from '@systems/PESCLRSystem';
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
  private energySystem!: EnergySystem;
  private pesclrSystem!: PESCLRSystem;

  private enemies: Enemy[] = [];
  private viewDirection: ViewDirection = ViewDirection.FORE;

  // Starfield rotation velocity (for arrow key navigation)
  private rotationVelocity = { x: 0, y: 0 };
  private readonly ROTATION_SPEED = 30; // pixels per second when rotating
  private readonly ROTATION_DAMPING = 0.92; // smooth deceleration
  private readonly IDLE_DRIFT_SPEED = 5; // subtle constant movement
  private readonly IDLE_DRIFT_FREQ_X = 0.0003; // horizontal drift frequency
  private readonly IDLE_DRIFT_FREQ_Y = 0.0005; // vertical drift frequency

  // HUD elements
  private hudText!: Phaser.GameObjects.Text;
  private lockIndicators!: Phaser.GameObjects.Graphics;
  private positionIndicators!: Phaser.GameObjects.Graphics;
  private statusBar!: Phaser.GameObjects.Text;
  private pesclrDisplay!: Phaser.GameObjects.Text;
  
  // Lock indicator text elements (reused to prevent memory leaks)
  private lockLabels: Phaser.GameObjects.Text[] = [];
  private rangeDisplay!: Phaser.GameObjects.Text;
  private positionLabels: Phaser.GameObjects.Text[] = [];
  private pesclrTexts: Phaser.GameObjects.Text[] = [];
  
  // Graphics pool for torpedo rendering
  private torpedoGraphics: Phaser.GameObjects.Graphics[] = [];
  private torpedoGraphicsIndex: number = 0;
  
  // Tracking computer HUD overlay
  private trackingComputerGraphics!: Phaser.GameObjects.Graphics;
  
  // Shield effect
  private shieldEffectGraphics!: Phaser.GameObjects.Graphics;
  private shieldPulseTime: number = 0;

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
    
    // IMPORTANT: Clean up listeners from previous instance if this is a restart
    // scene.restart() doesn't call shutdown(), so we must clean up here
    const inputManager = InputManager.getInstance();
    inputManager.removeAllListeners();
    console.log('[CombatView] init() - cleaned up listeners from previous instance');
  }

  create(): void {
    this.gameStateManager = GameStateManager.getInstance();
    this.inputManager = InputManager.getInstance();
    this.inputManager.initialize(this);
    this.starbaseSystem = StarbaseSystem.getInstance();
    this.galaxyManager = GalaxyManager.getInstance();

    // Set state
    this.gameStateManager.setState(GameStateType.PLAYING);

    // Initialize energy and PESCLR systems
    this.pesclrSystem = new PESCLRSystem();
    this.energySystem = new EnergySystem(this.pesclrSystem);

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
    this.createTrackingComputerHUD();
    this.createShieldEffect();

    // Create enemies from current sector data
    this.createEnemiesFromSector();

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
 
    const hudContent =
      ` V:${velocity.toString().padStart(2, '0')}` +
      `  E:${Math.floor(energy).toString().padStart(4, '0')}` +
      `  K:${kills.toString().padStart(2, '0')}` +
      `  T:${tracking}`;
 
    this.hudText = this.add.text(16, 16, hudContent, {
      fontSize: '20px',
      color: '#00FF00',
      fontFamily: 'monospace',
    });
  }

  private createLockIndicators(): void {
    this.lockIndicators = this.add.graphics();
    
    const centerX = this.scale.width / 2;
    const bottomY = this.scale.height - 80;
    const spacing = 200;
    
    // Create reusable text labels
    // H-Lock label
    this.lockLabels[0] = this.add.text(centerX - spacing, bottomY + 30, '(H-LOCK)', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    
    // Range label
    this.lockLabels[1] = this.add.text(centerX, bottomY + 30, '(RANGE)', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    
    // V-Lock label
    this.lockLabels[2] = this.add.text(centerX + spacing, bottomY + 30, '(V-LOCK)', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    
    // Range display
    this.rangeDisplay = this.add.text(centerX, bottomY - 30, 'R: 0', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
  }

  private drawLockIndicators(): void {
    this.lockIndicators.clear();

    const centerX = this.scale.width / 2;
    const bottomY = this.scale.height - 80;
    const spacing = 200;

    // H-Lock (left)
    this.drawCrosshair(centerX - spacing, bottomY, this.hLock);

    // Range Lock (center)
    this.drawCrosshair(centerX, bottomY, this.rangeLock);

    // Update range display
    const rangeColor = this.getRangeColor();
    this.rangeDisplay.setText(`R: ${Math.floor(this.targetRange)}`);
    this.rangeDisplay.setColor(rangeColor);

    // V-Lock (right)
    this.drawCrosshair(centerX + spacing, bottomY, this.vLock);
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
    
    const bottomY = this.scale.height - 140;
    const leftX = 100;
    const rightX = this.scale.width - 100;
    
    // Create reusable position labels
    this.positionLabels[0] = this.add.text(leftX, bottomY + 25, '(H-POS)', {
      fontSize: '12px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    
    this.positionLabels[1] = this.add.text(rightX, bottomY + 25, '(V-POS)', {
      fontSize: '12px',
      color: '#FFFFFF',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
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

    // V-Position indicator (right)
    const vFilled = Math.abs(this.vLock ? 1 : 0);
    this.positionIndicators.lineStyle(2, 0xffffff, 1);
    this.positionIndicators.strokeCircle(rightX, bottomY, 12);
    if (vFilled) {
      this.positionIndicators.fillStyle(0xffffff, 1);
      this.positionIndicators.fillCircle(rightX, bottomY, 10);
    }
  }

  private createStatusBar(): void {
    const gameState = this.gameStateManager.getGameState();
    const shieldsStatus = gameState.player.shieldsActive ? 'ON ' : 'OFF';
    const computerStatus = gameState.player.computerActive ? 'ON ' : 'OFF';
 
    const statusContent =
      ` [S] SHIELDS:${shieldsStatus}` +
      `  [T] COMPUTER:${computerStatus}` +
      `   [F] FORE  [A] AFT  [G] CHART`;
 
    this.statusBar = this.add.text(
      this.scale.width / 2,
      this.scale.height - 40,
      statusContent,
      {
        fontSize: '16px',
        color: '#00FF00',
        fontFamily: 'monospace',
      }
    );
    this.statusBar.setOrigin(0.5);
  }

  private createPESCLRDisplay(): void {
    const startX = this.scale.width - 150;
    const startY = 60;
    const spacing = 25;
    
    // Create reusable text objects for PESCLR display
    const systemLetters = ['P', 'E', 'S', 'C', 'L', 'R'];
    
    for (let i = 0; i < systemLetters.length; i++) {
      const text = this.add.text(
        startX + (i * spacing),
        startY,
        systemLetters[i],
        {
          fontSize: '20px',
          color: '#00FF00',
          fontFamily: 'monospace',
          fontStyle: 'bold',
        }
      );
      text.setDepth(1000); // Ensure it's on top
      this.pesclrTexts.push(text);
    }
  }
  
  private createTrackingComputerHUD(): void {
    this.trackingComputerGraphics = this.add.graphics();
    this.trackingComputerGraphics.setDepth(5); // Above starfield, below enemies
  }
  
  private drawTrackingComputerHUD(): void {
    this.trackingComputerGraphics.clear();
    
    const gameState = this.gameStateManager.getGameState();
    if (!gameState.player.computerActive) {
      return; // Don't draw if computer is off
    }
    
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const color = 0x00ff00;
    const alpha = 0.3;
    
    // Draw targeting grid
    this.trackingComputerGraphics.lineStyle(1, color, alpha);
    
    // Vertical lines
    const gridSpacing = 80;
    for (let i = -3; i <= 3; i++) {
      const x = centerX + i * gridSpacing;
      this.trackingComputerGraphics.lineBetween(x, 0, x, this.scale.height);
    }
    
    // Horizontal lines
    for (let i = -3; i <= 3; i++) {
      const y = centerY + i * gridSpacing;
      this.trackingComputerGraphics.lineBetween(0, y, this.scale.width, y);
    }
    
    // Draw center crosshair
    this.trackingComputerGraphics.lineStyle(2, color, 0.6);
    const crosshairSize = 30;
    
    // Center cross
    this.trackingComputerGraphics.lineBetween(
      centerX - crosshairSize, centerY,
      centerX + crosshairSize, centerY
    );
    this.trackingComputerGraphics.lineBetween(
      centerX, centerY - crosshairSize,
      centerX, centerY + crosshairSize
    );
    
    // Center circle
    this.trackingComputerGraphics.strokeCircle(centerX, centerY, 20);
  }
  
  private createShieldEffect(): void {
    this.shieldEffectGraphics = this.add.graphics();
    this.shieldEffectGraphics.setDepth(100); // On top of everything
  }
  
  private drawShieldEffect(deltaSeconds: number): void {
    this.shieldEffectGraphics.clear();
    
    const gameState = this.gameStateManager.getGameState();
    if (!gameState.player.shieldsActive) {
      return; // Don't draw if shields are off
    }
    
    // Update pulse animation
    this.shieldPulseTime += deltaSeconds;
    
    // Pulsing alpha for shimmer effect (between 0.05 and 0.15)
    const pulseAlpha = 0.1 + Math.sin(this.shieldPulseTime * 3) * 0.05;
    
    // Draw blue glow around screen edges
    const edgeWidth = 40;
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Create gradient effect using multiple rectangles
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      const progress = i / steps;
      const currentAlpha = pulseAlpha * (1 - progress);
      const currentEdge = edgeWidth * progress;
      
      this.shieldEffectGraphics.lineStyle(2, 0x4488ff, currentAlpha);
      
      // Draw rectangle border
      this.shieldEffectGraphics.strokeRect(
        currentEdge,
        currentEdge,
        width - currentEdge * 2,
        height - currentEdge * 2
      );
    }
    
    // Add corner highlights
    this.shieldEffectGraphics.fillStyle(0x4488ff, pulseAlpha * 0.5);
    const cornerSize = 20;
    this.shieldEffectGraphics.fillTriangle(0, 0, cornerSize, 0, 0, cornerSize);
    this.shieldEffectGraphics.fillTriangle(width, 0, width - cornerSize, 0, width, cornerSize);
    this.shieldEffectGraphics.fillTriangle(0, height, cornerSize, height, 0, height - cornerSize);
    this.shieldEffectGraphics.fillTriangle(width, height, width - cornerSize, height, width, height - cornerSize);
  }

  private updatePESCLRDisplay(): void {
    const pesclrSystem = this.combatSystem.getPESCLRSystem();
    const gameState = this.gameStateManager.getGameState();
    const systems = gameState.player.systems;
    
    const systemKeys: (keyof typeof systems)[] = ['photon', 'engines', 'shields', 'computer', 'longRange', 'radio'];
    
    // Update colors of existing text objects - check if they still exist first
    for (let i = 0; i < systemKeys.length; i++) {
      if (i < this.pesclrTexts.length && this.pesclrTexts[i] && this.pesclrTexts[i].active) {
        const key = systemKeys[i];
        const status = systems[key];
        const color = pesclrSystem.getSystemColor(status);
        this.pesclrTexts[i].setColor(color);
      }
    }
  }

  private createEnemiesFromSector(): void {
    // Get current sector from game state
    const gameState = this.gameStateManager.getGameState();
    const currentSector = gameState.player.sector;
    
    // Get sector data from galaxy manager
    const sectorData = this.galaxyManager.getSector(currentSector);
    
    if (!sectorData || sectorData.enemies.length === 0) {
      // No enemies in this sector
      Debug.log('No enemies in current sector');
      return;
    }
    
    Debug.log(`Creating ${sectorData.enemies.length} enemies in sector (${currentSector.x}, ${currentSector.y})`);
    
    // Create Enemy entities from sector data
    for (let i = 0; i < sectorData.enemies.length; i++) {
      const enemyData = sectorData.enemies[i];
      
      // Generate 3D position for enemy in combat view
      // Spread enemies out in 3D space based on their index
      const angle = (i / sectorData.enemies.length) * Math.PI * 2;
      const distance = 40 + (i * 15); // Vary distance
      const spread = 20;
      
      const position = {
        x: Math.cos(angle) * spread,
        y: Math.sin(angle) * spread * 0.5, // Less vertical spread
        z: this.viewDirection === ViewDirection.FORE ? distance : -distance,
      };
      
      // Create enemy with data from galaxy
      const enemy = new Enemy(
        enemyData.id,
        enemyData.type,
        position,
        enemyData.health
      );
      
      this.enemies.push(enemy);
      Debug.log(`  - ${enemyData.type} at (${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)})`);
    }

    // Set initial target range
    if (this.enemies.length > 0) {
      this.targetRange = Math.abs(this.enemies[0].position.z);
    }
  }

  private setupInput(): void {
    // Listen to navigation events (arrow keys)
    this.inputManager.on('navigation', (navX: number, navY: number) => {
      // Update rotation velocity based on arrow key input
      this.rotationVelocity.x = navX * this.ROTATION_SPEED;
      this.rotationVelocity.y = navY * this.ROTATION_SPEED;
    });

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

  private updatePlayerPosition(deltaSeconds: number, gameState: any): void {
    // Get current velocity in metrons/second
    const forwardSpeed = SPEED_TABLE[gameState.player.velocity] || 0;
    
    // Convert rotation velocity (from arrow keys) to actual player movement
    const moveSpeed = 10; // metrons/second for lateral movement
    
    // Update player position in 3D space
    // Forward/backward movement (Z-axis)
    if (this.viewDirection === ViewDirection.FORE) {
      gameState.player.position.z += forwardSpeed * deltaSeconds;
    } else {
      gameState.player.position.z -= forwardSpeed * deltaSeconds;
    }
    
    // Lateral movement from arrow keys (X and Y axes)
    gameState.player.position.x += (this.rotationVelocity.x / this.ROTATION_SPEED) * moveSpeed * deltaSeconds;
    gameState.player.position.y += (this.rotationVelocity.y / this.ROTATION_SPEED) * moveSpeed * deltaSeconds;
    
    // Update enemy positions relative to player movement
    // This makes enemies appear to move closer/farther as player moves
    for (const enemy of this.enemies) {
      // Move enemies in opposite direction to simulate player movement
      if (this.viewDirection === ViewDirection.FORE) {
        enemy.position.z -= forwardSpeed * deltaSeconds;
      } else {
        enemy.position.z += forwardSpeed * deltaSeconds;
      }
      
      // Lateral movement relative to player
      enemy.position.x -= (this.rotationVelocity.x / this.ROTATION_SPEED) * moveSpeed * deltaSeconds;
      enemy.position.y -= (this.rotationVelocity.y / this.ROTATION_SPEED) * moveSpeed * deltaSeconds;
    }
  }

  update(time: number, delta: number): void {
    const deltaSeconds = delta / 1000;
    const gameState = this.gameStateManager.getGameState();

    // Update input manager
    this.inputManager.update();

    // Update energy system for velocity-based energy consumption
    this.energySystem.update(delta);

    // Update player position based on velocity and navigation
    this.updatePlayerPosition(deltaSeconds, gameState);

    // Update combat system (torpedoes and collisions)
    this.combatSystem.update(deltaSeconds, this.enemies);

    // Calculate starfield movement from multiple sources
    // 1. Forward velocity from speed setting
    const forwardVelocity = SPEED_TABLE[gameState.player.velocity] || 0;
    
    // 2. Apply rotation damping for smooth deceleration
    this.rotationVelocity.x *= this.ROTATION_DAMPING;
    this.rotationVelocity.y *= this.ROTATION_DAMPING;
    
    // 3. Add idle drift for visual interest (even at velocity 0)
    const idleDriftX = Math.sin(time * this.IDLE_DRIFT_FREQ_X) * this.IDLE_DRIFT_SPEED;
    const idleDriftY = Math.cos(time * this.IDLE_DRIFT_FREQ_Y) * this.IDLE_DRIFT_SPEED;
    
    // 4. Combine all velocity sources
    const totalVelocityX = this.rotationVelocity.x + idleDriftX;
    const totalVelocityY = forwardVelocity + this.rotationVelocity.y + idleDriftY;
    
    // Update starfield with combined velocity
    this.starfieldManager.update(deltaSeconds, totalVelocityX, totalVelocityY);

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
    
    // Draw tracking computer HUD overlay
    this.drawTrackingComputerHUD();
    
    // Draw shield effect
    this.drawShieldEffect(deltaSeconds);
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
    
    // Reset graphics index for this frame
    this.torpedoGraphicsIndex = 0;
    
    // Hide all torpedo graphics first
    for (const graphics of this.torpedoGraphics) {
      graphics.clear();
      graphics.setVisible(false);
    }
    
    for (const torpedo of torpedoes) {
      // Project torpedo position to screen
      const screenPos = this.vectorRenderer.projectToScreen(torpedo.position);
      
      if (screenPos) {
        // Get or create graphics object from pool
        let graphics: Phaser.GameObjects.Graphics;
        if (this.torpedoGraphicsIndex >= this.torpedoGraphics.length) {
          graphics = this.add.graphics();
          graphics.setDepth(50);
          this.torpedoGraphics.push(graphics);
        } else {
          graphics = this.torpedoGraphics[this.torpedoGraphicsIndex];
        }
        graphics.clear(); // Always clear before use
        this.torpedoGraphicsIndex++;
        
        // Compute shrinking radius based on distance traveled
        const progress = Phaser.Math.Clamp(
          torpedo.distanceTraveled / torpedo.maxRange,
          0,
          1,
        );
        const maxRadius = 10;
        const minRadius = 2;
        const radius = maxRadius - (maxRadius - minRadius) * progress;
        
        // Core bright circle
        graphics.fillStyle(0xffffff, 1.0);
        graphics.fillCircle(screenPos.x, screenPos.y, radius);
        
        // Faint outer halo for a softer, pixel-blast feel
        graphics.lineStyle(1, 0xffffff, 0.5);
        graphics.strokeCircle(screenPos.x, screenPos.y, radius + 1);
        
        graphics.setVisible(true);
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
      ` V:${velocity.toString().padStart(2, '0')}` +
      `  E:${Math.floor(energy).toString().padStart(4, '0')}` +
      `  K:${kills.toString().padStart(2, '0')}` +
      `  T:${tracking}`,
    );
 
    const shieldsStatus = gameState.player.shieldsActive ? 'ON ' : 'OFF';
    const computerStatus = gameState.player.computerActive ? 'ON ' : 'OFF';
 
    this.statusBar.setText(
      ` [S] SHIELDS:${shieldsStatus}` +
      `  [T] COMPUTER:${computerStatus}` +
      `   [F] FORE  [A] AFT  [G] CHART`,
    );
  }

  shutdown(): void {
    // DIAGNOSTIC: Log shutdown
    console.log('[CombatView] shutdown() called - cleaning up listeners');
    
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
    
    // Clean up torpedo graphics pool
    for (const graphics of this.torpedoGraphics) {
      graphics.destroy();
    }
    this.torpedoGraphics = [];
    
    // Clean up lock indicator labels
    for (const label of this.lockLabels) {
      label.destroy();
    }
    this.lockLabels = [];
    
    // Clean up position indicator labels
    for (const label of this.positionLabels) {
      label.destroy();
    }
    this.positionLabels = [];
    
    // Clean up PESCLR text objects
    for (const text of this.pesclrTexts) {
      text.destroy();
    }
    this.pesclrTexts = [];
    
    // Remove event listeners
    this.events.off('torpedoHit');
    this.events.off('enemyDestroyed');
    this.events.off('torpedoFired');
    
    // Remove all input manager listeners to prevent memory leaks
    if (this.inputManager) {
      // Use removeAllListeners to clear all event listeners for this scene
      // This is more reliable than trying to remove individual listeners
      this.inputManager.removeAllListeners();
    }
  }
}
