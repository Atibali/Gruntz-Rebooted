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

export interface SecurityEscalationConfig {
  triggerAtCount: number;
  alertMessage: string;
  activateLaserIds?: string[];
  openDoorIds?: string[];
  spawnEnemies?: EnemyConfig[];
  partiallyAwakenBoss?: boolean;
}

export interface LevelConfig {
  levelNumber: 1 | 2 | 3;
  name: string;
  subtitle: string;
  objective: string;
  shardsRequired: number;
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
  toolStations: ToolStationConfig[];
  corruptedWalls: CorruptedWallConfig[];
  softDataBlocks: SoftDataConfig[];
  escalations: SecurityEscalationConfig[];
  boss?: BossConfig;
  hints: WorldHintConfig[];
}

export const LEVELS: Record<1 | 2 | 3, LevelConfig> = {
  1: {
    levelNumber: 1,
    name: 'LEVEL 1 — BOOT SECTOR',
    subtitle: 'Tool Calibration & Core Fragment Recovery',
    objective: 'Find the Tool Station, equip DATA HAMMER to break the Corrupted Wall, recover 1 Core Fragment, and escape.',
    shardsRequired: 1,
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
    objective: 'Swap tools at Tool Stations (1 at a time) to breach Upper & Lower Vaults, recover 2 Core Fragments, and escape.',
    shardsRequired: 2,
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
  }
};
