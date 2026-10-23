import React from 'react';

interface TouchControlsProps {
  onLeftChange: (pressed: boolean) => void;
  onRightChange: (pressed: boolean) => void;
  onJumpChange: (pressed: boolean) => void;
  onDashPress: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onLeftChange,
  onRightChange,
  onJumpChange,
  onDashPress,
}) => {
  return (
    <div className="fixed inset-x-0 bottom-4 pointer-events-none z-30 px-6 flex justify-between items-end select-none">
      {/* Left side: D-Pad / Horizontal Movement */}
      <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/80 p-2 rounded-2xl border border-cyan-500/30 backdrop-blur-sm shadow-2xl">
        <button
          type="button"
          aria-label="Move Left"
          className="w-16 h-16 rounded-xl bg-slate-800 active:bg-cyan-600 border border-slate-700 active:border-cyan-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-transform active:scale-95 touch-none"
          onTouchStart={(e) => {
            e.preventDefault();
            onLeftChange(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onLeftChange(false);
          }}
          onMouseDown={() => onLeftChange(true)}
          onMouseUp={() => onLeftChange(false)}
          onMouseLeave={() => onLeftChange(false)}
        >
          ◀
        </button>

        <button
          type="button"
          aria-label="Move Right"
          className="w-16 h-16 rounded-xl bg-slate-800 active:bg-cyan-600 border border-slate-700 active:border-cyan-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-transform active:scale-95 touch-none"
          onTouchStart={(e) => {
            e.preventDefault();
            onRightChange(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onRightChange(false);
          }}
          onMouseDown={() => onRightChange(true)}
          onMouseUp={() => onRightChange(false)}
          onMouseLeave={() => onRightChange(false)}
        >
          ▶
        </button>
      </div>

      {/* Right side: Jump [A] and Dash [B] Action Buttons */}
      <div className="pointer-events-auto flex items-center gap-4 bg-slate-900/80 p-2 rounded-2xl border border-emerald-500/30 backdrop-blur-sm shadow-2xl">
        {/* Dash [B] Button */}
        <button
          type="button"
          aria-label="Dash"
          className="w-16 h-16 rounded-full bg-amber-600/90 active:bg-amber-500 border-2 border-amber-400 flex flex-col items-center justify-center text-white shadow-lg transition-transform active:scale-95 touch-none"
          onTouchStart={(e) => {
            e.preventDefault();
            onDashPress();
          }}
          onMouseDown={() => onDashPress()}
        >
          <span className="text-xl font-extrabold leading-none">B</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200">Dash</span>
        </button>

        {/* Jump [A] Button */}
        <button
          type="button"
          aria-label="Jump"
          className="w-20 h-20 rounded-full bg-emerald-600/90 active:bg-emerald-500 border-2 border-emerald-300 flex flex-col items-center justify-center text-white shadow-xl transition-transform active:scale-95 touch-none"
          onTouchStart={(e) => {
            e.preventDefault();
            onJumpChange(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onJumpChange(false);
          }}
          onMouseDown={() => onJumpChange(true)}
          onMouseUp={() => onJumpChange(false)}
          onMouseLeave={() => onJumpChange(false)}
        >
          <span className="text-2xl font-black leading-none">A</span>
          <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-100">Jump</span>
        </button>
      </div>
    </div>
  );
};
