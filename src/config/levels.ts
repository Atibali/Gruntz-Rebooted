import { ToolType } from '../systems/GameEvents';
import { ToolStationConfig } from '../objects/ToolStation';
import { CorruptedWallConfig } from '../objects/CorruptedWall';
import { SoftDataConfig } from '../objects/SoftDataBlock';

export const TILE_SIZE = 48;

export interface GridPos {
  col: number;
  row: number;
}

export interface DoorConfig {
  id: string;
  col: number;
  row: number;
  initiallyOpen?: boolean;
}

export interface SwitchConfig {
  id: string;
  col: number;
  row: number;
  targetIds: string[];
  label: string;
  message: string;
}

export interface TerminalConfig {
  id: string;
  col: number;
  row: number;
  targetIds: string[];
  label: string;
  message: string;
  isBossPurge?: boolean;
}

export interface LaserConfig {
  id: string;
  col: number;
  row: number;
  lengthTiles: number;
  direction: 'horizontal' | 'vertical';
  initiallyActive: boolean;
}

export interface PlatformConfig {
  id: string;
  col: number;
  row: number;
  initiallyActive: boolean;
}

export interface HazardConfig {
  id: string;
  col: number;
  row: number;
}

export interface EnemyConfig {
  id: string;
  type: 'drone' | 'glitch';
  col: number;
  row: number;
  patrolEndCol?: number;
  patrolEndRow?: number;
}

export interface BossConfig {
  col: number;
  row: number;
  maxHp: number;
}

export interface WorldHintConfig {
  col: number;
  row: number;
  text: string;
}

export interface SentryTurretConfig {
  id: string;
  col: number;
  row: number;
  scanDirection?: 'up' | 'down' | 'left' | 'right';
  scanAngleDeg?: number;
  rangeTiles?: number;
  fireIntervalMs?: number;
}

export interface SecretCacheConfig {
  id: string;
  col: number;
  row: number;
  lore: string;
}

export interface SecurityEscalationConfig {
  triggerAtCount: number;
  alertMessage: string;
  activateLaserIds?: string[];
  openDoorIds?: string[];
  spawnEnemies?: EnemyConfig[];
  partiallyAwakenBoss?: boolean;
}

export interface LevelConfig {
  levelNumber: 1 | 2 | 3 | 4;
  name: string;
  subtitle: string;
  objective: string;
  shardsRequired: number;
  parTimeMs: number;
  initialTool?: ToolType;
  map: string[];
  playerStart: GridPos;
  exitPos: GridPos;
  shards: GridPos[];
  doors: DoorConfig[];
  switches: SwitchConfig[];
  terminals: TerminalConfig[];
  lasers: LaserConfig[];
  platforms: PlatformConfig[];
  hazards: HazardConfig[];
  enemies: EnemyConfig[];
  sentries?: SentryTurretConfig[];
  secretCache?: SecretCacheConfig;
  toolStations: ToolStationConfig[];
  corruptedWalls: CorruptedWallConfig[];
  softDataBlocks: SoftDataConfig[];
  escalations: SecurityEscalationConfig[];
  boss?: BossConfig;
  hints: WorldHintConfig[];
}

export const LEVELS: Record<1 | 2 | 3 | 4, LevelConfig> = {
  1: {
    levelNumber: 1,
    name: 'LEVEL 1 — BOOT SECTOR',
    subtitle: 'Tool Calibration & Core Fragment Recovery',
    objective: 'Find the Tool Station, equip DATA HAMMER to break the Corrupted Wall, recover 1 Core Fragment, and escape.',
    shardsRequired: 1,
    parTimeMs: 65000,
    initialTool: 'NONE',
    map: [
      '##################',
      '#......#.....#...#',
      '#......#.........#',
      '#......D.....#...#',
      '#......#.....#...#',
      '#####.#######~~###',
      '#...........#....#',
      '#...........#....#',
      '#...........###D##',
      '#................#',
      '#...........#....#',
      '#...........#....#',
      '##################'
    ],
    playerStart: { col: 2, row: 2 },
    exitPos: { col: 15, row: 10 },
    shards: [{ col: 15, row: 2 }],
    doors: [
      { id: 'door_boot_1', col: 7, row: 3, initiallyOpen: false },
      { id: 'door_boot_2', col: 15, row: 8, initiallyOpen: false },
      { id: 'door_boot_shortcut', col: 12, row: 9, initiallyOpen: false }
    ],
    switches: [
      {
        id: 'sw_boot_1',
        col: 4,
        row: 8,
        targetIds: ['door_boot_1'],
        label: 'SW-01',
        message: 'Switch Activated: Diagnostics Bay Door Opened'
      }
    ],
    terminals: [
      {
        id: 'term_boot_1',
        col: 11,
        row: 2,
        targetIds: ['plat_boot_1', 'plat_boot_2', 'door_boot_2'],
        label: 'TERM-01',
        message: 'Terminal Hacked: Holo-Bridge & Exit Gate Online'
      }
    ],
    lasers: [
      {
        id: 'laser_boot_esc',
        col: 8,
        row: 6,
        lengthTiles: 3,
        direction: 'horizontal',
        initiallyActive: false
      }
    ],
    platforms: [
      { id: 'plat_boot_1', col: 13, row: 5, initiallyActive: false },
      { id: 'plat_boot_2', col: 14, row: 5, initiallyActive: false }
    ],
    hazards: [],
    enemies: [],
    sentries: [],
    secretCache: {
      id: 'cache_boot_1',
      col: 16,
      row: 11,
      lore: 'ARCHIVE FILE #001: In 1999, the original Gruntz subroutines were sealed inside the core registers before system migration. You are their legacy.'
    },
    toolStations: [
      {
        id: 'ts_boot_1',
        col: 9,
        row: 2,
        availableTools: ['HAMMER', 'SHOVEL']
      }
    ],
    corruptedWalls: [
      { id: 'cw_boot_1', col: 13, row: 2 }
    ],
    softDataBlocks: [
      { id: 'sd_boot_1', col: 12, row: 9 }
    ],
    escalations: [
      {
        triggerAtCount: 1,
        alertMessage: 'CORE FRAGMENT RECOVERED — WARNING: SECURITY PROTOCOL ACTIVATED!',
        activateLaserIds: ['laser_boot_esc'],
        openDoorIds: ['door_boot_2', 'door_boot_shortcut']
      }
    ],
    hints: [
      { col: 3, row: 4, text: '1. Step on SW-01 below to open Door' },
      { col: 9, row: 4, text: '2. Press [E] at Tool Station → Take HAMMER' },
      { col: 13, row: 1, text: '3. Press [SPACE/E] with HAMMER to break Wall' },
      { col: 14, row: 7, text: '4. Cross Bridge & Escape to Exit Portal' }
    ]
  },

  2: {
    levelNumber: 2,
    name: 'LEVEL 2 — FIREWALL FACTORY',
    subtitle: 'Strategic Tool Selection & Security Escalation',
    objective: 'Swap tools at Tool Stations (1 at a time) to breach Upper & Lower Vaults, avoid Sentry Turrets, recover 2 Core Fragments, and escape.',
    shardsRequired: 2,
    parTimeMs: 95000,
    initialTool: 'NONE',
    map: [
      '####################',
      '#.....#......#.....#',
      '#.....#......#.....#',
      '#.....#......D.....#',
      '#.....#......#.....#',
      '##########.#########',
      '#..................#',
      '#..................#',
      '#########.#####...##',
      '#.....#......#.....#',
      '#.....D......#.....#',
      '#.....#......#.....#',
      '#.....#......#.....#',
      '####################'
    ],
    playerStart: { col: 2, row: 6 },
    exitPos: { col: 17, row: 11 },
    shards: [
      { col: 17, row: 2 },
      { col: 2, row: 11 }
    ],
    doors: [
      { id: 'door_fw_upper', col: 13, row: 3, initiallyOpen: true },
      { id: 'door_fw_lower', col: 6, row: 10, initiallyOpen: false }
    ],
    switches: [
      {
        id: 'sw_fw_1',
        col: 8,
        row: 2,
        targetIds: ['laser_fw_2'],
        label: 'SW-FW1',
        message: 'Firewall Switch: Upper Laser Barrier Offline'
      },
      {
        id: 'sw_fw_2',
        col: 11,
        row: 11,
        targetIds: ['door_fw_lower'],
        label: 'SW-FW2',
        message: 'Assembly Switch: Lower Fragment Vault Unlocked'
      }
    ],
    terminals: [
      {
        id: 'term_fw_1',
        col: 17,
        row: 6,
        targetIds: ['laser_fw_exit'],
        label: 'TERM-FW',
        message: 'Firewall Overridden: Exit Laser Deactivated'
      }
    ],
    lasers: [
      { id: 'laser_fw_1', col: 6, row: 6, lengthTiles: 2, direction: 'vertical', initiallyActive: true },
      { id: 'laser_fw_2', col: 9, row: 3, lengthTiles: 3, direction: 'horizontal', initiallyActive: true },
      { id: 'laser_fw_3', col: 14, row: 6, lengthTiles: 2, direction: 'vertical', initiallyActive: false },
      { id: 'laser_fw_exit', col: 15, row: 8, lengthTiles: 3, direction: 'horizontal', initiallyActive: true }
    ],
    platforms: [],
    hazards: [
      { id: 'haz_fw_1', col: 8, row: 6 },
      { id: 'haz_fw_2', col: 12, row: 7 }
    ],
    enemies: [
      {
        id: 'drone_fw_1',
        type: 'drone',
        col: 8,
        row: 11,
        patrolEndCol: 12,
        patrolEndRow: 11
      },
      {
        id: 'glitch_fw_1',
        type: 'glitch',
        col: 11,
        row: 2
      }
    ],
    sentries: [
      {
        id: 'sentry_fw_center',
        col: 15,
        row: 6,
        scanDirection: 'left',
        scanAngleDeg: 45,
        rangeTiles: 5,
        fireIntervalMs: 2400
      }
    ],
    secretCache: {
      id: 'cache_fw_2',
      col: 2,
      row: 2,
      lore: 'ARCHIVE FILE #002: Firewall sentries use harmonic quantum tracking. Decoy beacons introduce phase jitter that scrambles their targeting.'
    },
    toolStations: [
      {
        id: 'ts_fw_west',
        col: 4,
        row: 6,
        availableTools: ['HAMMER', 'EMP', 'SHOVEL', 'DECOY']
      },
      {
        id: 'ts_fw_center',
        col: 10,
        row: 6,
        availableTools: ['HAMMER', 'EMP', 'SHOVEL', 'DECOY']
      }
    ],
    corruptedWalls: [
      { id: 'cw_fw_upper', col: 13, row: 3 }
    ],
    softDataBlocks: [
      { id: 'sd_fw_lower', col: 9, row: 8 }
    ],
    escalations: [
      {
        triggerAtCount: 1,
        alertMessage: 'CORE FRAGMENT 1/2 EXTRACTED — WARNING: EAST FIREWALL LASER ACTIVATED!',
        activateLaserIds: ['laser_fw_3']
      },
      {
        triggerAtCount: 2,
        alertMessage: 'ALL FRAGMENTS EXTRACTED — SECURITY ESCALATED: HUNTER DRONE DEPLOYED! ESCAPE TO EXIT!',
        activateLaserIds: ['laser_fw_3'],
        spawnEnemies: [
          {
            id: 'drone_fw_esc',
            type: 'drone',
            col: 11,
            row: 6,
            patrolEndCol: 16,
            patrolEndRow: 6
          }
        ]
      }
    ],
    hints: [
      { col: 4, row: 7, text: 'Tool Station [E]: Carry 1 Tool at a time' },
      { col: 13, row: 4, text: 'Upper Route: Needs DATA HAMMER' },
      { col: 9, row: 9, text: 'Lower Route: Needs SHOVEL + DECOY or EMP GLOVE' },
      { col: 16, row: 5, text: 'Hack Terminal [E] or use Shield [1] to Escape' }
    ]
  },

  3: {
    levelNumber: 3,
    name: 'LEVEL 3 — CORE BREACH',
    subtitle: 'Central System Kernel & Core Guardian Purge',
    objective: 'Use Tools & Abilities to recover 3 Core Fragments, activate Surge Nodes, and purge the Core Guardian.',
    shardsRequired: 3,
    parTimeMs: 135000,
    initialTool: 'NONE',
    map: [
      '######################',
      '#....#..........#....#',
      '#....#..........#....#',
      '#....D..........D....#',
      '#....#..........#....#',
      '#~~###..........###~~#',
      '#....................#',
      '#....................#',
      '##########DD##########',
      '#....................#',
      '#....................#',
      '#....................#',
      '#....................#',
      '#....................#',
      '#....................#',
      '######################'
    ],
    playerStart: { col: 10, row: 2 },
    exitPos: { col: 11, row: 14 },
    shards: [
      { col: 2, row: 2 },
      { col: 19, row: 2 },
      { col: 10, row: 13 }
    ],
    doors: [
      { id: 'door_core_west', col: 5, row: 3, initiallyOpen: true },
      { id: 'door_core_east', col: 16, row: 3, initiallyOpen: false },
      { id: 'door_core_boss1', col: 10, row: 8, initiallyOpen: false },
      { id: 'door_core_boss2', col: 11, row: 8, initiallyOpen: false }
    ],
    switches: [
      {
        id: 'sw_core_west',
        col: 7,
        row: 4,
        targetIds: ['plat_core_west1', 'plat_core_west2'],
        label: 'SW-WEST',
        message: 'West Holo-Bridge Activated'
      },
      {
        id: 'sw_core_gate',
        col: 3,
        row: 7,
        targetIds: ['door_core_boss1', 'door_core_boss2'],
        label: 'SW-GATE',
        message: 'Core Blast Gates Opened!'
      },
      {
        id: 'sw_boss_surge_1',
        col: 4,
        row: 12,
        targetIds: ['laser_core_boss'],
        label: 'SURGE-NODE-1',
        message: 'Surge Node #1 Triggered!'
      },
      {
        id: 'sw_boss_surge_2',
        col: 17,
        row: 11,
        targetIds: [],
        label: 'SURGE-NODE-2',
        message: 'Surge Node #2 Triggered!'
      }
    ],
    terminals: [
      {
        id: 'term_core_east',
        col: 14,
        row: 4,
        targetIds: ['door_core_east', 'plat_core_east1', 'plat_core_east2', 'laser_core_east'],
        label: 'TERM-EAST',
        message: 'East Terminal Hacked: East Vault & Bridge Ready'
      },
      {
        id: 'term_boss_purge',
        col: 17,
        row: 13,
        targetIds: [],
        label: 'CORE-PURGE',
        message: 'Executing System Core Purge!',
        isBossPurge: true
      }
    ],
    lasers: [
      { id: 'laser_core_west', col: 2, row: 6, lengthTiles: 3, direction: 'horizontal', initiallyActive: false },
      { id: 'laser_core_east', col: 17, row: 6, lengthTiles: 3, direction: 'horizontal', initiallyActive: true },
      { id: 'laser_core_boss', col: 9, row: 10, lengthTiles: 4, direction: 'horizontal', initiallyActive: true }
    ],
    platforms: [
      { id: 'plat_core_west1', col: 1, row: 5, initiallyActive: false },
      { id: 'plat_core_west2', col: 2, row: 5, initiallyActive: false },
      { id: 'plat_core_east1', col: 19, row: 5, initiallyActive: false },
      { id: 'plat_core_east2', col: 20, row: 5, initiallyActive: false }
    ],
    hazards: [
      { id: 'haz_core_1', col: 7, row: 7 },
      { id: 'haz_core_2', col: 14, row: 7 },
      { id: 'haz_core_3', col: 7, row: 11 },
      { id: 'haz_core_4', col: 14, row: 11 }
    ],
    enemies: [
      {
        id: 'drone_core_1',
        type: 'drone',
        col: 2,
        row: 4,
        patrolEndCol: 4,
        patrolEndRow: 4
      },
      {
        id: 'drone_core_2',
        type: 'drone',
        col: 17,
        row: 7,
        patrolEndCol: 20,
        patrolEndRow: 7
      },
      {
        id: 'glitch_core_1',
        type: 'glitch',
        col: 18,
        row: 3
      }
    ],
    sentries: [
      {
        id: 'sentry_core_west',
        col: 2,
        row: 11,
        scanDirection: 'right',
        scanAngleDeg: 45,
        rangeTiles: 4,
        fireIntervalMs: 2200
      },
      {
        id: 'sentry_core_east',
        col: 19,
        row: 11,
        scanDirection: 'left',
        scanAngleDeg: 45,
        rangeTiles: 4,
        fireIntervalMs: 2200
      }
    ],
    secretCache: {
      id: 'cache_core_3',
      col: 20,
      row: 14,
      lore: 'ARCHIVE FILE #003: Core Guardian was not an intruder—it was the automated antivirus that turned on its creators when logic degraded.'
    },
    toolStations: [
      {
        id: 'ts_core_upper',
        col: 10,
        row: 4,
        availableTools: ['HAMMER', 'EMP', 'SHOVEL', 'DECOY']
      },
      {
        id: 'ts_core_arena',
        col: 10,
        row: 9,
        availableTools: ['HAMMER', 'EMP', 'SHOVEL', 'DECOY']
      }
    ],
    corruptedWalls: [
      { id: 'cw_core_west', col: 5, row: 3 },
      { id: 'cw_core_surge1', col: 4, row: 11 }
    ],
    softDataBlocks: [
      { id: 'sd_core_east', col: 18, row: 2 },
      { id: 'sd_core_surge2', col: 16, row: 11 }
    ],
    escalations: [
      {
        triggerAtCount: 1,
        alertMessage: 'CORE FRAGMENT 1/3 RECOVERED — WARNING: WEST LASER GRID ENGAGED!',
        activateLaserIds: ['laser_core_west']
      },
      {
        triggerAtCount: 2,
        alertMessage: 'CORE FRAGMENT 2/3 RECOVERED — CORE GUARDIAN ONLINE! BLAST GATES OPENED!',
        openDoorIds: ['door_core_boss1', 'door_core_boss2'],
        partiallyAwakenBoss: true
      },
      {
        triggerAtCount: 3,
        alertMessage: 'ALL CORE FRAGMENTS RECOVERED — DEFEAT CORE GUARDIAN TO UNLOCK SYSTEM CORE!',
        openDoorIds: ['door_core_boss1', 'door_core_boss2']
      }
    ],
    boss: {
      col: 11,
      row: 11,
      maxHp: 4
    },
    hints: [
      { col: 10, row: 5, text: 'Use Tool Station [E] to swap HAMMER / SHOVEL / EMP / DECOY' },
      { col: 4, row: 10, text: 'Phase 1: Break Wall & Step on 2 SURGE NODES' },
      { col: 11, row: 9, text: 'Phase 2: Equip EMP GLOVE [2] or use GLITCH [4] on Boss' },
      { col: 17, row: 12, text: 'Phase 3: Hack CORE-PURGE Terminal [E]/[3]!' }
    ]
  },

  4: {
    levelNumber: 4,
    name: 'LEVEL 4 — OVERCLOCK SANCTUM',
    subtitle: 'Quantum Processor Sub-Levels & The Prime Singularity',
    objective: 'The ultimate trial: Coordinate all 4 digital tools across 4 fortified security quadrants, retrieve 4 Core Fragments, and access the Prime Core.',
    shardsRequired: 4,
    parTimeMs: 165000,
    initialTool: 'NONE',
    map: [
      '######################',
      '#....#..........#....#',
      '#....#..........#....#',
      '#....D....~~....D....#',
      '#....#..........#....#',
      '######....~~....######',
      '#....................#',
      '#....................#',
      '#.....##########.....#',
      '#.....#........#.....#',
      '#.....D...~~...D.....#',
      '#.....#........#.....#',
      '#.....##########.....#',
      '#....................#',
      '#....................#',
      '######################'
    ],
    playerStart: { col: 10, row: 1 },
    exitPos: { col: 11, row: 11 },
    shards: [
      { col: 2, row: 2 },
      { col: 19, row: 2 },
      { col: 2, row: 13 },
      { col: 19, row: 13 }
    ],
    doors: [
      { id: 'door_sanctum_nw', col: 5, row: 3, initiallyOpen: false },
      { id: 'door_sanctum_ne', col: 16, row: 3, initiallyOpen: false },
      { id: 'door_sanctum_sw', col: 6, row: 10, initiallyOpen: false },
      { id: 'door_sanctum_se', col: 15, row: 10, initiallyOpen: false }
    ],
    switches: [
      {
        id: 'sw_sanctum_top',
        col: 10,
        row: 4,
        targetIds: ['door_sanctum_nw', 'plat_sanctum_1', 'plat_sanctum_2'],
        label: 'SW-QUAD-A',
        message: 'Quadrant Alpha Unlocked & Holo-Plates Energized'
      },
      {
        id: 'sw_sanctum_nw',
        col: 2,
        row: 4,
        targetIds: ['door_sanctum_ne'],
        label: 'SW-QUAD-B',
        message: 'Quadrant Beta Access Gate Opened'
      },
      {
        id: 'sw_sanctum_sw',
        col: 3,
        row: 14,
        targetIds: ['door_sanctum_sw'],
        label: 'SW-SANCTUM-GATE-1',
        message: 'Prime Sanctum West Gate De-energized'
      },
      {
        id: 'sw_sanctum_se',
        col: 18,
        row: 14,
        targetIds: ['door_sanctum_se'],
        label: 'SW-SANCTUM-GATE-2',
        message: 'Prime Sanctum East Gate De-energized'
      }
    ],
    terminals: [
      {
        id: 'term_sanctum_ne',
        col: 19,
        row: 4,
        targetIds: ['laser_sanctum_mid1', 'laser_sanctum_mid2'],
        label: 'TERM-QUANTUM',
        message: 'Quantum Terminal Hacked: Crossfire Lasers Suppressed'
      },
      {
        id: 'term_sanctum_core',
        col: 10,
        row: 11,
        targetIds: ['laser_sanctum_exit'],
        label: 'TERM-PRIME',
        message: 'Prime Core Terminal Linked: System Restoration Complete!'
      }
    ],
    lasers: [
      { id: 'laser_sanctum_mid1', col: 4, row: 7, lengthTiles: 4, direction: 'horizontal', initiallyActive: true },
      { id: 'laser_sanctum_mid2', col: 14, row: 7, lengthTiles: 4, direction: 'horizontal', initiallyActive: true },
      { id: 'laser_sanctum_cross', col: 10, row: 6, lengthTiles: 3, direction: 'vertical', initiallyActive: false },
      { id: 'laser_sanctum_exit', col: 10, row: 12, lengthTiles: 2, direction: 'horizontal', initiallyActive: true }
    ],
    platforms: [
      { id: 'plat_sanctum_1', col: 10, row: 3, initiallyActive: false },
      { id: 'plat_sanctum_2', col: 11, row: 3, initiallyActive: false },
      { id: 'plat_sanctum_3', col: 10, row: 5, initiallyActive: true },
      { id: 'plat_sanctum_4', col: 11, row: 5, initiallyActive: true }
    ],
    hazards: [
      { id: 'haz_sanctum_1', col: 7, row: 6 },
      { id: 'haz_sanctum_2', col: 14, row: 6 },
      { id: 'haz_sanctum_3', col: 7, row: 13 },
      { id: 'haz_sanctum_4', col: 14, row: 13 }
    ],
    enemies: [
      {
        id: 'drone_sanctum_1',
        type: 'drone',
        col: 3,
        row: 6,
        patrolEndCol: 7,
        patrolEndRow: 6
      },
      {
        id: 'drone_sanctum_2',
        type: 'drone',
        col: 14,
        row: 14,
        patrolEndCol: 18,
        patrolEndRow: 14
      },
      {
        id: 'glitch_sanctum_1',
        type: 'glitch',
        col: 18,
        row: 2
      },
      {
        id: 'glitch_sanctum_2',
        type: 'glitch',
        col: 3,
        row: 12
      }
    ],
    sentries: [
      {
        id: 'sentry_sanctum_north',
        col: 10,
        row: 2,
        scanDirection: 'down',
        scanAngleDeg: 60,
        rangeTiles: 5,
        fireIntervalMs: 2000
      },
      {
        id: 'sentry_sanctum_south',
        col: 11,
        row: 13,
        scanDirection: 'up',
        scanAngleDeg: 55,
        rangeTiles: 4,
        fireIntervalMs: 1800
      }
    ],
    secretCache: {
      id: 'cache_sanctum_4',
      col: 1,
      row: 14,
      lore: 'PRIME ARCHIVE: You have reached the core origin. The Gruntz are no longer relics of 1999—they are immortal computational spirits.'
    },
    toolStations: [
      {
        id: 'ts_sanctum_hub',
        col: 10,
        row: 7,
        availableTools: ['HAMMER', 'EMP', 'SHOVEL', 'DECOY']
      },
      {
        id: 'ts_sanctum_west',
        col: 1,
        row: 7,
        availableTools: ['HAMMER', 'EMP', 'SHOVEL', 'DECOY']
      },
      {
        id: 'ts_sanctum_east',
        col: 20,
        row: 7,
        availableTools: ['HAMMER', 'EMP', 'SHOVEL', 'DECOY']
      }
    ],
    corruptedWalls: [
      { id: 'cw_sanctum_nw', col: 5, row: 2 },
      { id: 'cw_sanctum_se', col: 17, row: 13 }
    ],
    softDataBlocks: [
      { id: 'sd_sanctum_ne', col: 17, row: 2 },
      { id: 'sd_sanctum_sw', col: 4, row: 13 }
    ],
    escalations: [
      {
        triggerAtCount: 1,
        alertMessage: 'FRAGMENT 1/4 RESTORED — WARNING: CENTRAL SCANNER ACTIVATED!',
        activateLaserIds: ['laser_sanctum_cross']
      },
      {
        triggerAtCount: 2,
        alertMessage: 'FRAGMENT 2/4 RESTORED — SANCTUM OVERHEAT: SECONDARY DRONES RE-BOOTED!',
        spawnEnemies: [
          {
            id: 'drone_sanctum_esc1',
            type: 'drone',
            col: 10,
            row: 14,
            patrolEndCol: 13,
            patrolEndRow: 14
          }
        ]
      },
      {
        triggerAtCount: 3,
        alertMessage: 'FRAGMENT 3/4 RESTORED — PRIME GATE BARRIERS WEAKENING!',
        openDoorIds: ['door_sanctum_sw', 'door_sanctum_se']
      },
      {
        triggerAtCount: 4,
        alertMessage: 'ALL 4 PRIME FRAGMENTS ASSEMBLED! ENTER THE PRIME CORE CHAMBER TO COMPLETE RESTORATION!',
        openDoorIds: ['door_sanctum_sw', 'door_sanctum_se']
      }
    ],
    hints: [
      { col: 10, row: 8, text: 'CENTRAL HUB: Swap Tools to conquer all 4 Quadrants' },
      { col: 3, row: 1, text: 'NW: HAMMER required' },
      { col: 18, row: 1, text: 'NE: SHOVEL required' },
      { col: 3, row: 15, text: 'SW: EMP + DECOY required' },
      { col: 18, row: 15, text: 'SE: Combined Mastery required' }
    ]
  }
};
