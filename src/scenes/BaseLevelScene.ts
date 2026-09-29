import Phaser from 'phaser';
import { EnemyConfig, LevelConfig, LEVELS, TILE_SIZE } from '../config/levels';
import { Player } from '../entities/Player';
import { SecurityDrone } from '../entities/SecurityDrone';
import { GlitchCreature } from '../entities/GlitchCreature';
import { CoreGuardian } from '../entities/CoreGuardian';
import { Door } from '../objects/Door';
import { Switch } from '../objects/Switch';
import { Terminal } from '../objects/Terminal';
import { Laser } from '../objects/Laser';
import { MovingPlatform } from '../objects/MovingPlatform';
import { Hazard } from '../objects/Hazard';
import { DataShard } from '../objects/DataShard';
import { Exit } from '../objects/Exit';
import { ToolStation } from '../objects/ToolStation';
import { CorruptedWall } from '../objects/CorruptedWall';
import { SoftDataBlock } from '../objects/SoftDataBlock';
import { DecoyBeacon } from '../objects/DecoyBeacon';
import { HealthSystem } from '../systems/HealthSystem';
import { PuzzleSystem } from '../systems/PuzzleSystem';
import { AbilitySystem } from '../systems/AbilitySystem';
import { levelSystem } from '../systems/LevelSystem';
import { AudioSystem } from '../systems/AudioSystem';
import {
  gameEvents,
  HudSnapshot,
  TOOL_CATALOG,
  ToolStationModalState,
  ToolType
} from '../systems/GameEvents';

export class BaseLevelScene extends Phaser.Scene {
  protected levelNum: 1 | 2 | 3;
  protected config!: LevelConfig;
  protected player!: Player;
  protected healthSystem!: HealthSystem;
  protected puzzleSystem!: PuzzleSystem;
  protected abilitySystem!: AbilitySystem;

  protected wallGroup!: Phaser.Physics.Arcade.StaticGroup;
  protected doors: Door[] = [];
  protected switches: Switch[] = [];
  protected terminals: Terminal[] = [];
  protected lasers: Laser[] = [];
  protected platforms: MovingPlatform[] = [];
  protected hazards: Hazard[] = [];
  protected shards: DataShard[] = [];
  protected drones: SecurityDrone[] = [];
  protected glitches: GlitchCreature[] = [];
  protected toolStations: ToolStation[] = [];
  protected corruptedWalls: CorruptedWall[] = [];
  protected softDataBlocks: SoftDataBlock[] = [];
  protected decoys: DecoyBeacon[] = [];
  protected boss?: CoreGuardian;
  protected exitPortal!: Exit;

  private securityAlertLevel: number = 0;
  private decoyCooldownMs: number = 0;
  private toolModalState: ToolStationModalState = {
    isOpen: false,
    stationId: '',
    availableTools: [],
    currentTool: 'NONE'
  };

  private toastMessage: string | null = null;
  private toastTimer: number = 0;
  private levelCompleted: boolean = false;
  private isGameOver: boolean = false;

  constructor(key: string, levelNum: 1 | 2 | 3) {
    super({ key });
    this.levelNum = levelNum;
  }

  public create() {
    this.levelCompleted = false;
    this.isGameOver = false;
    this.securityAlertLevel = 0;
    this.decoyCooldownMs = 0;
    this.doors = [];
    this.switches = [];
    this.terminals = [];
    this.lasers = [];
    this.platforms = [];
    this.hazards = [];
    this.shards = [];
    this.drones = [];
    this.glitches = [];
    this.toolStations = [];
    this.corruptedWalls = [];
    this.softDataBlocks = [];
    this.decoys = [];
    this.boss = undefined;
    this.toolModalState = {
      isOpen: false,
      stationId: '',
      availableTools: [],
      currentTool: 'NONE'
    };

    levelSystem.setLevel(this.levelNum);
    this.config = LEVELS[this.levelNum];

    const mapRows = this.config.map.length;
    const mapCols = this.config.map[0].length;
    const worldWidth = mapCols * TILE_SIZE;
    const worldHeight = mapRows * TILE_SIZE;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.wallGroup = this.physics.add.staticGroup();

    // Build Floor, Walls, and Void Chasms
    for (let r = 0; r < mapRows; r++) {
      const rowStr = this.config.map[r];
      for (let c = 0; c < mapCols; c++) {
        const ch = rowStr[c];
        const x = c * TILE_SIZE + TILE_SIZE / 2;
        const y = r * TILE_SIZE + TILE_SIZE / 2;

        if (ch === '#') {
          this.add.image(x, y, 'tile_floor').setDepth(0);
          const wall = this.wallGroup.create(x, y, 'tile_wall') as Phaser.Physics.Arcade.Sprite;
          wall.setDepth(5);
          wall.refreshBody();
        } else if (ch === '~') {
          this.add.image(x, y, 'tile_void').setDepth(0);
          const hasPlatform = this.config.platforms.some((p) => p.col === c && p.row === r);
          if (!hasPlatform) {
            const voidBlocker = this.wallGroup.create(x, y, 'tile_void') as Phaser.Physics.Arcade.Sprite;
            voidBlocker.setAlpha(0.01);
            voidBlocker.refreshBody();
          }
        } else {
          this.add.image(x, y, 'tile_floor').setDepth(0);
        }
      }
    }

    // World Floor Hints
    this.config.hints.forEach((h) => {
      const hx = h.col * TILE_SIZE + TILE_SIZE / 2;
      const hy = h.row * TILE_SIZE + TILE_SIZE / 2;
      this.add
        .text(hx, hy, h.text, {
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          color: '#94a3b8',
          backgroundColor: '#090d16cc',
          padding: { x: 5, y: 2 }
        })
        .setOrigin(0.5)
        .setDepth(2);
    });

    this.puzzleSystem = new PuzzleSystem(
      this,
      (msg) => this.showToast(msg),
      () => this.boss
    );

    // Platforms
    this.config.platforms.forEach((pCfg) => {
      const plat = new MovingPlatform(this, pCfg);
      this.platforms.push(plat);
      this.puzzleSystem.registerPlatform(plat);
    });

    // Doors
    this.config.doors.forEach((dCfg) => {
      const door = new Door(this, dCfg);
      this.doors.push(door);
      this.puzzleSystem.registerDoor(door);
    });

    // Lasers
    this.config.lasers.forEach((lCfg) => {
      const laser = new Laser(this, lCfg);
      this.lasers.push(laser);
      this.puzzleSystem.registerLaser(laser);
    });

    // Switches
    this.config.switches.forEach((sCfg) => {
      const sw = new Switch(this, sCfg);
      this.switches.push(sw);
    });

    // Terminals
    this.config.terminals.forEach((tCfg) => {
      const term = new Terminal(this, tCfg);
      this.terminals.push(term);
    });

    // Tool Stations
    this.config.toolStations.forEach((tsCfg) => {
      const station = new ToolStation(this, tsCfg);
      this.toolStations.push(station);
    });

    // Corrupted Walls (DATA HAMMER)
    this.config.corruptedWalls.forEach((cwCfg) => {
      const cw = new CorruptedWall(this, cwCfg);
      this.corruptedWalls.push(cw);
    });

    // Soft-Data Blocks (VOID SHOVEL)
    this.config.softDataBlocks.forEach((sdCfg) => {
      const sd = new SoftDataBlock(this, sdCfg);
      this.softDataBlocks.push(sd);
    });

    // Hazards
    this.config.hazards.forEach((hCfg) => {
      const haz = new Hazard(this, hCfg);
      this.hazards.push(haz);
    });

    // Core Fragments (formerly Data Shards)
    this.config.shards.forEach((sPos) => {
      const shard = new DataShard(this, sPos);
      this.shards.push(shard);
    });

    // Exit Portal
    this.exitPortal = new Exit(this, this.config.exitPos, this.levelNum === 3);

    // Player
    this.player = new Player(this, this.config.playerStart);
    if (this.config.initialTool && this.config.initialTool !== 'NONE') {
      this.player.setActiveTool(this.config.initialTool);
    }

    this.healthSystem = new HealthSystem(
      this,
      this.player,
      () => this.handlePlayerDeath(),
      (msg) => this.showToast(msg)
    );

    this.abilitySystem = new AbilitySystem(this, this.player, (msg) => this.showToast(msg));

    // Enemies
    this.config.enemies.forEach((eCfg) => {
      this.spawnEnemyUnit(eCfg);
    });

    // Boss (Level 3)
    if (this.config.boss) {
      this.boss = new CoreGuardian(this, this.config.boss);
      this.physics.add.collider(this.boss, this.wallGroup);
    }

    this.puzzleSystem.drawCircuitLinks(this.switches, this.terminals);

    // Colliders
    this.physics.add.collider(this.player, this.wallGroup);
    this.doors.forEach((door) => {
      this.physics.add.collider(this.player, door);
    });
    this.platforms.forEach((plat) => {
      this.physics.add.collider(this.player, plat);
    });
    this.terminals.forEach((term) => {
      this.physics.add.collider(this.player, term);
    });
    this.toolStations.forEach((ts) => {
      this.physics.add.collider(this.player, ts);
    });
    this.corruptedWalls.forEach((cw) => {
      this.physics.add.collider(this.player, cw);
    });
    this.softDataBlocks.forEach((sd) => {
      this.physics.add.collider(this.player, sd);
    });

    // Overlaps
    this.switches.forEach((sw) => {
      this.physics.add.overlap(this.player, sw, () => {
        sw.activate((targets, msg, swId) => {
          this.puzzleSystem.triggerTargets(targets, msg, swId, false);
          this.puzzleSystem.drawCircuitLinks(this.switches, this.terminals);
          this.updateExitUnlockState();
        });
      });
    });

    this.shards.forEach((shard) => {
      this.physics.add.overlap(this.player, shard, () => {
        shard.collect(() => {
          levelSystem.addShard();
          const cur = levelSystem.getShardsCollected();
          const req = levelSystem.getShardsRequired();
          this.triggerSecurityEscalation(cur, req);
          this.updateExitUnlockState();
        });
      });
    });

    this.lasers.forEach((laser) => {
      this.physics.add.overlap(this.player, laser.getZone(), () => {
        if (laser.isDangerous()) {
          this.healthSystem.damage('Security Laser');
        }
      });
    });

    this.hazards.forEach((hazard) => {
      this.physics.add.overlap(this.player, hazard, () => {
        if (hazard.isDangerous()) {
          this.healthSystem.damage('Voltage Trap');
        }
      });
    });

    if (this.boss) {
      this.physics.add.overlap(this.player, this.boss, () => {
        if (this.boss && this.boss.isDangerous()) {
          this.healthSystem.damage('Core Guardian');
        }
      });
    }

    this.physics.add.overlap(this.player, this.exitPortal, () => {
      if (this.exitPortal.isUnlocked() && !this.levelCompleted) {
        this.handleLevelComplete();
      } else if (!this.exitPortal.isUnlocked()) {
        this.showToast(this.getExitLockReason());
      }
    });

    // Camera setup
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.14, 0.14);
    this.cameras.main.setBackgroundColor('#070b12');

    // Keyboard Shortcuts
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ONE', () => this.triggerAbility('shield'));
      this.input.keyboard.on('keydown-TWO', () => this.triggerAbility('emp'));
      this.input.keyboard.on('keydown-THREE', () => this.triggerAbility('hack'));
      this.input.keyboard.on('keydown-FOUR', () => this.triggerAbility('glitch'));
      this.input.keyboard.on('keydown-E', () => this.handlePrimaryInteract());
      this.input.keyboard.on('keydown-SPACE', () => this.handleUseActiveTool());
      this.input.keyboard.on('keydown-ESC', () => {
        if (this.toolModalState.isOpen) {
          this.closeToolModal();
        } else {
          gameEvents.emit('request-toggle-pause');
        }
      });
    }

    // Listen to UI events
    const onUiAbility = (id: 'shield' | 'emp' | 'hack' | 'glitch') => this.triggerAbility(id);
    const onUiInteract = () => this.handlePrimaryInteract();
    const onUiUseTool = () => this.handleUseActiveTool();
    const onUiSelectTool = (tool: ToolType) => this.equipToolFromStation(tool);
    const onUiCloseToolModal = () => this.closeToolModal();
    const onUiMove = (dir: { x: number; y: number }) => {
      if (this.player) this.player.setExternalDirection(dir.x, dir.y);
    };

    gameEvents.on('ui-ability', onUiAbility);
    gameEvents.on('ui-interact', onUiInteract);
    gameEvents.on('ui-use-tool', onUiUseTool);
    gameEvents.on('ui-select-tool', onUiSelectTool);
    gameEvents.on('ui-close-tool-modal', onUiCloseToolModal);
    gameEvents.on('ui-move', onUiMove);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameEvents.off('ui-ability', onUiAbility);
      gameEvents.off('ui-interact', onUiInteract);
      gameEvents.off('ui-use-tool', onUiUseTool);
      gameEvents.off('ui-select-tool', onUiSelectTool);
      gameEvents.off('ui-close-tool-modal', onUiCloseToolModal);
      gameEvents.off('ui-move', onUiMove);
    });

    AudioSystem.startMusic(this.levelNum === 3 ? 'boss' : 'level');
    this.updateExitUnlockState();
    this.showToast(`Entered ${this.config.name}`);
    this.emitHudSnapshot();
  }

  private spawnEnemyUnit(eCfg: EnemyConfig) {
    if (eCfg.type === 'drone') {
      const drone = new SecurityDrone(this, eCfg);
      this.drones.push(drone);
      this.physics.add.collider(drone, this.wallGroup);
      this.doors.forEach((door) => this.physics.add.collider(drone, door));
      this.corruptedWalls.forEach((cw) => this.physics.add.collider(drone, cw));
      this.softDataBlocks.forEach((sd) => this.physics.add.collider(drone, sd));
      this.physics.add.overlap(this.player, drone, () => {
        if (drone.isDangerous()) {
          this.healthSystem.damage('Security Drone');
        }
      });
    } else {
      const glitch = new GlitchCreature(this, eCfg);
      this.glitches.push(glitch);
      this.physics.add.collider(glitch, this.wallGroup);
      this.doors.forEach((door) => this.physics.add.collider(glitch, door));
      this.corruptedWalls.forEach((cw) => this.physics.add.collider(glitch, cw));
      this.softDataBlocks.forEach((sd) => this.physics.add.collider(glitch, sd));
      this.physics.add.overlap(this.player, glitch, () => {
        if (glitch.isDangerous()) {
          this.healthSystem.damage('Glitch Creature');
        }
      });
    }
  }

  private triggerSecurityEscalation(curCount: number, reqCount: number) {
    const esc = this.config.escalations.find((e) => e.triggerAtCount === curCount);
    if (!esc) {
      this.showToast(`CORE FRAGMENT RECOVERED (${curCount}/${reqCount})`);
      return;
    }

    this.securityAlertLevel++;
    AudioSystem.playSecurityAlert();
    this.cameras.main.flash(220, 180, 30, 50, false);

    if (esc.activateLaserIds) {
      esc.activateLaserIds.forEach((lid) => {
        const laser = this.puzzleSystem.getLaser(lid);
        if (laser) laser.activateLaser();
      });
    }

    if (esc.openDoorIds) {
      esc.openDoorIds.forEach((did) => {
        const door = this.puzzleSystem.getDoor(did);
        if (door) door.open(true);
      });
    }

    if (esc.spawnEnemies) {
      esc.spawnEnemies.forEach((eCfg) => {
        this.spawnEnemyUnit(eCfg);
      });
    }

    if (esc.partiallyAwakenBoss && this.boss) {
      this.boss.setPartiallyAwakened();
    }

    this.showToast(esc.alertMessage);
  }

  private handlePrimaryInteract() {
    if (this.levelCompleted || this.isGameOver || this.scene.isPaused()) return;

    if (this.toolModalState.isOpen) {
      this.closeToolModal();
      return;
    }

    const px = this.player.x;
    const py = this.player.y;

    // 1. Check nearby Tool Station first
    const nearbyStation = this.toolStations.find(
      (ts) => Phaser.Math.Distance.Between(px, py, ts.x, ts.y) <= 86
    );
    if (nearbyStation) {
      this.openToolModal(nearbyStation);
      return;
    }

    // 2. Check nearby Corrupted Wall (Hammer) or Soft Data (Shovel)
    const nearbyWall = this.corruptedWalls.find(
      (cw) => !cw.getIsBroken() && Phaser.Math.Distance.Between(px, py, cw.x, cw.y) <= 82
    );
    if (nearbyWall) {
      if (this.player.getActiveTool() === 'HAMMER') {
        this.player.playToolUseAnim();
        nearbyWall.smash();
        this.showToast('DATA HAMMER: Corrupted Wall Smashed!');
      } else {
        this.showToast('REQUIRES TOOL: [DATA HAMMER] — Equip at a Tool Station!');
      }
      return;
    }

    const nearbySoft = this.softDataBlocks.find(
      (sd) => !sd.getIsDug() && Phaser.Math.Distance.Between(px, py, sd.x, sd.y) <= 82
    );
    if (nearbySoft) {
      if (this.player.getActiveTool() === 'SHOVEL') {
        this.player.playToolUseAnim();
        nearbySoft.dig();
        this.showToast('VOID SHOVEL: Soft-Data Obstacle Excavated!');
      } else {
        this.showToast('REQUIRES TOOL: [VOID SHOVEL] — Equip at a Tool Station!');
      }
      return;
    }

    // 3. Check nearby Terminal (Hack)
    const nearbyTerm = this.terminals.find(
      (t) => t.canHack() && Phaser.Math.Distance.Between(px, py, t.x, t.y) <= 115
    );
    if (nearbyTerm) {
      this.abilitySystem.useHack(
        this.terminals,
        (term) => {
          term.hack((targets, msg, isBossPurge) => {
            this.puzzleSystem.triggerTargets(targets, msg, term.terminalId, isBossPurge);
            this.puzzleSystem.drawCircuitLinks(this.switches, this.terminals);
            this.updateExitUnlockState();
          });
        },
        this.boss
      );
      this.updateExitUnlockState();
      return;
    }

    // 4. Otherwise use active physical tool (e.g. Deploy Decoy or EMP Glove)
    this.handleUseActiveTool();
  }

  private handleUseActiveTool() {
    if (this.levelCompleted || this.isGameOver || this.scene.isPaused()) return;

    const tool = this.player.getActiveTool();
    const px = this.player.x;
    const py = this.player.y;

    if (tool === 'NONE') {
      this.showToast('No Active Tool Equipped! Visit a Tool Station [E] to select a tool.');
      return;
    }

    if (tool === 'HAMMER') {
      const wall = this.corruptedWalls.find(
        (cw) => !cw.getIsBroken() && Phaser.Math.Distance.Between(px, py, cw.x, cw.y) <= 85
      );
      this.player.playToolUseAnim();
      if (wall) {
        wall.smash();
        this.showToast('DATA HAMMER: Corrupted Wall Smashed!');
      } else {
        this.showToast('DATA HAMMER: Stand next to a cracked Corrupted Wall to smash it.');
      }
      return;
    }

    if (tool === 'SHOVEL') {
      const soft = this.softDataBlocks.find(
        (sd) => !sd.getIsDug() && Phaser.Math.Distance.Between(px, py, sd.x, sd.y) <= 85
      );
      this.player.playToolUseAnim();
      if (soft) {
        soft.dig();
        this.showToast('VOID SHOVEL: Soft-Data Obstacle Cleared!');
      } else {
        this.showToast('VOID SHOVEL: Stand next to a Soft-Data Mound to dig it.');
      }
      return;
    }

    if (tool === 'EMP') {
      this.triggerAbility('emp');
      return;
    }

    if (tool === 'DECOY') {
      if (this.decoyCooldownMs > 0) {
        this.showToast(
          `GLITCH DECOY recharging (${(this.decoyCooldownMs / 1000).toFixed(1)}s)`
        );
        return;
      }
      this.decoyCooldownMs = 4500;
      this.player.playToolUseAnim();
      const beacon = new DecoyBeacon(this, px, py);
      this.decoys.push(beacon);
      this.showToast('GLITCH DECOY DEPLOYED — Nearby Drones & Glitches Lured!');
      return;
    }
  }

  private openToolModal(station: ToolStation) {
    station.playDispenseAnimation();
    this.toolModalState = {
      isOpen: true,
      stationId: station.stationId,
      availableTools: station.availableTools,
      currentTool: this.player.getActiveTool()
    };
    this.emitHudSnapshot();
  }

  private closeToolModal() {
    if (!this.toolModalState.isOpen) return;
    this.toolModalState = {
      ...this.toolModalState,
      isOpen: false
    };
    this.emitHudSnapshot();
  }

  private equipToolFromStation(tool: ToolType) {
    const prev = this.player.getActiveTool();
    this.player.setActiveTool(tool);
    AudioSystem.playToolPickup();
    this.toolModalState = {
      ...this.toolModalState,
      isOpen: false,
      currentTool: tool
    };
    const meta = TOOL_CATALOG[tool];
    this.showToast(
      prev !== 'NONE' && prev !== tool
        ? `TOOL SWAPPED: ${TOOL_CATALOG[prev].shortName} → ${meta.name.toUpperCase()}`
        : `TOOL ACQUIRED: ${meta.name.toUpperCase()} — ${meta.usageHint}`
    );
    this.emitHudSnapshot();
  }

  private triggerAbility(id: 'shield' | 'emp' | 'hack' | 'glitch') {
    if (this.levelCompleted || this.isGameOver || this.scene.isPaused()) return;
    if (id === 'shield') {
      this.abilitySystem.useShield();
    } else if (id === 'emp') {
      this.abilitySystem.useEmp(this.drones, this.glitches, this.lasers, this.hazards, this.boss);
      this.updateExitUnlockState();
    } else if (id === 'hack') {
      this.abilitySystem.useHack(
        this.terminals,
        (term) => {
          term.hack((targets, msg, isBossPurge) => {
            this.puzzleSystem.triggerTargets(targets, msg, term.terminalId, isBossPurge);
            this.puzzleSystem.drawCircuitLinks(this.switches, this.terminals);
            this.updateExitUnlockState();
          });
        },
        this.boss
      );
      this.updateExitUnlockState();
    } else if (id === 'glitch') {
      this.abilitySystem.useGlitchPulse(this.drones, this.glitches, this.hazards, this.boss);
      this.updateExitUnlockState();
    }
  }

  private getExitLockReason(): string {
    const cur = levelSystem.getShardsCollected();
    const req = levelSystem.getShardsRequired();
    if (cur < req) {
      const diff = req - cur;
      return `LOCKED: RECOVER ${diff} MORE CORE FRAGMENT${diff > 1 ? 'S' : ''} (${cur}/${req})`;
    }
    if (this.boss && !this.boss.isDefeated()) {
      return 'LOCKED: DEFEAT CORE GUARDIAN TO UNLOCK SYSTEM CORE';
    }
    return 'EXIT UNLOCKED';
  }

  private updateExitUnlockState() {
    const shardsReady = levelSystem.areAllShardsCollected();
    const bossReady = !this.boss || this.boss.isDefeated();
    const unlocked = shardsReady && bossReady;
    this.exitPortal.setUnlocked(unlocked, this.levelNum === 3, this.getExitLockReason());
  }

  private handlePlayerDeath() {
    if (this.isGameOver || this.levelCompleted) return;
    this.isGameOver = true;
    this.player.setVelocity(0, 0);
    this.emitHudSnapshot();
    gameEvents.emit('level-game-over', {
      levelNumber: this.levelNum,
      levelName: this.config.name
    });
  }

  private handleLevelComplete() {
    if (this.levelCompleted || this.isGameOver) return;
    this.levelCompleted = true;
    this.player.setVelocity(0, 0);
    AudioSystem.playVictory();
    this.emitHudSnapshot();

    if (this.levelNum === 3) {
      gameEvents.emit('game-victory', {
        shardsCollected: levelSystem.getShardsCollected(),
        shardsRequired: levelSystem.getShardsRequired()
      });
    } else {
      gameEvents.emit('level-complete', {
        levelNumber: this.levelNum,
        levelName: this.config.name,
        shardsCollected: levelSystem.getShardsCollected(),
        shardsRequired: levelSystem.getShardsRequired()
      });
    }
  }

  public showToast(msg: string) {
    this.toastMessage = msg;
    this.toastTimer = 3600;
  }

  public update(_time: number, delta: number) {
    if (this.levelCompleted || this.isGameOver) return;

    this.player.update(delta);
    this.healthSystem.update(delta);
    this.abilitySystem.update(delta);

    if (this.decoyCooldownMs > 0) {
      this.decoyCooldownMs = Math.max(0, this.decoyCooldownMs - delta);
    }

    // Update active decoys
    this.decoys = this.decoys.filter((d) => d.isActive());
    this.decoys.forEach((d) => d.update(delta));

    this.lasers.forEach((l) => l.update(delta));
    this.hazards.forEach((h) => h.update(delta));
    this.drones.forEach((d) => d.update(delta, this.player.x, this.player.y, this.decoys));
    this.glitches.forEach((g) => g.update(delta, this.player.x, this.player.y, this.decoys));

    if (this.boss) {
      const wasDefeated = this.boss.isDefeated();
      this.boss.update(delta, this.player.x, this.player.y, this.decoys);
      if (!wasDefeated && this.boss.isDefeated()) {
        this.updateExitUnlockState();
      }
    }

    this.updateExitUnlockState();

    if (this.toastTimer > 0) {
      this.toastTimer = Math.max(0, this.toastTimer - delta);
      if (this.toastTimer <= 0) {
        this.toastMessage = null;
      }
    }

    this.emitHudSnapshot();
  }

  private emitHudSnapshot() {
    let nearbyPrompt: string | null = null;
    const px = this.player.x;
    const py = this.player.y;
    const activeTool = this.player.getActiveTool();

    // Update proximity badges on Tool Stations, Corrupted Walls, Soft Data, and Terminals
    this.toolStations.forEach((ts) => {
      const close = Phaser.Math.Distance.Between(px, py, ts.x, ts.y) <= 84;
      ts.setPlayerNearby(close);
      if (close) {
        nearbyPrompt = 'Press [E] to Open Tool Station (Swap Active Tool)';
      } else if (this.toolModalState.isOpen && this.toolModalState.stationId === ts.stationId) {
        this.toolModalState.isOpen = false;
      }
    });

    this.corruptedWalls.forEach((cw) => {
      const close = !cw.getIsBroken() && Phaser.Math.Distance.Between(px, py, cw.x, cw.y) <= 80;
      cw.updatePrompt(close, activeTool === 'HAMMER');
      if (close) {
        nearbyPrompt =
          activeTool === 'HAMMER'
            ? 'Press [SPACE] or [E] to Smash Corrupted Wall with DATA HAMMER'
            : 'Corrupted Wall requires [DATA HAMMER] from a Tool Station';
      }
    });

    this.softDataBlocks.forEach((sd) => {
      const close = !sd.getIsDug() && Phaser.Math.Distance.Between(px, py, sd.x, sd.y) <= 80;
      sd.updatePrompt(close, activeTool === 'SHOVEL');
      if (close) {
        nearbyPrompt =
          activeTool === 'SHOVEL'
            ? 'Press [SPACE] or [E] to Excavate Soft Data with VOID SHOVEL'
            : 'Soft-Data Obstacle requires [VOID SHOVEL] from a Tool Station';
      }
    });

    this.terminals.forEach((t) => {
      const dist = Phaser.Math.Distance.Between(px, py, t.x, t.y);
      const isClose = dist <= 110 && t.canHack();
      t.setPlayerNearby(isClose);
      if (isClose) {
        nearbyPrompt = t.isBossPurge
          ? 'Press [E] or [3] to Execute SYSTEM CORE PURGE!'
          : 'Press [E] or [3] to Hack Security Terminal';
      }
    });

    const snapshot: HudSnapshot = {
      levelNumber: this.levelNum,
      levelName: this.config.name,
      levelSubtitle: this.config.subtitle,
      objectiveText: this.config.objective,
      hp: this.healthSystem.getHp(),
      maxHp: this.healthSystem.getMaxHp(),
      shardsCollected: levelSystem.getShardsCollected(),
      shardsRequired: levelSystem.getShardsRequired(),
      exitUnlocked: this.exitPortal.isUnlocked(),
      exitLockReason: this.getExitLockReason(),
      activeTool,
      securityAlertLevel: this.securityAlertLevel,
      abilities: this.abilitySystem.getStatusList(),
      nearbyPrompt,
      toastMessage: this.toastMessage,
      boss: {
        visible: Boolean(this.boss),
        name: 'CORRUPTED CORE GUARDIAN',
        hp: this.boss ? this.boss.getHp() : 0,
        maxHp: this.boss ? this.boss.getMaxHp() : 4,
        phase: this.boss ? this.boss.getPhase() : 1,
        statusHint: this.boss ? this.boss.getStatusHint() : '',
        surgeNodesRemaining: this.boss ? this.boss.getSurgeNodesRemaining() : 0
      },
      toolStationModal: this.toolModalState
    };

    gameEvents.emit('hud-update', snapshot);
  }
}
