import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { AudioSystem } from './AudioSystem';

export class HealthSystem {
  private scene: Phaser.Scene;
  private player: Player;
  private hp: number = 3;
  private readonly maxHp: number = 3;
  private invulnTimer: number = 0;
  private onDeath: () => void;
  private onDamageToast: (msg: string) => void;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    onDeath: () => void,
    onDamageToast: (msg: string) => void
  ) {
    this.scene = scene;
    this.player = player;
    this.onDeath = onDeath;
    this.onDamageToast = onDamageToast;
  }

  public getHp(): number {
    return this.hp;
  }

  public getMaxHp(): number {
    return this.maxHp;
  }

  public isInvulnerable(): boolean {
    return this.invulnTimer > 0 || this.player.isShielded();
  }

  public damage(sourceName: string): boolean {
    if (this.hp <= 0) return false;

    if (this.player.isShielded()) {
      return false;
    }

    if (this.invulnTimer > 0) {
      return false;
    }

    this.hp = Math.max(0, this.hp - 1);
    this.invulnTimer = 1300;
    AudioSystem.playDamage();
    this.scene.cameras.main.shake(160, 0.008);
    this.onDamageToast(`Integrity Hit by ${sourceName}! (${this.hp}/${this.maxHp} HP)`);

    // Flash player sprite during invulnerability
    this.scene.tweens.add({
      targets: this.player,
      alpha: { from: 0.25, to: 1 },
      duration: 110,
      repeat: 5,
      yoyo: true,
      onComplete: () => {
        this.player.setAlpha(1);
      }
    });

    if (this.hp <= 0) {
      this.onDeath();
    }

    return true;
  }

  public update(delta: number) {
    if (this.invulnTimer > 0) {
      this.invulnTimer = Math.max(0, this.invulnTimer - delta);
    }
  }
}
