import Phaser from 'phaser';
import { HazardConfig, TILE_SIZE } from '../config/levels';

export class Hazard extends Phaser.Physics.Arcade.Sprite {
  public readonly hazardId: string;
  private disableTimer: number = 0;
  private cycleTimer: number = 0;
  private cycleActive: boolean = true;

  constructor(scene: Phaser.Scene, config: HazardConfig) {
    const x = config.col * TILE_SIZE + TILE_SIZE / 2;
    const y = config.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, 'hazard_active');

    this.hazardId = config.id;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(3);
  }

  public disableTemporarily(durationMs: number) {
    this.disableTimer = Math.max(this.disableTimer, durationMs);
    this.setTexture('hazard_disabled');
  }

  public isDangerous(): boolean {
    return this.disableTimer <= 0 && this.cycleActive;
  }

  public update(delta: number) {
    if (this.disableTimer > 0) {
      this.disableTimer = Math.max(0, this.disableTimer - delta);
      this.setTexture('hazard_disabled');
      return;
    }

    this.cycleTimer += delta;
    // Cycles 2.4s active, 1.4s safe so observant players can time it OR use Shield/EMP
    const mod = this.cycleTimer % 3800;
    const shouldBeActive = mod < 2400;
    if (shouldBeActive !== this.cycleActive) {
      this.cycleActive = shouldBeActive;
      this.setTexture(this.cycleActive ? 'hazard_active' : 'hazard_disabled');
    }
  }
}
