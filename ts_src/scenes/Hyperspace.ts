import Phaser from 'phaser';
import { GameStateManager, GameStateType } from '@systems/GameStateManager';
import { GalaxyManager } from '@systems/GalaxyManager';
import { EnergySystem } from '@systems/EnergySystem';
import { PESCLRSystem } from '@systems/PESCLRSystem';
import { SectorCoord } from '@utils/Types';
import { DifficultyLevel } from '@utils/Constants';
import { Debug } from '@utils/Debug';

/**
 * Hyperspace Navigation Scene
 * Handles warp travel between sectors
 * 
 * Phase 15 Implementation
 */
export class HyperspaceScene extends Phaser.Scene {
  private gameStateManager!: GameStateManager;
  private galaxyManager!: GalaxyManager;
  private energySystem!: EnergySystem;
  private pesclrSystem!: PESCLRSystem;

  // Hyperspace parameters
  private targetSector: SectorCoord | null = null;
  private currentSector: SectorCoord | null = null;
  private isManualMode: boolean = false;
  private travelTime: number = 3.0; // seconds
  private elapsed: number = 0;

  // Manual mode parameters
  private driftX: number = 0;
  private driftY: number = 0;
  private readonly maxDrift: number = 100; // pixels
  private readonly driftRate: number = 20; // pixels/second
  private readonly centeringThreshold: number = 10; // pixels
  
  // Visual elements
  private tunnelGraphics!: Phaser.GameObjects.Graphics;
  private starLines: Phaser.GameObjects.Line[] = [];
  private crosshairGraphics!: Phaser.GameObjects.Graphics;
  private targetIndicator!: Phaser.GameObjects.Graphics;
  private hudText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'Hyperspace' });
  }

  init(data: { targetSector: SectorCoord }): void {
    this.targetSector = data.targetSector;
    this.gameStateManager = GameStateManager.getInstance();
    this.galaxyManager = GalaxyManager.getInstance();
    this.pesclrSystem = new PESCLRSystem();
    this.energySystem = new EnergySystem(this.pesclrSystem);

    const gameState = this.gameStateManager.getGameState();
    this.currentSector = gameState.player.sector;

    // Determine if manual mode based on difficulty
    this.isManualMode = this.requiresManualNavigation();

    // Calculate and consume energy
    const distance = this.calculateDistance();
    const success = this.energySystem.consumeHyperspaceEnergy(distance);
    
    if (!success) {
      Debug.error('Hyperspace: Insufficient energy for jump!');
      this.scene.stop();
      return;
    }

    this.elapsed = 0;
    this.driftX = 0;
    this.driftY = 0;

    // Clear any existing star lines from previous scene instances
    this.starLines = [];

    Debug.log(`Hyperspace: Jumping from (${this.currentSector?.x}, ${this.currentSector?.y}) to (${this.targetSector.x}, ${this.targetSector.y})`);
  }

  create(): void {
    this.gameStateManager.setState(GameStateType.HYPERSPACE);

    // Create tunnel effect
    this.createTunnelEffect();

    // Create star lines for speed effect
    this.createStarLines();

    if (this.isManualMode) {
      // Manual mode: show crosshairs and drift
      this.createManualModeUI();
    } else {
      // Auto-pilot mode: show progress bar
      this.createAutoPilotUI();
    }

    // Create HUD
    this.createHUD();
  }

  update(time: number, delta: number): void {
    const deltaSeconds = delta / 1000;
    this.elapsed += deltaSeconds;

    // Update tunnel animation
    this.updateTunnelEffect(deltaSeconds);

    // Update star lines
    this.updateStarLines(deltaSeconds);

    if (this.isManualMode) {
      // Manual mode: player must center crosshairs
      this.updateManualMode(deltaSeconds);
    } else {
      // Auto-pilot mode: automatic progress
      this.updateAutoPilot(deltaSeconds);
    }

    // Update HUD
    this.updateHUD();

    // Check if travel complete
    if (this.elapsed >= this.travelTime) {
      this.completeJump();
    }
  }

  private requiresManualNavigation(): boolean {
    const gameState = this.gameStateManager.getGameState();
    return gameState.difficulty === DifficultyLevel.WARRIOR ||
           gameState.difficulty === DifficultyLevel.COMMANDER;
  }

  private calculateDistance(): number {
    if (!this.currentSector || !this.targetSector) return 0;
    return this.galaxyManager.manhattanDistance(this.currentSector, this.targetSector);
  }

  private createTunnelEffect(): void {
    this.tunnelGraphics = this.add.graphics();
  }

  private updateTunnelEffect(deltaSeconds: number): void {
    this.tunnelGraphics.clear();

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const animPhase = (this.elapsed / this.travelTime) * Math.PI * 4;

    // Draw concentric circles expanding outward
    for (let i = 0; i < 10; i++) {
      const radius = 50 + i * 40 + (animPhase % 40);
      const alpha = 1.0 - (i / 10);
      
      this.tunnelGraphics.lineStyle(2, 0x00ffff, alpha);
      this.tunnelGraphics.strokeCircle(centerX, centerY, radius);
    }
  }

  private createStarLines(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Create star lines emanating from center
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50;
      const distance = 100 + Math.random() * 300;
      
      const x1 = centerX + Math.cos(angle) * distance;
      const y1 = centerY + Math.sin(angle) * distance;
      const x2 = centerX + Math.cos(angle) * (distance + 20);
      const y2 = centerY + Math.sin(angle) * (distance + 20);

      const line = this.add.line(0, 0, x1, y1, x2, y2, 0xffffff, 0.8);
      line.setOrigin(0, 0);
      this.starLines.push(line);
    }
  }

  private updateStarLines(deltaSeconds: number): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const speed = 200 * deltaSeconds;

    for (const line of this.starLines) {
      // Check if line and its geometry are still valid
      if (!line || !line.geom) {
        continue;
      }

      const x1 = line.geom.x1;
      const y1 = line.geom.y1;
      
      // Calculate angle from center
      const dx = x1 - centerX;
      const dy = y1 - centerY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Move outward
      const newDistance = distance + speed;
      
      // Wrap around
      if (newDistance > this.scale.width) {
        const newDist = 100 + Math.random() * 100;
        const newX1 = centerX + Math.cos(angle) * newDist;
        const newY1 = centerY + Math.sin(angle) * newDist;
        const newX2 = centerX + Math.cos(angle) * (newDist + 20);
        const newY2 = centerY + Math.sin(angle) * (newDist + 20);
        
        line.setTo(newX1, newY1, newX2, newY2);
      } else {
        const newX1 = centerX + Math.cos(angle) * newDistance;
        const newY1 = centerY + Math.sin(angle) * newDistance;
        const newX2 = centerX + Math.cos(angle) * (newDistance + 20);
        const newY2 = centerY + Math.sin(angle) * (newDistance + 20);
        
        line.setTo(newX1, newY1, newX2, newY2);
      }
    }
  }

  private createManualModeUI(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Create crosshair
    this.crosshairGraphics = this.add.graphics();
    
    // Create target indicator at center
    this.targetIndicator = this.add.graphics();
    this.targetIndicator.lineStyle(3, 0x00ff00, 1);
    this.targetIndicator.strokeCircle(centerX, centerY, 30);
    this.targetIndicator.strokeCircle(centerX, centerY, 20);
  }

  private updateManualMode(deltaSeconds: number): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Apply drift (simulates navigation difficulty)
    this.driftX += (Math.random() - 0.5) * this.driftRate * deltaSeconds;
    this.driftY += (Math.random() - 0.5) * this.driftRate * deltaSeconds;

    // Player can counter drift with input
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors) {
      if (cursors.left.isDown) {
        this.driftX -= 50 * deltaSeconds;
      }
      if (cursors.right.isDown) {
        this.driftX += 50 * deltaSeconds;
      }
      if (cursors.up.isDown) {
        this.driftY -= 50 * deltaSeconds;
      }
      if (cursors.down.isDown) {
        this.driftY += 50 * deltaSeconds;
      }
    }

    // Clamp drift
    this.driftX = Phaser.Math.Clamp(this.driftX, -this.maxDrift, this.maxDrift);
    this.driftY = Phaser.Math.Clamp(this.driftY, -this.maxDrift, this.maxDrift);

    // Draw crosshair at drifted position
    this.crosshairGraphics.clear();
    const crosshairX = centerX + this.driftX;
    const crosshairY = centerY + this.driftY;

    this.crosshairGraphics.lineStyle(2, 0xffffff, 1);
    this.crosshairGraphics.lineBetween(crosshairX - 20, crosshairY, crosshairX + 20, crosshairY);
    this.crosshairGraphics.lineBetween(crosshairX, crosshairY - 20, crosshairX, crosshairY + 20);
    this.crosshairGraphics.strokeCircle(crosshairX, crosshairY, 15);

    // Check if centered
    const distance = Math.sqrt(this.driftX * this.driftX + this.driftY * this.driftY);
    const isCentered = distance < this.centeringThreshold;

    // Change color based on centering
    if (isCentered) {
      this.targetIndicator.clear();
      this.targetIndicator.lineStyle(3, 0x00ff00, 1);
      this.targetIndicator.strokeCircle(centerX, centerY, 30);
    } else {
      this.targetIndicator.clear();
      this.targetIndicator.lineStyle(3, 0xff0000, 0.5);
      this.targetIndicator.strokeCircle(centerX, centerY, 30);
    }

    // If not centered, increase travel time
    if (!isCentered) {
      this.travelTime += 0.1 * deltaSeconds;
    }
  }

  private createAutoPilotUI(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.progressBar = this.add.graphics();
  }

  private updateAutoPilot(deltaSeconds: number): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2 + 200;

    const progress = Math.min(this.elapsed / this.travelTime, 1.0);

    this.progressBar.clear();
    
    // Background
    this.progressBar.fillStyle(0x333333, 1);
    this.progressBar.fillRect(centerX - 200, centerY, 400, 20);

    // Progress fill
    this.progressBar.fillStyle(0x00ff00, 1);
    this.progressBar.fillRect(centerX - 200, centerY, 400 * progress, 20);

    // Border
    this.progressBar.lineStyle(2, 0xffffff, 1);
    this.progressBar.strokeRect(centerX - 200, centerY, 400, 20);
  }

  private createHUD(): void {
    const distance = this.calculateDistance();
    const mode = this.isManualMode ? 'MANUAL' : 'AUTO-PILOT';

    this.hudText = this.add.text(20, 20, '', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });

    this.updateHUD();
  }

  private updateHUD(): void {
    const distance = this.calculateDistance();
    const mode = this.isManualMode ? 'MANUAL' : 'AUTO-PILOT';
    const progress = Math.floor((this.elapsed / this.travelTime) * 100);

    this.hudText.setText([
      `HYPERSPACE NAVIGATION`,
      `Mode: ${mode}`,
      `Target: (${this.targetSector?.x}, ${this.targetSector?.y})`,
      `Distance: ${distance} sectors`,
      `Progress: ${progress}%`,
      this.isManualMode ? `\nUse arrow keys to center crosshairs` : '',
    ]);
  }

  private completeJump(): void {
    if (!this.targetSector) return;
 
    // Update player sector
    this.galaxyManager.movePlayerToSector(this.targetSector);
    
    const gameState = this.gameStateManager.getGameState();
    gameState.player.sector = this.targetSector;
 
    Debug.log(`Hyperspace: Jump complete to (${this.targetSector.x}, ${this.targetSector.y})`);
 
    // Return to main game in combat view at the new sector
    this.gameStateManager.setState(GameStateType.PLAYING);
    this.scene.start('CombatView', { direction: 'FORE' });
  }

  shutdown(): void {
    // Clean up star lines array to prevent null reference errors on scene restart
    this.starLines = [];
  }
}
