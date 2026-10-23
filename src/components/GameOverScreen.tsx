import React from 'react';

interface GameOverScreenProps {
  score: number;
  altitudeMeters: number;
  cubesBroken: number;
  enemiesStomped: number;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  altitudeMeters,
  cubesBroken,
  enemiesStomped,
  onRetry,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-2 border-rose-600/70 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(225,29,72,0.4)] text-white flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center text-3xl font-black mb-4">
          💀
        </div>

        <h2 className="text-3xl font-black tracking-tight text-rose-500">
          CLIMB FAILED
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          The scaling hazards or a platform fall depleted your vitality.
        </p>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-2.5 w-full my-6">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Altitude Reached</div>
            <div className="text-lg font-black text-cyan-400 font-mono">{altitudeMeters} m</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Score</div>
            <div className="text-lg font-black text-amber-400 font-mono">{score.toLocaleString()}</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Cubes Smashed</div>
            <div className="text-lg font-black text-yellow-300 font-mono">{cubesBroken}</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Bots Stomped</div>
            <div className="text-lg font-black text-rose-400 font-mono">{enemiesStomped}</div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            type="button"
            data-start="true"
            onClick={onRetry}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-base shadow-lg transition active:scale-95 cursor-pointer"
            aria-label="Try Again"
          >
            TRY AGAIN
          </button>
          <button
            type="button"
            onClick={onMainMenu}
            className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition active:scale-95 cursor-pointer"
            aria-label="Main Menu"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
