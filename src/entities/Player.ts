import Phaser from 'phaser';
import { GridPos, TILE_SIZE } from '../config/levels';
import { ToolType } from '../systems/GameEvents';
import { AudioSystem } from '../systems/AudioSystem';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private shieldGraphics: Phaser.GameObjects.Graphics;
  private heldToolSprite: Phaser.GameObjects.Sprite;
  private walkAnimTimer: number = 0;
  private walkFrame: number = 0;
  private footstepTimer: number = 0;
  private shieldActive: boolean = false;
  private shieldAngle: number = 0;
  private activeTool: ToolType = 'NONE';
  private externalDir: { x: number; y: number } = { x: 0, y: 0 };
  public moveSpeed: number = 180;
  private isFacingLeft: boolean = false;

  constructor(scene: Phaser.Scene, startPos: GridPos) {
    const x = startPos.col * TILE_SIZE + TILE_SIZE / 2;
    const y = startPos.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, 'player_idle');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.setCollideWorldBounds(true);

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
    this.heldToolSprite = scene.add
      .sprite(x + 15, y + 2, 'tool_icon_HAMMER')
      .setDepth(14)
      .setVisible(false);
  }

  public setActiveTool(tool: ToolType) {
    this.activeTool = tool;
    if (tool === 'NONE') {
      this.heldToolSprite.setVisible(false);
    } else {
      this.heldToolSprite.setTexture(`tool_icon_${tool}`);
      this.heldToolSprite.setVisible(true);
      this.playToolPickupAnim();
    }
  }

  public getActiveTool(): ToolType {
    return this.activeTool;
  }

  public playToolPickupAnim() {
    this.scene.tweens.add({
      targets: [this, this.heldToolSprite],
      scaleX: 1.25,
      scaleY: 1.25,
      yoyo: true,
      duration: 150
    });
  }

  public playToolUseAnim() {
    if (this.heldToolSprite.visible) {
      const swingStart = this.isFacingLeft ? 35 : -35;
      const swingEnd = this.isFacingLeft ? -45 : 45;
      this.scene.tweens.add({
        targets: this.heldToolSprite,
        angle: { from: swingStart, to: swingEnd },
        scaleX: 1.4,
        scaleY: 1.4,
        yoyo: true,
        duration: 130,
        onComplete: () => {
          this.heldToolSprite.setAngle(0);
          this.heldToolSprite.setScale(1);
        }
      });
    }
  }

  public playHurtAnim() {
    this.setTexture('player_hurt');
    this.scene.time.delayedCall(120, () => {
      this.setTexture('player_idle');
    });
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

    // Directional facing
    if (vx < 0) {
      this.isFacingLeft = true;
      this.setFlipX(true);
    } else if (vx > 0) {
      this.isFacingLeft = false;
      this.setFlipX(false);
    }

    if (vx !== 0 || vy !== 0) {
      this.walkAnimTimer += delta;
      this.footstepTimer += delta;

      if (this.footstepTimer >= 260) {
        this.footstepTimer = 0;
        AudioSystem.playFootstep();
      }

      if (this.walkAnimTimer >= 120) {
        this.walkAnimTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 2;
        this.setTexture(this.walkFrame === 0 ? 'player_walk1' : 'player_walk2');
      }
    } else {
      this.setTexture('player_idle');
      this.footstepTimer = 220; // Ready for immediate step sound
    }

    // Held tool offsets based on facing
    const toolOffsetX = this.isFacingLeft ? -15 : 15;
    this.heldToolSprite.setPosition(this.x + toolOffsetX, this.y + 3);
    this.heldToolSprite.setFlipX(this.isFacingLeft);

    // Circular energy shield rendering
    this.shieldGraphics.clear();
    if (this.shieldActive) {
      this.shieldAngle += delta * 0.007;
      this.shieldGraphics.lineStyle(2.5, 0x38bdf8, 0.95);
      this.shieldGraphics.strokeCircle(this.x, this.y, 25);
      this.shieldGraphics.fillStyle(0x38bdf8, 0.2);
      this.shieldGraphics.fillCircle(this.x, this.y, 25);

      for (let i = 0; i < 3; i++) {
        const a = this.shieldAngle + (i * Math.PI * 2) / 3;
        const nx = this.x + Math.cos(a) * 25;
        const ny = this.y + Math.sin(a) * 25;
        this.shieldGraphics.fillStyle(0x7dd3fc, 1);
        this.shieldGraphics.fillCircle(nx, ny, 3.5);
      }
    }
  }
}
