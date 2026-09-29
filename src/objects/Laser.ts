import Phaser from 'phaser';
import { LaserConfig, TILE_SIZE } from '../config/levels';

export class Laser {
  public readonly laserId: string;
  private scene: Phaser.Scene;
  private beamZone: Phaser.GameObjects.Zone;
  private beamGraphics: Phaser.GameObjects.Graphics;
  private emitterSprite: Phaser.GameObjects.Rectangle;
  private isActive: boolean;
  private permDisabled: boolean = false;
  private empDisableTimer: number = 0;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private pulsePhase: number = 0;

  constructor(scene: Phaser.Scene, config: LaserConfig) {
    this.scene = scene;
    this.laserId = config.id;
    this.isActive = config.initiallyActive;

    const startX = config.col * TILE_SIZE;
    const startY = config.row * TILE_SIZE;

    if (config.direction === 'horizontal') {
      this.width = config.lengthTiles * TILE_SIZE;
      this.height = 14;
      this.x = startX + this.width / 2;
      this.y = startY + TILE_SIZE / 2;
    } else {
      this.width = 14;
      this.height = config.lengthTiles * TILE_SIZE;
      this.x = startX + TILE_SIZE / 2;
      this.y = startY + this.height / 2;
    }

    this.emitterSprite = scene.add
      .rectangle(startX + TILE_SIZE / 2, startY + TILE_SIZE / 2, 16, 16, 0x334155)
      .setStrokeStyle(2, 0xef4444)
      .setDepth(8);

    this.beamGraphics = scene.add.graphics().setDepth(7);

    this.beamZone = scene.add.zone(this.x, this.y, this.width, this.height);
    scene.physics.add.existing(this.beamZone, true);

    this.drawBeam();
  }

  public getZone(): Phaser.GameObjects.Zone {
    return this.beamZone;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  public isDangerous(): boolean {
    return this.isActive && !this.permDisabled && this.empDisableTimer <= 0;
  }

  public disablePermanently() {
    this.permDisabled = true;
    this.isActive = false;
    this.emitterSprite.setStrokeStyle(2, 0x10b981);
    this.drawBeam();
  }

  public toggle() {
    if (this.permDisabled) {
      this.permDisabled = false;
      this.isActive = true;
    } else {
      this.disablePermanently();
    }
    this.drawBeam();
  }

  public disableTemporarily(durationMs: number) {
    this.empDisableTimer = Math.max(this.empDisableTimer, durationMs);
    this.drawBeam();
  }

  public update(delta: number) {
    if (this.empDisableTimer > 0) {
      this.empDisableTimer = Math.max(0, this.empDisableTimer - delta);
    }
    this.pulsePhase += delta * 0.01;
    this.drawBeam();
  }

  private drawBeam() {
    this.beamGraphics.clear();
    if (!this.isDangerous()) {
      // Draw faint dotted guide line when disabled
      this.beamGraphics.lineStyle(1, 0x334155, 0.4);
      this.beamGraphics.strokeRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
      return;
    }

    const alpha = 0.65 + Math.sin(this.pulsePhase) * 0.2;
    this.beamGraphics.fillStyle(0xef4444, alpha * 0.45);
    this.beamGraphics.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    // Inner hot laser core
    const innerW = this.width > this.height ? this.width : 4;
    const innerH = this.height > this.width ? this.height : 4;
    this.beamGraphics.fillStyle(0xfca5a5, 0.95);
    this.beamGraphics.fillRect(
      this.x - innerW / 2,
      this.y - innerH / 2,
      innerW,
      innerH
    );
  }
}
