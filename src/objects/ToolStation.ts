import Phaser from 'phaser';
import { TILE_SIZE } from '../config/levels';
import { ToolType } from '../systems/GameEvents';

export interface ToolStationConfig {
  id: string;
  col: number;
  row: number;
  availableTools: ToolType[];
  label?: string;
}

export class ToolStation extends Phaser.Physics.Arcade.Sprite {
  public readonly stationId: string;
  public readonly availableTools: ToolType[];
  private labelText: Phaser.GameObjects.Text;
  private promptBadge: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: ToolStationConfig) {
    const x = config.col * TILE_SIZE + TILE_SIZE / 2;
    const y = config.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, 'tool_station');

    this.stationId = config.id;
    this.availableTools = config.availableTools;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(6);

    const toolsShort = config.availableTools.join('·');
    this.labelText = scene.add
      .text(x, y + 23, `TOOL STATION [${toolsShort}]`, {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '9px',
        color: '#38bdf8',
        backgroundColor: '#090d16dd',
        padding: { x: 3, y: 1 }
      })
      .setOrigin(0.5)
      .setDepth(12);

    this.promptBadge = scene.add
      .text(x, y - 27, '[E] USE TOOL STATION', {
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
    this.promptBadge.setVisible(nearby);
  }

  public playDispenseAnimation() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.15,
      scaleY: 1.15,
      yoyo: true,
      duration: 140
    });
  }
}
