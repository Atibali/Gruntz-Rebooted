import Phaser from 'phaser';
import { TILE_SIZE } from '../config/levels';
import { AudioSystem } from '../systems/AudioSystem';

export interface CorruptedWallConfig {
  id: string;
  col: number;
  row: number;
}

export class CorruptedWall extends Phaser.Physics.Arcade.Sprite {
  public readonly wallId: string;
  private isBroken: boolean = false;
  private labelText: Phaser.GameObjects.Text;
  private promptBadge: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: CorruptedWallConfig) {
    const x = config.col * TILE_SIZE + TILE_SIZE / 2;
    const y = config.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, 'corrupted_wall');

    this.wallId = config.id;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(6);

    this.labelText = scene.add
      .text(x, y + 19, 'HAMMER WALL', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '8px',
        color: '#fbbf24',
        backgroundColor: '#090d16cc',
        padding: { x: 2, y: 1 }
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.promptBadge = scene.add
      .text(x, y - 26, '[SPACE / E] SMASH WALL', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '10px',
        color: '#fbbf24',
        backgroundColor: '#0f172aee',
        padding: { x: 4, y: 2 }
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setVisible(false);
  }

  public updatePrompt(nearby: boolean, hasHammer: boolean) {
    if (this.isBroken || !nearby) {
      this.promptBadge.setVisible(false);
      return;
    }
    this.promptBadge.setVisible(true);
    if (hasHammer) {
      this.promptBadge.setText('[SPACE / E] SMASH WALL');
      this.promptBadge.setColor('#34d399');
    } else {
      this.promptBadge.setText('NEEDS: DATA HAMMER');
      this.promptBadge.setColor('#f87171');
    }
  }

  public smash(): boolean {
    if (this.isBroken) return false;
    this.isBroken = true;

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    if (body) {
      body.enable = false;
    }

    this.labelText.setVisible(false);
    this.promptBadge.setVisible(false);
    AudioSystem.playHammerSmash();
    this.scene.cameras.main.shake(120, 0.005);

    const particles = this.scene.add.particles(this.x, this.y, 'particle_square', {
      speed: { min: 60, max: 160 },
      scale: { start: 1.3, end: 0 },
      lifespan: 420,
      tint: [0xf59e0b, 0xfbbf24, 0xe11d48],
      quantity: 18,
      emitting: false
    });
    particles.explode(18);
    this.scene.time.delayedCall(450, () => particles.destroy());

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0,
      duration: 150,
      onComplete: () => {
        this.setVisible(false);
      }
    });

    return true;
  }

  public getIsBroken(): boolean {
    return this.isBroken;
  }
}
