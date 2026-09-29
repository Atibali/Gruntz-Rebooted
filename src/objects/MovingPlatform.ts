import Phaser from 'phaser';
import { PlatformConfig, TILE_SIZE } from '../config/levels';
import { AudioSystem } from '../systems/AudioSystem';

export class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
  public readonly platformId: string;
  public readonly gridCol: number;
  public readonly gridRow: number;
  private activeState: boolean;

  constructor(scene: Phaser.Scene, config: PlatformConfig) {
    const x = config.col * TILE_SIZE + TILE_SIZE / 2;
    const y = config.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, config.initiallyActive ? 'platform_active' : 'platform_inactive');

    this.platformId = config.id;
    this.gridCol = config.col;
    this.gridRow = config.row;
    this.activeState = config.initiallyActive;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(2);

    this.applyState(this.activeState, true);
  }

  public activate(silent: boolean = false) {
    if (this.activeState) return;
    this.applyState(true, silent);
  }

  public isBridgeActive(): boolean {
    return this.activeState;
  }

  private applyState(active: boolean, silent: boolean) {
    this.activeState = active;
    this.setTexture(active ? 'platform_active' : 'platform_inactive');

    // When bridge is INACTIVE over a void chasm, its static physics body blocks the player from falling in.
    // When bridge is ACTIVE, its static collider is disabled so the player can walk smoothly across it!
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    if (body) {
      body.enable = !active;
    }

    if (!silent && active) {
      AudioSystem.playDoorOpen();
      this.scene.tweens.add({
        targets: this,
        alpha: { from: 0.2, to: 1 },
        duration: 220
      });
    }
  }
}
