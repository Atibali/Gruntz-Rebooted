import Phaser from 'phaser';
import { BossConfig, TILE_SIZE } from '../config/levels';
import { AudioSystem } from '../systems/AudioSystem';

export class CoreGuardian extends Phaser.Physics.Arcade.Sprite {
  private hp: number;
  private maxHp: number;
  private phase: 1 | 2 | 3 = 1;
  private defeated: boolean = false;
  private stunTimer: number = 0;
  private invulnTimer: number = 0;
  private homeX: number;
  private homeY: number;
  private patrolDir: number = 1;
  private pulseRingGraphics: Phaser.GameObjects.Graphics;
  private pulseRadius: number = 0;
  private statusLabel: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: BossConfig) {
    const startX = config.col * TILE_SIZE + TILE_SIZE / 2;
    const startY = config.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, startX, startY, 'boss_normal');

    this.homeX = startX;
    this.homeY = startY;
    this.maxHp = config.maxHp;
    this.hp = config.maxHp;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(9);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(60, 60);
    body.setOffset(12, 12);

    this.pulseRingGraphics = scene.add.graphics().setDepth(6);
    this.statusLabel = scene.add
      .text(startX, startY - 52, 'CORE GUARDIAN [PHASE 1]', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '10px',
        color: '#f87171',
        backgroundColor: '#090d16dd',
        padding: { x: 4, y: 2 }
      })
      .setOrigin(0.5)
      .setDepth(15);
  }

  public getHp(): number {
    return this.hp;
  }

  public getMaxHp(): number {
    return this.maxHp;
  }

  public getPhase(): 1 | 2 | 3 {
    return this.phase;
  }

  public isDefeated(): boolean {
    return this.defeated;
  }

  public getStatusHint(): string {
    if (this.defeated) return 'GUARDIAN PURGED — SYSTEM CORE UNLOCKED';
    if (this.phase === 1) {
      return 'Phase 1: Patrol Mode — Step on SURGE-NODE or use [2] EMP / [4] Glitch near Boss';
    }
    if (this.phase === 2) {
      return 'Phase 2: Aggressive — Use [2] EMP or [4] Glitch Pulse near Boss to overload armor';
    }
    return 'Phase 3: CORE EXPOSED — Hack CORE-PURGE Terminal [E]/[3] or use [3] Hack near Boss!';
  }

  public takeDamage(amount: number = 1, reason?: string): boolean {
    if (this.defeated || this.invulnTimer > 0) return false;

    this.hp = Math.max(0, this.hp - amount);
    this.invulnTimer = 900;
    this.stunTimer = 1400;
    AudioSystem.playBossHit();

    // Update phase based on remaining HP
    if (this.hp >= 4) {
      this.phase = 1;
    } else if (this.hp >= 2) {
      this.phase = 2;
    } else if (this.hp === 1) {
      this.phase = 3;
      this.setTexture('boss_vulnerable');
    }

    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.25, to: 1 },
      scaleX: { from: 1.18, to: 1 },
      scaleY: { from: 1.18, to: 1 },
      duration: 260
    });

    if (this.hp <= 0) {
      this.defeatGuardian();
    }

    return true;
  }

  private defeatGuardian() {
    this.defeated = true;
    this.setVelocity(0, 0);
    this.pulseRingGraphics.clear();
    this.statusLabel.setText('GUARDIAN PURGED');
    this.statusLabel.setColor('#34d399');

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = false;
    }

    AudioSystem.playVictory();

    const particles = this.scene.add.particles(this.x, this.y, 'particle_square', {
      speed: { min: 70, max: 200 },
      scale: { start: 1.6, end: 0 },
      lifespan: 700,
      tint: [0xf43f5e, 0xfbbf24, 0x34d399, 0x38bdf8],
      quantity: 32,
      emitting: false
    });
    particles.explode(32);

    this.scene.tweens.add({
      targets: this,
      alpha: 0.2,
      scaleX: 0.6,
      scaleY: 0.6,
      duration: 500
    });
  }

  public isDangerous(): boolean {
    return !this.defeated && this.stunTimer <= 0 && this.phase !== 3;
  }

  public update(delta: number, playerX: number, playerY: number) {
    if (this.defeated) return;

    this.statusLabel.setPosition(this.x, this.y - 52);

    if (this.invulnTimer > 0) {
      this.invulnTimer = Math.max(0, this.invulnTimer - delta);
    }

    if (this.stunTimer > 0) {
      this.stunTimer = Math.max(0, this.stunTimer - delta);
      this.setVelocity(0, 0);
      this.statusLabel.setText(`STUNNED [HP: ${this.hp}/${this.maxHp}]`);
      this.statusLabel.setColor('#38bdf8');
      return;
    }

    this.pulseRingGraphics.clear();

    if (this.phase === 1) {
      // Phase 1: Patrols horizontally in the Core Arena
      this.statusLabel.setText(`GUARDIAN PHASE 1 [HP ${this.hp}/${this.maxHp}]`);
      this.statusLabel.setColor('#fbbf24');

      if (this.x > this.homeX + TILE_SIZE * 4) this.patrolDir = -1;
      if (this.x < this.homeX - TILE_SIZE * 4) this.patrolDir = 1;
      this.setVelocity(this.patrolDir * 85, 0);
    } else if (this.phase === 2) {
      // Phase 2: Aggressive chase toward player inside the Core Arena (row >= 9)
      this.statusLabel.setText(`GUARDIAN PHASE 2 [HP ${this.hp}/${this.maxHp}]`);
      this.statusLabel.setColor('#f87171');

      if (playerY > TILE_SIZE * 8.5) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY);
        this.setVelocity(Math.cos(angle) * 95, Math.sin(angle) * 95);
      } else {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.homeX, this.homeY);
        if (Phaser.Math.Distance.Between(this.x, this.y, this.homeX, this.homeY) > 12) {
          this.setVelocity(Math.cos(angle) * 80, Math.sin(angle) * 80);
        } else {
          this.setVelocity(0, 0);
        }
      }

      // Visual energy aura
      this.pulseRadius = (this.pulseRadius + delta * 0.08) % 75;
      this.pulseRingGraphics.lineStyle(2, 0xf43f5e, 1 - this.pulseRadius / 75);
      this.pulseRingGraphics.strokeCircle(this.x, this.y, 35 + this.pulseRadius);
    } else {
      // Phase 3: Core Exposed! Retreats to center, pulsing green vulnerable ring
      this.statusLabel.setText('CORE EXPOSED — HACK [3] OR PURGE TERMINAL!');
      this.statusLabel.setColor('#34d399');

      const distToCenter = Phaser.Math.Distance.Between(this.x, this.y, this.homeX, this.homeY);
      if (distToCenter > 10) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.homeX, this.homeY);
        this.setVelocity(Math.cos(angle) * 90, Math.sin(angle) * 90);
      } else {
        this.setVelocity(0, 0);
      }

      this.pulseRadius = (this.pulseRadius + delta * 0.06) % 60;
      this.pulseRingGraphics.lineStyle(2, 0x10b981, 0.8);
      this.pulseRingGraphics.strokeCircle(this.x, this.y, 44);
    }
  }
}
