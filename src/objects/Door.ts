import Phaser from 'phaser';
import { DoorConfig, TILE_SIZE } from '../config/levels';
import { AudioSystem } from '../systems/AudioSystem';

export class Door extends Phaser.Physics.Arcade.Sprite {
  public readonly doorId: string;
  private isOpenState: boolean = false;
  private statusText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: DoorConfig) {
    const x = config.col * TILE_SIZE + TILE_SIZE / 2;
    const y = config.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, config.initiallyOpen ? 'door_open' : 'door_locked');

    this.doorId = config.id;
    this.isOpenState = Boolean(config.initiallyOpen);

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body
    this.setDepth(5);

    this.statusText = scene.add
      .text(x, y - 20, this.isOpenState ? 'OPEN' : 'LOCKED', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '9px',
        color: this.isOpenState ? '#34d399' : '#f87171',
        backgroundColor: '#090d16cc',
        padding: { x: 2, y: 1 }
      })
      .setOrigin(0.5)
      .setDepth(12);

    this.applyState(this.isOpenState, true);
  }

  public open(silent: boolean = false) {
    if (this.isOpenState) return;
    this.applyState(true, silent);
  }

  public close(silent: boolean = false) {
    if (!this.isOpenState) return;
    this.applyState(false, silent);
  }

  public toggle(silent: boolean = false) {
    this.applyState(!this.isOpenState, silent);
  }

  public isOpen(): boolean {
    return this.isOpenState;
  }

  private applyState(open: boolean, silent: boolean) {
    this.isOpenState = open;
    this.setTexture(open ? 'door_open' : 'door_locked');

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    if (body) {
      body.enable = !open;
    }

    this.statusText.setText(open ? 'OPEN' : 'LOCKED');
    this.statusText.setColor(open ? '#34d399' : '#f87171');

    if (!silent) {
      AudioSystem.playDoorOpen();
      this.scene.tweens.add({
        targets: this,
        alpha: { from: 0.4, to: 1 },
        duration: 180
      });
    }
  }
}
