import Phaser from 'phaser';
import { SwitchConfig, TILE_SIZE } from '../config/levels';
import { AudioSystem } from '../systems/AudioSystem';

export class Switch extends Phaser.Physics.Arcade.Sprite {
  public readonly switchId: string;
  public readonly targetIds: string[];
  public readonly activationMessage: string;
  private isActivated: boolean = false;
  private labelText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: SwitchConfig) {
    const x = config.col * TILE_SIZE + TILE_SIZE / 2;
    const y = config.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, 'switch_off');

    this.switchId = config.id;
    this.targetIds = config.targetIds;
    this.activationMessage = config.message;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(3);

    this.labelText = scene.add
      .text(x, y + 20, config.label, {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '9px',
        color: '#fbbf24',
        backgroundColor: '#090d16cc',
        padding: { x: 2, y: 1 }
      })
      .setOrigin(0.5)
      .setDepth(10);
  }

  public activate(onTrigger: (targetIds: string[], message: string, switchId: string) => void): boolean {
    if (this.isActivated) return false;
    this.isActivated = true;
    this.setTexture('switch_on');
    this.labelText.setColor('#34d399');
    this.labelText.setText('ACTIVE');

    AudioSystem.playSwitch();

    this.scene.tweens.add({
      targets: this,
      scaleX: 0.86,
      scaleY: 0.86,
      yoyo: true,
      duration: 110
    });

    onTrigger(this.targetIds, this.activationMessage, this.switchId);
    return true;
  }

  public getActivated(): boolean {
    return this.isActivated;
  }
}
