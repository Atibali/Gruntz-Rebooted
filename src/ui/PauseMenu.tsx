import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onMainMenu
}) => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-[#0B121E] p-8 shadow-2xl">
        <h2 className="font-display text-center text-2xl font-bold tracking-wider text-emerald-400">
          SYSTEM PAUSED
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Digital Grunt Diagnostics Standby
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onResume}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>RESUME GAME [ESC]</span>
          </button>

          <button
            onClick={onRestart}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="h-4 w-4" />
            <span>RESTART LEVEL</span>
          </button>

          <button
            onClick={onMainMenu}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-5 py-3 text-sm font-semibold text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors whitespace-nowrap"
          >
            <Home className="h-4 w-4" />
            <span>MAIN MENU</span>
          </button>
        </div>

        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <h3 className="font-display text-xs font-semibold text-slate-300 mb-2">
            QUICK CONTROLS REFERENCE
          </h3>
          <div className="grid grid-cols-2 gap-y-1.5 text-xs font-mono-tabular text-slate-400">
            <span>WASD / ARROWS</span>
            <span className="text-right text-slate-200">Move Grunt</span>
            <span>E</span>
            <span className="text-right text-slate-200">Interact / Terminal</span>
            <span>1 · 2 · 3 · 4</span>
            <span className="text-right text-slate-200">Shield · EMP · Hack · Glitch</span>
            <span>ESC</span>
            <span className="text-right text-slate-200">Pause / Resume</span>
          </div>
        </div>
      </div>
    </div>
  );
};
