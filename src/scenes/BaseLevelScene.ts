import Phaser from 'phaser';
import { LevelConfig, LEVELS, TILE_SIZE } from '../config/levels';
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
import { HealthSystem } from '../systems/HealthSystem';
import { PuzzleSystem } from '../systems/PuzzleSystem';
import { AbilitySystem } from '../systems/AbilitySystem';
import { levelSystem } from '../systems/LevelSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { gameEvents, HudSnapshot } from '../systems/GameEvents';

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
  protected boss?: CoreGuardian;
  protected exitPortal!: Exit;

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
    this.doors = [];
    this.switches = [];
    this.terminals = [];
    this.lasers = [];
    this.platforms = [];
    this.hazards = [];
    this.shards = [];
    this.drones = [];
    this.glitches = [];
    this.boss = undefined;

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

    // World Floor Tutorial Hints
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

    // Systems
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

    // Hazards
    this.config.hazards.forEach((hCfg) => {
      const haz = new Hazard(this, hCfg);
      this.hazards.push(haz);
    });

    // Data Shards
    this.config.shards.forEach((sPos) => {
      const shard = new DataShard(this, sPos);
      this.shards.push(shard);
    });

    // Exit Portal
    this.exitPortal = new Exit(this, this.config.exitPos, this.levelNum === 3);

    // Player
    this.player = new Player(this, this.config.playerStart);

    this.healthSystem = new HealthSystem(
      this,
      this.player,
      () => this.handlePlayerDeath(),
      (msg) => this.showToast(msg)
    );

    this.abilitySystem = new AbilitySystem(this, this.player, (msg) => this.showToast(msg));

    // Enemies
    this.config.enemies.forEach((eCfg) => {
      if (eCfg.type === 'drone') {
        const drone = new SecurityDrone(this, eCfg);
        this.drones.push(drone);
      } else {
        const glitch = new GlitchCreature(this, eCfg);
        this.glitches.push(glitch);
      }
    });

    // Boss (Level 3)
    if (this.config.boss) {
      this.boss = new CoreGuardian(this, this.config.boss);
      this.physics.add.collider(this.boss, this.wallGroup);
    }

    // Draw motherboard circuit links between switches/terminals and targets
    this.puzzleSystem.drawCircuitLinks(this.switches, this.terminals);

    // Physics Colliders
    this.physics.add.collider(this.player, this.wallGroup);
    this.doors.forEach((door) => {
      this.physics.add.collider(this.player, door);
      this.drones.forEach((d) => this.physics.add.collider(d, door));
      this.glitches.forEach((g) => this.physics.add.collider(g, door));
    });
    this.platforms.forEach((plat) => {
      this.physics.add.collider(this.player, plat);
    });
    this.terminals.forEach((term) => {
      this.physics.add.collider(this.player, term);
    });

    this.drones.forEach((d) => this.physics.add.collider(d, this.wallGroup));
    this.glitches.forEach((g) => this.physics.add.collider(g, this.wallGroup));

    // Overlaps
    this.switches.forEach((sw) => {
      this.physics.add.overlap(this.player, sw, () => {
        sw.activate((targets, msg, swId) => {
          this.puzzleSystem.triggerTargets(targets, msg, swId, false);
          this.puzzleSystem.drawCircuitLinks(this.switches, this.terminals);
        });
      });
    });

    this.shards.forEach((shard) => {
      this.physics.add.overlap(this.player, shard, () => {
        shard.collect(() => {
          levelSystem.addShard();
          this.updateExitUnlockState();
          const cur = levelSystem.getShardsCollected();
          const req = levelSystem.getShardsRequired();
          this.showToast(
            cur >= req
              ? `Data Shard Collected (${cur}/${req}) — Objective Complete!`
              : `Data Shard Collected (${cur}/${req})`
          );
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

    this.drones.forEach((drone) => {
      this.physics.add.overlap(this.player, drone, () => {
        if (drone.isDangerous()) {
          this.healthSystem.damage('Security Drone');
        }
      });
    });

    this.glitches.forEach((glitch) => {
      this.physics.add.overlap(this.player, glitch, () => {
        if (glitch.isDangerous()) {
          this.healthSystem.damage('Glitch Creature');
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
      this.input.keyboard.on('keydown-E', () => this.triggerInteract());
      this.input.keyboard.on('keydown-ESC', () => {
        gameEvents.emit('request-toggle-pause');
      });
    }

    // Listen to UI button events
    const onUiAbility = (id: 'shield' | 'emp' | 'hack' | 'glitch') => this.triggerAbility(id);
    const onUiInteract = () => this.triggerInteract();
    const onUiMove = (dir: { x: number; y: number }) => {
      if (this.player) this.player.setExternalDirection(dir.x, dir.y);
    };

    gameEvents.on('ui-ability', onUiAbility);
    gameEvents.on('ui-interact', onUiInteract);
    gameEvents.on('ui-move', onUiMove);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameEvents.off('ui-ability', onUiAbility);
      gameEvents.off('ui-interact', onUiInteract);
      gameEvents.off('ui-move', onUiMove);
    });

    AudioSystem.startMusic(this.levelNum === 3 ? 'boss' : 'level');
    this.showToast(`Entered ${this.config.name}`);
    this.emitHudSnapshot();
  }

  private triggerInteract() {
    if (this.levelCompleted || this.isGameOver || this.scene.isPaused()) return;
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
  }

  private triggerAbility(id: 'shield' | 'emp' | 'hack' | 'glitch') {
    if (this.levelCompleted || this.isGameOver || this.scene.isPaused()) return;
    if (id === 'shield') {
      this.abilitySystem.useShield();
    } else if (id === 'emp') {
      this.abilitySystem.useEmp(this.drones, this.glitches, this.lasers, this.hazards, this.boss);
      this.updateExitUnlockState();
    } else if (id === 'hack') {
      this.triggerInteract();
    } else if (id === 'glitch') {
      this.abilitySystem.useGlitchPulse(this.drones, this.glitches, this.hazards, this.boss);
      this.updateExitUnlockState();
    }
  }

  private updateExitUnlockState() {
    const shardsReady = levelSystem.areAllShardsCollected();
    const bossReady = !this.boss || this.boss.isDefeated();
    const unlocked = shardsReady && bossReady;
    this.exitPortal.setUnlocked(unlocked, this.levelNum === 3);
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
    this.toastTimer = 3200;
  }

  public update(_time: number, delta: number) {
    if (this.levelCompleted || this.isGameOver) return;

    this.player.update(delta);
    this.healthSystem.update(delta);
    this.abilitySystem.update(delta);

    this.lasers.forEach((l) => l.update(delta));
    this.hazards.forEach((h) => h.update(delta));
    this.drones.forEach((d) => d.update(delta, this.player.x, this.player.y));
    this.glitches.forEach((g) => g.update(delta, this.player.x, this.player.y));

    if (this.boss) {
      const wasDefeated = this.boss.isDefeated();
      this.boss.update(delta, this.player.x, this.player.y);
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
    this.terminals.forEach((t) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y);
      const isClose = dist <= 110 && t.canHack();
      t.setPlayerNearby(isClose);
      if (isClose) {
        nearbyPrompt = 'Press [E] or [3] to Hack Terminal';
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
      abilities: this.abilitySystem.getStatusList(),
      nearbyPrompt,
      toastMessage: this.toastMessage,
      boss: {
        visible: Boolean(this.boss),
        name: 'CORRUPTED CORE GUARDIAN',
        hp: this.boss ? this.boss.getHp() : 0,
        maxHp: this.boss ? this.boss.getMaxHp() : 4,
        phase: this.boss ? this.boss.getPhase() : 1,
        statusHint: this.boss ? this.boss.getStatusHint() : ''
      }
    };

    gameEvents.emit('hud-update', snapshot);
  }
}
