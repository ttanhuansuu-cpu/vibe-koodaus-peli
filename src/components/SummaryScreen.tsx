import React from 'react';
import { LevelSummary } from '../game/types';

interface SummaryScreenProps {
  summary: LevelSummary;
  onRestart: () => void;
  onMainMenu: () => void;
  onOpenCppCode: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  summary,
  onRestart,
  onMainMenu,
  onOpenCppCode,
}) => {
  // Rank badge styling
  const rankColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    S: {
      bg: 'from-amber-400 to-yellow-500',
      text: 'text-amber-950',
      border: 'border-yellow-200',
      glow: 'shadow-[0_0_35px_rgba(251,191,36,0.8)]',
    },
    A: {
      bg: 'from-purple-500 to-indigo-600',
      text: 'text-white',
      border: 'border-purple-300',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.7)]',
    },
    B: {
      bg: 'from-cyan-500 to-blue-600',
      text: 'text-white',
      border: 'border-cyan-300',
      glow: 'shadow-[0_0_25px_rgba(6,182,212,0.6)]',
    },
    C: {
      bg: 'from-slate-600 to-slate-700',
      text: 'text-slate-100',
      border: 'border-slate-400',
      glow: 'shadow-md',
    },
  };

  const style = rankColors[summary.rank] || rankColors.B;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col items-center">
        {/* Summit Clear Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-xs font-black tracking-widest uppercase mb-3">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>SUMMIT REACHED · STAGE CLEAR</span>
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-center">
          STAGE PERFORMANCE SUMMARY
        </h2>

        {/* Level Rank Badge & Stars */}
        <div className="my-6 flex flex-col items-center">
          <div
            className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${style.bg} ${style.border} border-4 ${style.glow} flex flex-col items-center justify-center transform hover:scale-105 transition-transform`}
          >
            <span className="text-[11px] font-black uppercase tracking-widest opacity-80">LEVEL RANK</span>
            <span className={`text-5xl font-black ${style.text} leading-none mt-1`}>{summary.rank}</span>
          </div>

          {/* Star Rating via SVGs */}
          <div className="flex gap-2.5 mt-4">
            {[1, 2, 3].map((star) => (
              <svg
                key={star}
                className={`w-7 h-7 ${
                  star <= summary.stars
                    ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] fill-amber-400'
                    : 'text-slate-800 fill-slate-800'
                }`}
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>

          <p className="mt-2 text-xs font-medium text-slate-300 text-center max-w-sm italic">
            "{summary.rankFeedback}"
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-6">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Score</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {summary.score.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-[10px] font-bold uppercase text-slate-400">Altitude Climbed</div>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
              {summary.maxAltitude} <span className="text-xs text-slate-400">m</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-[10px] font-bold uppercase text-slate-400">Cubes Smashed</div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              {summary.cubesBroken}
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-[10px] font-bold uppercase text-slate-400">Enemies Stomped</div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
              {summary.enemiesStomped}
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-[10px] font-bold uppercase text-slate-400">Clear Time</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {summary.timeElapsed} <span className="text-xs text-slate-400">s</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-[10px] font-bold uppercase text-slate-400">Power-ups Triggered</div>
            <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono">
              {Math.floor(summary.cubesBroken / 2)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            type="button"
            data-start="true"
            onClick={onRestart}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-[0_0_20px_rgba(16,185,129,0.5)] transition active:scale-95 cursor-pointer text-center"
            aria-label="Play Again"
          >
            PLAY AGAIN
          </button>

          <button
            type="button"
            onClick={onMainMenu}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition active:scale-95 cursor-pointer"
            aria-label="Back to Main Menu"
          >
            MAIN MENU
          </button>

          <button
            type="button"
            onClick={onOpenCppCode}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-sm border border-emerald-500/40 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            aria-label="View Android Studio C++ Code"
          >
            <span>📱</span>
            <span>C++ Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};
