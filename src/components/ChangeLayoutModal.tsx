import React from 'react';
import { X, Grid, Square, LayoutTemplate, Layers, Check } from 'lucide-react';
import { LayoutMode } from '../types/meet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentLayout: LayoutMode;
  onSelectLayout: (mode: LayoutMode) => void;
  maxTiles: number;
  onChangeMaxTiles: (num: number) => void;
  isDark: boolean;
}

export const ChangeLayoutModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentLayout,
  onSelectLayout,
  maxTiles,
  onChangeMaxTiles,
  isDark,
}) => {
  if (!isOpen) return null;

  const LAYOUTS: { id: LayoutMode; title: string; desc: string; icon: any }[] = [
    {
      id: 'auto',
      title: 'Auto',
      desc: 'Allows Google Meet to choose the best layout for you based on active speakers.',
      icon: Layers,
    },
    {
      id: 'tiled',
      title: 'Tiled',
      desc: 'Shows up to maximum tiles when there is no presentation.',
      icon: Grid,
    },
    {
      id: 'spotlight',
      title: 'Spotlight',
      desc: 'The presentation or active speaker fills the entire screen.',
      icon: Square,
    },
    {
      id: 'sidebar',
      title: 'Sidebar',
      desc: 'The main presentation or speaker is shown large, with other people in a side strip.',
      icon: LayoutTemplate,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl border p-6 ${
          isDark ? 'bg-[#212121] text-white border-neutral-700' : 'bg-white text-neutral-900 border-neutral-200'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-inherit">
          <h3 className="font-semibold text-lg">Change layout</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-500/20 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          {LAYOUTS.map((layout) => {
            const Icon = layout.icon;
            const isSelected = currentLayout === layout.id;
            return (
              <button
                key={layout.id}
                onClick={() => onSelectLayout(layout.id)}
                className={`w-full p-3.5 rounded-xl border flex items-start gap-3.5 text-left transition-all ${
                  isSelected
                    ? 'border-[#0494f4] bg-[#0494f4]/10 ring-1 ring-[#0494f4]'
                    : isDark
                    ? 'border-neutral-800 hover:bg-neutral-800/60'
                    : 'border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#0494f4] text-white' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{layout.title}</h4>
                    {isSelected && <Check className="w-4 h-4 text-[#0494f4]" />}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{layout.desc}</p>
                </div>
              </button>
            );
          })}

          {/* Tiles Slider */}
          <div className="pt-3 border-t border-inherit">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span>Maximum tiles to display:</span>
              <span className="font-mono text-[#0494f4] font-bold">{maxTiles}</span>
            </div>
            <input
              type="range"
              min={4}
              max={49}
              step={1}
              value={maxTiles}
              onChange={(e) => onChangeMaxTiles(Number(e.target.value))}
              className="w-full accent-[#0494f4] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
              <span>4</span>
              <span>16</span>
              <span>30</span>
              <span>49</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-inherit flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0494f4] hover:bg-[#037ed1] text-white text-xs font-medium shadow-md shadow-[#0494f4]/20"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
