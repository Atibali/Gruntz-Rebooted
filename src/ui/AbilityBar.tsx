import React from 'react';
import {
  Shield,
  Zap,
  Terminal as TerminalIcon,
  Sparkles,
  Hammer,
  Shovel,
  Radio,
  Wrench,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { AbilityStatus, TOOL_CATALOG, ToolType } from '../systems/GameEvents';

interface AbilityBarProps {
  activeTool: ToolType;
  abilities: AbilityStatus[];
  nearbyPrompt: string | null;
  onUseActiveTool: () => void;
  onTriggerAbility: (id: 'shield' | 'emp' | 'hack' | 'glitch') => void;
  onTriggerInteract: () => void;
  onMoveDir: (dx: number, dy: number) => void;
}

export const AbilityBar: React.FC<AbilityBarProps> = ({
  activeTool,
  abilities,
  nearbyPrompt,
  onUseActiveTool,
  onTriggerAbility,
  onTriggerInteract,
  onMoveDir
}) => {
  const toolMeta = TOOL_CATALOG[activeTool];

  const getToolIcon = (tool: ToolType) => {
    switch (tool) {
      case 'HAMMER':
        return <Hammer className="h-4 w-4 text-amber-400" />;
      case 'EMP':
        return <Zap className="h-4 w-4 text-sky-400" />;
      case 'SHOVEL':
        return <Shovel className="h-4 w-4 text-emerald-400" />;
      case 'DECOY':
        return <Radio className="h-4 w-4 text-rose-400" />;
      default:
        return <Wrench className="h-4 w-4 text-slate-500" />;
    }
  };

  const getIcon = (id: AbilityStatus['id']) => {
    switch (id) {
      case 'shield':
        return <Shield className="h-4 w-4 text-sky-400" />;
      case 'emp':
        return <Zap className="h-4 w-4 text-amber-400" />;
      case 'hack':
        return <TerminalIcon className="h-4 w-4 text-emerald-400" />;
      case 'glitch':
        return <Sparkles className="h-4 w-4 text-rose-400" />;
    }
  };

  const getDesc = (ab: AbilityStatus) => {
    switch (ab.id) {
      case 'shield':
        return '3s Barrier';
      case 'emp':
        return ab.toolAvailable ? 'EMP Glove Ready' : 'Needs EMP Glove';
      case 'hack':
        return 'Override Terminal';
      case 'glitch':
        return 'Stun & Reverse';
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-end justify-between px-4 sm:px-6 pb-3 gap-3">
      {/* Compact Touch / Mouse D-Pad */}
      <div className="pointer-events-auto hidden xl:grid grid-cols-3 gap-1 rounded-xl border border-slate-800/90 bg-[#090E17]/90 p-2 backdrop-blur-sm">
        <div />
        <button
          onPointerDown={() => onMoveDir(0, -1)}
          onPointerUp={() => onMoveDir(0, 0)}
          onPointerLeave={() => onMoveDir(0, 0)}
          title="Move Up (W / Up Arrow)"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-slate-800/90 text-slate-200 hover:bg-slate-700 active:bg-emerald-600"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <div />
        <button
          onPointerDown={() => onMoveDir(-1, 0)}
          onPointerUp={() => onMoveDir(0, 0)}
          onPointerLeave={() => onMoveDir(0, 0)}
          title="Move Left (A / Left Arrow)"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-slate-800/90 text-slate-200 hover:bg-slate-700 active:bg-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          onPointerDown={() => onMoveDir(0, 1)}
          onPointerUp={() => onMoveDir(0, 0)}
          onPointerLeave={() => onMoveDir(0, 0)}
          title="Move Down (S / Down Arrow)"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-slate-800/90 text-slate-200 hover:bg-slate-700 active:bg-emerald-600"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          onPointerDown={() => onMoveDir(1, 0)}
          onPointerUp={() => onMoveDir(0, 0)}
          onPointerLeave={() => onMoveDir(0, 0)}
          title="Move Right (D / Right Arrow)"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-slate-800/90 text-slate-200 hover:bg-slate-700 active:bg-emerald-600"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Center Dock: Separated PHYSICAL TOOL Slot + DIGITAL ABILITIES */}
      <div className="pointer-events-auto mx-auto flex flex-wrap items-center justify-center gap-2.5 rounded-xl border border-slate-800/90 bg-[#090E17]/95 p-2 shadow-xl backdrop-blur-sm">
        {/* Active Physical Tool Slot (One-Tool-at-a-Time) */}
        <button
          onClick={onUseActiveTool}
          className={`flex min-w-[165px] cursor-pointer flex-col rounded-lg border px-3.5 py-2 text-left transition-all ${
            activeTool !== 'NONE'
              ? 'border-amber-500/70 bg-amber-950/30 hover:bg-amber-950/50'
              : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-tabular text-[10px] font-bold tracking-wider text-amber-400 whitespace-nowrap">
              ACTIVE TOOL [SPACE]
            </span>
            {getToolIcon(activeTool)}
          </div>
          <div className="mt-0.5 font-display text-sm font-bold text-slate-100 whitespace-nowrap">
            [{toolMeta.shortName}]
          </div>
          <span className="text-[10px] text-slate-400 whitespace-nowrap">
            {toolMeta.usageHint}
          </span>
        </button>

        <div className="hidden sm:block h-10 w-px bg-slate-800 mx-0.5" />

        {/* 4 Digital Abilities */}
        {abilities.map((ab) => {
          const pct =
            ab.cooldownTotal > 0
              ? Math.min(100, (ab.cooldownRemaining / ab.cooldownTotal) * 100)
              : 0;
          return (
            <button
              key={ab.id}
              onClick={() => onTriggerAbility(ab.id)}
              className={`relative flex min-w-[122px] cursor-pointer flex-col overflow-hidden rounded-lg border px-3 py-2 text-left transition-all ${
                ab.activeRemaining > 0
                  ? 'border-sky-400 bg-sky-950/60'
                  : ab.isReady
                  ? 'border-slate-700/90 bg-slate-900/90 hover:border-emerald-500/70 hover:bg-slate-800/90'
                  : 'border-slate-800 bg-slate-950/80 opacity-65'
              }`}
            >
              {ab.cooldownRemaining > 0 && (
                <div
                  className="absolute bottom-0 left-0 h-1 bg-amber-400 transition-all duration-100"
                  style={{ width: `${pct}%` }}
                />
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono-tabular text-xs font-bold text-emerald-400">
                    [{ab.key}]
                  </span>
                  {getIcon(ab.id)}
                  <span className="font-display text-xs sm:text-sm font-semibold text-slate-100 whitespace-nowrap">
                    {ab.name}
                  </span>
                </div>

                <span className="font-mono-tabular text-[10px] text-slate-400 whitespace-nowrap">
                  {ab.activeRemaining > 0
                    ? `${ab.activeRemaining.toFixed(1)}s`
                    : ab.cooldownRemaining > 0
                    ? `${ab.cooldownRemaining.toFixed(1)}s`
                    : ab.requiresTool && !ab.toolAvailable
                    ? 'LOCKED'
                    : 'READY'}
                </span>
              </div>

              <span className="mt-0.5 text-[10px] text-slate-400 whitespace-nowrap">
                {getDesc(ab)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contextual Interact [E] Button */}
      <div className="pointer-events-auto hidden lg:flex">
        <button
          onClick={onTriggerInteract}
          className={`cursor-pointer rounded-xl border px-4 py-3 font-mono-tabular text-xs font-semibold transition-all whitespace-nowrap ${
            nearbyPrompt
              ? 'border-emerald-400 bg-emerald-950/80 text-emerald-300 shadow-lg'
              : 'border-slate-800 bg-[#090E17]/90 text-slate-300 hover:border-slate-700'
          }`}
        >
          [E] INTERACT / STATION
        </button>
      </div>
    </div>
  );
};
