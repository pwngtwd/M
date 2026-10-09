import React, { useEffect, useRef, useState } from 'react';
import { MicOff, Pin, PinOff, Hand, Maximize2, PictureInPicture, MonitorUp } from 'lucide-react';
import { Participant } from '../types/meet';

interface Props {
  participant: Participant;
  isPinned: boolean;
  onTogglePin: (id: string) => void;
  isDark: boolean;
  mirrorLocal?: boolean;
}

export const VideoTile: React.FC<Props> = ({
  participant,
  isPinned,
  onTogglePin,
  isDark,
  mirrorLocal = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideoTrack, setHasVideoTrack] = useState(false);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
      const vTracks = participant.stream.getVideoTracks();
      setHasVideoTrack(vTracks.length > 0 && vTracks[0].enabled && !participant.isVideoMuted);
    } else {
      setHasVideoTrack(false);
    }
  }, [participant.stream, participant.isVideoMuted]);

  const handlePiP = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement === videoRef.current) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.warn('PiP failed', err);
      }
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isActuallySpeaking = participant.isSpeaking && !participant.isAudioMuted;

  return (
    <div
      className={`relative w-full h-full min-h-[160px] rounded-2xl overflow-hidden transition-all duration-300 group flex items-center justify-center border ${
        isActuallySpeaking
          ? 'ring-3 ring-[#0494f4] speaker-active-glow border-[#0494f4]'
          : isDark
          ? 'bg-[#1e1e1e] border-neutral-800'
          : 'bg-[#2b2b2b] border-neutral-700'
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={participant.isLocal} // Local video muted to prevent audio feedback
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          hasVideoTrack && !participant.isVideoMuted ? 'opacity-100' : 'opacity-0'
        } ${participant.isLocal && !participant.isScreenSharing && mirrorLocal ? 'scale-x-[-1]' : ''}`}
      />

      {/* Avatar Fallback when Video is Turned Off */}
      {(!hasVideoTrack || participant.isVideoMuted) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none bg-neutral-900/95">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-medium shadow-2xl transition-transform group-hover:scale-105"
            style={{
              backgroundColor: participant.avatarColor || '#0494f4',
            }}
          >
            {getInitials(participant.name)}
          </div>
          <p className="mt-3 text-xs text-neutral-400 font-medium">
            {participant.name} {participant.isLocal && '(You)'}
          </p>
        </div>
      )}

      {/* Active speaker wave indicator in top-left */}
      {isActuallySpeaking && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#0494f4]/40 z-20">
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-1 bg-[#0494f4] rounded-full wave-bar-1" />
            <span className="w-1 bg-[#0494f4] rounded-full wave-bar-2" />
            <span className="w-1 bg-[#0494f4] rounded-full wave-bar-3" />
          </div>
          <span className="text-[10px] text-white font-medium">Speaking</span>
        </div>
      )}

      {/* Top right badges: Muted, Hand raised, Pin & PiP controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
        {/* Hand Raised Banner */}
        {participant.isHandRaised && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500 text-black text-xs font-bold animate-bounce shadow-lg">
            <Hand className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">Raised hand</span>
          </div>
        )}

        {/* Screen sharing badge */}
        {participant.isScreenSharing && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#0494f4] text-white text-xs font-semibold shadow-lg">
            <MonitorUp className="w-3.5 h-3.5" />
            <span className="text-[10px]">Presenting</span>
          </div>
        )}

        {/* Audio Muted Indicator */}
        {participant.isAudioMuted && (
          <div className="p-1.5 rounded-full bg-rose-500/90 text-white shadow-md" title="Microphone muted">
            <MicOff className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Pin toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(participant.id);
          }}
          className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
            isPinned
              ? 'bg-[#0494f4] text-white'
              : 'bg-black/60 text-white/80 opacity-0 group-hover:opacity-100 hover:bg-black/80'
          }`}
          title={isPinned ? 'Unpin participant' : 'Pin to spotlight'}
        >
          {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        </button>

        {/* PiP button (on hover for video streams) */}
        {hasVideoTrack && !participant.isVideoMuted && (
          <button
            onClick={handlePiP}
            className="p-1.5 rounded-full bg-black/60 text-white/80 hover:bg-black/80 opacity-0 group-hover:opacity-100 backdrop-blur-md transition-all hidden sm:block"
            title="Picture in Picture"
          >
            <PictureInPicture className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Bottom Name Label */}
      <div className="absolute bottom-3 left-3 max-w-[85%] z-20">
        <div className="px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md border border-white/10 text-white text-xs font-medium truncate flex items-center gap-1.5 shadow-md">
          <span className="truncate">{participant.name}</span>
          {participant.isLocal && <span className="text-neutral-400 font-normal shrink-0">(You)</span>}
        </div>
      </div>
    </div>
  );
};
