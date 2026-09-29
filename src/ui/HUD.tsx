import React from 'react';
import { Heart, Volume2, VolumeX, Pause, RotateCcw } from 'lucide-react';
import { HudSnapshot } from '../systems/GameEvents';

interface HUDProps {
  hud: HudSnapshot;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
  onSelectLevel: (lvl: 1 | 2 | 3) => void;
}

export const HUD: React.FC<HUDProps> = ({
  hud,
  isMuted,
  onToggleMute,
  onPause,
  onRestart,
  onSelectLevel
}) => {
  const healthLabel =
    hud.hp === 3 ? 'STABLE' : hud.hp === 2 ? 'WARNING' : hud.hp === 1 ? 'CRITICAL' : 'OFFLINE';

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex flex-col">
      {/* Top 3-Zone Header Bar */}
      <header className="pointer-events-auto flex items-center justify-between border-b border-slate-800/90 bg-[#090E17]/95 px-6 py-3 backdrop-blur-sm">
        {/* Zone 1: Top-Left Health & Brand */}
        <div className="flex items-center gap-6">
          <span className="font-display text-lg font-bold tracking-wider text-emerald-400 whitespace-nowrap">
            GRUNTZ: REBOOTED
          </span>

          <div className="flex items-center gap-2.5 border-l border-slate-800 pl-5">
            <div className="flex items-center gap-1.5" aria-label={`Health ${hud.hp} of ${hud.maxHp}`}>
              {Array.from({ length: hud.maxHp }).map((_, i) => {
                const filled = i < hud.hp;
                return (
                  <Heart
                    key={i}
                    className={`h-5 w-5 transition-transform duration-150 ${
                      filled
                        ? 'fill-rose-500 text-rose-500 scale-100'
                        : 'fill-slate-800 text-slate-700 scale-90'
                    }`}
                  />
                );
              })}
            </div>
            <span className="font-mono-tabular text-xs text-slate-300 whitespace-nowrap">
              HP: {hud.hp}/{hud.maxHp} · {healthLabel}
            </span>
          </div>
        </div>

        {/* Zone 2: Sector Navigation & Objective */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-400">
          {([1, 2, 3] as const).map((lvl) => {
            const active = hud.levelNumber === lvl;
            const label =
              lvl === 1 ? '01. Boot Sector' : lvl === 2 ? '02. Firewall Factory' : '03. Core Breach';
            return (
              <button
                key={lvl}
                onClick={() => onSelectLevel(lvl)}
                className={`cursor-pointer transition-colors whitespace-nowrap py-1 ${
                  active
                    ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Top-Right Data Shards & System Controls */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-right">
            <span className="font-mono-tabular text-sm font-semibold text-amber-400 whitespace-nowrap">
              DATA: {hud.shardsCollected} / {hud.shardsRequired}
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span
              className={`font-mono-tabular text-xs font-semibold whitespace-nowrap ${
                hud.exitUnlocked ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {hud.exitUnlocked ? 'EXIT UNLOCKED' : 'EXIT LOCKED'}
            </span>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onRestart}
              title="Restart Level"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onPause}
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>Pause [ESC]</span>
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Sub-Bar: Active Objective & Boss Bar (when in Level 3) */}
      <div className="flex flex-col items-center px-6 pt-2.5 gap-2">
        <div className="flex items-center gap-3 rounded-lg border border-slate-800/80 bg-[#090E17]/90 px-4 py-1.5 text-xs text-slate-300 shadow-sm">
          <span className="font-display font-semibold text-emerald-400 whitespace-nowrap">
            {hud.levelName}
          </span>
          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>
          <span className="text-slate-300">{hud.objectiveText}</span>
        </div>

        {/* Boss Health & Phase Banner in Level 3 */}
        {hud.boss.visible && (
          <div className="w-full max-w-xl rounded-lg border border-rose-900/60 bg-[#090E17]/95 px-4 py-2 shadow-md">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-display font-bold tracking-wide text-rose-400">
                {hud.boss.name} · PHASE {hud.boss.phase} / 3
              </span>
              <span className="font-mono-tabular font-semibold text-slate-200">
                HP: {hud.boss.hp} / {hud.boss.maxHp}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-slate-800">
              <div
                className="h-full bg-rose-500 transition-all duration-200"
                style={{ width: `${(hud.boss.hp / Math.max(1, hud.boss.maxHp)) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-amber-300 font-mono-tabular">
              {hud.boss.statusHint}
            </p>
          </div>
        )}

        {/* Toast & Nearby Terminal Feedback */}
        {(hud.nearbyPrompt || hud.toastMessage) && (
          <div className="rounded-lg border border-amber-500/40 bg-slate-950/95 px-4 py-1.5 text-xs font-medium text-amber-300 shadow-sm font-mono-tabular">
            {hud.nearbyPrompt || hud.toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
