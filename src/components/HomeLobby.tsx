import React, { useState } from 'react';
import { Video, Keyboard, Link2, Copy, Check, Sparkles, Shield, Smartphone, Globe, Plus, ArrowRight } from 'lucide-react';

interface Props {
  isDark: boolean;
  onStartMeeting: (roomId: string) => void;
  onOpenCloudflareGuide: () => void;
}

// Generate random meeting code in Google Meet format: xxx-yyyy-zzz
export const generateMeetingCode = (): string => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const part1 = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const part3 = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  return `${part1}-${part2}-${part3}`;
};

export const HomeLobby: React.FC<Props> = ({
  isDark,
  onStartMeeting,
  onOpenCloudflareGuide,
}) => {
  const [meetingInput, setMeetingInput] = useState('');
  const [scheduledLink, setScheduledLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inputError, setInputError] = useState('');

  const handleInstantMeeting = () => {
    const code = generateMeetingCode();
    onStartMeeting(code);
  };

  const handleCreateForLater = () => {
    const code = generateMeetingCode();
    const currentOrigin = window.location.origin;
    const path = window.location.pathname;
    const fullLink = `${currentOrigin}${path}?room=${code}`;
    setScheduledLink(fullLink);
  };

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingInput.trim()) return;

    let code = meetingInput.trim();

    // If user pasted a full URL
    try {
      if (code.includes('?room=')) {
        const url = new URL(code);
        const r = url.searchParams.get('room');
        if (r) code = r;
      } else if (code.includes('/room/')) {
        const parts = code.split('/room/');
        if (parts[1]) code = parts[1].split('?')[0].split('#')[0];
      }
    } catch {
      // not a url, use string
    }

    // Clean code
    code = code.toLowerCase().replace(/[^a-z0-9-]/g, '');

    if (code.length < 3) {
      setInputError('Please enter a valid meeting code or link');
      return;
    }

    setInputError('');
    onStartMeeting(code);
  };

  const copyScheduled = () => {
    if (!scheduledLink) return;
    navigator.clipboard.writeText(scheduledLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      className={`min-h-[calc(100vh-64px)] flex flex-col justify-between transition-colors duration-200 ${
        isDark ? 'bg-[#212121] text-white' : 'bg-white text-neutral-900'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0494f4]/15 text-[#0494f4] border border-[#0494f4]/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero-Backend WebRTC • Direct Peer-to-Peer</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.15]">
                Video calls and meetings for{' '}
                <span className="text-[#0494f4] font-semibold underline decoration-[#0494f4]/40 decoration-wavy">
                  everyone.
                </span>
              </h1>
              <p
                className={`text-base sm:text-lg max-w-xl leading-relaxed ${
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                }`}
              >
                Connect, collaborate, and share with secure real-time WebRTC audio & video. 
                Optimized for Cloudflare Pages with zero-server static deployment.
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={handleInstantMeeting}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0494f4] hover:bg-[#037ed1] text-white font-medium text-sm shadow-lg shadow-[#0494f4]/25 active:scale-[0.98] transition-all"
              >
                <Video className="w-5 h-5" />
                <span>New meeting</span>
              </button>

              <button
                onClick={handleCreateForLater}
                className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                  isDark
                    ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-300 hover:text-white'
                    : 'border-neutral-300 hover:bg-neutral-100 text-neutral-700 hover:text-black'
                }`}
              >
                <Link2 className="w-4 h-4 text-[#0494f4]" />
                <span>Create link for later</span>
              </button>
            </div>

            {/* Join with code / link form */}
            <form onSubmit={handleJoinWithCode} className="space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg">
                <div
                  className={`flex-1 flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all ${
                    isDark
                      ? 'bg-neutral-800/80 border-neutral-700 focus-within:border-[#0494f4] focus-within:ring-2 focus-within:ring-[#0494f4]/20'
                      : 'bg-neutral-50 border-neutral-300 focus-within:border-[#0494f4] focus-within:ring-2 focus-within:ring-[#0494f4]/20'
                  }`}
                >
                  <Keyboard className="w-5 h-5 text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    value={meetingInput}
                    onChange={(e) => {
                      setMeetingInput(e.target.value);
                      if (inputError) setInputError('');
                    }}
                    placeholder="Enter code or paste meeting link"
                    className="w-full bg-transparent border-none outline-none text-sm placeholder:text-neutral-500 font-sans"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!meetingInput.trim()}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                    meetingInput.trim()
                      ? 'bg-neutral-700 hover:bg-[#0494f4] text-white shadow-sm'
                      : 'bg-neutral-800/40 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <span>Join</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {inputError && (
                <p className="text-xs text-rose-400 pl-1">{inputError}</p>
              )}
            </form>

            {/* Scheduled Link Modal Banner */}
            {scheduledLink && (
              <div
                className={`p-4 rounded-xl border animate-fade-in ${
                  isDark
                    ? 'bg-neutral-800/90 border-neutral-700 text-white'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#0494f4] uppercase tracking-wider">
                    Here's your meeting link
                  </span>
                  <button
                    onClick={() => setScheduledLink(null)}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <p className="text-xs text-neutral-400 mb-3">
                  Copy this link and send it to people you want to meet with.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={scheduledLink}
                    className="flex-1 text-xs font-mono p-2.5 rounded-lg bg-black/40 border border-neutral-700 text-neutral-200 select-all outline-none"
                  />
                  <button
                    onClick={copyScheduled}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0494f4] hover:bg-[#037ed1] text-white text-xs font-medium transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Cloudflare Pages Quick Note */}
            <div className="pt-2">
              <button
                onClick={onOpenCloudflareGuide}
                className={`text-left text-xs p-3.5 rounded-xl border flex items-center justify-between gap-3 w-full transition-colors ${
                  isDark
                    ? 'bg-neutral-800/40 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                    : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#0494f4]" />
                  <span>
                    Deploying to <strong>Cloudflare Pages</strong>? No Node server needed.
                  </span>
                </div>
                <span className="text-[#0494f4] font-medium underline text-[11px] shrink-0">
                  Read Guide &rarr;
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Showcase Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl relative overflow-hidden ${
                isDark
                  ? 'bg-neutral-800/50 border-neutral-700/80'
                  : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#0494f4]/20 rounded-full blur-3xl pointer-events-none" />

              {/* Mockup Meeting Window Preview */}
              <div className="rounded-2xl overflow-hidden border border-neutral-700/60 bg-black/80 aspect-4/3 relative flex flex-col justify-between p-4 shadow-inner">
                {/* Top status */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live WebRTC</span>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-neutral-300 text-[10px] font-mono">
                    HD 1080p
                  </div>
                </div>

                {/* Center graphic */}
                <div className="flex flex-col items-center justify-center my-auto text-center space-y-3 z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0494f4] to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-[#0494f4]/30">
                    <Video className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Gothwad Meet Room</h3>
                    <p className="text-neutral-400 text-xs mt-0.5">Click "New meeting" to enter</p>
                  </div>
                </div>

                {/* Bottom preview controls mock */}
                <div className="flex items-center justify-center gap-3 z-10">
                  <div className="w-8 h-8 rounded-full bg-neutral-800/80 flex items-center justify-center text-white text-xs border border-neutral-700">
                    🎤
                  </div>
                  <div className="w-8 h-8 rounded-full bg-neutral-800/80 flex items-center justify-center text-white text-xs border border-neutral-700">
                    📷
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#0494f4] flex items-center justify-center text-white text-xs shadow-md shadow-[#0494f4]/40">
                    👋
                  </div>
                  <div className="w-8 h-8 rounded-full bg-neutral-800/80 flex items-center justify-center text-white text-xs border border-neutral-700">
                    💬
                  </div>
                </div>
              </div>

              {/* Feature Pills */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="p-3 rounded-xl bg-black/20 border border-neutral-700/40 text-left">
                  <Smartphone className="w-4 h-4 text-[#0494f4] mb-1.5" />
                  <p className="text-xs font-semibold">Desktop &amp; Mobile</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Touch &amp; keyboard friendly</p>
                </div>
                <div className="p-3 rounded-xl bg-black/20 border border-neutral-700/40 text-left">
                  <Shield className="w-4 h-4 text-emerald-400 mb-1.5" />
                  <p className="text-xs font-semibold">End-to-End P2P</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Encrypted browser WebRTC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`w-full py-4 px-6 border-t text-center text-xs transition-colors ${
          isDark
            ? 'border-neutral-800 text-neutral-500'
            : 'border-neutral-200 text-neutral-500'
        }`}
      >
        <span>Gothwad Meet • WebRTC Real-Time Meetings • Theme: #212121 / #FFFFFF &amp; #0494f4</span>
      </footer>
    </div>
  );
};
