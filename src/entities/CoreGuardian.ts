import Phaser from 'phaser';
import { BossConfig, TILE_SIZE } from '../config/levels';
import { AudioSystem } from '../systems/AudioSystem';
import { DecoyBeacon } from '../objects/DecoyBeacon';

export class CoreGuardian extends Phaser.Physics.Arcade.Sprite {
  private hp: number;
  private maxHp: number;
  private phase: 1 | 2 | 3 = 1;
  private surgeNodesRemaining: number = 2;
  private defeated: boolean = false;
  private awakened: boolean = false;
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
    body.setSize(58, 58);
    body.setOffset(13, 13);

    this.pulseRingGraphics = scene.add.graphics().setDepth(6);
    this.statusLabel = scene.add
      .text(startX, startY - 52, 'CORE GUARDIAN [PHASE 1: SURGE NODES]', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '10px',
        color: '#fbbf24',
        backgroundColor: '#090d16dd',
        padding: { x: 4, y: 2 }
      })
      .setOrigin(0.5)
      .setDepth(15);
  }

  public setPartiallyAwakened() {
    this.awakened = true;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.12,
      scaleY: 1.12,
      yoyo: true,
      duration: 240
    });
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

  public getSurgeNodesRemaining(): number {
    return this.surgeNodesRemaining;
  }

  public isDefeated(): boolean {
    return this.defeated;
  }

  public getStatusHint(): string {
    if (this.defeated) return 'SYSTEM CORE PURGE: 100% — GUARDIAN DEFEATED';
    if (this.phase === 1) {
      return `PHASE 1: Patrol Mode — Activate ${this.surgeNodesRemaining} SURGE NODE switch${
        this.surgeNodesRemaining === 1 ? '' : 'es'
      } in the Core Arena to drop Guardian Armor!`;
    }
    if (this.phase === 2) {
      return 'PHASE 2: Aggressive Mode — Use EMP Glove [2] or Glitch Pulse [4] near Guardian to overload its Core!';
    }
    return 'PHASE 3: SHIELD DOWN — Interact [E] / [3] Hack at the CORE PURGE TERMINAL to execute 100% Purge!';
  }

  public triggerSurgeNode(): boolean {
    if (this.defeated) return false;
    if (this.surgeNodesRemaining > 0) {
      this.surgeNodesRemaining--;
    }
    this.hp = Math.max(2, this.hp - 1);
    this.stunTimer = 1400;
    AudioSystem.playBossHit();

    if (this.surgeNodesRemaining <= 0 && this.phase === 1) {
      this.phase = 2;
      this.hp = 3;
    }

    this.playHitFlash();
    return true;
  }

  public takeAbilityDamage(source: 'EMP' | 'GLITCH' | 'HACK' | 'PURGE_TERMINAL'): {
    damaged: boolean;
    message: string;
  } {
    if (this.defeated) {
      return { damaged: false, message: 'Core Guardian already purged.' };
    }
    if (this.invulnTimer > 0) {
      return { damaged: false, message: 'Core Guardian recovering...' };
    }

    // Phase 1 requires Surge Nodes (or Purge Terminal)
    if (this.phase === 1 && source !== 'PURGE_TERMINAL') {
      this.stunTimer = 900;
      return {
        damaged: false,
        message: `Guardian Armor Locked! Step on ${this.surgeNodesRemaining} SURGE NODE switch(es) first!`
      };
    }

    // Phase 2 requires EMP or Glitch (or Purge Terminal)
    if (this.phase === 2) {
      this.hp = Math.max(1, this.hp - 1);
      this.invulnTimer = 850;
      this.stunTimer = 1500;
      AudioSystem.playBossHit();
      this.playHitFlash();

      if (this.hp <= 1) {
        this.phase = 3;
        this.setTexture('boss_vulnerable');
        return {
          damaged: true,
          message: 'GUARDIAN SHIELD DOWN! Interact [E] / [3] Hack with CORE PURGE TERMINAL!'
        };
      }
      return {
        damaged: true,
        message: `Guardian Core Overloaded! Hit once more with EMP [2] or Glitch [4]!`
      };
    }

    // Phase 3: Final Purge via Terminal or Hack
    if (this.phase === 3) {
      if (source === 'PURGE_TERMINAL' || source === 'HACK') {
        this.hp = 0;
        this.defeatGuardian();
        return {
          damaged: true,
          message: 'SYSTEM CORE PURGE: 100% — CORE GUARDIAN DEFEATED!'
        };
      }
      this.stunTimer = 1200;
      return {
        damaged: false,
        message: 'Core Shield Down! Use [E] or [3] Hack at the CORE PURGE TERMINAL to finish!'
      };
    }

    return { damaged: false, message: '' };
  }

  private playHitFlash() {
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.25, to: 1 },
      scaleX: { from: 1.18, to: 1 },
      scaleY: { from: 1.18, to: 1 },
      duration: 260
    });
  }

  private defeatGuardian() {
    this.defeated = true;
    this.setVelocity(0, 0);
    this.pulseRingGraphics.clear();
    this.statusLabel.setText('SYSTEM CORE PURGE: 100%');
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
      quantity: 34,
      emitting: false
    });
    particles.explode(34);

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

  public update(
    delta: number,
    playerX: number,
    playerY: number,
    activeDecoys: DecoyBeacon[] = []
  ) {
    if (this.defeated) return;

    this.statusLabel.setPosition(this.x, this.y - 52);

    if (this.invulnTimer > 0) {
      this.invulnTimer = Math.max(0, this.invulnTimer - delta);
    }

    if (this.stunTimer > 0) {
      this.stunTimer = Math.max(0, this.stunTimer - delta);
      this.setVelocity(0, 0);
      this.statusLabel.setText(`DISRUPTED [PHASE ${this.phase}]`);
      this.statusLabel.setColor('#38bdf8');
      return;
    }

    this.pulseRingGraphics.clear();

    // Check if briefly lured by Glitch Decoy in Phase 1 or 2
    let targetX = playerX;
    let targetY = playerY;
    activeDecoys.forEach((decoy) => {
      if (decoy.isActive() && Phaser.Math.Distance.Between(this.x, this.y, decoy.x, decoy.y) < 220) {
        targetX = decoy.x;
        targetY = decoy.y;
      }
    });

    if (this.phase === 1) {
      this.statusLabel.setText(
        `PHASE 1: PATROL [SURGE NODES LEFT: ${this.surgeNodesRemaining}]`
      );
      this.statusLabel.setColor('#fbbf24');

      const speed = this.awakened ? 95 : 78;
      if (this.x > this.homeX + TILE_SIZE * 4.2) this.patrolDir = -1;
      if (this.x < this.homeX - TILE_SIZE * 4.2) this.patrolDir = 1;
      this.setVelocity(this.patrolDir * speed, 0);

      this.pulseRingGraphics.lineStyle(2, 0xf59e0b, 0.45);
      this.pulseRingGraphics.strokeCircle(this.x, this.y, 44);
    } else if (this.phase === 2) {
      this.statusLabel.setText(`PHASE 2: AGGRESSIVE [USE EMP [2] / GLITCH [4]]`);
      this.statusLabel.setColor('#f87171');

      if (targetY > TILE_SIZE * 8.5) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        this.setVelocity(Math.cos(angle) * 94, Math.sin(angle) * 94);
      } else {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.homeX, this.homeY);
        if (Phaser.Math.Distance.Between(this.x, this.y, this.homeX, this.homeY) > 12) {
          this.setVelocity(Math.cos(angle) * 80, Math.sin(angle) * 80);
        } else {
          this.setVelocity(0, 0);
        }
      }

      this.pulseRadius = (this.pulseRadius + delta * 0.08) % 75;
      this.pulseRingGraphics.lineStyle(2, 0xf43f5e, 1 - this.pulseRadius / 75);
      this.pulseRingGraphics.strokeCircle(this.x, this.y, 35 + this.pulseRadius);
    } else {
      this.statusLabel.setText('PHASE 3: SHIELD DOWN — HACK CORE PURGE TERMINAL!');
      this.statusLabel.setColor('#34d399');

      const distToCenter = Phaser.Math.Distance.Between(this.x, this.y, this.homeX, this.homeY);
      if (distToCenter > 10) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.homeX, this.homeY);
        this.setVelocity(Math.cos(angle) * 90, Math.sin(angle) * 90);
      } else {
        this.setVelocity(0, 0);
      }

      this.pulseRadius = (this.pulseRadius + delta * 0.06) % 60;
      this.pulseRingGraphics.lineStyle(2.5, 0x10b981, 0.85);
      this.pulseRingGraphics.strokeCircle(this.x, this.y, 46);
    }
  }
}
