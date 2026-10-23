import React from 'react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white flex flex-col items-center text-center">
        <h3 className="text-2xl font-black tracking-tight text-white mb-2">
          PAUSED
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Take a breath before resuming the vertical ascent.
        </p>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm shadow-lg transition active:scale-95 cursor-pointer"
            aria-label="Resume Game"
          >
            RESUME [P]
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition active:scale-95 cursor-pointer"
            aria-label="Restart Stage"
          >
            RESTART STAGE [R]
          </button>
          <button
            type="button"
            onClick={onMainMenu}
            className="w-full py-3 px-5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-xs border border-slate-800 transition active:scale-95 cursor-pointer"
            aria-label="Exit to Main Menu"
          >
            EXIT TO TITLE
          </button>
        </div>
      </div>
    </div>
  );
};
