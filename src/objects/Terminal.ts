import Phaser from 'phaser';
import { TerminalConfig, TILE_SIZE } from '../config/levels';
import { AudioSystem } from '../systems/AudioSystem';

export class Terminal extends Phaser.Physics.Arcade.Sprite {
  public readonly terminalId: string;
  public readonly targetIds: string[];
  public readonly hackMessage: string;
  public readonly isBossPurge: boolean;
  private stateType: 'OFFLINE' | 'HACKING' | 'ONLINE' = 'OFFLINE';
  private labelText: Phaser.GameObjects.Text;
  private promptBadge: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: TerminalConfig) {
    const x = config.col * TILE_SIZE + TILE_SIZE / 2;
    const y = config.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, 'terminal_offline');

    this.terminalId = config.id;
    this.targetIds = config.targetIds;
    this.hackMessage = config.message;
    this.isBossPurge = Boolean(config.isBossPurge);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(6);

    this.labelText = scene.add
      .text(x, y + 22, `${config.label}: OFFLINE`, {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '9px',
        color: '#38bdf8',
        backgroundColor: '#090d16dd',
        padding: { x: 3, y: 1 }
      })
      .setOrigin(0.5)
      .setDepth(12);

    this.promptBadge = scene.add
      .text(x, y - 26, '[E] / [3] HACK', {
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

  public setPlayerNearby(nearby: boolean) {
    if (this.stateType === 'ONLINE' && !this.isBossPurge) {
      this.promptBadge.setVisible(false);
      return;
    }
    this.promptBadge.setVisible(nearby);
  }

  public canHack(): boolean {
    if (this.isBossPurge) return true;
    return this.stateType === 'OFFLINE';
  }

  public hack(onComplete: (targetIds: string[], message: string, isBossPurge: boolean) => void): boolean {
    if (!this.canHack()) return false;

    this.stateType = 'HACKING';
    this.labelText.setText('HACKING...');
    this.labelText.setColor('#fbbf24');
    AudioSystem.playHack();

    // Instant responsive trigger with visual flash
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.14,
      scaleY: 1.14,
      yoyo: true,
      duration: 130,
      onComplete: () => {
        if (!this.isBossPurge) {
          this.stateType = 'ONLINE';
          this.setTexture('terminal_online');
          this.labelText.setText('ONLINE');
          this.labelText.setColor('#34d399');
          this.promptBadge.setVisible(false);
        } else {
          this.stateType = 'OFFLINE';
          this.labelText.setText('PURGE READY');
          this.labelText.setColor('#34d399');
        }
      }
    });

    onComplete(this.targetIds, this.hackMessage, this.isBossPurge);
    return true;
  }

  public isOnline(): boolean {
    return this.stateType === 'ONLINE';
  }
}
