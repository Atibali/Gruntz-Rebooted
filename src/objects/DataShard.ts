import Phaser from 'phaser';
import { GridPos, TILE_SIZE } from '../config/levels';
import { AudioSystem } from '../systems/AudioSystem';

export class DataShard extends Phaser.Physics.Arcade.Sprite {
  private collected: boolean = false;

  constructor(scene: Phaser.Scene, pos: GridPos) {
    const x = pos.col * TILE_SIZE + TILE_SIZE / 2;
    const y = pos.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, 'data_shard');

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(8);

    // Floating pulse animation
    scene.tweens.add({
      targets: this,
      y: y - 5,
      scaleX: 1.08,
      scaleY: 1.08,
      yoyo: true,
      repeat: -1,
      duration: 750,
      ease: 'Sine.easeInOut'
    });
  }

  public collect(onCollected: () => void): boolean {
    if (this.collected) return false;
    this.collected = true;

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    if (body) {
      body.enable = false;
    }

    AudioSystem.playDataCollect();

    // Particle burst
    const particles = this.scene.add.particles(this.x, this.y, 'particle_square', {
      speed: { min: 50, max: 140 },
      scale: { start: 1.1, end: 0 },
      lifespan: 420,
      tint: [0xfbbf24, 0x34d399, 0x38bdf8],
      quantity: 16,
      emitting: false
    });
    particles.explode(16);
    this.scene.time.delayedCall(500, () => particles.destroy());

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.6,
      scaleY: 1.6,
      alpha: 0,
      duration: 180,
      onComplete: () => {
        this.destroy();
      }
    });

    onCollected();
    return true;
  }
}
