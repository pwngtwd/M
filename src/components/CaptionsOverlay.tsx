import React from 'react';
import { LiveCaption } from '../types/meet';

interface Props {
  captions: LiveCaption[];
  isEnabled: boolean;
}

export const CaptionsOverlay: React.FC<Props> = ({ captions, isEnabled }) => {
  if (!isEnabled || captions.length === 0) return null;

  // Show only the latest 2 captions
  const visibleCaptions = captions.slice(-2);

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-[90%] pointer-events-none space-y-2">
      {visibleCaptions.map((cap) => (
        <div
          key={cap.id}
          className="bg-black/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-white text-center shadow-xl animate-fade-in"
        >
          <span className="font-semibold text-[#0494f4] mr-2 text-xs">
            {cap.senderName}:
          </span>
          <span className="text-sm font-sans tracking-wide">
            {cap.text}
          </span>
        </div>
      ))}
    </div>
  );
};
