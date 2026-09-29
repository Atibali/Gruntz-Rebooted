import Phaser from 'phaser';
import { GridPos, TILE_SIZE } from '../config/levels';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private shieldGraphics: Phaser.GameObjects.Graphics;
  private walkAnimTimer: number = 0;
  private walkFrame: number = 0;
  private shieldActive: boolean = false;
  private shieldAngle: number = 0;
  private externalDir: { x: number; y: number } = { x: 0, y: 0 };
  public readonly moveSpeed: number = 178;

  constructor(scene: Phaser.Scene, startPos: GridPos) {
    const x = startPos.col * TILE_SIZE + TILE_SIZE / 2;
    const y = startPos.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, 'player_idle');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.setCollideWorldBounds(true);

    // Compact hitbox for smooth corridor navigation
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 24);
    body.setOffset(8, 10);

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      };
    }

    this.shieldGraphics = scene.add.graphics().setDepth(15);
  }

  public setExternalDirection(dx: number, dy: number) {
    this.externalDir = { x: dx, y: dy };
  }

  public setShieldActive(active: boolean) {
    this.shieldActive = active;
    if (!active) {
      this.shieldGraphics.clear();
    }
  }

  public isShielded(): boolean {
    return this.shieldActive;
  }

  public update(delta: number) {
    let vx = this.externalDir.x;
    let vy = this.externalDir.y;

    if (this.cursors && this.wasd) {
      if (this.cursors.left.isDown || this.wasd.A.isDown) {
        vx = -1;
      } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
        vx = 1;
      }

      if (this.cursors.up.isDown || this.wasd.W.isDown) {
        vy = -1;
      } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
        vy = 1;
      }
    }

    if (vx !== 0 && vy !== 0) {
      const norm = Math.SQRT1_2;
      vx *= norm;
      vy *= norm;
    }

    this.setVelocity(vx * this.moveSpeed, vy * this.moveSpeed);

    // Walk frame animation
    if (vx !== 0 || vy !== 0) {
      this.walkAnimTimer += delta;
      if (this.walkAnimTimer >= 130) {
        this.walkAnimTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 2;
        this.setTexture(this.walkFrame === 0 ? 'player_walk1' : 'player_walk2');
      }
    } else {
      this.setTexture('player_idle');
    }

    // Draw circular energy shield if active
    this.shieldGraphics.clear();
    if (this.shieldActive) {
      this.shieldAngle += delta * 0.006;
      this.shieldGraphics.lineStyle(2.5, 0x38bdf8, 0.9);
      this.shieldGraphics.strokeCircle(this.x, this.y, 24);
      this.shieldGraphics.fillStyle(0x38bdf8, 0.18);
      this.shieldGraphics.fillCircle(this.x, this.y, 24);

      // Orbiting energy nodes
      for (let i = 0; i < 3; i++) {
        const a = this.shieldAngle + (i * Math.PI * 2) / 3;
        const nx = this.x + Math.cos(a) * 24;
        const ny = this.y + Math.sin(a) * 24;
        this.shieldGraphics.fillStyle(0x7dd3fc, 1);
        this.shieldGraphics.fillCircle(nx, ny, 3);
      }
    }
  }
}
