import Phaser from 'phaser';
import { EnemyConfig, TILE_SIZE } from '../config/levels';
import { DecoyBeacon } from '../objects/DecoyBeacon';

export class GlitchCreature extends Phaser.Physics.Arcade.Sprite {
  public readonly enemyId: string;
  private homeX: number;
  private homeY: number;
  private stunTimer: number = 0;
  private reverseTimer: number = 0;
  private jitterTimer: number = 0;
  private statusLabel: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: EnemyConfig) {
    const startX = config.col * TILE_SIZE + TILE_SIZE / 2;
    const startY = config.row * TILE_SIZE + TILE_SIZE / 2;
    super(scene, startX, startY, 'enemy_glitch');

    this.enemyId = config.id;
    this.homeX = startX;
    this.homeY = startY;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(9);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(26, 26);
    body.setOffset(7, 7);

    this.statusLabel = scene.add
      .text(startX, startY - 24, 'GLITCH', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '9px',
        color: '#fb7185',
        backgroundColor: '#090d16cc',
        padding: { x: 2, y: 1 }
      })
      .setOrigin(0.5)
      .setDepth(14);
  }

  public stunAndReverse(durationMs: number = 4000) {
    this.stunTimer = 1500;
    this.reverseTimer = durationMs;
    this.setTexture('enemy_glitch_stunned');
    this.setVelocity(0, 0);
    this.statusLabel.setText('STUNNED');
    this.statusLabel.setColor('#38bdf8');
  }

  public disableWithEmp(durationMs: number = 4500) {
    this.stunTimer = Math.max(this.stunTimer, durationMs);
    this.setTexture('enemy_glitch_stunned');
    this.setVelocity(0, 0);
    this.statusLabel.setText('DISABLED');
    this.statusLabel.setColor('#38bdf8');
  }

  public isDangerous(): boolean {
    return this.stunTimer <= 0;
  }

  public update(
    delta: number,
    playerX: number,
    playerY: number,
    activeDecoys: DecoyBeacon[] = []
  ) {
    this.statusLabel.setPosition(this.x, this.y - 24);

    if (this.stunTimer > 0) {
      this.stunTimer = Math.max(0, this.stunTimer - delta);
      this.setVelocity(0, 0);
      if (this.stunTimer <= 0) {
        this.setTexture('enemy_glitch');
      }
      return;
    }

    if (this.reverseTimer > 0) {
      this.reverseTimer = Math.max(0, this.reverseTimer - delta);
    }

    // Check if lured by Glitch Decoy
    let nearestDecoy: DecoyBeacon | undefined;
    let nearestDecoyDist = 240;
    activeDecoys.forEach((decoy) => {
      if (!decoy.isActive()) return;
      const d = Phaser.Math.Distance.Between(this.x, this.y, decoy.x, decoy.y);
      if (d <= nearestDecoyDist) {
        nearestDecoyDist = d;
        nearestDecoy = decoy;
      }
    });

    if (nearestDecoy) {
      this.statusLabel.setText('LURED TO DECOY');
      this.statusLabel.setColor('#38bdf8');
      if (nearestDecoyDist > 20) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, nearestDecoy.x, nearestDecoy.y);
        this.setVelocity(Math.cos(angle) * 95, Math.sin(angle) * 95);
      } else {
        this.setVelocity(0, 0);
      }
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    const targetX = dist < 210 ? playerX : this.homeX;
    const targetY = dist < 210 ? playerY : this.homeY;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dirMult = this.reverseTimer > 0 ? -1 : 1;
    const speed = 92 * dirMult;

    this.statusLabel.setText(
      this.reverseTimer > 0 ? 'REVERSED' : dist < 210 ? 'SEEKING' : 'GLITCH'
    );
    this.statusLabel.setColor(this.reverseTimer > 0 ? '#fbbf24' : '#fb7185');

    if (Math.abs(dx) > Math.abs(dy)) {
      this.setVelocity(Math.sign(dx) * speed, Math.sign(dy) * speed * 0.35);
    } else if (Math.abs(dy) > 4) {
      this.setVelocity(Math.sign(dx) * speed * 0.35, Math.sign(dy) * speed);
    } else {
      this.setVelocity(0, 0);
    }

    this.jitterTimer += delta;
    if (this.jitterTimer > 220) {
      this.jitterTimer = 0;
      this.setFlipX(!this.flipX);
    }
  }
}
