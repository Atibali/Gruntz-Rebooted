import { LevelConfig, LEVELS } from '../config/levels';

export class LevelSystem {
  private currentLevelNum: 1 | 2 | 3 = 1;
  private shardsCollected: number = 0;

  public setLevel(levelNum: 1 | 2 | 3) {
    this.currentLevelNum = levelNum;
    this.shardsCollected = 0;
  }

  public getCurrentLevelNumber(): 1 | 2 | 3 {
    return this.currentLevelNum;
  }

  public getCurrentConfig(): LevelConfig {
    return LEVELS[this.currentLevelNum];
  }

  public addShard() {
    this.shardsCollected++;
  }

  public getShardsCollected(): number {
    return this.shardsCollected;
  }

  public getShardsRequired(): number {
    return this.getCurrentConfig().shardsRequired;
  }

  public areAllShardsCollected(): boolean {
    return this.shardsCollected >= this.getShardsRequired();
  }
}

export const levelSystem = new LevelSystem();
