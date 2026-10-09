import React, { useEffect, useState } from 'react';
import { X, Mic, Video, Volume2, Shield, Moon, Sun, Play } from 'lucide-react';
import { sounds } from '../utils/sounds';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  mirrorVideo: boolean;
  onToggleMirror: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isDark,
  onToggleTheme,
  mirrorVideo,
  onToggleMirror,
}) => {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioInputs = devices.filter((d) => d.kind === 'audioinput');
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);
      if (audioInputs[0]) setSelectedAudio(audioInputs[0].deviceId);
      if (videoInputs[0]) setSelectedVideo(videoInputs[0].deviceId);
    }).catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const testAudio = () => {
    sounds.playJoinSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl border p-6 ${
          isDark
            ? 'bg-[#212121] text-white border-neutral-700'
            : 'bg-white text-neutral-900 border-neutral-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <h3 className="text-lg font-semibold tracking-tight">Audio &amp; Video Settings</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-500/20 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="py-5 space-y-5 text-xs">
          {/* Microphone */}
          <div className="space-y-1.5">
            <label className="font-medium flex items-center gap-2 text-neutral-300">
              <Mic className="w-4 h-4 text-[#0494f4]" />
              <span>Microphone</span>
            </label>
            <select
              value={selectedAudio}
              onChange={(e) => setSelectedAudio(e.target.value)}
              className="w-full p-2.5 rounded-xl border bg-neutral-800 border-neutral-700 text-neutral-200 outline-none focus:border-[#0494f4]"
            >
              {audioDevices.length > 0 ? (
                audioDevices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Microphone ${i + 1}`}
                  </option>
                ))
              ) : (
                <option value="">Default Microphone</option>
              )}
            </select>
          </div>

          {/* Camera */}
          <div className="space-y-1.5">
            <label className="font-medium flex items-center gap-2 text-neutral-300">
              <Video className="w-4 h-4 text-[#0494f4]" />
              <span>Camera</span>
            </label>
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
              className="w-full p-2.5 rounded-xl border bg-neutral-800 border-neutral-700 text-neutral-200 outline-none focus:border-[#0494f4]"
            >
              {videoDevices.length > 0 ? (
                videoDevices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))
              ) : (
                <option value="">Default Camera</option>
              )}
            </select>
          </div>

          {/* Speakers test */}
          <div className="space-y-1.5">
            <label className="font-medium flex items-center gap-2 text-neutral-300">
              <Volume2 className="w-4 h-4 text-[#0494f4]" />
              <span>Speaker Test</span>
            </label>
            <div className="flex items-center justify-between p-2.5 rounded-xl border bg-neutral-800/60 border-neutral-700">
              <span className="text-neutral-300">Play chime to test sound</span>
              <button
                onClick={testAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0494f4] hover:bg-[#037ed1] text-white font-medium transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test</span>
              </button>
            </div>
          </div>

          {/* Mirror Camera Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border bg-neutral-800/40 border-neutral-700">
            <div>
              <p className="font-medium text-neutral-200">Mirror My Video</p>
              <p className="text-[11px] text-neutral-400">Flips your local camera preview horizontally</p>
            </div>
            <button
              onClick={onToggleMirror}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                mirrorVideo ? 'bg-[#0494f4]' : 'bg-neutral-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  mirrorVideo ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Theme selector */}
          <div className="flex items-center justify-between p-3 rounded-xl border bg-neutral-800/40 border-neutral-700">
            <div>
              <p className="font-medium text-neutral-200">Color Theme</p>
              <p className="text-[11px] text-neutral-400">
                Dark: #212121 • Light: #FFFFFF • Accent: #0494F4
              </p>
            </div>
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-600 text-neutral-200 hover:text-white"
            >
              {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-inherit flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0494f4] hover:bg-[#037ed1] text-white font-medium text-xs transition-colors shadow-md shadow-[#0494f4]/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
