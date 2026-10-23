import React from 'react';

interface TitleScreenProps {
  onStart: () => void;
  onOpenCppCode: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onOpenCppCode }) => {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-between p-6 sm:p-10 select-none bg-radial from-slate-900 via-slate-950 to-black text-white">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between w-full max-w-4xl pt-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-semibold text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ANDROID STUDIO NDK C++ PLATFORM ENGINE</span>
        </div>

        <button
          type="button"
          onClick={onOpenCppCode}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 text-xs font-bold text-emerald-400 transition flex items-center gap-2 shadow-lg"
          aria-label="View Android Studio C++ Code"
        >
          <span>📦</span>
          <span>View Android Studio C++ Source</span>
        </button>
      </div>

      {/* Main Title Centerpiece */}
      <div className="flex flex-col items-center text-center max-w-2xl my-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <span>⚡ Escalating Vertical Ascent · 2D Platformer</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-[0_4px_24px_rgba(6,182,212,0.5)]">
          CYBER CLIMBER
        </h1>
        <div className="text-lg sm:text-2xl font-black tracking-widest text-cyan-400 mt-1 uppercase font-mono">
          VERTICAL ASCENT
        </div>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed">
          Sprint horizontally across neon terrain, then ascend the towering vertical cyber spire.
          Break <span className="text-amber-400 font-bold">2 Power-Up Cubes</span> from underneath to unlock super abilities,
          stomp patrolling bots, and dodge accelerating buzzsaws!
        </p>

        {/* Feature Grid Pills */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg text-left">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Progression</div>
            <div className="text-xs font-bold text-cyan-300 flex items-center gap-1">
              <span>Horizontal</span>
              <span className="text-emerald-400">→</span>
              <span>Vertical</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Power-ups</div>
            <div className="text-xs font-bold text-amber-400">Hit 2 Cubes Below</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Combat</div>
            <div className="text-xs font-bold text-rose-400">Stomp on Enemies</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Scaling Hazards</div>
            <div className="text-xs font-bold text-emerald-400">Faster with Height</div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            data-start="true"
            onClick={onStart}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xl tracking-wide shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Start Game"
          >
            START ASCENT
          </button>
        </div>
      </div>

      {/* Footer Controls Guide */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-300">Touch Controls:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono">D-Pad ◀ ▶</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-mono">[A] Jump</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono">[B] Dash</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300">Keyboard:</span>
          <span className="font-mono text-slate-400">A / D or ◀ ▶ Move · Space / W Jump · Shift / X Dash · P Pause</span>
        </div>
      </div>
    </div>
  );
};
