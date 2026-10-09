import React from 'react';
import { X, Sparkles, Ban, Sliders, Image as ImageIcon, Check } from 'lucide-react';
import { BackgroundEffect } from '../types/meet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentEffect: BackgroundEffect;
  onSelectEffect: (effect: BackgroundEffect) => void;
  isDark: boolean;
}

export const VISUAL_EFFECTS: { id: BackgroundEffect; label: string; preview: string; description: string }[] = [
  {
    id: 'none',
    label: 'No effect',
    preview: 'bg-neutral-800 flex items-center justify-center text-neutral-400',
    description: 'Natural camera feed',
  },
  {
    id: 'slight-blur',
    label: 'Slight blur',
    preview: 'bg-gradient-to-tr from-sky-900 to-indigo-900 blur-xs',
    description: 'Subtle privacy blur',
  },
  {
    id: 'heavy-blur',
    label: 'Heavy blur',
    preview: 'bg-gradient-to-tr from-blue-900 via-indigo-950 to-slate-900 blur-md',
    description: 'Maximum background privacy',
  },
  {
    id: 'office',
    label: 'Modern Office',
    preview: 'bg-gradient-to-r from-amber-950 via-stone-900 to-neutral-900',
    description: 'Professional workspace background',
  },
  {
    id: 'gradient',
    label: 'Studio Gradient',
    preview: 'bg-gradient-to-tr from-[#0494f4]/40 via-purple-900/60 to-rose-900/40',
    description: 'Chic modern studio aesthetic',
  },
  {
    id: 'beach',
    label: 'Sunset Beach',
    preview: 'bg-gradient-to-tr from-amber-600/40 via-rose-900/50 to-sky-950',
    description: 'Relaxing tropical scenery',
  },
];

export const VisualEffectsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentEffect,
  onSelectEffect,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl border p-5 ${
          isDark ? 'bg-[#212121] text-white border-neutral-700' : 'bg-white text-neutral-900 border-neutral-200'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-inherit">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0494f4]" />
            <h3 className="font-semibold text-base">Visual effects</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-500/20 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <p className="text-xs text-neutral-400">
            Choose a background effect or virtual environment for your camera stream:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {VISUAL_EFFECTS.map((effect) => {
              const isSelected = currentEffect === effect.id;
              return (
                <button
                  key={effect.id}
                  onClick={() => onSelectEffect(effect.id)}
                  className={`p-2 rounded-xl border text-left flex flex-col items-center gap-2 transition-all relative overflow-hidden ${
                    isSelected
                      ? 'border-[#0494f4] ring-2 ring-[#0494f4]/40 bg-[#0494f4]/10'
                      : isDark
                      ? 'border-neutral-700/80 hover:border-neutral-600 bg-neutral-800/40'
                      : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'
                  }`}
                >
                  <div className={`w-full aspect-16/10 rounded-lg overflow-hidden relative ${effect.preview}`}>
                    {effect.id === 'none' && <Ban className="w-5 h-5 text-neutral-400 m-auto" />}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#0494f4] text-white flex items-center justify-center shadow">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-medium truncate w-full text-center">
                    {effect.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-inherit flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0494f4] hover:bg-[#037ed1] text-white text-xs font-medium shadow-md shadow-[#0494f4]/20"
          >
            Apply &amp; Done
          </button>
        </div>
      </div>
    </div>
  );
};
