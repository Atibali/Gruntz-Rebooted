import Phaser from 'phaser';
import { Door } from '../objects/Door';
import { Laser } from '../objects/Laser';
import { MovingPlatform } from '../objects/MovingPlatform';
import { Switch } from '../objects/Switch';
import { Terminal } from '../objects/Terminal';
import { CoreGuardian } from '../entities/CoreGuardian';

export class PuzzleSystem {
  private scene: Phaser.Scene;
  private doors: Map<string, Door> = new Map();
  private lasers: Map<string, Laser> = new Map();
  private platforms: Map<string, MovingPlatform> = new Map();
  private circuitGraphics: Phaser.GameObjects.Graphics;
  private onToast: (msg: string) => void;
  private getBoss: () => CoreGuardian | undefined;

  constructor(
    scene: Phaser.Scene,
    onToast: (msg: string) => void,
    getBoss: () => CoreGuardian | undefined
  ) {
    this.scene = scene;
    this.onToast = onToast;
    this.getBoss = getBoss;
    this.circuitGraphics = scene.add.graphics().setDepth(1);
  }

  public registerDoor(door: Door) {
    this.doors.set(door.doorId, door);
  }

  public registerLaser(laser: Laser) {
    this.lasers.set(laser.laserId, laser);
  }

  public registerPlatform(platform: MovingPlatform) {
    this.platforms.set(platform.platformId, platform);
  }

  public getDoor(id: string): Door | undefined {
    return this.doors.get(id);
  }

  public getLaser(id: string): Laser | undefined {
    return this.lasers.get(id);
  }

  public drawCircuitLinks(switches: Switch[], terminals: Terminal[]) {
    this.circuitGraphics.clear();

    const drawLink = (fromX: number, fromY: number, targetId: string, color: number) => {
      const door = this.doors.get(targetId);
      const laser = this.lasers.get(targetId);
      const plat = this.platforms.get(targetId);

      let toX: number | undefined;
      let toY: number | undefined;

      if (door) {
        toX = door.x;
        toY = door.y;
      } else if (laser) {
        const pos = laser.getPosition();
        toX = pos.x;
        toY = pos.y;
      } else if (plat) {
        toX = plat.x;
        toY = plat.y;
      }

      if (toX !== undefined && toY !== undefined) {
        this.circuitGraphics.lineStyle(1.5, color, 0.28);
        this.circuitGraphics.beginPath();
        this.circuitGraphics.moveTo(fromX, fromY);
        this.circuitGraphics.lineTo(toX, fromY);
        this.circuitGraphics.lineTo(toX, toY);
        this.circuitGraphics.strokePath();
      }
    };

    switches.forEach((sw) => {
      const color = sw.getActivated() ? 0x10b981 : 0xf59e0b;
      sw.targetIds.forEach((tid) => drawLink(sw.x, sw.y, tid, color));
    });

    terminals.forEach((term) => {
      const color = term.isOnline() ? 0x10b981 : 0x38bdf8;
      term.targetIds.forEach((tid) => drawLink(term.x, term.y, tid, color));
    });
  }

  public triggerTargets(
    targetIds: string[],
    message: string,
    sourceId?: string,
    isBossPurge?: boolean
  ) {
    targetIds.forEach((id) => {
      const door = this.doors.get(id);
      if (door) {
        door.open();
      }

      const laser = this.lasers.get(id);
      if (laser) {
        laser.disablePermanently();
      }

      const platform = this.platforms.get(id);
      if (platform) {
        platform.activate();
      }
    });

    const boss = this.getBoss();
    if (boss && !boss.isDefeated()) {
      if (sourceId && sourceId.startsWith('sw_boss_surge')) {
        boss.triggerSurgeNode();
        const rem = boss.getSurgeNodesRemaining();
        this.onToast(
          rem > 0
            ? `SURGE NODE ACTIVATED! ${rem} Surge Node left to drop Guardian Armor!`
            : `ALL SURGE NODES ACTIVE! Guardian Armor Dropped — Phase 2 Engaged!`
        );
        return;
      }

      if (isBossPurge) {
        const res = boss.takeAbilityDamage('PURGE_TERMINAL');
        this.onToast(res.message);
        return;
      }
    }

    this.onToast(message);
  }
}
