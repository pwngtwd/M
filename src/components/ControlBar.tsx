import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  Hand,
  Smile,
  MessageSquare,
  Users,
  Info,
  PhoneOff,
  MoreVertical,
  Maximize,
  Minimize,
  Edit3,
  Bot,
  Settings,
  Subtitles,
  Shapes,
  ShieldCheck,
  Grid,
  Sparkles,
} from 'lucide-react';

interface Props {
  isMicOn: boolean;
  isCamOn: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isCaptionsOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleScreenShare: () => void;
  onToggleHandRaise: () => void;
  onToggleCaptions: () => void;
  onSendReaction: (emoji: string) => void;
  onLeaveCall: () => void;
  activePanel: 'none' | 'chat' | 'people' | 'info' | 'activities';
  onTogglePanel: (panel: 'chat' | 'people' | 'info' | 'activities') => void;
  unreadMessagesCount: number;
  participantsCount: number;
  onOpenWhiteboard: () => void;
  onOpenSettings: () => void;
  onOpenHostControls: () => void;
  onOpenChangeLayout: () => void;
  onOpenVisualEffects: () => void;
  onToggleDemoBot: () => void;
  isDemoBotActive: boolean;
  roomId: string;
  isDark: boolean;
}

const REACTION_EMOJIS = ['❤️', '👏', '🎉', '👍', '😮', '😂', '🚀', '🔥'];

export const ControlBar: React.FC<Props> = ({
  isMicOn,
  isCamOn,
  isScreenSharing,
  isHandRaised,
  isCaptionsOn,
  onToggleMic,
  onToggleCam,
  onToggleScreenShare,
  onToggleHandRaise,
  onToggleCaptions,
  onSendReaction,
  onLeaveCall,
  activePanel,
  onTogglePanel,
  unreadMessagesCount,
  participantsCount,
  onOpenWhiteboard,
  onOpenSettings,
  onOpenHostControls,
  onOpenChangeLayout,
  onOpenVisualEffects,
  onToggleDemoBot,
  isDemoBotActive,
  roomId,
  isDark,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    onSendReaction(emoji);
    setShowEmojiPicker(false);
  };

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <footer className="w-full h-20 px-3 sm:px-6 flex items-center justify-between select-none relative z-30 transition-colors">
      {/* Left section: Meeting Info Pill & Time */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
          <span>{currentTime}</span>
          <span>|</span>
          <span className="font-mono text-neutral-400">{roomId}</span>
        </div>
      </div>

      {/* Center Section: Core Audio/Video/Call Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 mx-auto">
        {/* Microphone Toggle */}
        <button
          onClick={onToggleMic}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
            isMicOn
              ? isDark
                ? 'bg-[#3c4043] hover:bg-[#4a4f53] text-white'
                : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
              : 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-rose-900/30'
          }`}
          title={isMicOn ? 'Turn off microphone' : 'Turn on microphone'}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCam}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
            isCamOn
              ? isDark
                ? 'bg-[#3c4043] hover:bg-[#4a4f53] text-white'
                : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
              : 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-rose-900/30'
          }`}
          title={isCamOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Live Captions (CC) Toggle */}
        <button
          onClick={onToggleCaptions}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full hidden sm:flex items-center justify-center transition-all shadow-md ${
            isCaptionsOn
              ? 'bg-[#0494f4] text-white ring-2 ring-[#0494f4]/40'
              : isDark
              ? 'bg-[#3c4043] hover:bg-[#4a4f53] text-white'
              : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
          }`}
          title={isCaptionsOn ? 'Turn off captions' : 'Turn on captions (CC)'}
        >
          <Subtitles className="w-5 h-5" />
        </button>

        {/* Reactions Button + Popover */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
              showEmojiPicker
                ? 'bg-[#0494f4] text-white'
                : isDark
                ? 'bg-[#3c4043] hover:bg-[#4a4f53] text-white'
                : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
            }`}
            title="Send a reaction"
          >
            <Smile className="w-5 h-5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 p-2 rounded-2xl bg-black/90 backdrop-blur-xl border border-neutral-700 shadow-2xl flex items-center gap-1.5 z-50 animate-fade-in">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSelectEmoji(emoji)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/20 text-xl transition-transform active:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Screen Sharing Toggle */}
        <button
          onClick={onToggleScreenShare}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full hidden xs:flex items-center justify-center transition-all shadow-md ${
            isScreenSharing
              ? 'bg-[#0494f4] text-white shadow-[#0494f4]/40 ring-2 ring-[#0494f4]/50'
              : isDark
              ? 'bg-[#3c4043] hover:bg-[#4a4f53] text-white'
              : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
          }`}
          title={isScreenSharing ? 'Stop presenting' : 'Present now (Share screen)'}
        >
          <MonitorUp className="w-5 h-5" />
        </button>

        {/* Hand Raise Toggle */}
        <button
          onClick={onToggleHandRaise}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
            isHandRaised
              ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/30 ring-2 ring-amber-400'
              : isDark
              ? 'bg-[#3c4043] hover:bg-[#4a4f53] text-white'
              : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
          }`}
          title={isHandRaised ? 'Lower hand' : 'Raise hand'}
        >
          <Hand className="w-5 h-5" />
        </button>

        {/* More options menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
              showMoreMenu
                ? 'bg-[#0494f4] text-white'
                : isDark
                ? 'bg-[#3c4043] hover:bg-[#4a4f53] text-white'
                : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
            }`}
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMoreMenu && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-60 p-2 rounded-2xl bg-black/95 backdrop-blur-xl border border-neutral-700 shadow-2xl space-y-1 z-50 animate-fade-in text-xs text-white">
              {/* Whiteboard */}
              <button
                onClick={() => {
                  onOpenWhiteboard();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-left"
              >
                <Edit3 className="w-4 h-4 text-[#0494f4]" />
                <span>Whiteboard (Jamboard)</span>
              </button>

              {/* Change layout */}
              <button
                onClick={() => {
                  onOpenChangeLayout();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-left"
              >
                <Grid className="w-4 h-4 text-neutral-300" />
                <span>Change layout</span>
              </button>

              {/* Apply visual effects */}
              <button
                onClick={() => {
                  onOpenVisualEffects();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-left"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Apply visual effects</span>
              </button>

              {/* Captions toggle */}
              <button
                onClick={() => {
                  onToggleCaptions();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/15 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Subtitles className="w-4 h-4 text-[#0494f4]" />
                  <span>Turn on captions</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isCaptionsOn ? 'bg-[#0494f4]/20 text-[#0494f4]' : 'text-neutral-500'}`}>
                  {isCaptionsOn ? 'On' : 'Off'}
                </span>
              </button>

              {/* Fullscreen */}
              <button
                onClick={() => {
                  toggleFullscreen();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-left"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                <span>{isFullscreen ? 'Exit full screen' : 'Full screen'}</span>
              </button>

              {/* Echo bot */}
              <button
                onClick={() => {
                  onToggleDemoBot();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/15 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>Echo Bot (Demo Peer)</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDemoBotActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-700 text-neutral-400'}`}>
                  {isDemoBotActive ? 'Active' : 'Off'}
                </span>
              </button>

              {/* Host controls */}
              <button
                onClick={() => {
                  onOpenHostControls();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-left"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Host controls</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => {
                  onOpenSettings();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/15 text-left"
              >
                <Settings className="w-4 h-4 text-neutral-400" />
                <span>Audio &amp; video settings</span>
              </button>
            </div>
          )}
        </div>

        {/* Leave Call Button */}
        <button
          onClick={onLeaveCall}
          className="px-5 sm:px-6 h-10 sm:h-12 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 active:scale-95 transition-all"
          title="Leave call"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-semibold">End</span>
        </button>
      </div>

      {/* Right Section: Info, People, Chat, Activities, Host controls */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Info panel */}
        <button
          onClick={() => onTogglePanel('info')}
          className={`p-2.5 rounded-full transition-colors relative ${
            activePanel === 'info'
              ? 'bg-[#0494f4] text-white'
              : isDark
              ? 'hover:bg-neutral-800 text-neutral-300'
              : 'hover:bg-neutral-200 text-neutral-700'
          }`}
          title="Meeting details"
        >
          <Info className="w-5 h-5" />
        </button>

        {/* People panel */}
        <button
          onClick={() => onTogglePanel('people')}
          className={`p-2.5 rounded-full transition-colors relative ${
            activePanel === 'people'
              ? 'bg-[#0494f4] text-white'
              : isDark
              ? 'hover:bg-neutral-800 text-neutral-300'
              : 'hover:bg-neutral-200 text-neutral-700'
          }`}
          title="People in call"
        >
          <Users className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-neutral-700 text-white text-[10px] font-bold flex items-center justify-center border border-black/40">
            {participantsCount}
          </span>
        </button>

        {/* Chat panel */}
        <button
          onClick={() => onTogglePanel('chat')}
          className={`p-2.5 rounded-full transition-colors relative ${
            activePanel === 'chat'
              ? 'bg-[#0494f4] text-white'
              : isDark
              ? 'hover:bg-neutral-800 text-neutral-300'
              : 'hover:bg-neutral-200 text-neutral-700'
          }`}
          title="In-call messages"
        >
          <MessageSquare className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0494f4] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* Activities panel (Triangle, Square, Circle) */}
        <button
          onClick={() => onTogglePanel('activities')}
          className={`p-2.5 rounded-full transition-colors relative hidden sm:flex ${
            activePanel === 'activities'
              ? 'bg-[#0494f4] text-white'
              : isDark
              ? 'hover:bg-neutral-800 text-neutral-300'
              : 'hover:bg-neutral-200 text-neutral-700'
          }`}
          title="Activities (Whiteboard, Polls, Notes)"
        >
          <Shapes className="w-5 h-5" />
        </button>

        {/* Host controls button */}
        <button
          onClick={onOpenHostControls}
          className="p-2.5 rounded-full hover:bg-neutral-800 text-neutral-300 hidden md:flex transition-colors"
          title="Host safety controls"
        >
          <ShieldCheck className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
};
