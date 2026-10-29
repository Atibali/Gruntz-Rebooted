import { progressionSystem } from './ProgressionSystem';

class AudioSystemManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private currentTrack: 'none' | 'menu' | 'level' | 'boss' | 'overclock' = 'none';
  private stepIndex: number = 0;
  private isHighTension: boolean = false;

  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();

        this.applyVolumes();

        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public applyVolumes() {
    const settings = progressionSystem.getSettings();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : settings.masterVolume, this.ctx.currentTime);
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(settings.musicVolume, this.ctx.currentTime);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(settings.sfxVolume, this.ctx.currentTime);
    }
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : vol, this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number) {
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  public setSfxVolume(vol: number) {
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  public playSecretFound() {
    this.playSecretCacheCollect();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.applyVolumes();
    if (muted) {
      this.stopMusic();
    } else if (this.currentTrack !== 'none') {
      const track = this.currentTrack;
      this.currentTrack = 'none';
      this.startMusic(track);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setTension(high: boolean) {
    if (this.isHighTension !== high) {
      this.isHighTension = high;
      if (this.currentTrack !== 'none' && this.currentTrack !== 'menu') {
        const track = this.currentTrack;
        this.stopMusic();
        this.currentTrack = 'none';
        this.startMusic(track);
      }
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 0.12,
    slideToFreq?: number,
    delayMs: number = 0,
    isMusic: boolean = false
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const parentGain = isMusic ? this.musicGain : this.sfxGain;
    if (!parentGain) return;

    const startTime = ctx.currentTime + delayMs / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideToFreq), startTime + duration);
    }

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(parentGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // --- Sound Effects ---

  public playFootstep() {
    this.playTone(180, 0.03, 'triangle', 0.02, 120);
  }

  public playSwitch() {
    this.playTone(523.25, 0.08, 'square', 0.12);
    this.playTone(659.25, 0.1, 'square', 0.12, undefined, 50);
    this.playTone(783.99, 0.14, 'triangle', 0.14, undefined, 100);
  }

  public playDoorOpen() {
    this.playTone(160, 0.22, 'sawtooth', 0.09, 340);
    this.playTone(440, 0.16, 'triangle', 0.09, 587.33, 90);
  }

  public playDataCollect() {
    const notes = [587.33, 783.99, 987.77, 1174.66];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.13, 'triangle', 0.14, undefined, idx * 55);
    });
  }

  public playSecretCacheCollect() {
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.22, 'sine', 0.18, undefined, idx * 60);
    });
  }

  public playDamage() {
    this.playTone(140, 0.2, 'sawtooth', 0.22, 45);
    this.playTone(90, 0.22, 'square', 0.2, 40, 70);
  }

  public playShield() {
    this.playTone(329.63, 0.22, 'sine', 0.16, 659.25);
    this.playTone(659.25, 0.3, 'triangle', 0.12, 880, 90);
  }

  public playEmp() {
    this.playTone(520, 0.32, 'sawtooth', 0.18, 55);
    this.playTone(980, 0.22, 'square', 0.12, 110, 35);
  }

  public playHack() {
    const freqs = [660, 880, 1320, 990, 1480];
    freqs.forEach((f, i) => {
      this.playTone(f, 0.06, 'square', 0.11, undefined, i * 40);
    });
  }

  public playGlitchPulse() {
    this.playTone(720, 0.09, 'sawtooth', 0.15, 180);
    this.playTone(240, 0.11, 'square', 0.15, 920, 60);
    this.playTone(640, 0.14, 'sawtooth', 0.12, 140, 120);
  }

  public playToolPickup() {
    this.playTone(392.0, 0.07, 'triangle', 0.14);
    this.playTone(523.25, 0.08, 'triangle', 0.14, undefined, 55);
    this.playTone(783.99, 0.15, 'square', 0.12, undefined, 110);
  }

  public playHammerSmash() {
    this.playTone(130, 0.16, 'sawtooth', 0.22, 38);
    this.playTone(85, 0.2, 'square', 0.18, 30, 45);
  }

  public playShovelDig() {
    this.playTone(220, 0.09, 'triangle', 0.15, 380);
    this.playTone(330, 0.11, 'sine', 0.14, 520, 65);
  }

  public playDecoyDeploy() {
    this.playTone(587.33, 0.09, 'sine', 0.14, 880);
    this.playTone(880, 0.13, 'triangle', 0.12, 587.33, 80);
  }

  public playTurretAlert() {
    this.playTone(880, 0.06, 'sawtooth', 0.14, 1100);
    this.playTone(1100, 0.06, 'sawtooth', 0.14, 880, 70);
  }

  public playSecurityAlert() {
    this.playTone(440, 0.15, 'sawtooth', 0.16, 620);
    this.playTone(440, 0.16, 'sawtooth', 0.16, 620, 160);
  }

  public playEnemyAlert() {
    this.playTone(600, 0.07, 'square', 0.1, 820);
    this.playTone(820, 0.09, 'square', 0.1, 600, 75);
  }

  public playBossHit() {
    this.playTone(220, 0.16, 'sawtooth', 0.2, 65);
    this.playTone(440, 0.14, 'square', 0.16, 105, 75);
    this.playTone(880, 0.22, 'triangle', 0.14, 210, 140);
  }

  public playAchievementUnlocked() {
    const melody = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    melody.forEach((freq, idx) => {
      this.playTone(freq, 0.18, 'triangle', 0.16, undefined, idx * 75);
    });
  }

  public playVictory() {
    const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
    const times = [0, 100, 200, 310, 440, 560, 700];
    melody.forEach((freq, idx) => {
      this.playTone(freq, idx === melody.length - 1 ? 0.45 : 0.13, 'triangle', 0.16, undefined, times[idx]);
    });
  }

  // --- Dynamic Polyphonic Background Music Engine ---

  public startMusic(track: 'menu' | 'level' | 'boss' | 'overclock') {
    if (this.currentTrack === track && this.bgmInterval !== null) return;
    this.stopMusic();
    this.currentTrack = track;
    if (this.isMuted) return;

    this.applyVolumes();
    this.stepIndex = 0;

    // Rich polyphonic motifs
    const menuBass = [220, 0, 261.63, 0, 293.66, 0, 261.63, 196.0];
    const menuArp = [440, 523.25, 659.25, 523.25, 587.33, 659.25, 783.99, 659.25];

    const levelBass = [146.83, 146.83, 220, 146.83, 174.61, 164.81, 130.81, 196.0];
    const levelArp = [293.66, 329.63, 349.23, 392.0, 440.0, 392.0, 349.23, 329.63];

    const bossBass = [110, 123.47, 130.81, 110, 146.83, 130.81, 123.47, 98.0];
    const bossLead = [220, 246.94, 261.63, 293.66, 329.63, 293.66, 261.63, 220];

    const overclockBass = [98.0, 110.0, 123.47, 146.83, 130.81, 110.0, 98.0, 82.41];
    const overclockArp = [392.0, 440.0, 493.88, 587.33, 523.25, 440.0, 392.0, 329.63];

    let intervalMs = 230;
    if (track === 'menu') intervalMs = 280;
    else if (track === 'level') intervalMs = this.isHighTension ? 180 : 230;
    else if (track === 'boss') intervalMs = this.isHighTension ? 150 : 185;
    else if (track === 'overclock') intervalMs = this.isHighTension ? 140 : 175;

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted) return;

      let bassNote = 0;
      let leadNote = 0;

      if (track === 'menu') {
        bassNote = menuBass[this.stepIndex % menuBass.length];
        leadNote = menuArp[this.stepIndex % menuArp.length];
      } else if (track === 'level') {
        bassNote = levelBass[this.stepIndex % levelBass.length];
        leadNote = levelArp[this.stepIndex % levelArp.length];
      } else if (track === 'boss') {
        bassNote = bossBass[this.stepIndex % bossBass.length];
        leadNote = bossLead[this.stepIndex % bossLead.length];
      } else if (track === 'overclock') {
        bassNote = overclockBass[this.stepIndex % overclockBass.length];
        leadNote = overclockArp[this.stepIndex % overclockArp.length];
      }

      this.stepIndex++;

      // Play bass tone
      if (bassNote > 0) {
        this.playTone(
          bassNote,
          0.16,
          track === 'boss' || track === 'overclock' ? 'sawtooth' : 'triangle',
          0.04,
          undefined,
          0,
          true
        );
      }

      // Play lead tone every other beat or on high tension
      if (leadNote > 0 && (this.isHighTension || this.stepIndex % 2 === 0)) {
        this.playTone(
          leadNote,
          0.09,
          'square',
          this.isHighTension ? 0.025 : 0.016,
          undefined,
          20,
          true
        );
      }
    }, intervalMs);
  }

  public stopMusic() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const AudioSystem = new AudioSystemManager();
