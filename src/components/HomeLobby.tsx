import React, { useState, useEffect } from 'react';
import {
  Video,
  Keyboard,
  Link2,
  Copy,
  Check,
  Shield,
  Smartphone,
  Globe,
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

interface Props {
  isDark: boolean;
  onStartMeeting: (roomId: string) => void;
  onOpenCloudflareGuide: () => void;
}

export const generateMeetingCode = (): string => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const part1 = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const part3 = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  return `${part1}-${part2}-${part3}`;
};

const CAROUSEL_SLIDES = [
  {
    title: 'Get a link you can share',
    description: 'Click New meeting to get a link you can send to people you want to meet with.',
    badge: 'Instant Sharing',
    icon: Link2,
    illustrationBg: 'from-[#0494f4]/30 to-blue-600/10',
  },
  {
    title: 'See everyone together',
    description: 'To see more people at the same time, switch between Tiled, Spotlight, or Sidebar layouts.',
    badge: 'Adaptive Grid',
    icon: Layers,
    illustrationBg: 'from-purple-500/30 to-indigo-600/10',
  },
  {
    title: 'Your meeting is safe & private',
    description: 'All video, audio, and chat streams are encrypted peer-to-peer over direct WebRTC.',
    badge: 'Encrypted P2P',
    icon: Shield,
    illustrationBg: 'from-emerald-500/30 to-teal-600/10',
  },
  {
    title: 'Works on phones & computers',
    description: 'Seamless responsive interface engineered for desktop, laptops, tablets, and smartphones.',
    badge: 'Mobile Optimized',
    icon: Smartphone,
    illustrationBg: 'from-amber-500/30 to-rose-600/10',
  },
];

export const HomeLobby: React.FC<Props> = ({
  isDark,
  onStartMeeting,
  onOpenCloudflareGuide,
}) => {
  const [meetingInput, setMeetingInput] = useState('');
  const [scheduledLink, setScheduledLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inputError, setInputError] = useState('');
  const [isNewMeetingDropdownOpen, setIsNewMeetingDropdownOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Auto rotate carousel every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
    setIsNewMeetingDropdownOpen(false);
  };

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingInput.trim()) return;

    let code = meetingInput.trim();
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
      // ignore
    }

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

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  const currentSlide = CAROUSEL_SLIDES[carouselIndex];
  const SlideIcon = currentSlide.icon;

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
                <span>Google Meet Clone • Zero-Backend WebRTC</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.12]">
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
                Gothwad Meet provides secure, high-definition video calls with live captions,
                screen sharing, whiteboard, and reactions. Built specifically for zero-server hosting on Cloudflare Pages.
              </p>
            </div>

            {/* Action Buttons with Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative">
              <div className="relative">
                <button
                  onClick={() => setIsNewMeetingDropdownOpen(!isNewMeetingDropdownOpen)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#0494f4] hover:bg-[#037ed1] text-white font-medium text-sm shadow-lg shadow-[#0494f4]/25 active:scale-[0.98] transition-all"
                >
                  <Video className="w-5 h-5" />
                  <span>New meeting</span>
                </button>

                {/* Dropdown Options */}
                {isNewMeetingDropdownOpen && (
                  <div
                    className={`absolute top-full left-0 mt-2 w-64 rounded-2xl shadow-2xl border p-2 z-40 animate-fade-in ${
                      isDark ? 'bg-[#2c2c2c] border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                    }`}
                  >
                    <button
                      onClick={handleCreateForLater}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-500/20 text-left text-xs font-medium"
                    >
                      <Link2 className="w-4 h-4 text-[#0494f4]" />
                      <span>Create a meeting for later</span>
                    </button>
                    <button
                      onClick={handleInstantMeeting}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-500/20 text-left text-xs font-medium"
                    >
                      <Plus className="w-4 h-4 text-[#0494f4]" />
                      <span>Start an instant meeting</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Enter a code or link input */}
              <form onSubmit={handleJoinWithCode} className="flex-1 max-w-md">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex-1 flex items-center gap-3 px-3.5 py-3 rounded-full border transition-all ${
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
                      placeholder="Enter a code or link"
                      className="w-full bg-transparent border-none outline-none text-xs sm:text-sm placeholder:text-neutral-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!meetingInput.trim()}
                    className={`px-5 py-3 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      meetingInput.trim()
                        ? 'text-[#0494f4] hover:bg-[#0494f4]/15'
                        : 'text-neutral-500 cursor-not-allowed opacity-50'
                    }`}
                  >
                    Join
                  </button>
                </div>
                {inputError && <p className="text-xs text-rose-400 pl-4 mt-1">{inputError}</p>}
              </form>
            </div>

            {/* Scheduled Link Modal Card */}
            {scheduledLink && (
              <div
                className={`p-4 rounded-2xl border animate-fade-in ${
                  isDark ? 'bg-neutral-800/90 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#0494f4] uppercase tracking-wider">
                    Here's your meeting link
                  </span>
                  <button onClick={() => setScheduledLink(null)} className="text-xs text-neutral-400 hover:text-white">
                    Close
                  </button>
                </div>
                <p className="text-xs text-neutral-400 mb-3">
                  Copy this link and send it to people you want to meet with. Be sure to save it so you can use it later, too.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={scheduledLink}
                    className="flex-1 text-xs font-mono p-2.5 rounded-xl bg-black/40 border border-neutral-700 text-neutral-200 select-all outline-none"
                  />
                  <button
                    onClick={copyScheduled}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0494f4] hover:bg-[#037ed1] text-white text-xs font-medium transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Cloudflare Pages Quick Guide Pill */}
            <div className="pt-2">
              <button
                onClick={onOpenCloudflareGuide}
                className={`text-left text-xs p-3.5 rounded-2xl border flex items-center justify-between gap-3 w-full transition-colors ${
                  isDark
                    ? 'bg-neutral-800/40 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                    : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#0494f4]" />
                  <span>
                    Deploying to <strong>Cloudflare Pages</strong>? Zero backend server required.
                  </span>
                </div>
                <span className="text-[#0494f4] font-medium underline text-[11px] shrink-0">
                  Read Guide &rarr;
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Google Meet Carousel Feature Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div
              className={`w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl text-center relative overflow-hidden flex flex-col justify-between min-h-[360px] ${
                isDark ? 'bg-neutral-800/40 border-neutral-700/80' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              {/* Illustration / Graphic */}
              <div className="my-auto flex flex-col items-center justify-center space-y-4">
                <div
                  className={`w-36 h-36 rounded-full bg-gradient-to-tr ${currentSlide.illustrationBg} flex items-center justify-center relative shadow-inner`}
                >
                  <SlideIcon className="w-16 h-16 text-[#0494f4]" />
                  <span className="absolute bottom-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                    {currentSlide.badge}
                  </span>
                </div>

                <div className="space-y-1.5 max-w-xs mx-auto">
                  <h3 className="text-lg font-semibold tracking-tight">{currentSlide.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {currentSlide.description}
                  </p>
                </div>
              </div>

              {/* Carousel Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-700/40 mt-4">
                <button
                  onClick={prevSlide}
                  className="p-1.5 rounded-full hover:bg-neutral-700/40 text-neutral-400 hover:text-white transition-colors"
                  title="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1.5">
                  {CAROUSEL_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        carouselIndex === idx ? 'w-6 bg-[#0494f4]' : 'w-2 bg-neutral-600'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className="p-1.5 rounded-full hover:bg-neutral-700/40 text-neutral-400 hover:text-white transition-colors"
                  title="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`w-full py-4 px-6 border-t text-center text-xs transition-colors ${
          isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-500'
        }`}
      >
        <span>Gothwad Meet • Dark #212121 • Light #FFFFFF • Accent #0494F4</span>
      </footer>
    </div>
  );
};
