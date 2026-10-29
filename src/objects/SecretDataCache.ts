import Phaser from 'phaser';
import { GridPos, TILE_SIZE } from '../config/levels';
import { AudioSystem } from '../systems/AudioSystem';

export interface SecretDataCacheConfig {
  id?: string;
  col: number;
  row: number;
  lore: string;
}

export class SecretDataCache extends Phaser.Physics.Arcade.Sprite {
  private collected: boolean = false;
  private labelText: Phaser.GameObjects.Text;
  public readonly cacheId: string;
  public readonly secretLore: string;

  constructor(
    scene: Phaser.Scene,
    configOrPos: SecretDataCacheConfig | GridPos,
    id: string = 'secret_cache',
    lore: string = 'ARCHIVE LOG: Prime Core partition found!'
  ) {
    const col = 'col' in configOrPos ? configOrPos.col : 0;
    const row = 'row' in configOrPos ? configOrPos.row : 0;
    const x = col * TILE_SIZE + TILE_SIZE / 2;
    const y = row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, 'secret_data_cache');

    this.cacheId = 'id' in configOrPos && configOrPos.id ? configOrPos.id : id;
    this.secretLore = 'lore' in configOrPos && configOrPos.lore ? configOrPos.lore : lore;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(8);

    this.labelText = scene.add
      .text(x, y - 24, 'SECRET ARCHIVE', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '8px',
        color: '#d8b4fe',
        backgroundColor: '#3b0764dd',
        padding: { x: 3, y: 1 }
      })
      .setOrigin(0.5)
      .setDepth(13);

    scene.tweens.add({
      targets: this,
      y: y - 4,
      scaleX: 1.08,
      scaleY: 1.08,
      yoyo: true,
      repeat: -1,
      duration: 650,
      ease: 'Sine.easeInOut'
    });
  }

  public isCollected(): boolean {
    return this.collected;
  }

  public getLore(): string {
    return this.secretLore;
  }

  public update(_delta?: number) {
    // Pulsing or animated effects if desired
  }

  public collect(onCollected?: () => void): boolean {
    if (this.collected) return false;
    this.collected = true;

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    if (body) {
      body.enable = false;
    }

    if (this.labelText && this.labelText.active) {
      this.labelText.destroy();
    }
    AudioSystem.playSecretCacheCollect();

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 250,
      onComplete: () => {
        this.destroy();
      }
    });

    if (onCollected) {
      onCollected();
    }
    return true;
  }
}
