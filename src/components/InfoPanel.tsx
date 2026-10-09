import React, { useState } from 'react';
import { X, Copy, Check, Globe, Shield, Smartphone, QrCode } from 'lucide-react';

interface Props {
  roomId: string;
  onClose: () => void;
  isDark: boolean;
  onOpenCloudflareGuide: () => void;
}

export const InfoPanel: React.FC<Props> = ({
  roomId,
  onClose,
  isDark,
  onOpenCloudflareGuide,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fullLink = `${window.location.origin}${window.location.pathname}?room=${roomId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(fullLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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
        <h3 className="font-semibold text-base tracking-tight">Meeting details</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-neutral-500/20 text-neutral-400 hover:text-white transition-colors"
          title="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        {/* Joining Info Card */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-[#0494f4]">Joining info</h4>

          <div
            className={`p-3 rounded-xl border space-y-2 ${
              isDark ? 'bg-neutral-800/50 border-neutral-700' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <p className="text-[11px] text-neutral-400">Meeting code</p>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold tracking-wide text-white">
                {roomId}
              </span>
              <button
                onClick={copyCode}
                className="p-1.5 rounded-lg hover:bg-neutral-700 text-neutral-300"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border space-y-2 ${
              isDark ? 'bg-neutral-800/50 border-neutral-700' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <p className="text-[11px] text-neutral-400">Shareable URL</p>
            <p className="font-mono text-[11px] text-neutral-300 break-all select-all">
              {fullLink}
            </p>
            <button
              onClick={copyLink}
              className="w-full mt-2 py-2 rounded-lg bg-[#0494f4] hover:bg-[#037ed1] text-white font-medium flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#0494f4]/20"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy joining info'}</span>
            </button>
          </div>
        </div>

        {/* Multi-Device Testing Tip */}
        <div
          className={`p-4 rounded-xl border space-y-2 ${
            isDark ? 'bg-neutral-800/30 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-neutral-200">
            <Smartphone className="w-4 h-4 text-[#0494f4]" />
            <span>Test on Phone or Another Tab</span>
          </div>
          <p className="text-neutral-400 leading-relaxed text-[11px]">
            Send this link to your smartphone or open it in a second Incognito tab to test two-way live WebRTC video, microphone audio, screen sharing, and chat!
          </p>
        </div>

        {/* Cloudflare Pages Deployment Note */}
        <div
          className={`p-4 rounded-xl border space-y-2 ${
            isDark ? 'bg-[#0494f4]/10 border-[#0494f4]/30' : 'bg-[#0494f4]/5 border-[#0494f4]/20'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-[#0494f4]">
            <Globe className="w-4 h-4" />
            <span>Cloudflare Pages Ready</span>
          </div>
          <p className="text-neutral-300 leading-relaxed text-[11px]">
            Gothwad Meet does not require a custom backend server. Deploy directly to Cloudflare Pages static hosting with Vite output <code className="text-[#0494f4]">dist</code>.
          </p>
          <button
            onClick={onOpenCloudflareGuide}
            className="text-[#0494f4] underline font-semibold text-[11px] hover:text-[#037ed1]"
          >
            View Cloudflare Deployment Details &rarr;
          </button>
        </div>
      </div>
    </aside>
  );
};
