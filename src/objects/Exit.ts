import Phaser from 'phaser';
import { GridPos, TILE_SIZE } from '../config/levels';

export class Exit extends Phaser.Physics.Arcade.Sprite {
  private unlocked: boolean = false;
  private labelText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, pos: GridPos, isFinalCore: boolean = false) {
    const x = pos.col * TILE_SIZE + TILE_SIZE / 2;
    const y = pos.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, 'exit_locked');

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(4);

    this.labelText = scene.add
      .text(x, y - 32, isFinalCore ? 'SYSTEM CORE: LOCKED' : 'EXIT: LOCKED', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '10px',
        color: '#f87171',
        backgroundColor: '#090d16dd',
        padding: { x: 4, y: 2 }
      })
      .setOrigin(0.5)
      .setDepth(14);
  }

  public setUnlocked(unlocked: boolean, isFinalCore: boolean = false) {
    if (this.unlocked === unlocked) return;
    this.unlocked = unlocked;
    this.setTexture(unlocked ? 'exit_unlocked' : 'exit_locked');
    this.labelText.setText(
      unlocked
        ? isFinalCore
          ? 'SYSTEM CORE: READY'
          : 'EXIT: UNLOCKED'
        : isFinalCore
        ? 'SYSTEM CORE: LOCKED'
        : 'EXIT: LOCKED'
    );
    this.labelText.setColor(unlocked ? '#34d399' : '#f87171');

    if (unlocked) {
      this.scene.tweens.add({
        targets: this,
        angle: 360,
        duration: 4000,
        repeat: -1
      });
    }
  }

  public isUnlocked(): boolean {
    return this.unlocked;
  }
}
