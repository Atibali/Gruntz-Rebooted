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

export interface LevelConfig {
  levelNumber: 1 | 2 | 3;
  name: string;
  subtitle: string;
  objective: string;
  shardsRequired: number;
  /**
   * Legend for ascii map:
   * '#' = Wall
   * '.' = Floor
   * '~' = Void / Data Chasm (impassable unless Platform is active on that tile)
   */
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
  boss?: BossConfig;
  hints: WorldHintConfig[];
}

export const LEVELS: Record<1 | 2 | 3, LevelConfig> = {
  1: {
    levelNumber: 1,
    name: 'LEVEL 1 — BOOT SECTOR',
    subtitle: 'System Initialization & Diagnostics',
    objective: 'Activate the Switch & Terminal, collect 1 Data Shard, and enter the Exit Portal.',
    shardsRequired: 1,
    map: [
      '##################',
      '#......#.........#',
      '#......#.........#',
      '#......D.........#',
      '#......#.........#',
      '#####.#######~~###',
      '#...........#....#',
      '#...........#....#',
      '#...........###D##',
      '#...........#....#',
      '#...........#....#',
      '#...........#....#',
      '##################'
    ],
    playerStart: { col: 2, row: 2 },
    exitPos: { col: 15, row: 10 },
    shards: [{ col: 15, row: 2 }],
    doors: [
      { id: 'door_boot_1', col: 7, row: 3, initiallyOpen: false },
      { id: 'door_boot_2', col: 15, row: 8, initiallyOpen: false }
    ],
    switches: [
      {
        id: 'sw_boot_1',
        col: 4,
        row: 8,
        targetIds: ['door_boot_1'],
        label: 'SW-01',
        message: 'Switch Activated: Upper Security Door Opened'
      }
    ],
    terminals: [
      {
        id: 'term_boot_1',
        col: 10,
        row: 2,
        targetIds: ['plat_boot_1', 'plat_boot_2', 'door_boot_2'],
        label: 'TERM-01',
        message: 'Terminal Hacked: Holo-Bridge & Exit Gate Online'
      }
    ],
    lasers: [],
    platforms: [
      { id: 'plat_boot_1', col: 13, row: 5, initiallyActive: false },
      { id: 'plat_boot_2', col: 14, row: 5, initiallyActive: false }
    ],
    hazards: [],
    enemies: [],
    hints: [
      { col: 3, row: 4, text: 'WASD / Arrows to Move' },
      { col: 4, row: 10, text: 'Step on Switch to Open Door' },
      { col: 10, row: 4, text: 'Press [E] or [3] Hack near Terminal' },
      { col: 14, row: 7, text: 'Collect Shard to Unlock Exit' }
    ]
  },

  2: {
    levelNumber: 2,
    name: 'LEVEL 2 — FIREWALL FACTORY',
    subtitle: 'Packet Security & Active Countermeasures',
    objective: 'Use Shield [1] & EMP [2] to bypass security, collect 2 Data Shards, and reach the Exit.',
    shardsRequired: 2,
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
      { id: 'door_fw_upper', col: 13, row: 3, initiallyOpen: false },
      { id: 'door_fw_lower', col: 6, row: 10, initiallyOpen: false }
    ],
    switches: [
      {
        id: 'sw_fw_1',
        col: 8,
        row: 2,
        targetIds: ['door_fw_upper', 'laser_fw_3'],
        label: 'SW-FW1',
        message: 'Firewall Switch: Shard Vault #1 Unlocked'
      },
      {
        id: 'sw_fw_2',
        col: 11,
        row: 11,
        targetIds: ['door_fw_lower'],
        label: 'SW-FW2',
        message: 'Assembly Switch: Shard Vault #2 Unlocked'
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
      { id: 'laser_fw_3', col: 14, row: 6, lengthTiles: 2, direction: 'vertical', initiallyActive: true },
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
    hints: [
      { col: 4, row: 6, text: 'Press [1] Shield or [2] EMP to pass Lasers' },
      { col: 10, row: 9, text: 'Use [2] EMP or [4] Glitch Pulse on Drones' },
      { col: 16, row: 5, text: 'Hack Terminal [E]/[3] to disable Exit Laser' }
    ]
  },

  3: {
    levelNumber: 3,
    name: 'LEVEL 3 — CORE BREACH',
    subtitle: 'Central System Kernel & Guardian Purge',
    objective: 'Collect 3 Data Shards and defeat the Corrupted Core Guardian to unlock the System Core.',
    shardsRequired: 3,
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
      { id: 'door_core_west', col: 5, row: 3, initiallyOpen: false },
      { id: 'door_core_east', col: 16, row: 3, initiallyOpen: false },
      { id: 'door_core_boss1', col: 10, row: 8, initiallyOpen: false },
      { id: 'door_core_boss2', col: 11, row: 8, initiallyOpen: false }
    ],
    switches: [
      {
        id: 'sw_core_west',
        col: 7,
        row: 4,
        targetIds: ['door_core_west', 'plat_core_west1', 'plat_core_west2'],
        label: 'SW-W',
        message: 'West Sector Switch: Bridge & Vault Open'
      },
      {
        id: 'sw_core_gate',
        col: 3,
        row: 7,
        targetIds: ['door_core_boss1', 'door_core_boss2'],
        label: 'SW-CORE',
        message: 'Core Blast Gates Opened!'
      },
      {
        id: 'sw_boss_surge',
        col: 4,
        row: 12,
        targetIds: ['laser_core_boss'],
        label: 'SURGE-NODE',
        message: 'Surge Triggered: Guardian Armor Disrupted!'
      }
    ],
    terminals: [
      {
        id: 'term_core_east',
        col: 14,
        row: 4,
        targetIds: ['door_core_east', 'plat_core_east1', 'plat_core_east2', 'laser_core_east'],
        label: 'TERM-E',
        message: 'East Terminal Hacked: East Vault & Bridge Ready'
      },
      {
        id: 'term_boss_purge',
        col: 17,
        row: 12,
        targetIds: [],
        label: 'CORE-PURGE',
        message: 'Executing System Core Purge Strike!',
        isBossPurge: true
      }
    ],
    lasers: [
      { id: 'laser_core_west', col: 2, row: 6, lengthTiles: 3, direction: 'horizontal', initiallyActive: true },
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
    boss: {
      col: 11,
      row: 11,
      maxHp: 4
    },
    hints: [
      { col: 10, row: 4, text: 'Unlock West & East Vaults for Shards 1 & 2' },
      { col: 4, row: 10, text: 'Step on SURGE-NODE or use [2] EMP / [4] Glitch on Boss' },
      { col: 17, row: 10, text: 'Use [E] or [3] Hack at CORE-PURGE Terminal!' }
    ]
  }
};
