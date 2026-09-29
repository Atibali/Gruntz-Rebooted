import Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';

export class DecoyBeacon extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  private ringGraphics: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text;
  private remainingMs: number = 6500;
  private pulsePhase: number = 0;
  private activeState: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.ringGraphics = scene.add.graphics();
    this.sprite = scene.add.sprite(0, 0, 'decoy_beacon');
    this.labelText = scene.add
      .text(0, -24, 'DECOY SIGNAL [6.5s]', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '9px',
        color: '#38bdf8',
        backgroundColor: '#090d16dd',
        padding: { x: 3, y: 1 }
      })
      .setOrigin(0.5);

    this.add([this.ringGraphics, this.sprite, this.labelText]);
    this.setDepth(11);
    scene.add.existing(this);

    AudioSystem.playDecoyDeploy();

    scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.12,
      scaleY: 1.12,
      yoyo: true,
      repeat: -1,
      duration: 280
    });
  }

  public isActive(): boolean {
    return this.activeState && this.remainingMs > 0;
  }

  public update(delta: number) {
    if (!this.activeState) return;

    this.remainingMs = Math.max(0, this.remainingMs - delta);
    this.pulsePhase += delta * 0.008;

    this.labelText.setText(`DECOY [${(this.remainingMs / 1000).toFixed(1)}s]`);

    this.ringGraphics.clear();
    const r = 20 + (this.pulsePhase % 1) * 180;
    const alpha = Math.max(0.08, 0.55 * (1 - (r - 20) / 180));
    this.ringGraphics.lineStyle(2, 0x38bdf8, alpha);
    this.ringGraphics.strokeCircle(0, 0, r);
    this.ringGraphics.lineStyle(1, 0xf43f5e, 0.25);
    this.ringGraphics.strokeCircle(0, 0, 220);

    if (this.remainingMs <= 0) {
      this.activeState = false;
      this.destroy();
    }
  }
}
