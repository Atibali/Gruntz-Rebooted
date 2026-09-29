import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { SecurityDrone } from '../entities/SecurityDrone';
import { GlitchCreature } from '../entities/GlitchCreature';
import { CoreGuardian } from '../entities/CoreGuardian';
import { Laser } from '../objects/Laser';
import { Hazard } from '../objects/Hazard';
import { Terminal } from '../objects/Terminal';
import { AbilityStatus } from './GameEvents';
import { AudioSystem } from './AudioSystem';

export class AbilitySystem {
  private scene: Phaser.Scene;
  private player: Player;
  private fxGraphics: Phaser.GameObjects.Graphics;

  // Cooldowns & active timers in ms
  private shieldActiveMs: number = 0;
  private shieldCooldownMs: number = 0;
  private readonly SHIELD_DURATION = 3000;
  private readonly SHIELD_COOLDOWN = 6000;

  private empCooldownMs: number = 0;
  private readonly EMP_COOLDOWN = 5000;
  private readonly EMP_RADIUS = 190;

  private hackCooldownMs: number = 0;
  private readonly HACK_COOLDOWN = 2500;
  private readonly HACK_RANGE = 115;

  private glitchCooldownMs: number = 0;
  private readonly GLITCH_COOLDOWN = 4000;
  private readonly GLITCH_RADIUS = 165;

  private onToast: (msg: string) => void;

  constructor(scene: Phaser.Scene, player: Player, onToast: (msg: string) => void) {
    this.scene = scene;
    this.player = player;
    this.onToast = onToast;
    this.fxGraphics = scene.add.graphics().setDepth(16);
  }

  public useShield(): boolean {
    if (this.shieldCooldownMs > 0) return false;
    this.shieldActiveMs = this.SHIELD_DURATION;
    this.shieldCooldownMs = this.SHIELD_COOLDOWN;
    this.player.setShieldActive(true);
    AudioSystem.playShield();
    this.onToast('SHIELD ACTIVE (3.0s) — Immune to Lasers, Traps & Enemies');
    return true;
  }

  public useEmp(
    drones: SecurityDrone[],
    glitches: GlitchCreature[],
    lasers: Laser[],
    hazards: Hazard[],
    boss?: CoreGuardian
  ): boolean {
    if (this.empCooldownMs > 0) return false;
    this.empCooldownMs = this.EMP_COOLDOWN;
    AudioSystem.playEmp();

    const px = this.player.x;
    const py = this.player.y;
    let affected = 0;

    drones.forEach((drone) => {
      if (Phaser.Math.Distance.Between(px, py, drone.x, drone.y) <= this.EMP_RADIUS) {
        drone.disableWithEmp(4500);
        affected++;
      }
    });

    glitches.forEach((glitch) => {
      if (Phaser.Math.Distance.Between(px, py, glitch.x, glitch.y) <= this.EMP_RADIUS) {
        glitch.disableWithEmp(4000);
        affected++;
      }
    });

    lasers.forEach((laser) => {
      const pos = laser.getPosition();
      if (Phaser.Math.Distance.Between(px, py, pos.x, pos.y) <= this.EMP_RADIUS + 36) {
        laser.disableTemporarily(4500);
        affected++;
      }
    });

    hazards.forEach((hazard) => {
      if (Phaser.Math.Distance.Between(px, py, hazard.x, hazard.y) <= this.EMP_RADIUS) {
        hazard.disableTemporarily(4500);
        affected++;
      }
    });

    if (
      boss &&
      !boss.isDefeated() &&
      Phaser.Math.Distance.Between(px, py, boss.x, boss.y) <= this.EMP_RADIUS + 25
    ) {
      if (boss.takeDamage(1, 'EMP Overload')) {
        affected++;
      }
    }

    this.spawnExpandingRing(px, py, this.EMP_RADIUS, 0x38bdf8);
    this.onToast(
      affected > 0
        ? `EMP PULSE — Disabled ${affected} Security System${affected > 1 ? 's' : ''}!`
        : 'EMP PULSE — No Electronics in Range'
    );
    return true;
  }

  public useHack(
    terminals: Terminal[],
    onTerminalHack: (terminal: Terminal) => void,
    boss?: CoreGuardian
  ): boolean {
    if (this.hackCooldownMs > 0) return false;

    const px = this.player.x;
    const py = this.player.y;

    // Find closest hackable terminal within range
    let closestTerm: Terminal | undefined;
    let minDist = this.HACK_RANGE;

    terminals.forEach((t) => {
      const d = Phaser.Math.Distance.Between(px, py, t.x, t.y);
      if (d <= minDist && t.canHack()) {
        minDist = d;
        closestTerm = t;
      }
    });

    if (closestTerm) {
      this.hackCooldownMs = this.HACK_COOLDOWN;
      this.drawBeamEffect(px, py, closestTerm.x, closestTerm.y, 0x10b981);
      onTerminalHack(closestTerm);
      return true;
    }

    // Also allow hacking the Core Guardian directly when its Core is exposed (Phase 3) or close
    if (
      boss &&
      !boss.isDefeated() &&
      Phaser.Math.Distance.Between(px, py, boss.x, boss.y) <= this.HACK_RANGE + 55
    ) {
      this.hackCooldownMs = this.HACK_COOLDOWN;
      AudioSystem.playHack();
      this.drawBeamEffect(px, py, boss.x, boss.y, 0x10b981);
      boss.takeDamage(1, 'Direct Cyber Hack');
      this.onToast('DIRECT HACK EXECUTED ON CORE GUARDIAN!');
      return true;
    }

    this.onToast('Move closer to an Offline Terminal to use [3] Hack / [E]');
    return false;
  }

  public useGlitchPulse(
    drones: SecurityDrone[],
    glitches: GlitchCreature[],
    hazards: Hazard[],
    boss?: CoreGuardian
  ): boolean {
    if (this.glitchCooldownMs > 0) return false;
    this.glitchCooldownMs = this.GLITCH_COOLDOWN;
    AudioSystem.playGlitchPulse();

    const px = this.player.x;
    const py = this.player.y;
    let disrupted = 0;

    glitches.forEach((g) => {
      if (Phaser.Math.Distance.Between(px, py, g.x, g.y) <= this.GLITCH_RADIUS) {
        g.stunAndReverse(4200);
        disrupted++;
      }
    });

    drones.forEach((d) => {
      if (Phaser.Math.Distance.Between(px, py, d.x, d.y) <= this.GLITCH_RADIUS) {
        d.disruptWithGlitch(3500);
        disrupted++;
      }
    });

    hazards.forEach((h) => {
      if (Phaser.Math.Distance.Between(px, py, h.x, h.y) <= this.GLITCH_RADIUS) {
        h.disableTemporarily(3500);
        disrupted++;
      }
    });

    if (
      boss &&
      !boss.isDefeated() &&
      Phaser.Math.Distance.Between(px, py, boss.x, boss.y) <= this.GLITCH_RADIUS + 25
    ) {
      if (boss.takeDamage(1, 'Glitch Pulse')) {
        disrupted++;
      }
    }

    this.spawnExpandingRing(px, py, this.GLITCH_RADIUS, 0xf43f5e);
    this.onToast(
      disrupted > 0
        ? `GLITCH PULSE — Disrupted & Reversed ${disrupted} Target${disrupted > 1 ? 's' : ''}!`
        : 'GLITCH PULSE — No Targets in Range'
    );
    return true;
  }

  private spawnExpandingRing(x: number, y: number, maxRadius: number, color: number) {
    const circle = this.scene.add.circle(x, y, 16, color, 0.25).setDepth(15);
    circle.setStrokeStyle(3, color, 0.95);
    this.scene.tweens.add({
      targets: circle,
      radius: maxRadius,
      alpha: 0,
      duration: 340,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        circle.setStrokeStyle(3, color, circle.alpha);
      },
      onComplete: () => circle.destroy()
    });
  }

  private drawBeamEffect(x1: number, y1: number, x2: number, y2: number, color: number) {
    this.fxGraphics.clear();
    this.fxGraphics.lineStyle(4, color, 0.95);
    this.fxGraphics.lineBetween(x1, y1, x2, y2);
    this.scene.time.delayedCall(220, () => {
      this.fxGraphics.clear();
    });
  }

  public update(delta: number) {
    if (this.shieldActiveMs > 0) {
      this.shieldActiveMs = Math.max(0, this.shieldActiveMs - delta);
      if (this.shieldActiveMs <= 0) {
        this.player.setShieldActive(false);
      }
    }
    if (this.shieldCooldownMs > 0) {
      this.shieldCooldownMs = Math.max(0, this.shieldCooldownMs - delta);
    }
    if (this.empCooldownMs > 0) {
      this.empCooldownMs = Math.max(0, this.empCooldownMs - delta);
    }
    if (this.hackCooldownMs > 0) {
      this.hackCooldownMs = Math.max(0, this.hackCooldownMs - delta);
    }
    if (this.glitchCooldownMs > 0) {
      this.glitchCooldownMs = Math.max(0, this.glitchCooldownMs - delta);
    }
  }

  public getStatusList(): AbilityStatus[] {
    return [
      {
        id: 'shield',
        key: '1',
        name: 'Shield',
        cooldownRemaining: Math.ceil(this.shieldCooldownMs / 100) / 10,
        cooldownTotal: this.SHIELD_COOLDOWN / 1000,
        activeRemaining: Math.ceil(this.shieldActiveMs / 100) / 10,
        isReady: this.shieldCooldownMs <= 0
      },
      {
        id: 'emp',
        key: '2',
        name: 'EMP',
        cooldownRemaining: Math.ceil(this.empCooldownMs / 100) / 10,
        cooldownTotal: this.EMP_COOLDOWN / 1000,
        activeRemaining: 0,
        isReady: this.empCooldownMs <= 0
      },
      {
        id: 'hack',
        key: '3',
        name: 'Hack',
        cooldownRemaining: Math.ceil(this.hackCooldownMs / 100) / 10,
        cooldownTotal: this.HACK_COOLDOWN / 1000,
        activeRemaining: 0,
        isReady: this.hackCooldownMs <= 0
      },
      {
        id: 'glitch',
        key: '4',
        name: 'Glitch',
        cooldownRemaining: Math.ceil(this.glitchCooldownMs / 100) / 10,
        cooldownTotal: this.GLITCH_COOLDOWN / 1000,
        activeRemaining: 0,
        isReady: this.glitchCooldownMs <= 0
      }
    ];
  }
}
