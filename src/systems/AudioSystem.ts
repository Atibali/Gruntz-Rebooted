// Web Audio API Synthesizer for Retro-Digital / 1990s Puzzle Computer Aesthetic

class AudioSystemManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private currentTrack: 'none' | 'menu' | 'level' | 'boss' = 'none';
  private stepIndex: number = 0;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
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

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 0.12,
    slideToFreq?: number,
    delayMs: number = 0
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

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
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  public playSwitch() {
    this.playTone(523.25, 0.09, 'square', 0.12);
    this.playTone(659.25, 0.12, 'square', 0.12, undefined, 70);
    this.playTone(783.99, 0.16, 'triangle', 0.14, undefined, 140);
  }

  public playDoorOpen() {
    this.playTone(180, 0.25, 'sawtooth', 0.1, 360);
    this.playTone(440, 0.18, 'triangle', 0.1, 587.33, 120);
  }

  public playDataCollect() {
    const notes = [587.33, 783.99, 987.77, 1174.66];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.14, 'triangle', 0.15, undefined, idx * 65);
    });
  }

  public playDamage() {
    this.playTone(160, 0.22, 'sawtooth', 0.2, 55);
    this.playTone(110, 0.25, 'square', 0.18, 45, 90);
  }

  public playShield() {
    this.playTone(329.63, 0.25, 'sine', 0.16, 659.25);
    this.playTone(659.25, 0.35, 'triangle', 0.12, 880, 100);
  }

  public playEmp() {
    this.playTone(480, 0.35, 'sawtooth', 0.18, 65);
    this.playTone(880, 0.25, 'square', 0.12, 120, 40);
  }

  public playHack() {
    const freqs = [660, 880, 1320, 990, 1480];
    freqs.forEach((f, i) => {
      this.playTone(f, 0.07, 'square', 0.11, undefined, i * 45);
    });
  }

  public playGlitchPulse() {
    this.playTone(720, 0.1, 'sawtooth', 0.15, 180);
    this.playTone(240, 0.12, 'square', 0.15, 920, 70);
    this.playTone(640, 0.15, 'sawtooth', 0.12, 140, 140);
  }

  public playEnemyAlert() {
    this.playTone(600, 0.08, 'square', 0.1, 820);
    this.playTone(820, 0.1, 'square', 0.1, 600, 85);
  }

  public playBossHit() {
    this.playTone(220, 0.18, 'sawtooth', 0.2, 70);
    this.playTone(440, 0.15, 'square', 0.16, 110, 80);
    this.playTone(880, 0.25, 'triangle', 0.14, 220, 160);
  }

  public playVictory() {
    const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    const times = [0, 110, 220, 340, 500, 640];
    melody.forEach((freq, idx) => {
      this.playTone(freq, idx === melody.length - 1 ? 0.45 : 0.14, 'triangle', 0.16, undefined, times[idx]);
    });
  }

  public startMusic(track: 'menu' | 'level' | 'boss') {
    if (this.currentTrack === track && this.bgmInterval !== null) return;
    this.stopMusic();
    this.currentTrack = track;
    if (this.isMuted) return;

    this.stepIndex = 0;
    const menuPattern = [220, 0, 261.63, 293.66, 329.63, 0, 293.66, 261.63];
    const levelPattern = [146.83, 146.83, 220, 146.83, 174.61, 164.81, 130.81, 196.0];
    const bossPattern = [110, 123.47, 130.81, 110, 146.83, 130.81, 123.47, 98.0];

    const intervalMs = track === 'boss' ? 190 : track === 'level' ? 240 : 300;

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted) return;
      const pattern =
        track === 'boss' ? bossPattern : track === 'level' ? levelPattern : menuPattern;
      const note = pattern[this.stepIndex % pattern.length];
      this.stepIndex++;
      if (note > 0) {
        this.playTone(note, 0.16, track === 'boss' ? 'sawtooth' : 'triangle', 0.035);
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
