import React, { useEffect, useState } from 'react';
import { Video, Moon, Sun, Settings, HelpCircle, Cloud, Copy, Check } from 'lucide-react';

interface Props {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenCloudflareGuide: () => void;
  roomId?: string;
  inMeeting?: boolean;
}

export const Navbar: React.FC<Props> = ({
  isDark,
  onToggleTheme,
  onOpenSettings,
  onOpenCloudflareGuide,
  roomId,
  inMeeting = false,
}) => {
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setDateString(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const copyRoomCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header
      className={`w-full h-16 px-4 md:px-6 flex items-center justify-between border-b select-none transition-colors duration-200 z-30 ${
        isDark
          ? 'bg-[#212121] border-neutral-800 text-white'
          : 'bg-white border-neutral-200 text-neutral-800 shadow-xs'
      }`}
    >
      {/* Brand logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#0494f4] text-white shadow-md shadow-[#0494f4]/20 transition-transform active:scale-95">
          <Video className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-sans font-semibold text-lg tracking-tight">
              Gothwad<span className="text-[#0494f4] font-bold ml-1">Meet</span>
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#0494f4]/20 text-[#0494f4] border border-[#0494f4]/40">
              WebRTC
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 hidden sm:block">
            Cloudflare Pages Ready • Zero Server
          </span>
        </div>
      </div>

      {/* Middle: Active Room Code (if in meeting) */}
      {inMeeting && roomId && (
        <div className="flex items-center gap-2">
          <button
            onClick={copyRoomCode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium border transition-all ${
              isDark
                ? 'bg-neutral-800/80 border-neutral-700 hover:border-[#0494f4] text-neutral-200'
                : 'bg-neutral-100 border-neutral-300 hover:border-[#0494f4] text-neutral-800'
            }`}
            title="Click to copy meeting code"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{roomId}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-neutral-400" />
            )}
          </button>
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center text-xs font-medium text-neutral-400 gap-1.5 pr-2">
          <span>{timeString}</span>
          <span>•</span>
          <span>{dateString}</span>
        </div>

        {/* Cloudflare Pages Deployment Guide */}
        <button
          onClick={onOpenCloudflareGuide}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isDark
              ? 'bg-[#0494f4]/15 border-[#0494f4]/40 text-[#0494f4] hover:bg-[#0494f4]/25'
              : 'bg-[#0494f4]/10 border-[#0494f4]/30 text-[#0494f4] hover:bg-[#0494f4]/20'
          }`}
          title="Cloudflare Pages vs Workers deployment information"
        >
          <Cloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cloudflare Deploy</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className={`p-2 rounded-full transition-colors ${
            isDark
              ? 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
              : 'hover:bg-neutral-100 text-neutral-600 hover:text-black'
          }`}
          title="Audio & Video Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Theme toggle: Dark #212121 <-> Light #ffffff */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-full transition-colors ${
            isDark
              ? 'hover:bg-neutral-800 text-yellow-400'
              : 'hover:bg-neutral-100 text-neutral-700'
          }`}
          title={isDark ? 'Switch to Light Mode (#FFFFFF)' : 'Switch to Dark Mode (#212121)'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
