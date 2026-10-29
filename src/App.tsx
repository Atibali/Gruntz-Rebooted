import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { Level1Scene } from './scenes/Level1Scene';
import { Level2Scene } from './scenes/Level2Scene';
import { Level3Scene } from './scenes/Level3Scene';
import { Level4Scene } from './scenes/Level4Scene';
import { gameEvents, GameState, HudSnapshot, ToolType } from './systems/GameEvents';
import { AudioSystem } from './systems/AudioSystem';
import { progressionSystem } from './systems/ProgressionSystem';
import { HUD } from './ui/HUD';
import { AbilityBar } from './ui/AbilityBar';
import { PauseMenu } from './ui/PauseMenu';
import { SettingsModal } from './ui/SettingsModal';
import { AchievementsModal } from './ui/AchievementsModal';
import { LEVELS } from './config/levels';
import {
  Play,
  Shield,
  Zap,
  Terminal,
  Sparkles,
  Hammer,
  Shovel,
  Radio,
  RotateCcw,
  ArrowRight,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Settings,
  Star,
  Clock,
  Heart
} from 'lucide-react';

const INITIAL_HUD: HudSnapshot = {
  levelNumber: 1,
  levelName: 'LEVEL 1 — BOOT SECTOR',
  levelSubtitle: 'Tool Calibration & Core Fragment Recovery',
  objectiveText:
    'Find the Tool Station, equip DATA HAMMER to break the Corrupted Wall, recover 1 Core Fragment, and escape.',
  hp: 3,
  maxHp: 3,
  shardsCollected: 0,
  shardsRequired: 1,
  exitUnlocked: false,
  exitLockReason: 'LOCKED: RECOVER 1 MORE CORE FRAGMENT (0/1)',
  activeTool: 'NONE',
  securityAlertLevel: 0,
  abilities: [
    { id: 'shield', key: '1', name: 'Shield', cooldownRemaining: 0, cooldownTotal: 6, activeRemaining: 0, isReady: true },
    {
      id: 'emp',
      key: '2',
      name: 'EMP Pulse',
      cooldownRemaining: 0,
      cooldownTotal: 5,
      activeRemaining: 0,
      isReady: false,
      requiresTool: true,
      toolAvailable: false
    },
    { id: 'hack', key: '3', name: 'Hack [E]', cooldownRemaining: 0, cooldownTotal: 2.5, activeRemaining: 0, isReady: true },
    { id: 'glitch', key: '4', name: 'Glitch', cooldownRemaining: 0, cooldownTotal: 4, activeRemaining: 0, isReady: true }
  ],
  nearbyPrompt: null,
  toastMessage: null,
  speedrunTimeMs: 0,
  parTimeMs: 65000,
  difficulty: 'NORMAL',
  boss: {
    visible: false,
    name: 'CORRUPTED CORE GUARDIAN',
    hp: 4,
    maxHp: 4,
    phase: 1,
    statusHint: '',
    surgeNodesRemaining: 2
  },
  toolStationModal: {
    isOpen: false,
    stationId: '',
    availableTools: [],
    currentTool: 'NONE'
  }
};

interface CompletionStats {
  levelNumber: number;
  levelName?: string;
  timeMs: number;
  damageTaken: number;
  starsEarned: number;
  isNewBestTime?: boolean;
  shardsCollected: number;
  shardsRequired: number;
}

export default function App() {
  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  const [gameState, setGameState] = useState<GameState>('MAIN_MENU');
  const [showControlsModal, setShowControlsModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3 | 4>(1);
  const [lastStats, setLastStats] = useState<CompletionStats | null>(null);
  const activeLevelRef = useRef<1 | 2 | 3 | 4>(1);

  const getSceneKey = (lvl: 1 | 2 | 3 | 4) =>
    lvl === 1
      ? 'Level1Scene'
      : lvl === 2
      ? 'Level2Scene'
      : lvl === 3
      ? 'Level3Scene'
      : 'Level4Scene';

  const prepareLevel = useCallback((lvl: 1 | 2 | 3 | 4) => {
    activeLevelRef.current = lvl;
    setActiveLevel(lvl);
    setGameState('LEVEL_INTRO');
    setShowControlsModal(false);
    const game = phaserGameRef.current;
    if (game) {
      (['Level1Scene', 'Level2Scene', 'Level3Scene', 'Level4Scene'] as const).forEach((key) => {
        if (game.scene.isActive(key) && !game.scene.isPaused(key)) {
          game.scene.pause(key);
        }
      });
    }
  }, []);

  const startOrSwitchLevel = useCallback((lvl: 1 | 2 | 3 | 4) => {
    activeLevelRef.current = lvl;
    setActiveLevel(lvl);
    setGameState('PLAYING');
    setShowControlsModal(false);
    const game = phaserGameRef.current;
    if (!game) return;

    const targetKey = getSceneKey(lvl);
    (['Level1Scene', 'Level2Scene', 'Level3Scene', 'Level4Scene'] as const).forEach((k) => {
      if (k !== targetKey && game.scene.isActive(k)) {
        game.scene.stop(k);
      }
      if (game.scene.isPaused(k)) {
        game.scene.resume(k);
        if (k !== targetKey) game.scene.stop(k);
      }
    });

    game.scene.start(targetKey);
  }, []);

  useEffect(() => {
    if (!gameContainerRef.current || phaserGameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#070b12',
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [BootScene, Level1Scene, Level2Scene, Level3Scene, Level4Scene]
    };

    const game = new Phaser.Game(config);
    phaserGameRef.current = game;

    const onHudUpdate = (snapshot: HudSnapshot) => {
      setHud(snapshot);
    };

    const onLevelComplete = (payload: CompletionStats) => {
      setLastStats(payload);
      setGameState('LEVEL_COMPLETE');
    };

    const onGameOver = () => {
      setGameState('GAME_OVER');
    };

    const onVictory = (payload: CompletionStats) => {
      setLastStats(payload);
      setGameState('VICTORY');
    };

    const onRequestTogglePause = () => {
      setGameState((prev) => {
        const currentKey = getSceneKey(activeLevelRef.current);
        if (prev === 'PLAYING') {
          game.scene.pause(currentKey);
          return 'PAUSED';
        } else if (prev === 'PAUSED') {
          game.scene.resume(currentKey);
          return 'PLAYING';
        }
        return prev;
      });
    };

    gameEvents.on('hud-update', onHudUpdate);
    gameEvents.on('level-complete', onLevelComplete);
    gameEvents.on('level-game-over', onGameOver);
    gameEvents.on('game-victory', onVictory);
    gameEvents.on('request-toggle-pause', onRequestTogglePause);

    return () => {
      gameEvents.off('hud-update', onHudUpdate);
      gameEvents.off('level-complete', onLevelComplete);
      gameEvents.off('level-game-over', onGameOver);
      gameEvents.off('game-victory', onVictory);
      gameEvents.off('request-toggle-pause', onRequestTogglePause);
      game.destroy(true);
      phaserGameRef.current = null;
    };
  }, []);

  const handleToggleMute = () => {
    const muted = AudioSystem.toggleMute();
    setIsMuted(muted);
  };

  const handlePause = () => {
    const game = phaserGameRef.current;
    const key = getSceneKey(activeLevel);
    if (game && gameState === 'PLAYING') {
      game.scene.pause(key);
      setGameState('PAUSED');
    }
  };

  const handleResume = () => {
    const game = phaserGameRef.current;
    const key = getSceneKey(activeLevel);
    if (game && gameState === 'PAUSED') {
      game.scene.resume(key);
      setGameState('PLAYING');
    }
  };

  const handleRestartLevel = () => {
    startOrSwitchLevel(activeLevel);
  };

  const handleNextLevel = () => {
    if (activeLevel < 4) {
      prepareLevel((activeLevel + 1) as 1 | 2 | 3 | 4);
    } else {
      prepareLevel(1);
    }
  };

  const handleMainMenu = () => {
    const game = phaserGameRef.current;
    if (game) {
      (['Level1Scene', 'Level2Scene', 'Level3Scene', 'Level4Scene'] as const).forEach((k) => {
        if (game.scene.isActive(k) || game.scene.isPaused(k)) {
          game.scene.stop(k);
        }
      });
    }
    AudioSystem.startMusic('menu');
    setGameState('MAIN_MENU');
  };

  const handleSelectToolFromModal = (tool: ToolType) => {
    gameEvents.emit('ui-select-tool', tool);
  };

  const handleCloseToolModal = () => {
    gameEvents.emit('ui-close-tool-modal');
  };

  const totalStars = progressionSystem.getTotalStars();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#070B12] text-slate-100 select-none">
      {/* Phaser 3 WebGL/Canvas Viewport */}
      <div ref={gameContainerRef} className="h-full w-full" />

      {/* Subtle CRT Scanline Overlay */}
      <div className="crt-scanlines pointer-events-none fixed inset-0 z-10 opacity-35" />

      {/* Active Gameplay HUD & Bottom Bar */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <>
          <HUD
            hud={hud}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={handlePause}
            onRestart={handleRestartLevel}
            onSelectLevel={prepareLevel}
            onSelectToolFromModal={handleSelectToolFromModal}
            onCloseToolModal={handleCloseToolModal}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenAchievements={() => setShowAchievementsModal(true)}
          />
          <AbilityBar
            activeTool={hud.activeTool}
            abilities={hud.abilities}
            nearbyPrompt={hud.nearbyPrompt}
            onUseActiveTool={() => gameEvents.emit('ui-use-tool')}
            onTriggerAbility={(id) => gameEvents.emit('ui-ability', id)}
            onTriggerInteract={() => gameEvents.emit('ui-interact')}
            onMoveDir={(dx, dy) => gameEvents.emit('ui-move', { x: dx, y: dy })}
          />
        </>
      )}

      {/* MAIN MENU OVERLAY */}
      {gameState === 'MAIN_MENU' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#070B12]/90 backdrop-blur-md p-6 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-[#0B121E] p-8 md:p-10 shadow-2xl">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <span className="font-mono-tabular text-xs font-semibold tracking-widest text-amber-400">
                  1999 PUZZLE-STRATEGY DNA · TOOL & REPLAY OVERHAUL
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{totalStars} / 12 STARS</span>
                </span>
              </div>
              <h1
                className="font-display mt-2 text-4xl md:text-5xl font-bold tracking-wider text-emerald-400"
                style={{ textWrap: 'balance' }}
              >
                GRUNTZ: REBOOTED
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 leading-relaxed">
                Explore a corrupted computer mainframe, swap physical tools at Tool Stations (one
                at a time), smash corrupted walls, excavate soft-data paths, bypass scanning Sentry
                Turrets, recover Core Fragments, and access the Overclock Sanctum.
              </p>
            </div>

            {/* Primary Menu Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => prepareLevel(1)}
                className="flex cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-7 py-3.5 font-display text-base font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-lg whitespace-nowrap"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>PLAY GAME</span>
              </button>

              <button
                onClick={() => setShowAchievementsModal(true)}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3.5 font-display text-sm font-semibold text-amber-300 hover:border-amber-500/50 hover:bg-amber-500/20 transition-all whitespace-nowrap"
              >
                <Trophy className="h-4 w-4" />
                <span>HONORS & ARCHIVE</span>
              </button>

              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3.5 font-display text-sm font-semibold text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-500/20 transition-all whitespace-nowrap"
              >
                <Settings className="h-4 w-4" />
                <span>SETTINGS & AUDIO</span>
              </button>

              <button
                onClick={() => setShowControlsModal((prev) => !prev)}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3.5 font-display text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-all whitespace-nowrap"
              >
                <Keyboard className="h-4 w-4 text-slate-400" />
                <span>{showControlsModal ? 'HIDE CONTROLS' : 'CONTROLS'}</span>
              </button>
            </div>

            {/* Direct Sector Launch */}
            <div className="mt-8 border-t border-slate-800/90 pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-xs font-semibold tracking-wider text-slate-400">
                  SYSTEM SECTORS
                </span>
                <span className="font-mono-tabular text-xs text-slate-400">
                  4 Tools · 4 Abilities · 4 Sectors
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => prepareLevel(1)}
                  className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-left hover:border-emerald-500/60 hover:bg-slate-900 transition-colors"
                >
                  <div className="font-display text-sm font-bold text-emerald-400">
                    01. Boot Sector
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    Hammer · Shovel · 1 Fragment
                  </div>
                </button>
                <button
                  onClick={() => prepareLevel(2)}
                  className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-left hover:border-amber-500/60 hover:bg-slate-900 transition-colors"
                >
                  <div className="font-display text-sm font-bold text-amber-400">
                    02. Firewall
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    Sentry · Decoy · 2 Fragments
                  </div>
                </button>
                <button
                  onClick={() => prepareLevel(3)}
                  className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-left hover:border-rose-500/60 hover:bg-slate-900 transition-colors"
                >
                  <div className="font-display text-sm font-bold text-rose-400">
                    03. Core Breach
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    Guardian Boss · 3 Fragments
                  </div>
                </button>
                <button
                  onClick={() => prepareLevel(4)}
                  className="cursor-pointer rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-3 text-left hover:border-cyan-400 hover:bg-cyan-950/40 transition-colors"
                >
                  <div className="font-display text-sm font-bold text-cyan-300">
                    04. Sanctum
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    Prime Core · 4 Fragments
                  </div>
                </button>
              </div>
            </div>

            {/* Expandable Controls Panel */}
            {showControlsModal && (
              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/90 p-5 space-y-5">
                <div>
                  <h2 className="font-display text-sm font-bold text-amber-400 mb-2.5">
                    PHYSICAL TOOLS (CARRY ONE AT A TIME VIA TOOL STATIONS [E])
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-start gap-2.5 text-slate-300">
                      <Hammer className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Data Hammer:</strong> Breaks cracked Corrupted Walls blocking vaults.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-slate-300">
                      <Zap className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">EMP Glove:</strong> Powers [2] EMP blast to disable drones, lasers & sentries.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-slate-300">
                      <Shovel className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Void Shovel:</strong> Excavates Soft-Data obstacles to reveal alternate paths.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-slate-300">
                      <Radio className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Glitch Decoy:</strong> Deploys a fake signal that lures nearby drones away.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-2 font-mono-tabular">
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-emerald-400 font-semibold">WASD / ARROWS</span>
                      <span className="text-slate-200">Move Digital Grunt</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-emerald-400 font-semibold">E</span>
                      <span className="text-slate-200">Use Tool Station / Terminal</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-emerald-400 font-semibold">SPACE</span>
                      <span className="text-slate-200">Use Equipped Physical Tool</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-emerald-400 font-semibold">1 · 2 · 3 · 4</span>
                      <span className="text-slate-200">Shield · EMP · Hack · Glitch</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Shield className="h-4 w-4 text-sky-400 shrink-0" />
                      <span>
                        <strong className="text-white">[1] Shield:</strong> 3s defensive barrier.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>
                        <strong className="text-white">[2] EMP:</strong> Discharges EMP Glove.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Terminal className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>
                        <strong className="text-white">[3] Hack:</strong> Terminal override.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Sparkles className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>
                        <strong className="text-white">[4] Glitch:</strong> Stuns & reverses enemies.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'LEVEL_INTRO' && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-[#070B12]/90 p-4 backdrop-blur-md sm:items-center">
          <section
            aria-labelledby="level-intro-title"
            className="my-auto w-full max-w-xl rounded-2xl border border-emerald-500/30 bg-[#0B121E] p-7 shadow-2xl sm:p-9"
          >
            <p className="font-mono-tabular text-xs font-semibold tracking-[0.2em] text-amber-400">
              SECTOR {String(activeLevel).padStart(2, '0')} · SYSTEM BRIEFING
            </p>
            <h2
              id="level-intro-title"
              className="font-display mt-3 text-3xl font-bold tracking-wide text-emerald-400 sm:text-4xl"
            >
              {LEVELS[activeLevel].name}
            </h2>
            <p className="mt-2 text-sm text-slate-400">{LEVELS[activeLevel].subtitle}</p>
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/80 p-5">
              <p className="font-mono-tabular text-[11px] font-semibold tracking-wider text-slate-500">
                PRIMARY OBJECTIVE
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                {LEVELS[activeLevel].objective}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300">
                  REQUIRED CORE FRAGMENTS · {LEVELS[activeLevel].shardsRequired}
                </span>
                <span className="text-cyan-400">
                  PAR TIME · {(LEVELS[activeLevel].parTimeMs / 1000).toFixed(0)}s
                </span>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={handleMainMenu}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800"
              >
                BACK TO MAIN MENU
              </button>
              <button
                onClick={() => startOrSwitchLevel(activeLevel)}
                className="flex-1 rounded-xl bg-emerald-500 px-5 py-3 font-display text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                INITIALIZE SECTOR
              </button>
            </div>
          </section>
        </div>
      )}

      {/* PAUSE MENU OVERLAY */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestartLevel}
          onMainMenu={handleMainMenu}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenAchievements={() => setShowAchievementsModal(true)}
        />
      )}

      {/* LEVEL COMPLETE MODAL */}
      {gameState === 'LEVEL_COMPLETE' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/40 bg-[#0B121E] p-8 text-center shadow-2xl">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h2 className="font-display mt-3 text-3xl font-bold tracking-wide text-emerald-400">
              SECTOR COMPLETE
            </h2>
            <p className="mt-1 text-xs text-slate-400">{hud.levelName}</p>

            {/* Star Rating Display */}
            {lastStats && (
              <div className="mt-4 flex items-center justify-center space-x-2">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`w-7 h-7 transition-all ${
                      starIdx <= lastStats.starsEarned
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="mt-5 space-y-2 rounded-xl border border-slate-800 bg-slate-950/90 p-4 font-mono-tabular text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">CORE FRAGMENTS:</span>
                <span className="font-bold text-amber-400">
                  {lastStats ? lastStats.shardsCollected : hud.shardsCollected} /{' '}
                  {lastStats ? lastStats.shardsRequired : hud.shardsRequired}
                </span>
              </div>
              {lastStats && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CLEAR TIME:</span>
                    <span className="font-bold text-cyan-300">
                      {(lastStats.timeMs / 1000).toFixed(1)}s
                      {lastStats.isNewBestTime && (
                        <span className="ml-1.5 text-[10px] text-amber-400 font-bold">
                          [NEW BEST]
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">DAMAGE SUSTAINED:</span>
                    <span
                      className={`font-bold ${
                        lastStats.damageTaken === 0 ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {lastStats.damageTaken === 0
                        ? '0 HP (FLAWLESS ★)'
                        : `${lastStats.damageTaken} HP`}
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleNextLevel}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 font-display text-base font-bold text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap shadow-lg"
            >
              <span>{activeLevel < 4 ? 'NEXT SECTOR' : 'REVISIT SECTORS'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {gameState === 'GAME_OVER' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-[#0B121E] p-8 text-center shadow-2xl">
            <AlertTriangle className="mx-auto h-12 w-12 text-rose-500" />
            <h2 className="font-display mt-3 text-3xl font-bold tracking-wide text-rose-400">
              GAME OVER
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Digital Grunt integrity reached 0 HP in {hud.levelName}.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleRestartLevel}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3.5 font-display text-base font-bold text-white hover:bg-rose-400 transition-colors whitespace-nowrap shadow-lg"
              >
                <RotateCcw className="h-5 w-5" />
                <span>RESTART LEVEL</span>
              </button>
              <button
                onClick={handleMainMenu}
                className="w-full cursor-pointer rounded-xl border border-slate-800 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY MODAL */}
      {gameState === 'VICTORY' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-emerald-500/50 bg-[#0B121E] p-8 text-center shadow-2xl">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
            <p className="mt-3 font-mono-tabular text-xs font-semibold tracking-widest text-amber-400">
              PRIME RESTORATION: 100% COMPLETE
            </p>
            <h2 className="font-display mt-1 text-3xl md:text-4xl font-bold tracking-wide text-emerald-400">
              SYSTEM RESTORED!
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Your Digital Grunt mastered all 4 physical tools, solved every security grid,
              overcame the Sentry Turrets, and purged the systemic corruption from the Prime Sanctum.
            </p>

            {/* Victory Stars */}
            <div className="mt-4 flex items-center justify-center space-x-2">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span className="font-mono font-bold text-amber-300 text-sm">
                TOTAL STARS: {totalStars} / 12
              </span>
            </div>

            <div className="mt-5 space-y-2 rounded-xl border border-slate-800 bg-slate-950/90 p-4 font-mono-tabular text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">SANCTUM CLEAR TIME:</span>
                <span className="font-bold text-cyan-300">
                  {lastStats ? (lastStats.timeMs / 1000).toFixed(1) + 's' : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DAMAGE SUSTAINED:</span>
                <span className="font-bold text-emerald-400">
                  {lastStats ? `${lastStats.damageTaken} HP` : '0 HP'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ALL 4 SECTORS:</span>
                <span className="font-bold text-emerald-400">OPERATIONAL & ONLINE</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => startOrSwitchLevel(1)}
                className="flex-1 cursor-pointer rounded-xl bg-emerald-500 px-6 py-3.5 font-display text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap shadow-lg"
              >
                PLAY AGAIN (SECTOR 1)
              </button>
              <button
                onClick={() => {
                  setGameState('MAIN_MENU');
                  setShowAchievementsModal(true);
                }}
                className="flex-1 cursor-pointer rounded-xl border border-amber-500/40 bg-amber-500/10 px-6 py-3.5 font-display text-sm font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors whitespace-nowrap"
              >
                VIEW ARCHIVE
              </button>
              <button
                onClick={handleMainMenu}
                className="flex-1 cursor-pointer rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 font-display text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Achievements / Archive Modal */}
      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />
    </div>
  );
}
