import { ToolType } from './GameEvents';

export type Difficulty = 'STORY' | 'NORMAL' | 'HARD' | 'NIGHTMARE';

export interface DifficultyConfig {
  id: Difficulty;
  name: string;
  tagline: string;
  desc?: string;
  playerHp: number;
  enemySpeedMultiplier: number;
  droneSpeedMult?: number;
  detectionRadiusMultiplier: number;
  detectionRadiusMult?: number;
  abilityCooldownMultiplier: number;
  hazardSpeedMultiplier: number;
  scoreMultiplier: number;
  color: string;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  STORY: {
    id: 'STORY',
    name: 'Story',
    tagline: 'Forgiving mainframe. 4 HP, slower security hazards, and faster ability cooldowns.',
    desc: 'Forgiving mainframe. 4 HP, slower hazards, and faster recharges.',
    playerHp: 4,
    enemySpeedMultiplier: 0.8,
    droneSpeedMult: 0.8,
    detectionRadiusMultiplier: 0.8,
    detectionRadiusMult: 0.8,
    abilityCooldownMultiplier: 0.8,
    hazardSpeedMultiplier: 0.85,
    scoreMultiplier: 0.8,
    color: '#34d399'
  },
  NORMAL: {
    id: 'NORMAL',
    name: 'Normal',
    tagline: 'Standard security protocol. 3 HP, balanced tactical puzzles, and reactive drones.',
    desc: 'Standard security protocol. 3 HP, balanced tactical puzzles, reactive drones.',
    playerHp: 3,
    enemySpeedMultiplier: 1.0,
    droneSpeedMult: 1.0,
    detectionRadiusMultiplier: 1.0,
    detectionRadiusMult: 1.0,
    abilityCooldownMultiplier: 1.0,
    hazardSpeedMultiplier: 1.0,
    scoreMultiplier: 1.0,
    color: '#38bdf8'
  },
  HARD: {
    id: 'HARD',
    name: 'Hard',
    tagline: 'High-alert firewall. 2 HP, aggressive patrols, faster hazards, and precise timing.',
    desc: 'High-alert firewall. 2 HP, aggressive patrols, rapid hazards, precise timing.',
    playerHp: 2,
    enemySpeedMultiplier: 1.15,
    droneSpeedMult: 1.15,
    detectionRadiusMultiplier: 1.2,
    detectionRadiusMult: 1.2,
    abilityCooldownMultiplier: 1.15,
    hazardSpeedMultiplier: 1.2,
    scoreMultiplier: 1.5,
    color: '#f59e0b'
  },
  NIGHTMARE: {
    id: 'NIGHTMARE',
    name: 'Nightmare',
    tagline: 'Kernel zero-tolerance. 1 HP critical! Relentless drones, rapid hazards, and no room for error.',
    desc: 'Kernel zero-tolerance. 1 HP critical! Relentless drones, zero room for error.',
    playerHp: 1,
    enemySpeedMultiplier: 1.3,
    droneSpeedMult: 1.3,
    detectionRadiusMultiplier: 1.35,
    detectionRadiusMult: 1.35,
    abilityCooldownMultiplier: 1.25,
    hazardSpeedMultiplier: 1.35,
    scoreMultiplier: 2.2,
    color: '#f43f5e'
  }
};

export const DIFFICULTY_PRESETS = DIFFICULTY_CONFIGS;

export interface LevelRecord {
  completed: boolean;
  stars: number;
  starsEarned?: number;
  bestTimeMs: number | null;
  bestDamageTaken: number | null;
  foundSecretCache: boolean;
  highestDifficulty: Difficulty | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface PlayerStats {
  wallsSmashed: number;
  softDataDug: number;
  empFired: number;
  enemiesDistracted: number;
  terminalsHacked: number;
  guardianPurgedCount: number;
  totalDamageTaken: number;
  totalPlayTimeMs: number;
  totalSectorsCleared?: number;
  shardsCollected?: number;
  toolsUsed?: number;
  abilitiesUsed?: number;
  damageTaken?: number;
  playtimeMs?: number;
}

export interface GameSettings {
  difficulty: Difficulty;
  masterVolume: number; // 0.0 - 1.0
  musicVolume: number;  // 0.0 - 1.0
  sfxVolume: number;    // 0.0 - 1.0
  showSpeedrunTimer: boolean;
  screenShake: boolean;
}

export interface SaveDataModel {
  settings: GameSettings;
  sectorRecords: Record<number, LevelRecord>;
  stats: Required<PlayerStats>;
  achievements: Record<string, Achievement>;
}

const STORAGE_KEY_SAVE = 'gruntz_rebooted_save_v2';

export class ProgressionSystemManager {
  private settings: GameSettings = {
    difficulty: 'NORMAL',
    masterVolume: 0.8,
    musicVolume: 0.7,
    sfxVolume: 0.85,
    showSpeedrunTimer: false,
    screenShake: true
  };

  private levelRecords: Record<number, LevelRecord> = {
    1: { completed: false, stars: 0, starsEarned: 0, bestTimeMs: null, bestDamageTaken: null, foundSecretCache: false, highestDifficulty: null },
    2: { completed: false, stars: 0, starsEarned: 0, bestTimeMs: null, bestDamageTaken: null, foundSecretCache: false, highestDifficulty: null },
    3: { completed: false, stars: 0, starsEarned: 0, bestTimeMs: null, bestDamageTaken: null, foundSecretCache: false, highestDifficulty: null },
    4: { completed: false, stars: 0, starsEarned: 0, bestTimeMs: null, bestDamageTaken: null, foundSecretCache: false, highestDifficulty: null }
  };

  private stats: Required<PlayerStats> = {
    wallsSmashed: 0,
    softDataDug: 0,
    empFired: 0,
    enemiesDistracted: 0,
    terminalsHacked: 0,
    guardianPurgedCount: 0,
    totalDamageTaken: 0,
    totalPlayTimeMs: 0,
    totalSectorsCleared: 0,
    shardsCollected: 0,
    toolsUsed: 0,
    abilitiesUsed: 0,
    damageTaken: 0,
    playtimeMs: 0
  };

  private achievements: Record<string, Achievement> = {
    silicon_smasher: {
      id: 'silicon_smasher',
      title: 'Silicon Smasher',
      description: 'Smash 8 Corrupted Walls with the Data Hammer.',
      icon: 'Hammer',
      unlocked: false
    },
    subsurface_archaeologist: {
      id: 'subsurface_archaeologist',
      title: 'Subsurface Archaeologist',
      description: 'Excavate 6 Soft-Data mounds with the Void Shovel.',
      icon: 'Shovel',
      unlocked: false
    },
    grid_disruptor: {
      id: 'grid_disruptor',
      title: 'Grid Disruptor',
      description: 'Discharge the EMP Glove 10 times to disable electronic security.',
      icon: 'Zap',
      unlocked: false
    },
    ghost_protocol: {
      id: 'ghost_protocol',
      title: 'Ghost Protocol',
      description: 'Lure 6 Security Drones or Glitch Creatures with Glitch Decoys.',
      icon: 'Radio',
      unlocked: false
    },
    clean_trace: {
      id: 'clean_trace',
      title: 'Clean Trace',
      description: 'Complete any sector with 0 damage taken.',
      icon: 'Shield',
      unlocked: false
    },
    nightmare_architect: {
      id: 'nightmare_architect',
      title: 'Nightmare Architect',
      description: 'Complete any sector on Nightmare difficulty (1 HP!).',
      icon: 'AlertTriangle',
      unlocked: false
    },
    kernel_purger: {
      id: 'kernel_purger',
      title: 'Kernel Purger',
      description: 'Defeat the Corrupted Core Guardian in Sector 3.',
      icon: 'CheckCircle2',
      unlocked: false
    },
    system_overlord: {
      id: 'system_overlord',
      title: 'System Overlord',
      description: 'Master all 4 sectors with 3 stars each (12 Total Stars).',
      icon: 'Sparkles',
      unlocked: false
    }
  };

  constructor() {
    this.load();
  }

  public getSettings(): GameSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<GameSettings>): GameSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.save();
    return this.getSettings();
  }

  public setSettings(newSettings: Partial<GameSettings>) {
    this.updateSettings(newSettings);
  }

  public getDifficulty(): Difficulty {
    return this.settings.difficulty;
  }

  public getDifficultyConfig(): DifficultyConfig {
    return DIFFICULTY_CONFIGS[this.settings.difficulty];
  }

  public setDifficulty(diff: Difficulty) {
    this.settings.difficulty = diff;
    this.save();
  }

  public getLevelRecord(levelNum: number): LevelRecord {
    return (
      this.levelRecords[levelNum] || {
        completed: false,
        stars: 0,
        starsEarned: 0,
        bestTimeMs: null,
        bestDamageTaken: null,
        foundSecretCache: false,
        highestDifficulty: null
      }
    );
  }

  public getAllLevelRecords(): Record<number, LevelRecord> {
    return { ...this.levelRecords };
  }

  public getSaveData(): SaveDataModel {
    return {
      settings: { ...this.settings },
      sectorRecords: { ...this.levelRecords },
      stats: { ...this.stats },
      achievements: { ...this.achievements }
    };
  }

  public getTotalStars(): number {
    return Object.values(this.levelRecords).reduce((acc, rec) => acc + (rec.stars || 0), 0);
  }

  public getStats(): Required<PlayerStats> {
    return { ...this.stats };
  }

  public getAchievements(): Achievement[] {
    return Object.values(this.achievements);
  }

  public unlockAchievement(id: string) {
    if (this.achievements[id] && !this.achievements[id].unlocked) {
      this.achievements[id].unlocked = true;
      this.achievements[id].unlockedAt = new Date().toISOString();
      this.save();
    }
  }

  public recordToolUse(tool: ToolType) {
    this.stats.toolsUsed++;
    if (tool === 'HAMMER') this.stats.wallsSmashed++;
    if (tool === 'SHOVEL') this.stats.softDataDug++;
    if (tool === 'EMP') this.stats.empFired++;
    if (tool === 'DECOY') this.stats.enemiesDistracted++;
    this.checkStatAchievements();
    this.save();
  }

  public recordAbilityUse(ability: string) {
    this.stats.abilitiesUsed++;
    if (ability === 'emp') this.stats.empFired++;
    this.checkStatAchievements();
    this.save();
  }

  public recordSectorCompletion(
    levelNum: number,
    timeMs: number,
    damageTaken: number,
    foundSecret: boolean,
    parTimeMs: number
  ): { starsEarned: number; isNewBestTime: boolean; newlyUnlockedAchievements: Achievement[] } {
    const prev = this.getLevelRecord(levelNum);
    let stars = 1; // Completed = 1 star

    if (foundSecret || prev.foundSecretCache) {
      stars++;
    }

    if (damageTaken === 0 || timeMs <= parTimeMs) {
      stars = Math.min(3, stars + 1);
    }

    const isNewBestTime = prev.bestTimeMs === null || timeMs < prev.bestTimeMs;
    const bestTime = prev.bestTimeMs ? Math.min(prev.bestTimeMs, timeMs) : timeMs;
    const bestDamage =
      prev.bestDamageTaken !== null ? Math.min(prev.bestDamageTaken, damageTaken) : damageTaken;
    const finalStars = Math.max(prev.stars, stars);

    this.levelRecords[levelNum] = {
      completed: true,
      stars: finalStars,
      starsEarned: finalStars,
      bestTimeMs: bestTime,
      bestDamageTaken: bestDamage,
      foundSecretCache: prev.foundSecretCache || foundSecret,
      highestDifficulty: this.settings.difficulty
    };

    this.stats.totalSectorsCleared++;
    this.stats.totalDamageTaken += damageTaken;
    this.stats.damageTaken += damageTaken;
    this.stats.totalPlayTimeMs += timeMs;
    this.stats.playtimeMs += timeMs;

    const newlyUnlocked: Achievement[] = [];

    // Clean Trace
    if (damageTaken === 0 && !this.achievements.clean_trace.unlocked) {
      this.achievements.clean_trace.unlocked = true;
      this.achievements.clean_trace.unlockedAt = new Date().toISOString();
      newlyUnlocked.push(this.achievements.clean_trace);
    }

    // Nightmare Architect
    if (this.settings.difficulty === 'NIGHTMARE' && !this.achievements.nightmare_architect.unlocked) {
      this.achievements.nightmare_architect.unlocked = true;
      this.achievements.nightmare_architect.unlockedAt = new Date().toISOString();
      newlyUnlocked.push(this.achievements.nightmare_architect);
    }

    // Kernel Purger
    if ((levelNum === 3 || levelNum === 4) && !this.achievements.kernel_purger.unlocked) {
      this.achievements.kernel_purger.unlocked = true;
      this.achievements.kernel_purger.unlockedAt = new Date().toISOString();
      newlyUnlocked.push(this.achievements.kernel_purger);
    }

    // System Overlord (all 4 sectors have 3 stars)
    const allThreeStars = [1, 2, 3, 4].every((lvl) => (this.levelRecords[lvl]?.stars || 0) >= 3);
    if (allThreeStars && !this.achievements.system_overlord.unlocked) {
      this.achievements.system_overlord.unlocked = true;
      this.achievements.system_overlord.unlockedAt = new Date().toISOString();
      newlyUnlocked.push(this.achievements.system_overlord);
    }

    this.save();
    return { starsEarned: finalStars, isNewBestTime, newlyUnlockedAchievements: newlyUnlocked };
  }

  private checkStatAchievements() {
    if (this.stats.wallsSmashed >= 8 && !this.achievements.silicon_smasher.unlocked) {
      this.achievements.silicon_smasher.unlocked = true;
    }
    if (this.stats.softDataDug >= 6 && !this.achievements.subsurface_archaeologist.unlocked) {
      this.achievements.subsurface_archaeologist.unlocked = true;
    }
    if (this.stats.empFired >= 10 && !this.achievements.grid_disruptor.unlocked) {
      this.achievements.grid_disruptor.unlocked = true;
    }
    if (this.stats.enemiesDistracted >= 6 && !this.achievements.ghost_protocol.unlocked) {
      this.achievements.ghost_protocol.unlocked = true;
    }
  }

  public resetAllProgress() {
    this.resetProgress();
  }

  public resetProgress() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_SAVE);
    }
    this.levelRecords = {
      1: { completed: false, stars: 0, starsEarned: 0, bestTimeMs: null, bestDamageTaken: null, foundSecretCache: false, highestDifficulty: null },
      2: { completed: false, stars: 0, starsEarned: 0, bestTimeMs: null, bestDamageTaken: null, foundSecretCache: false, highestDifficulty: null },
      3: { completed: false, stars: 0, starsEarned: 0, bestTimeMs: null, bestDamageTaken: null, foundSecretCache: false, highestDifficulty: null },
      4: { completed: false, stars: 0, starsEarned: 0, bestTimeMs: null, bestDamageTaken: null, foundSecretCache: false, highestDifficulty: null }
    };
    this.stats = {
      wallsSmashed: 0,
      softDataDug: 0,
      empFired: 0,
      enemiesDistracted: 0,
      terminalsHacked: 0,
      guardianPurgedCount: 0,
      totalDamageTaken: 0,
      totalPlayTimeMs: 0,
      totalSectorsCleared: 0,
      shardsCollected: 0,
      toolsUsed: 0,
      abilitiesUsed: 0,
      damageTaken: 0,
      playtimeMs: 0
    };
    Object.keys(this.achievements).forEach((k) => {
      this.achievements[k].unlocked = false;
    });
    this.save();
  }

  private save() {
    if (typeof window === 'undefined') return;
    try {
      const data = {
        settings: this.settings,
        levelRecords: this.levelRecords,
        stats: this.stats,
        achievements: this.achievements
      };
      localStorage.setItem(STORAGE_KEY_SAVE, JSON.stringify(data));
    } catch {
      // Ignore quota or private storage errors
    }
  }

  private load() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVE);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.settings) this.settings = { ...this.settings, ...parsed.settings };
      if (parsed.levelRecords) this.levelRecords = { ...this.levelRecords, ...parsed.levelRecords };
      if (parsed.stats) this.stats = { ...this.stats, ...parsed.stats };
      if (parsed.achievements) {
        Object.keys(parsed.achievements).forEach((k) => {
          if (this.achievements[k]) {
            this.achievements[k].unlocked = parsed.achievements[k].unlocked;
            this.achievements[k].unlockedAt = parsed.achievements[k].unlockedAt;
          }
        });
      }
    } catch {
      // Fallback to defaults
    }
  }
}

export const progressionSystem = new ProgressionSystemManager();
