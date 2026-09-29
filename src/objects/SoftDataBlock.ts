import Phaser from 'phaser';
import { TILE_SIZE } from '../config/levels';
import { AudioSystem } from '../systems/AudioSystem';

export interface SoftDataConfig {
  id: string;
  col: number;
  row: number;
}

export class SoftDataBlock extends Phaser.Physics.Arcade.Sprite {
  public readonly blockId: string;
  private isDug: boolean = false;
  private labelText: Phaser.GameObjects.Text;
  private promptBadge: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: SoftDataConfig) {
    const x = config.col * TILE_SIZE + TILE_SIZE / 2;
    const y = config.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, 'soft_data_block');

    this.blockId = config.id;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(6);

    this.labelText = scene.add
      .text(x, y + 19, 'SOFT DATA', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '8px',
        color: '#34d399',
        backgroundColor: '#090d16cc',
        padding: { x: 2, y: 1 }
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.promptBadge = scene.add
      .text(x, y - 26, '[SPACE / E] DIG SOFT DATA', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '10px',
        color: '#34d399',
        backgroundColor: '#0f172aee',
        padding: { x: 4, y: 2 }
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setVisible(false);
  }

  public updatePrompt(nearby: boolean, hasShovel: boolean) {
    if (this.isDug || !nearby) {
      this.promptBadge.setVisible(false);
      return;
    }
    this.promptBadge.setVisible(true);
    if (hasShovel) {
      this.promptBadge.setText('[SPACE / E] DIG SOFT DATA');
      this.promptBadge.setColor('#34d399');
    } else {
      this.promptBadge.setText('NEEDS: VOID SHOVEL');
      this.promptBadge.setColor('#f87171');
    }
  }

  public dig(): boolean {
    if (this.isDug) return false;
    this.isDug = true;

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    if (body) {
      body.enable = false;
    }

    this.labelText.setVisible(false);
    this.promptBadge.setVisible(false);
    AudioSystem.playShovelDig();

    const particles = this.scene.add.particles(this.x, this.y, 'particle_square', {
      speed: { min: 45, max: 120 },
      scale: { start: 1.1, end: 0 },
      lifespan: 380,
      tint: [0x10b981, 0x34d399, 0x38bdf8],
      quantity: 14,
      emitting: false
    });
    particles.explode(14);
    this.scene.time.delayedCall(420, () => particles.destroy());

    this.scene.tweens.add({
      targets: this,
      scaleX: 0.4,
      scaleY: 0.4,
      alpha: 0,
      duration: 170,
      onComplete: () => {
        this.setVisible(false);
      }
    });

    return true;
  }

  public getIsDug(): boolean {
    return this.isDug;
  }
}
