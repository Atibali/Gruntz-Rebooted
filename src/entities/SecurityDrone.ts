import Phaser from 'phaser';
import { EnemyConfig, TILE_SIZE } from '../config/levels';
import { AudioSystem } from '../systems/AudioSystem';
import { DecoyBeacon } from '../objects/DecoyBeacon';

export class SecurityDrone extends Phaser.Physics.Arcade.Sprite {
  public readonly enemyId: string;
  private pointA: { x: number; y: number };
  private pointB: { x: number; y: number };
  private targetPoint: { x: number; y: number };
  private aiState: 'PATROL' | 'CHASE' | 'DISTRACTED' | 'DISABLED' = 'PATROL';
  private disableTimer: number = 0;
  private reverseMultiplier: number = 1;
  private reverseTimer: number = 0;
  private statusLabel: Phaser.GameObjects.Text;
  private sensorRing: Phaser.GameObjects.Graphics;
  public baseSpeed: number = 88;
  public baseChaseSpeed: number = 112;
  public baseDetectRadius: number = 140;

  constructor(
    scene: Phaser.Scene,
    config: EnemyConfig,
    speedMultiplier: number = 1.0,
    detectMultiplier: number = 1.0
  ) {
    const startX = config.col * TILE_SIZE + TILE_SIZE / 2;
    const startY = config.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, startX, startY, 'enemy_drone');

    this.enemyId = config.id;
    this.baseSpeed = Math.round(88 * speedMultiplier);
    this.baseChaseSpeed = Math.round(112 * speedMultiplier);
    this.baseDetectRadius = Math.round(140 * detectMultiplier);
    this.pointA = { x: startX, y: startY };
    const endCol = config.patrolEndCol ?? config.col + 3;
    const endRow = config.patrolEndRow ?? config.row;
    this.pointB = {
      x: endCol * TILE_SIZE + TILE_SIZE / 2,
      y: endRow * TILE_SIZE + TILE_SIZE / 2
    };
    this.targetPoint = this.pointB;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(9);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(26, 26);
    body.setOffset(7, 7);

    this.sensorRing = scene.add.graphics().setDepth(2);
    this.statusLabel = scene.add
      .text(startX, startY - 24, 'PATROL', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '9px',
        color: '#94a3b8',
        backgroundColor: '#090d16cc',
        padding: { x: 2, y: 1 }
      })
      .setOrigin(0.5)
      .setDepth(14);
  }

  public disableWithEmp(durationMs: number = 5000) {
    this.disableTimer = Math.max(this.disableTimer, durationMs);
    this.aiState = 'DISABLED';
    this.setTexture('enemy_drone_disabled');
    this.setVelocity(0, 0);
    this.statusLabel.setText('EMP OFFLINE');
    this.statusLabel.setColor('#38bdf8');
  }

  public disruptWithGlitch(durationMs: number = 3800) {
    this.disableTimer = Math.max(this.disableTimer, 1400);
    this.reverseTimer = durationMs;
    this.reverseMultiplier = -1;
    this.aiState = 'DISABLED';
    this.setTexture('enemy_drone_disabled');
    this.setVelocity(0, 0);
    this.statusLabel.setText('GLITCHED');
    this.statusLabel.setColor('#fbbf24');
  }

  public isDangerous(): boolean {
    return this.disableTimer <= 0;
  }

  public isChasing(): boolean {
    return this.aiState === 'CHASE';
  }

  public isInAlert(): boolean {
    return this.isChasing();
  }

  public update(
    delta: number,
    playerX: number,
    playerY: number,
    activeDecoys: DecoyBeacon[] = [],
    speedMult: number = 1.0,
    detectMult: number = 1.0
  ) {
    this.statusLabel.setPosition(this.x, this.y - 24);
    this.sensorRing.clear();

    if (this.reverseTimer > 0) {
      this.reverseTimer = Math.max(0, this.reverseTimer - delta);
      if (this.reverseTimer <= 0) {
        this.reverseMultiplier = 1;
      }
    }

    if (this.disableTimer > 0) {
      this.disableTimer = Math.max(0, this.disableTimer - delta);
      this.setVelocity(0, 0);
      this.sensorRing.lineStyle(1.5, 0x38bdf8, 0.4);
      this.sensorRing.strokeCircle(this.x, this.y, 22);
      if (this.disableTimer <= 0) {
        this.aiState = 'PATROL';
        this.setTexture('enemy_drone');
      }
      return;
    }

    // Check if distracted by a Glitch Decoy within 250px
    let nearestDecoy: DecoyBeacon | undefined;
    let nearestDecoyDist = 250;
    activeDecoys.forEach((decoy) => {
      if (!decoy.isActive()) return;
      const d = Phaser.Math.Distance.Between(this.x, this.y, decoy.x, decoy.y);
      if (d <= nearestDecoyDist) {
        nearestDecoyDist = d;
        nearestDecoy = decoy;
      }
    });

    if (nearestDecoy) {
      this.aiState = 'DISTRACTED';
      this.statusLabel.setText('DISTRACTED!');
      this.statusLabel.setColor('#38bdf8');
      this.sensorRing.lineStyle(1.5, 0x38bdf8, 0.45);
      this.sensorRing.strokeCircle(this.x, this.y, 140);

      if (nearestDecoyDist > 20) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, nearestDecoy.x, nearestDecoy.y);
        const speed = this.baseSpeed * speedMult;
        this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      } else {
        this.setVelocity(0, 0);
      }
      return;
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    const detectRadius = this.baseDetectRadius * detectMult;

    if (distToPlayer <= detectRadius) {
      if (this.aiState !== 'CHASE') {
        this.aiState = 'CHASE';
        AudioSystem.playEnemyAlert();
      }
    } else if (
      (this.aiState === 'CHASE' || this.aiState === 'DISTRACTED') &&
      distToPlayer > detectRadius * 1.35
    ) {
      this.aiState = 'PATROL';
    }

    // Dynamic search spotlight rendering
    if (this.aiState === 'CHASE') {
      this.sensorRing.lineStyle(1.5, 0xef4444, 0.45);
      this.sensorRing.fillStyle(0xef4444, 0.12);
      this.sensorRing.fillCircle(this.x, this.y, detectRadius);
      this.sensorRing.strokeCircle(this.x, this.y, detectRadius);

      this.statusLabel.setText(this.reverseMultiplier < 0 ? 'REVERSED' : 'CHASE!');
      this.statusLabel.setColor('#f87171');
      const angle = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY);
      const speed = this.baseChaseSpeed * speedMult * this.reverseMultiplier;
      this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    } else {
      this.statusLabel.setText('PATROL');
      this.statusLabel.setColor('#94a3b8');

      const distToTarget = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.targetPoint.x,
        this.targetPoint.y
      );
      if (distToTarget < 12) {
        this.targetPoint = this.targetPoint === this.pointA ? this.pointB : this.pointA;
      }
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        this.targetPoint.x,
        this.targetPoint.y
      );
      const speed = this.baseSpeed * speedMult;
      this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

      // Search cone ahead of drone
      this.drawPatrolCone(angle, detectRadius);
    }
  }

  private drawPatrolCone(angleRad: number, radius: number) {
    const halfFov = Phaser.Math.DegToRad(35);
    const leftRad = angleRad - halfFov;
    const rightRad = angleRad + halfFov;
    const x1 = this.x + Math.cos(leftRad) * radius;
    const y1 = this.y + Math.sin(leftRad) * radius;
    const x2 = this.x + Math.cos(rightRad) * radius;
    const y2 = this.y + Math.sin(rightRad) * radius;

    this.sensorRing.fillStyle(0xf59e0b, 0.08);
    this.sensorRing.beginPath();
    this.sensorRing.moveTo(this.x, this.y);
    this.sensorRing.lineTo(x1, y1);
    this.sensorRing.arc(this.x, this.y, radius, leftRad, rightRad);
    this.sensorRing.closePath();
    this.sensorRing.fillPath();

    this.sensorRing.lineStyle(1, 0xf59e0b, 0.25);
    this.sensorRing.lineBetween(this.x, this.y, x1, y1);
    this.sensorRing.lineBetween(this.x, this.y, x2, y2);
  }
}
