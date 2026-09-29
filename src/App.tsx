import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { Level1Scene } from './scenes/Level1Scene';
import { Level2Scene } from './scenes/Level2Scene';
import { Level3Scene } from './scenes/Level3Scene';
import { gameEvents, GameState, HudSnapshot } from './systems/GameEvents';
import { AudioSystem } from './systems/AudioSystem';
import { HUD } from './ui/HUD';
import { AbilityBar } from './ui/AbilityBar';
import { PauseMenu } from './ui/PauseMenu';
import { Play, Shield, Zap, Terminal, Sparkles, RotateCcw, ArrowRight, Keyboard, CheckCircle2, AlertTriangle } from 'lucide-react';

const INITIAL_HUD: HudSnapshot = {
  levelNumber: 1,
  levelName: 'LEVEL 1 — BOOT SECTOR',
  levelSubtitle: 'System Initialization & Diagnostics',
  objectiveText: 'Activate the Switch & Terminal, collect 1 Data Shard, and enter the Exit Portal.',
  hp: 3,
  maxHp: 3,
  shardsCollected: 0,
  shardsRequired: 1,
  exitUnlocked: false,
  abilities: [
    { id: 'shield', key: '1', name: 'Shield', cooldownRemaining: 0, cooldownTotal: 6, activeRemaining: 0, isReady: true },
    { id: 'emp', key: '2', name: 'EMP', cooldownRemaining: 0, cooldownTotal: 5, activeRemaining: 0, isReady: true },
    { id: 'hack', key: '3', name: 'Hack', cooldownRemaining: 0, cooldownTotal: 2.5, activeRemaining: 0, isReady: true },
    { id: 'glitch', key: '4', name: 'Glitch', cooldownRemaining: 0, cooldownTotal: 4, activeRemaining: 0, isReady: true }
  ],
  nearbyPrompt: null,
  toastMessage: null,
  boss: {
    visible: false,
    name: 'CORRUPTED CORE GUARDIAN',
    hp: 4,
    maxHp: 4,
    phase: 1,
    statusHint: ''
  }
};

export default function App() {
  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  const [gameState, setGameState] = useState<GameState>('MAIN_MENU');
  const [showControlsModal, setShowControlsModal] = useState<boolean>(false);
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3>(1);

  const getSceneKey = (lvl: 1 | 2 | 3) =>
    lvl === 1 ? 'Level1Scene' : lvl === 2 ? 'Level2Scene' : 'Level3Scene';

  const startOrSwitchLevel = useCallback((lvl: 1 | 2 | 3) => {
    setActiveLevel(lvl);
    setGameState('PLAYING');
    setShowControlsModal(false);

    const game = phaserGameRef.current;
    if (!game) return;

    const targetKey = getSceneKey(lvl);
    (['Level1Scene', 'Level2Scene', 'Level3Scene'] as const).forEach((k) => {
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
      scene: [BootScene, Level1Scene, Level2Scene, Level3Scene]
    };

    const game = new Phaser.Game(config);
    phaserGameRef.current = game;

    const onHudUpdate = (snapshot: HudSnapshot) => {
      setHud(snapshot);
    };

    const onLevelComplete = () => {
      setGameState('LEVEL_COMPLETE');
    };

    const onGameOver = () => {
      setGameState('GAME_OVER');
    };

    const onVictory = () => {
      setGameState('VICTORY');
    };

    const onRequestTogglePause = () => {
      setGameState((prev) => {
        const currentKey = getSceneKey(activeLevel);
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
  }, [activeLevel]);

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
    const nextLvl = (activeLevel < 3 ? activeLevel + 1 : 1) as 1 | 2 | 3;
    startOrSwitchLevel(nextLvl);
  };

  const handleMainMenu = () => {
    const game = phaserGameRef.current;
    if (game) {
      (['Level1Scene', 'Level2Scene', 'Level3Scene'] as const).forEach((k) => {
        if (game.scene.isActive(k)) {
          game.scene.pause(k);
        }
      });
    }
    AudioSystem.startMusic('menu');
    setGameState('MAIN_MENU');
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#070B12] text-slate-100 select-none">
      {/* Phaser 3 WebGL/Canvas Viewport */}
      <div ref={gameContainerRef} className="h-full w-full" />

      {/* Subtle CRT Scanline Overlay */}
      <div className="crt-scanlines pointer-events-none fixed inset-0 z-10 opacity-35" />

      {/* Active Gameplay HUD & Bottom Ability Bar */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <>
          <HUD
            hud={hud}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={handlePause}
            onRestart={handleRestartLevel}
            onSelectLevel={(lvl) => startOrSwitchLevel(lvl)}
          />
          <AbilityBar
            abilities={hud.abilities}
            nearbyPrompt={hud.nearbyPrompt}
            onTriggerAbility={(id) => gameEvents.emit('ui-ability', id)}
            onTriggerInteract={() => gameEvents.emit('ui-interact')}
            onMoveDir={(dx, dy) => gameEvents.emit('ui-move', { x: dx, y: dy })}
          />
        </>
      )}

      {/* MAIN MENU OVERLAY */}
      {gameState === 'MAIN_MENU' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#070B12]/90 backdrop-blur-md p-6 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0B121E] p-8 md:p-10 shadow-2xl">
            <div className="text-center">
              <p className="font-mono-tabular text-xs font-semibold tracking-widest text-amber-400">
                1999 PUZZLE-STRATEGY REIMAGINED · DIGITAL ARCHITECT EDITION
              </p>
              <h1
                className="font-display mt-2 text-4xl md:text-5xl font-bold tracking-wider text-emerald-400"
                style={{ textWrap: 'balance' }}
              >
                GRUNTZ: REBOOTED
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm text-slate-300 leading-relaxed">
                Guide a Digital Grunt through a corrupted computer mainframe. Activate circuit
                switches, hack security terminals, deploy cyber abilities, collect Data Shards, and
                purge the System Core Guardian.
              </p>
            </div>

            {/* Primary Menu Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => startOrSwitchLevel(1)}
                className="flex w-full sm:w-auto min-w-[200px] cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-7 py-3.5 font-display text-base font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-lg whitespace-nowrap"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>PLAY GAME</span>
              </button>

              <button
                onClick={() => setShowControlsModal((prev) => !prev)}
                className="flex w-full sm:w-auto min-w-[200px] cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900 px-7 py-3.5 font-display text-base font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-all whitespace-nowrap"
              >
                <Keyboard className="h-5 w-5 text-amber-400" />
                <span>{showControlsModal ? 'HIDE CONTROLS' : 'CONTROLS'}</span>
              </button>
            </div>

            {/* Direct Sector Launch */}
            <div className="mt-8 border-t border-slate-800/90 pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-xs font-semibold tracking-wider text-slate-400">
                  SELECT SYSTEM SECTOR
                </span>
                <span className="font-mono-tabular text-xs text-slate-400">
                  3 Sectors · 4 Abilities · 1 Core Boss
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => startOrSwitchLevel(1)}
                  className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 text-left hover:border-emerald-500/60 hover:bg-slate-900 transition-colors"
                >
                  <div className="font-display text-sm font-bold text-emerald-400">
                    01. Boot Sector
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Switches · Doors · 1 Shard
                  </div>
                </button>
                <button
                  onClick={() => startOrSwitchLevel(2)}
                  className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 text-left hover:border-amber-500/60 hover:bg-slate-900 transition-colors"
                >
                  <div className="font-display text-sm font-bold text-amber-400">
                    02. Firewall Factory
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Lasers · Drones · 2 Shards
                  </div>
                </button>
                <button
                  onClick={() => startOrSwitchLevel(3)}
                  className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 text-left hover:border-rose-500/60 hover:bg-slate-900 transition-colors"
                >
                  <div className="font-display text-sm font-bold text-rose-400">
                    03. Core Breach
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Core Guardian Boss · 3 Shards
                  </div>
                </button>
              </div>
            </div>

            {/* Expandable Controls & Abilities Panel */}
            {showControlsModal && (
              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/90 p-5">
                <h2 className="font-display text-sm font-bold text-emerald-400 mb-3">
                  CONTROLS & DIGITAL ABILITIES
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-2 font-mono-tabular">
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-amber-400 font-semibold">WASD / ARROWS</span>
                      <span className="text-slate-200">Move Digital Grunt</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-amber-400 font-semibold">E</span>
                      <span className="text-slate-200">Interact with Terminal</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-amber-400 font-semibold">1 · 2 · 3 · 4</span>
                      <span className="text-slate-200">Activate Cyber Abilities</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-amber-400 font-semibold">ESC</span>
                      <span className="text-slate-200">Pause Menu</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Shield className="h-4 w-4 text-sky-400 shrink-0" />
                      <span>
                        <strong className="text-white">[1] Shield:</strong> 3s barrier against lasers, traps & enemies (6s CD).
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>
                        <strong className="text-white">[2] EMP:</strong> Disables nearby drones, lasers & traps (5s CD).
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Terminal className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>
                        <strong className="text-white">[3] Hack:</strong> Overrides terminals & exposes Core locks.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Sparkles className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>
                        <strong className="text-white">[4] Glitch Pulse:</strong> Stuns & reverses enemies.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAUSE MENU OVERLAY */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestartLevel}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* LEVEL COMPLETE MODAL */}
      {gameState === 'LEVEL_COMPLETE' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/40 bg-[#0B121E] p-8 text-center shadow-2xl">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h2 className="font-display mt-3 text-3xl font-bold tracking-wide text-emerald-400">
              LEVEL COMPLETE
            </h2>
            <p className="mt-1 text-xs text-slate-400">{hud.levelName}</p>

            <div className="mt-6 space-y-2 rounded-xl border border-slate-800 bg-slate-950/90 p-4 font-mono-tabular text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">DATA RECOVERED:</span>
                <span className="font-bold text-amber-400">
                  {hud.shardsCollected} / {hud.shardsRequired}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SYSTEM STATUS:</span>
                <span className="font-bold text-emerald-400">STABLE</span>
              </div>
            </div>

            <button
              onClick={handleNextLevel}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 font-display text-base font-bold text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap"
            >
              <span>NEXT LEVEL</span>
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
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3.5 font-display text-base font-bold text-white hover:bg-rose-400 transition-colors whitespace-nowrap"
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
              CORRUPTED CORE GUARDIAN PURGED
            </p>
            <h2 className="font-display mt-1 text-3xl md:text-4xl font-bold tracking-wide text-emerald-400">
              SYSTEM CORE RESTORED!
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Your Digital Grunt recovered all critical Data Shards across the Boot Sector,
              Firewall Factory, and Core Breach, neutralizing the Corrupted Core Guardian.
            </p>

            <div className="mt-6 space-y-2 rounded-xl border border-slate-800 bg-slate-950/90 p-4 font-mono-tabular text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">FINAL SECTOR SHARDS:</span>
                <span className="font-bold text-amber-400">
                  {hud.shardsCollected} / {hud.shardsRequired}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CORE GUARDIAN STATUS:</span>
                <span className="font-bold text-emerald-400">PURGED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">MAINFRAME INTEGRITY:</span>
                <span className="font-bold text-emerald-400">100% ONLINE</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => startOrSwitchLevel(1)}
                className="flex-1 cursor-pointer rounded-xl bg-emerald-500 px-6 py-3.5 font-display text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap"
              >
                PLAY AGAIN (LEVEL 1)
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
    </div>
  );
}
