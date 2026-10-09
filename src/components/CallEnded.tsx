import React from 'react';
import { RefreshCw, Home, HeartHandshake, Cloud } from 'lucide-react';

interface Props {
  roomId: string;
  onRejoin: () => void;
  onGoHome: () => void;
  onOpenCloudflareGuide: () => void;
  isDark: boolean;
}

export const CallEnded: React.FC<Props> = ({
  roomId,
  onRejoin,
  onGoHome,
  onOpenCloudflareGuide,
  isDark,
}) => {
  return (
    <div
      className={`min-h-[calc(100vh-64px)] flex items-center justify-center p-6 transition-colors duration-200 ${
        isDark ? 'bg-[#212121] text-white' : 'bg-white text-neutral-900'
      }`}
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-[#0494f4]/20 border border-[#0494f4]/40 flex items-center justify-center mx-auto text-[#0494f4] shadow-xl shadow-[#0494f4]/20">
          <HeartHandshake className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-medium tracking-tight">You left the meeting</h2>
          <p className="text-xs text-neutral-400">
            Room code: <span className="font-mono text-[#0494f4] font-semibold">{roomId}</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
          <button
            onClick={onRejoin}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#0494f4] hover:bg-[#037ed1] text-white font-medium text-xs shadow-lg shadow-[#0494f4]/25 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Rejoin meeting</span>
          </button>

          <button
            onClick={onGoHome}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border text-xs font-medium transition-all ${
              isDark
                ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-300'
                : 'border-neutral-300 hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Return to home</span>
          </button>
        </div>

        <div className="pt-6">
          <button
            onClick={onOpenCloudflareGuide}
            className="inline-flex items-center gap-1.5 text-xs text-[#0494f4] hover:underline"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>View Cloudflare Pages deployment tips</span>
          </button>
        </div>
      </div>
    </div>
  );
};
