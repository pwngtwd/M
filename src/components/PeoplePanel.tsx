import React, { useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Hand, Pin, PinOff, UserPlus, Copy, Check, Bot } from 'lucide-react';
import { Participant } from '../types/meet';

interface Props {
  participants: Participant[];
  pinnedId: string | null;
  onTogglePin: (id: string) => void;
  onClose: () => void;
  roomId: string;
  onToggleDemoBot: () => void;
  isDemoBotActive: boolean;
  isDark: boolean;
}

export const PeoplePanel: React.FC<Props> = ({
  participants,
  pinnedId,
  onTogglePin,
  onClose,
  roomId,
  onToggleDemoBot,
  isDemoBotActive,
  isDark,
}) => {
  const [copied, setCopied] = useState(false);

  const copyInvite = () => {
    const fullLink = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handRaisedCount = participants.filter((p) => p.isHandRaised).length;

  return (
    <aside
      className={`fixed inset-y-0 right-0 sm:relative w-full sm:w-80 md:w-96 flex flex-col z-40 shadow-2xl border-l transition-all duration-300 ${
        isDark
          ? 'bg-[#212121] border-neutral-800 text-white'
          : 'bg-white border-neutral-200 text-neutral-900'
      }`}
    >
      {/* Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-inherit">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-base tracking-tight">People</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-700/60 text-neutral-300 font-bold">
            {participants.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-neutral-500/20 text-neutral-400 hover:text-white transition-colors"
          title="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Invite & Tools Banner */}
      <div className="p-4 border-b border-inherit space-y-2">
        <button
          onClick={copyInvite}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0494f4] hover:bg-[#037ed1] text-white text-xs font-semibold shadow-md shadow-[#0494f4]/25 transition-all active:scale-[0.99]"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <UserPlus className="w-4 h-4" />}
          <span>{copied ? 'Invite Link Copied!' : 'Add people / Copy invite'}</span>
        </button>

        <button
          onClick={onToggleDemoBot}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
            isDemoBotActive
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
              : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800'
          }`}
          title="Toggle Echo Bot for solo testing"
        >
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Echo Bot (Demo Peer)</span>
          </div>
          <span className="text-[10px] font-bold">
            {isDemoBotActive ? 'Active (Click to Remove)' : 'Click to Add'}
          </span>
        </button>
      </div>

      {/* Raised hands queue notice if any */}
      {handRaisedCount > 0 && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
          <Hand className="w-3.5 h-3.5" />
          <span>{handRaisedCount} person raised their hand</span>
        </div>
      )}

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {participants.map((p) => {
          const isPinned = pinnedId === p.id;
          return (
            <div
              key={p.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                isDark
                  ? 'bg-neutral-800/40 border-neutral-800/80 hover:bg-neutral-800/80'
                  : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                  style={{ backgroundColor: p.avatarColor || '#0494f4' }}
                >
                  {p.name.slice(0, 2).toUpperCase()}
                </div>

                {/* Name */}
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium truncate">{p.name}</span>
                    {p.isLocal && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-700 text-neutral-300 shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 block truncate">
                    {p.isScreenSharing ? 'Sharing screen' : p.isHandRaised ? 'Raised hand' : 'In meeting'}
                  </span>
                </div>
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {p.isHandRaised && (
                  <div className="p-1 text-amber-400" title="Hand raised">
                    <Hand className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Pin button */}
                <button
                  onClick={() => onTogglePin(p.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isPinned ? 'text-[#0494f4]' : 'text-neutral-400 hover:text-white'
                  }`}
                  title={isPinned ? 'Unpin' : 'Pin'}
                >
                  {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>

                {/* Video status */}
                <div className="p-1 text-neutral-400">
                  {p.isVideoMuted ? (
                    <VideoOff className="w-3.5 h-3.5 text-neutral-500" />
                  ) : (
                    <Video className="w-3.5 h-3.5 text-neutral-300" />
                  )}
                </div>

                {/* Audio status */}
                <div className="p-1">
                  {p.isAudioMuted ? (
                    <MicOff className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
