import Phaser from 'phaser';
import { AssetGenerator } from '../systems/AssetGenerator';
import { gameEvents } from '../systems/GameEvents';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public create() {
    AssetGenerator.generateAll(this);
    gameEvents.emit('boot-ready');
    this.scene.start('Level1Scene');
  }
}
