import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Volume2, Shield, Settings, Copy, Check, Users, Sparkles } from 'lucide-react';
import { StreamAudioAnalyser } from '../utils/audioAnalyser';

interface Props {
  roomId: string;
  isDark: boolean;
  onJoinMeeting: (userName: string, isMicOn: boolean, isCamOn: boolean, stream: MediaStream) => void;
  onOpenSettings: () => void;
  onBackToHome: () => void;
}

export const GreenRoom: React.FC<Props> = ({
  roomId,
  isDark,
  onJoinMeeting,
  onOpenSettings,
  onBackToHome,
}) => {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('gothwad_meet_username') || '';
  });
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [micLevel, setMicLevel] = useState(0);
  const [isMirror, setIsMirror] = useState(true);
  const [isBlur, setIsBlur] = useState(false);
  const [copied, setCopied] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<StreamAudioAnalyser | null>(null);

  // Initialize media devices
  useEffect(() => {
    let isCancelled = false;

    async function setupPreviewStream() {
      try {
        setPermissionError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true },
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup live audio analyser
        analyserRef.current = new StreamAudioAnalyser(stream, (level) => {
          setMicLevel(level);
        });
      } catch (err: any) {
        console.warn('Could not access camera/mic preview:', err);
        setPermissionError(
          'Camera or microphone access was blocked or is not available. You can still join as audio-only or listen.'
        );
      }
    }

    setupPreviewStream();

    return () => {
      isCancelled = true;
      if (analyserRef.current) {
        analyserRef.current.destroy();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, []);

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = !isMicOn));
    }
    setIsMicOn(!isMicOn);
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((t) => (t.enabled = !isCamOn));
    }
    setIsCamOn(!isCamOn);
  };

  const handleJoin = (present = false) => {
    const finalName = userName.trim() || 'Guest ' + Math.floor(100 + Math.random() * 900);
    localStorage.setItem('gothwad_meet_username', finalName);

    // Make sure stream tracks match mic/cam states
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = isMicOn));
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = isCamOn));
      onJoinMeeting(finalName, isMicOn, isCamOn, localStreamRef.current);
    } else {
      // Create empty or placeholder stream if user has no devices
      const emptyStream = new MediaStream();
      onJoinMeeting(finalName, isMicOn, isCamOn, emptyStream);
    }
  };

  const copyLink = () => {
    const currentOrigin = window.location.origin;
    const path = window.location.pathname;
    const fullLink = `${currentOrigin}${path}?room=${roomId}`;
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 transition-colors duration-200 ${
        isDark ? 'bg-[#212121] text-white' : 'bg-white text-neutral-900'
      }`}
    >
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Camera Preview Box */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            className={`w-full aspect-16/10 sm:aspect-16/9 rounded-3xl overflow-hidden relative border shadow-2xl flex items-center justify-center ${
              isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-neutral-900 border-neutral-300'
            }`}
          >
            {/* Live Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-all duration-300 ${
                !isCamOn ? 'hidden' : ''
              } ${isMirror ? 'scale-x-[-1]' : ''} ${isBlur ? 'blur-md scale-105' : ''}`}
            />

            {/* Avatar placeholder when camera is off */}
            {!isCamOn && (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-24 h-24 rounded-full bg-[#0494f4] text-white font-bold text-3xl flex items-center justify-center shadow-2xl shadow-[#0494f4]/40">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <p className="text-neutral-400 text-xs font-medium">Camera is turned off</p>
              </div>
            )}

            {/* Audio level meter (small pill bottom-left) */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs">
              <Volume2 className="w-3.5 h-3.5 text-neutral-300" />
              <div className="w-16 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-75"
                  style={{ width: `${isMicOn ? micLevel : 0}%` }}
                />
              </div>
            </div>

            {/* Mirror / Blur toggles top-right */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setIsMirror(!isMirror)}
                className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium transition-colors"
                title="Toggle Mirror Camera"
              >
                {isMirror ? 'Mirror: On' : 'Mirror: Off'}
              </button>
              <button
                onClick={() => setIsBlur(!isBlur)}
                className={`px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10 text-[11px] font-medium transition-colors ${
                  isBlur ? 'bg-[#0494f4] text-white' : 'bg-black/60 hover:bg-black/80 text-white'
                }`}
                title="Toggle Background Blur Filter"
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                Blur
              </button>
            </div>

            {/* Center-Bottom Media Control Buttons */}
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <button
                onClick={toggleMic}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isMicOn
                    ? 'bg-neutral-800/80 hover:bg-neutral-700 text-white border border-white/20'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
                title={isMicOn ? 'Turn off microphone' : 'Turn on microphone'}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleCam}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isCamOn
                    ? 'bg-neutral-800/80 hover:bg-neutral-700 text-white border border-white/20'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
                title={isCamOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {permissionError && (
            <p className="mt-3 text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center">
              {permissionError}
            </p>
          )}
        </div>

        {/* Right Column: Name input & Join action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight">Ready to join?</h2>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>Room code:</span>
              <span className="font-mono text-[#0494f4] font-semibold">{roomId}</span>
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">What's your name?</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              maxLength={30}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${
                isDark
                  ? 'bg-neutral-800/90 border-neutral-700 focus:border-[#0494f4] focus:ring-2 focus:ring-[#0494f4]/20 text-white'
                  : 'bg-neutral-50 border-neutral-300 focus:border-[#0494f4] focus:ring-2 focus:ring-[#0494f4]/20 text-neutral-900'
              }`}
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={() => handleJoin(false)}
              className="flex-1 py-3.5 px-6 rounded-full bg-[#0494f4] hover:bg-[#037ed1] text-white font-medium text-sm shadow-lg shadow-[#0494f4]/30 active:scale-[0.98] transition-all text-center"
            >
              Join now
            </button>
            <button
              onClick={() => handleJoin(true)}
              className={`py-3.5 px-5 rounded-full border text-sm font-medium transition-all ${
                isDark
                  ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-300'
                  : 'border-neutral-300 hover:bg-neutral-100 text-neutral-700'
              }`}
            >
              Present
            </button>
          </div>

          {/* Share Room Info */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-neutral-800/40 border-neutral-700/60' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300">Share meeting link</span>
              <button
                onClick={copyLink}
                className="flex items-center gap-1 text-[#0494f4] font-medium hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy link'}</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">
              Users on any device (phone, laptop, desktop) can join using this link directly in their browser without installing anything!
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs">
            <button
              onClick={onBackToHome}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              &larr; Back to home
            </button>
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-[#0494f4] transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Check audio & video</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
