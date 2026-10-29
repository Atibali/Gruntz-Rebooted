import React, { useState } from 'react';
import {
  progressionSystem,
  Achievement
} from '../systems/ProgressionSystem';
import {
  Trophy,
  X,
  Star,
  CheckCircle2,
  Lock,
  Clock,
  Activity,
  Cpu,
  Flame,
  Wrench,
  Zap,
  Target
} from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const data = progressionSystem.getSaveData();
  const achievements = progressionSystem.getAchievements();
  const totalStars = progressionSystem.getTotalStars();
  const maxPossibleStars = 12; // 4 sectors * 3 stars each

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#090e17] border-2 border-amber-500/40 rounded-xl shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/60 to-slate-900 border-b border-amber-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 rounded border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wider text-amber-300 font-mono">
                DATA CORE ARCHIVE & HONORS
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                System Honors, Sector Stars, & Subroutine Performance
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-lg">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold font-mono text-amber-300">
                {totalStars} / {maxPossibleStars} STARS
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Sector Stars Progress Row */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3 flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Sector Clear & Mastery Ratings</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((sec) => {
                const rec = data.sectorRecords[sec];
                const stars = rec ? (rec.starsEarned ?? rec.stars ?? 0) : 0;
                const completed = rec ? rec.completed : false;
                const bestTime = rec?.bestTimeMs
                  ? (rec.bestTimeMs / 1000).toFixed(1) + 's'
                  : '--';

                return (
                  <div
                    key={sec}
                    className={`p-3 rounded-lg border flex flex-col ${
                      completed
                        ? 'bg-slate-900/80 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-200 mb-1.5">
                      <span>SECTOR {sec}</span>
                      <div className="flex space-x-0.5">
                        {[1, 2, 3].map((starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-3.5 h-3.5 ${
                              starIdx <= stars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-auto pt-2 border-t border-slate-800 flex justify-between">
                      <span>BEST:</span>
                      <span className="text-cyan-400 font-bold">{bestTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Player Lifetime Statistics */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>System Telemetry & Activity Stats</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
              <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80">
                <div className="text-[10px] font-mono text-slate-400">SECTORS CLEARED</div>
                <div className="text-base font-bold font-mono text-cyan-400">
                  {data.stats.totalSectorsCleared}
                </div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80">
                <div className="text-[10px] font-mono text-slate-400">CORE FRAGMENTS</div>
                <div className="text-base font-bold font-mono text-cyan-400">
                  {data.stats.shardsCollected}
                </div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80">
                <div className="text-[10px] font-mono text-slate-400">TOOL OPERATIONS</div>
                <div className="text-base font-bold font-mono text-cyan-400">
                  {data.stats.toolsUsed}
                </div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80">
                <div className="text-[10px] font-mono text-slate-400">ABILITY PULSES</div>
                <div className="text-base font-bold font-mono text-cyan-400">
                  {data.stats.abilitiesUsed}
                </div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80">
                <div className="text-[10px] font-mono text-slate-400">DAMAGE SUSTAINED</div>
                <div className="text-base font-bold font-mono text-rose-400">
                  {data.stats.damageTaken} HP
                </div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80">
                <div className="text-[10px] font-mono text-slate-400">SESSION TIME</div>
                <div className="text-base font-bold font-mono text-slate-200">
                  {formatTime(data.stats.playtimeMs)}
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3 flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>System Honors & Medals</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((ach) => {
                return (
                  <div
                    key={ach.id}
                    className={`p-3.5 rounded-lg border flex items-start space-x-3 transition-all ${
                      ach.unlocked
                        ? 'bg-slate-900/80 border-amber-500/30'
                        : 'bg-slate-950/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg border shrink-0 ${
                        ach.unlocked
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                          : 'bg-slate-800/40 border-slate-700 text-slate-600'
                      }`}
                    >
                      {ach.unlocked ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-xs font-bold font-mono tracking-wide ${
                            ach.unlocked ? 'text-amber-300' : 'text-slate-400'
                          }`}
                        >
                          {ach.title}
                        </h4>
                        {ach.unlocked && (
                          <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                            EARNED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-1">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs tracking-wider transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            DISMISS ARCHIVE
          </button>
        </div>
      </div>
    </div>
  );
};
