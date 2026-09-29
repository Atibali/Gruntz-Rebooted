import Phaser from 'phaser';

export type GameState =
  | 'MAIN_MENU'
  | 'LEVEL_INTRO'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER'
  | 'VICTORY';

export type ToolType = 'NONE' | 'HAMMER' | 'EMP' | 'SHOVEL' | 'DECOY';

export interface ToolMetadata {
  id: ToolType;
  name: string;
  shortName: string;
  description: string;
  usageHint: string;
}

export const TOOL_CATALOG: Record<ToolType, ToolMetadata> = {
  NONE: {
    id: 'NONE',
    name: 'No Tool Equipped',
    shortName: 'NONE',
    description: 'Visit a Tool Station [E] to equip a physical tool.',
    usageHint: 'Find a Tool Station [E]'
  },
  HAMMER: {
    id: 'HAMMER',
    name: 'Data Hammer',
    shortName: 'HAMMER',
    description: 'Smashes cracked Corrupted Walls & hardened data blocks.',
    usageHint: '[SPACE / E] Smash Corrupted Wall'
  },
  EMP: {
    id: 'EMP',
    name: 'EMP Glove',
    shortName: 'EMP GLOVE',
    description: 'Powers [2] EMP blast to disable drones, lasers & traps.',
    usageHint: '[2 / SPACE] Emit EMP Blast'
  },
  SHOVEL: {
    id: 'SHOVEL',
    name: 'Void Shovel',
    shortName: 'SHOVEL',
    description: 'Excavates Soft-Data obstacles to open hidden routes.',
    usageHint: '[SPACE / E] Dig Soft-Data Mound'
  },
  DECOY: {
    id: 'DECOY',
    name: 'Glitch Decoy',
    shortName: 'DECOY',
    description: 'Deploys a holographic signal that lures nearby enemies away.',
    usageHint: '[SPACE / E] Deploy Decoy Signal'
  }
};

export interface AbilityStatus {
  id: 'shield' | 'emp' | 'hack' | 'glitch';
  key: string;
  name: string;
  cooldownRemaining: number;
  cooldownTotal: number;
  activeRemaining: number;
  isReady: boolean;
  requiresTool?: boolean;
  toolAvailable?: boolean;
}

export interface BossHudState {
  visible: boolean;
  name: string;
  hp: number;
  maxHp: number;
  phase: 1 | 2 | 3;
  statusHint: string;
  surgeNodesRemaining?: number;
}

export interface ToolStationModalState {
  isOpen: boolean;
  stationId: string;
  availableTools: ToolType[];
  currentTool: ToolType;
}

export interface HudSnapshot {
  levelNumber: 1 | 2 | 3;
  levelName: string;
  levelSubtitle: string;
  objectiveText: string;
  hp: number;
  maxHp: number;
  shardsCollected: number;
  shardsRequired: number;
  exitUnlocked: boolean;
  exitLockReason: string;
  activeTool: ToolType;
  securityAlertLevel: number;
  abilities: AbilityStatus[];
  nearbyPrompt: string | null;
  toastMessage: string | null;
  boss: BossHudState;
  toolStationModal: ToolStationModalState;
}

export const gameEvents = new Phaser.Events.EventEmitter();
