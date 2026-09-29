import Phaser from 'phaser';

export type GameState =
  | 'MAIN_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER'
  | 'VICTORY';

export interface AbilityStatus {
  id: 'shield' | 'emp' | 'hack' | 'glitch';
  key: string;
  name: string;
  cooldownRemaining: number;
  cooldownTotal: number;
  activeRemaining: number;
  isReady: boolean;
}

export interface BossHudState {
  visible: boolean;
  name: string;
  hp: number;
  maxHp: number;
  phase: 1 | 2 | 3;
  statusHint: string;
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
  abilities: AbilityStatus[];
  nearbyPrompt: string | null;
  toastMessage: string | null;
  boss: BossHudState;
}

export const gameEvents = new Phaser.Events.EventEmitter();
