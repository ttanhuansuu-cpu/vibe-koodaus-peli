/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  GameStatus,
  Player,
  Platform,
  PowerUpCube,
  Enemy,
  Obstacle,
  LevelSummary,
} from './game/types';
import { createStage1 } from './game/levelData';
import {
  createInitialPlayer,
  PhysicsEngine,
  InputState,
} from './game/physics';
import { GameRenderer } from './game/renderer';
import { calculateLevelSummary } from './game/rules';
import { soundFX } from './game/audio';
import { TouchControls } from './components/TouchControls';
import { GameHUD } from './components/GameHUD';
import { TitleScreen } from './components/TitleScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { PauseModal } from './components/PauseModal';
import { CppInspectorModal } from './components/CppInspectorModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level UI state (only updated on discrete events or 4Hz throttles)
  const [gameStatus, setGameStatus] = useState<GameStatus>('title');
  const [hudPlayer, setHudPlayer] = useState<Player>(() => createInitialPlayer(50, 450));
  const [summaryData, setSummaryData] = useState<LevelSummary | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCppModal, setShowCppModal] = useState(false);

  // Engine references kept outside React reconciliation for 60Hz performance
  const physicsRef = useRef(new PhysicsEngine());
  const rendererRef = useRef(new GameRenderer());
  const levelRef = useRef(createStage1());
  const playerRef = useRef<Player>(createInitialPlayer(50, 450));
  const platformsRef = useRef<Platform[]>([]);
  const cubesRef = useRef<PowerUpCube[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);

  // Input states
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    up: false,
    jumpPressed: false,
    jumpHeld: false,
    dashPressed: false,
  });

  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const hudThrottleRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Synchronize document.body.dataset.state for styling and tests
  useEffect(() => {
    const stateMap: Record<GameStatus, string> = {
      title: 'title',
      playing: 'playing',
      paused: 'paused',
      summary: 'gameover',
      gameover: 'gameover',
    };
    document.body.dataset.state = stateMap[gameStatus] || 'title';
  }, [gameStatus]);

  // Level reset helper
  const resetLevel = useCallback((stageData = createStage1()) => {
    levelRef.current = stageData;
    playerRef.current = createInitialPlayer(stageData.spawnPoint.x, stageData.spawnPoint.y);
    platformsRef.current = JSON.parse(JSON.stringify(stageData.platforms));
    cubesRef.current = JSON.parse(JSON.stringify(stageData.cubes));
    enemiesRef.current = JSON.parse(JSON.stringify(stageData.enemies));
    obstaclesRef.current = JSON.parse(JSON.stringify(stageData.obstacles));
    physicsRef.current = new PhysicsEngine();
    rendererRef.current = new GameRenderer();
    startTimeRef.current = performance.now();
    setHudPlayer({ ...playerRef.current });
  }, []);

  // Start game handler
  const handleStartGame = useCallback(() => {
    soundFX.playClick();
    resetLevel();
    setGameStatus('playing');
    // Clear held keys
    inputRef.current = {
      left: false,
      right: false,
      up: false,
      jumpPressed: false,
      jumpHeld: false,
      dashPressed: false,
    };
  }, [resetLevel]);

  // Autostart and test URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('test_summary') === '1') {
      const demoSummary = calculateLevelSummary(3800, 3, 4, 70, 52);
      setSummaryData(demoSummary);
      setGameStatus('summary');
    } else if (params.get('autostart') === '1') {
      handleStartGame();
    }
  }, [handleStartGame]);

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.enabled = next;
    soundFX.playClick();
  }, [soundEnabled]);

  // Pause / Resume
  const handlePause = useCallback(() => {
    setGameStatus((prev) => (prev === 'playing' ? 'paused' : prev));
  }, []);

  const handleResume = useCallback(() => {
    lastTimeRef.current = performance.now();
    setGameStatus('playing');
  }, []);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space or Enter on Title Screen starts game
      if (gameStatus === 'title' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        handleStartGame();
        return;
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameStatus === 'playing') handlePause();
        else if (gameStatus === 'paused') handleResume();
        return;
      }

      if (e.code === 'KeyM') {
        handleToggleSound();
        return;
      }

      if (e.code === 'KeyR' && (gameStatus === 'playing' || gameStatus === 'paused')) {
        resetLevel();
        setGameStatus('playing');
        return;
      }

      if (gameStatus !== 'playing') return;

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        inputRef.current.left = true;
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        inputRef.current.right = true;
      }
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        if (!inputRef.current.jumpHeld) {
          inputRef.current.jumpPressed = true;
        }
        inputRef.current.jumpHeld = true;
        e.preventDefault();
      }
      if (e.code === 'KeyE' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyJ') {
        inputRef.current.dashPressed = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        inputRef.current.left = false;
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        inputRef.current.right = false;
      }
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        inputRef.current.jumpHeld = false;
      }
    };

    // Clear keys when window blurs
    const handleBlur = () => {
      inputRef.current = {
        left: false,
        right: false,
        up: false,
        jumpPressed: false,
        jumpHeld: false,
        dashPressed: false,
      };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameStatus, handleStartGame, handlePause, handleResume, handleToggleSound, resetLevel]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let active = true;

    const loop = (timestamp: number) => {
      if (!active) return;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      const dt = Math.min(rawDt, 0.05);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Responsive canvas resolution
          const width = canvas.width;
          const height = canvas.height;

          if (gameStatus === 'playing') {
            // Update physics
            const result = physicsRef.current.update(
              playerRef.current,
              platformsRef.current,
              cubesRef.current,
              enemiesRef.current,
              obstaclesRef.current,
              inputRef.current,
              dt,
              levelRef.current.groundY
            );

            // Reset one-frame triggers
            inputRef.current.jumpPressed = false;
            inputRef.current.dashPressed = false;

            // Check stage outcome
            if (result.stageCompleted) {
              const elapsedSec = (timestamp - startTimeRef.current) / 1000;
              const summary = calculateLevelSummary(
                playerRef.current.score,
                playerRef.current.enemiesStomped,
                playerRef.current.totalCubesBroken,
                playerRef.current.altitudeMeters,
                elapsedSec
              );
              setSummaryData(summary);
              setGameStatus('summary');
            } else if (result.playerDied) {
              setGameStatus('gameover');
            }

            // Throttle React HUD state update to ~8 Hz to avoid reconciliation overhead
            hudThrottleRef.current += dt;
            if (hudThrottleRef.current > 0.12) {
              hudThrottleRef.current = 0;
              setHudPlayer({ ...playerRef.current });
            }
          }

          // Render game scene
          rendererRef.current.render(
            ctx,
            width,
            height,
            playerRef.current,
            platformsRef.current,
            cubesRef.current,
            enemiesRef.current,
            obstaclesRef.current,
            physicsRef.current.particles,
            physicsRef.current.screenShake,
            levelRef.current.summitY
          );
        }
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [gameStatus]);

  // Resize canvas to match container dimensions with devicePixelRatio
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Touch controls callbacks
  const handleTouchLeft = useCallback((pressed: boolean) => {
    inputRef.current.left = pressed;
  }, []);

  const handleTouchRight = useCallback((pressed: boolean) => {
    inputRef.current.right = pressed;
  }, []);

  const handleTouchJump = useCallback((pressed: boolean) => {
    if (pressed) {
      inputRef.current.jumpPressed = true;
      inputRef.current.jumpHeld = true;
    } else {
      inputRef.current.jumpHeld = false;
    }
  }, []);

  const handleTouchDash = useCallback(() => {
    inputRef.current.dashPressed = true;
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 60 FPS HTML5 Canvas Viewport */}
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        className="absolute inset-0 w-full h-full block cursor-crosshair touch-none"
      />

      {/* Screen Modals & Overlays */}
      {gameStatus === 'title' && (
        <TitleScreen
          onStart={handleStartGame}
          onOpenCppCode={() => setShowCppModal(true)}
        />
      )}

      {gameStatus === 'playing' && (
        <>
          <GameHUD
            player={hudPlayer}
            notification={physicsRef.current.currentNotification}
            onPause={handlePause}
            onRestart={() => {
              resetLevel();
              setGameStatus('playing');
            }}
            onToggleSound={handleToggleSound}
            soundEnabled={soundEnabled}
            onOpenCppCode={() => setShowCppModal(true)}
          />
          <TouchControls
            onLeftChange={handleTouchLeft}
            onRightChange={handleTouchRight}
            onJumpChange={handleTouchJump}
            onDashPress={handleTouchDash}
          />
        </>
      )}

      {gameStatus === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onRestart={() => {
            resetLevel();
            setGameStatus('playing');
          }}
          onMainMenu={() => setGameStatus('title')}
        />
      )}

      {gameStatus === 'summary' && summaryData && (
        <SummaryScreen
          summary={summaryData}
          onRestart={handleStartGame}
          onMainMenu={() => setGameStatus('title')}
          onOpenCppCode={() => setShowCppModal(true)}
        />
      )}

      {gameStatus === 'gameover' && (
        <GameOverScreen
          score={playerRef.current.score}
          altitudeMeters={playerRef.current.altitudeMeters}
          cubesBroken={playerRef.current.totalCubesBroken}
          enemiesStomped={playerRef.current.enemiesStomped}
          onRetry={handleStartGame}
          onMainMenu={() => setGameStatus('title')}
        />
      )}

      {/* Android Studio C++ Code Inspector Modal */}
      {showCppModal && (
        <CppInspectorModal onClose={() => setShowCppModal(false)} />
      )}
    </div>
  );
}
