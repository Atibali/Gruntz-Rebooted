import React, { useState } from 'react';
import {
  Difficulty,
  DIFFICULTY_PRESETS,
  progressionSystem
} from '../systems/ProgressionSystem';
import { AudioSystem } from '../systems/AudioSystem';
import {
  X,
  Volume2,
  VolumeX,
  Gauge,
  ShieldAlert,
  RotateCcw,
  Check,
  Flame,
  Zap,
  Info
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDifficultyChange?: (difficulty: Difficulty) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDifficultyChange
}) => {
  if (!isOpen) return null;

  const [settings, setSettings] = useState(progressionSystem.getSettings());
  const [currentDiff, setCurrentDiff] = useState<Difficulty>(progressionSystem.getDifficulty());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleDifficultySelect = (diff: Difficulty) => {
    progressionSystem.setDifficulty(diff);
    setCurrentDiff(diff);
    AudioSystem.playToolPickup();
    if (onDifficultyChange) {
      onDifficultyChange(diff);
    }
  };

  const handleMasterVolume = (val: number) => {
    const updated = progressionSystem.updateSettings({ masterVolume: val });
    setSettings(updated);
    AudioSystem.setMasterVolume(val);
  };

  const handleMusicVolume = (val: number) => {
    const updated = progressionSystem.updateSettings({ musicVolume: val });
    setSettings(updated);
    AudioSystem.setMusicVolume(val);
  };

  const handleSfxVolume = (val: number) => {
    const updated = progressionSystem.updateSettings({ sfxVolume: val });
    setSettings(updated);
    AudioSystem.setSfxVolume(val);
    AudioSystem.playFootstep();
  };

  const handleToggleSpeedrun = () => {
    const updated = progressionSystem.updateSettings({
      showSpeedrunTimer: !settings.showSpeedrunTimer
    });
    setSettings(updated);
    AudioSystem.playToolPickup();
  };

  const handleResetProgress = () => {
    progressionSystem.resetAllProgress();
    setShowResetConfirm(false);
    AudioSystem.playSecurityAlert();
    setSettings(progressionSystem.getSettings());
    setCurrentDiff(progressionSystem.getDifficulty());
  };

  const diffList: Difficulty[] = ['STORY', 'NORMAL', 'HARD', 'NIGHTMARE'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090e17] border-2 border-cyan-500/40 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-950/60 to-slate-900 border-b border-cyan-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/30 text-cyan-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wider text-cyan-300 font-mono">
                SYSTEM CONFIGURATION
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Subroutine Parameters & Audio Routing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Difficulty Preset */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
                Subroutine Difficulty Mode
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {diffList.map((d) => {
                const preset = DIFFICULTY_PRESETS[d];
                const isSelected = currentDiff === d;
                return (
                  <button
                    key={d}
                    onClick={() => handleDifficultySelect(d)}
                    className={`flex flex-col p-3 rounded-lg border text-left transition-all relative ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className={`text-xs font-bold font-mono tracking-wider ${
                          isSelected ? 'text-cyan-300' : 'text-slate-300'
                        }`}
                      >
                        {preset.name}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight mb-2">
                      {preset.desc}
                    </span>
                    <div className="mt-auto pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>HP: {preset.playerHp}</span>
                      <span>SPD: {preset.droneSpeedMult}x</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Channels */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
                Audio Synthesizer Routing
              </h3>
            </div>
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
              {/* Master Volume */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span>MASTER GAIN</span>
                  <span className="text-cyan-400 font-bold">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) => handleMasterVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>

              {/* Music Volume */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span>POLYPHONIC BGM</span>
                  <span className="text-cyan-400 font-bold">
                    {Math.round(settings.musicVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => handleMusicVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>

              {/* SFX Volume */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
                  <span>DIGITAL SFX & CHIMES</span>
                  <span className="text-cyan-400 font-bold">
                    {Math.round(settings.sfxVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => handleSfxVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Gameplay Toggles */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
                Speedrun & Interface Display
              </h3>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <div>
                <div className="text-xs font-bold text-slate-200 font-mono">
                  ACTIVE SPEEDRUN STOPWATCH
                </div>
                <div className="text-[11px] text-slate-400">
                  Display millisecond timer and Par Time tracker on top HUD bar
                </div>
              </div>
              <button
                onClick={handleToggleSpeedrun}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showSpeedrunTimer ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showSpeedrunTimer ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset Progress Section */}
          <div className="pt-4 border-t border-slate-800/80">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center space-x-2 text-xs font-mono text-rose-400 hover:text-rose-300 px-3 py-2 rounded border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>PURGE SAVED PROGRESS & RECORDS</span>
              </button>
            ) : (
              <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-lg space-y-2">
                <div className="text-xs text-rose-300 font-mono font-bold">
                  CONFIRM PURGE: Clear all unlocked sectors, stars, and speedrun records?
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleResetProgress}
                    className="px-3 py-1.5 text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
                  >
                    YES, PURGE DATA
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 rounded transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs tracking-wider transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            CONFIRM & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
