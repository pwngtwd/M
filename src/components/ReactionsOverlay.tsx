import React from 'react';
import { FloatingReaction } from '../types/meet';

interface Props {
  reactions: FloatingReaction[];
}

export const ReactionsOverlay: React.FC<Props> = ({ reactions }) => {
  if (reactions.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute bottom-24 flex items-center gap-2 animate-float-reaction"
          style={{
            left: `${r.x}%`,
          }}
        >
          <div className="text-4xl filter drop-shadow-lg select-none">
            {r.emoji}
          </div>
          {r.senderName && (
            <div className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-medium border border-white/20 whitespace-nowrap shadow-md">
              {r.senderName}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
