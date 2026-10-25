import React from 'react';
import { Player, PowerUpNotification } from '../game/types';
import { POWER_UP_CONFIGS } from '../game/rules';

interface GameHUDProps {
  player: Player;
  notification: PowerUpNotification | null;
  onPause: () => void;
  onRestart: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
  onOpenCppCode: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  player,
  notification,
  onPause,
  onRestart,
  onToggleSound,
  soundEnabled,
  onOpenCppCode,
}) => {
  const activeConfig = player.activePowerUp ? POWER_UP_CONFIGS[player.activePowerUp] : null;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header Bar */}
      <div className="flex justify-between items-start gap-4">
        {/* Left Cluster: Health Lives & Altitude */}
        <div className="flex flex-col gap-2">
          {/* Health Pips */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-xl shadow-lg pointer-events-auto">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">HULL</span>
            <div className="flex gap-1.5">
              {Array.from({ length: player.maxLives }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-5 rounded-sm transition-all ${
                    i < player.lives
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] border border-rose-300'
                      : 'bg-slate-800 border border-slate-700 opacity-40'
                  }`}
                />
              ))}
            </div>
            {player.hasShield && (
              <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-600 text-purple-100 border border-purple-400 animate-pulse">
                SHIELD ON
              </span>
            )}
          </div>

          {/* Altitude Meter */}
          <div className="bg-slate-900/90 border border-cyan-500/40 px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2.5">
            <span className="text-cyan-400 font-mono text-sm font-bold">▲</span>
            <div>
              <div className="text-[10px] font-extrabold uppercase text-cyan-300 tracking-wider">ALTITUDE</div>
              <div className="text-base sm:text-lg font-black text-white font-mono leading-none">
                {player.altitudeMeters} <span className="text-xs text-cyan-400 font-sans">m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Cluster: 2-Cube Power-up Progression Tracker */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-900/95 border-2 border-amber-500/60 px-4 py-2 rounded-2xl shadow-2xl flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2 text-[11px] font-black text-amber-400 uppercase tracking-widest">
              <span>⚡ POWER CUBES</span>
              <span className="font-mono bg-amber-950/80 border border-amber-600/50 px-1.5 py-0.5 rounded text-amber-300">
                {player.cubesBrokenCount} / 3
              </span>
            </div>

            {/* Visual 2-Slot Sockets */}
            <div className="flex items-center gap-2.5">
              {/* Slot 1 */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                  player.cubesBrokenCount >= 1
                    ? 'bg-amber-400 text-slate-950 border-2 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.9)] scale-105'
                    : 'bg-slate-800 text-slate-600 border border-slate-700'
                }`}
              >
                {player.cubesBrokenCount >= 1 ? '■' : '1'}
              </div>

              {/* Connector line */}
              <div className={`h-1 w-4 rounded-full ${player.cubesBrokenCount >= 1 ? 'bg-amber-400' : 'bg-slate-800'}`} />

              {/* Slot 2 */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                  player.cubesBrokenCount >= 2
                    ? 'bg-amber-400 text-slate-950 border-2 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.9)] scale-105'
                    : 'bg-slate-800 text-slate-600 border border-slate-700'
                }`}
              >
                2
              </div>
            </div>
            <span className="text-[9px] text-slate-400 font-medium">Head-butt cubes under platforms</span>
          </div>

          {/* Active Power-Up Bar (if active) */}
          {activeConfig && (
            <div className="mt-2 bg-slate-900/90 border border-cyan-400 px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2.5 animate-fadeIn">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-wider uppercase text-cyan-300">
                  {activeConfig.name}
                </span>
                <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all"
                    style={{
                      width: `${(player.powerUpTimeRemaining / activeConfig.duration) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Cluster: Score & Action Controls */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Score */}
          <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-1.5 rounded-xl shadow-lg text-right">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">SCORE</div>
            <div className="text-base sm:text-xl font-black text-amber-400 font-mono leading-none">
              {player.score.toLocaleString()}
            </div>
          </div>

          {/* Utility Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-xl shadow-lg">
            {/* Android Studio C++ Code Button */}
            <button
              type="button"
              onClick={onOpenCppCode}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
              title="Android Studio C++ Code"
              aria-label="View Android Studio C++ Code"
            >
              <span>C++</span>
              <span className="hidden sm:inline">Code</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={onToggleSound}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
              title="Toggle Audio"
              aria-label="Toggle Sound"
            >
              {soundEnabled ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>

            {/* Restart */}
            <button
              type="button"
              onClick={onRestart}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
              title="Restart"
              aria-label="Restart Stage"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Pause */}
            <button
              type="button"
              onClick={onPause}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
              title="Pause"
              aria-label="Pause Game"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Pop-up Power-Up Banner Notification */}
      {notification && (
        <div className="self-center mb-24 pointer-events-none animate-bounce">
          <div className="bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 px-6 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(251,191,36,0.8)] border-2 border-white flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="text-xs uppercase font-black tracking-widest text-amber-950">
                2 CUBES SMASHED! POWER-UP TRIGGERED!
              </div>
              <div className="text-lg font-black tracking-wide">{notification.name}</div>
              <div className="text-xs font-semibold text-amber-950/80">{notification.desc}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
