import Phaser from 'phaser';
import { TILE_SIZE } from '../config/levels';
import { AudioSystem } from '../systems/AudioSystem';
import { DecoyBeacon } from './DecoyBeacon';

export interface SentryTurretConfig {
  id: string;
  col: number;
  row: number;
  scanDirection?: 'up' | 'down' | 'left' | 'right';
  scanAngleDeg?: number;
  rangeTiles?: number;
  fireIntervalMs?: number;
  startAngleDeg?: number;
  sweepRangeDeg?: number;
  sweepSpeed?: number;
  rangePx?: number;
}

export class SentryTurret extends Phaser.Physics.Arcade.Sprite {
  public readonly turretId: string;
  private currentAngleDeg: number = 0;
  private baseAngleDeg: number = 0;
  private sweepRangeDeg: number = 90;
  private sweepSpeed: number = 0.0015;
  private rangePx: number = 180;
  private beamGraphics: Phaser.GameObjects.Graphics;
  private statusLabel: Phaser.GameObjects.Text;
  private disableTimer: number = 0;
  private lockOnTimer: number = 0;
  private isLocked: boolean = false;
  private sweepPhase: number = 0;

  constructor(scene: Phaser.Scene, config: SentryTurretConfig) {
    const x = config.col * TILE_SIZE + TILE_SIZE / 2;
    const y = config.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, 'sentry_turret');

    this.turretId = config.id;

    // Convert scanDirection to baseAngleDeg
    let dirAngle = 0;
    if (config.scanDirection === 'down') dirAngle = 90;
    else if (config.scanDirection === 'left') dirAngle = 180;
    else if (config.scanDirection === 'up') dirAngle = 270;
    else if (config.scanDirection === 'right') dirAngle = 0;

    this.baseAngleDeg = config.startAngleDeg ?? dirAngle;
    this.currentAngleDeg = this.baseAngleDeg;
    this.sweepRangeDeg = config.sweepRangeDeg ?? (config.scanAngleDeg ?? 80);
    this.sweepSpeed = config.sweepSpeed ?? 0.0016;
    this.rangePx = config.rangePx ?? (config.rangeTiles ? config.rangeTiles * TILE_SIZE : 180);

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body
    this.setDepth(8);

    this.beamGraphics = scene.add.graphics().setDepth(7);

    this.statusLabel = scene.add
      .text(x, y - 26, 'SENTRY', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '8px',
        color: '#f87171',
        backgroundColor: '#090d16cc',
        padding: { x: 2, y: 1 }
      })
      .setOrigin(0.5)
      .setDepth(14);
  }

  public disableWithEmp(durationMs: number = 5000) {
    this.disableTimer = Math.max(this.disableTimer, durationMs);
    this.isLocked = false;
    this.lockOnTimer = 0;
    this.setTexture('sentry_turret_disabled');
    this.statusLabel.setText('OFFLINE');
    this.statusLabel.setColor('#38bdf8');
    this.beamGraphics.clear();
  }

  public disableSentry(durationMs: number = 5000) {
    this.disableWithEmp(durationMs);
  }

  public isDangerous(): boolean {
    return this.disableTimer <= 0;
  }

  public isLockedOn(): boolean {
    return this.isLocked;
  }

  public update(
    delta: number,
    playerX: number,
    playerY: number,
    activeDecoys: DecoyBeacon[] = [],
    onPlayerHit?: () => void
  ) {
    this.beamGraphics.clear();

    if (this.disableTimer > 0) {
      this.disableTimer = Math.max(0, this.disableTimer - delta);
      if (this.disableTimer <= 0) {
        this.setTexture('sentry_turret');
        this.statusLabel.setText('SENTRY');
        this.statusLabel.setColor('#f87171');
      }
      return;
    }

    // Check if distracted by decoy
    let targetX = playerX;
    let targetY = playerY;
    let isDecoyTarget = false;

    activeDecoys.forEach((decoy) => {
      if (decoy.isActive() && Phaser.Math.Distance.Between(this.x, this.y, decoy.x, decoy.y) <= this.rangePx * 1.2) {
        targetX = decoy.x;
        targetY = decoy.y;
        isDecoyTarget = true;
      }
    });

    if (isDecoyTarget) {
      this.statusLabel.setText('DISTRACTED');
      this.statusLabel.setColor('#38bdf8');
      const decoyAngleRad = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
      this.currentAngleDeg = Phaser.Math.RadToDeg(decoyAngleRad);
      this.setAngle(this.currentAngleDeg);
      this.drawScanningCone(this.currentAngleDeg, 0x38bdf8, 0.25);
      return;
    }

    // Sweep motion if not locked on
    if (!this.isLocked) {
      this.sweepPhase += delta * this.sweepSpeed;
      const offset = Math.sin(this.sweepPhase) * (this.sweepRangeDeg / 2);
      this.currentAngleDeg = this.baseAngleDeg + offset;
      this.setAngle(this.currentAngleDeg);
    }

    // Check if player is inside the scanning sector cone
    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    let playerInCone = false;

    if (distToPlayer <= this.rangePx) {
      const angleToPlayerDeg = Phaser.Math.RadToDeg(
        Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY)
      );
      const angleDiff = Phaser.Math.Angle.ShortestBetween(this.currentAngleDeg, angleToPlayerDeg);
      if (Math.abs(angleDiff) <= 28) {
        playerInCone = true;
      }
    }

    if (playerInCone) {
      if (!this.isLocked) {
        this.isLocked = true;
        this.lockOnTimer = 0;
        AudioSystem.playTurretAlert();
        this.statusLabel.setText('LOCK-ON!');
        this.statusLabel.setColor('#f43f5e');
      }

      this.lockOnTimer += delta;
      // Track player smoothly during lock-on
      const lockAngle = Phaser.Math.RadToDeg(
        Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY)
      );
      this.currentAngleDeg = lockAngle;
      this.setAngle(this.currentAngleDeg);

      // Warning beam flashes red
      const lockRatio = Math.min(1, this.lockOnTimer / 650);
      this.drawScanningCone(this.currentAngleDeg, 0xf43f5e, 0.4 + lockRatio * 0.45, true);

      // Fire burst if locked for 650ms
      if (this.lockOnTimer >= 650) {
        this.lockOnTimer = 0;
        if (onPlayerHit) {
          onPlayerHit();
        }
      }
    } else {
      if (this.isLocked) {
        this.isLocked = false;
        this.statusLabel.setText('SENTRY');
        this.statusLabel.setColor('#f87171');
      }
      this.drawScanningCone(this.currentAngleDeg, 0xef4444, 0.22, false);
    }
  }

  private drawScanningCone(angleDeg: number, color: number, alpha: number, intense: boolean = false) {
    const centerRad = Phaser.Math.DegToRad(angleDeg);
    const halfFov = Phaser.Math.DegToRad(26);
    const leftRad = centerRad - halfFov;
    const rightRad = centerRad + halfFov;

    const x1 = this.x + Math.cos(leftRad) * this.rangePx;
    const y1 = this.y + Math.sin(leftRad) * this.rangePx;
    const x2 = this.x + Math.cos(rightRad) * this.rangePx;
    const y2 = this.y + Math.sin(rightRad) * this.rangePx;

    this.beamGraphics.fillStyle(color, alpha);
    this.beamGraphics.beginPath();
    this.beamGraphics.moveTo(this.x, this.y);
    this.beamGraphics.lineTo(x1, y1);
    this.beamGraphics.arc(this.x, this.y, this.rangePx, leftRad, rightRad);
    this.beamGraphics.closePath();
    this.beamGraphics.fillPath();

    this.beamGraphics.lineStyle(intense ? 2.5 : 1.2, color, alpha * 1.5);
    this.beamGraphics.lineBetween(this.x, this.y, x1, y1);
    this.beamGraphics.lineBetween(this.x, this.y, x2, y2);
  }
}
