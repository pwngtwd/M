import React from 'react';
import { X, ShieldCheck, MonitorUp, MessageSquare, Mic, MicOff, Video, Users } from 'lucide-react';
import { HostSettings } from '../types/meet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: HostSettings;
  onUpdateSettings: (newSettings: HostSettings) => void;
  onMuteAll: () => void;
  isDark: boolean;
}

export const HostControlsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onMuteAll,
  isDark,
}) => {
  if (!isOpen) return null;

  const toggle = (key: keyof HostSettings) => {
    onUpdateSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl border p-6 ${
          isDark ? 'bg-[#212121] text-white border-neutral-700' : 'bg-white text-neutral-900 border-neutral-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-inherit">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0494f4]" />
            <h3 className="font-semibold text-lg">Host controls</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-500/20 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-xs">
          <p className="text-neutral-400">
            Use these host settings to keep your meeting safe and organized:
          </p>

          {/* Quick Access */}
          <div className="flex items-center justify-between p-3 rounded-xl border bg-neutral-800/40 border-neutral-700">
            <div>
              <p className="font-semibold text-white">Quick Access</p>
              <p className="text-[11px] text-neutral-400">
                When turned off, guests must ask permission before joining
              </p>
            </div>
            <button
              onClick={() => toggle('quickAccess')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.quickAccess ? 'bg-[#0494f4]' : 'bg-neutral-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.quickAccess ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-2">
            <h4 className="font-semibold text-neutral-300 mb-2">Let everyone:</h4>

            <div className="space-y-2">
              {/* Share screen */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border bg-neutral-800/30 border-neutral-700">
                <div className="flex items-center gap-2">
                  <MonitorUp className="w-4 h-4 text-neutral-400" />
                  <span>Share their screen</span>
                </div>
                <button
                  onClick={() => toggle('allowScreenShare')}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    settings.allowScreenShare ? 'bg-[#0494f4]' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.allowScreenShare ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Send chat messages */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border bg-neutral-800/30 border-neutral-700">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-neutral-400" />
                  <span>Send chat messages</span>
                </div>
                <button
                  onClick={() => toggle('allowChat')}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    settings.allowChat ? 'bg-[#0494f4]' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.allowChat ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Turn on microphone */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border bg-neutral-800/30 border-neutral-700">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-neutral-400" />
                  <span>Turn on their microphone</span>
                </div>
                <button
                  onClick={() => toggle('allowMic')}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    settings.allowMic ? 'bg-[#0494f4]' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.allowMic ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Mute All Button */}
          <div className="pt-2">
            <button
              onClick={onMuteAll}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-semibold transition-colors"
            >
              <MicOff className="w-4 h-4" />
              <span>Mute all participants</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-inherit flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0494f4] hover:bg-[#037ed1] text-white text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
