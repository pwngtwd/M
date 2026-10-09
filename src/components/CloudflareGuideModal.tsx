import React from 'react';
import { X, Cloud, Zap, Database, CheckCircle2, Copy, ExternalLink, HelpCircle, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const CloudflareGuideModal: React.FC<Props> = ({ isOpen, onClose, isDark }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const copyConfig = () => {
    navigator.clipboard.writeText(`Build Command: npm run build
Build Output Directory: dist
Framework Preset: Vite
Node Version: 18 or 20`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl border ${
          isDark
            ? 'bg-[#212121] text-white border-neutral-700'
            : 'bg-white text-neutral-900 border-neutral-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-700/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0494f4]/20 flex items-center justify-center text-[#0494f4]">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans">Cloudflare Pages vs Workers Guide</h2>
              <p className="text-xs text-neutral-400">Gothwad Meet Zero-Backend Deployment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-500/20 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-6 text-sm">
          {/* Direct Answer to User's Query */}
          <div className="p-4 rounded-xl bg-[#0494f4]/10 border border-[#0494f4]/30">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-[#0494f4] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[#0494f4] text-base">
                  Aapko Cloudflare Pages par deploy karna chahiye! (Recommended)
                </h3>
                <p className="mt-1 leading-relaxed text-neutral-300">
                  Kyonki <strong>Gothwad Meet</strong> ek modern React + Vite Single Page App (SPA) hai. 
                  Cloudflare Pages static frontend hosting ke liye bana hai jo free me unlimited bandwidth, 
                  custom domain, instant global CDN, aur automatic HTTPS deta hai.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-800/60 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center gap-2 font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cloudflare Pages (Best Choice)</span>
              </div>
              <ul className="mt-2.5 space-y-2 text-xs text-neutral-300">
                <li>• <strong>No Server Required:</strong> Vite <code className="text-[#0494f4]">npm run build</code> seedha <code className="text-[#0494f4]">dist</code> folder serve karta hai.</li>
                <li>• <strong>Zero Cost:</strong> Free tier me unlimited requests &amp; bandwidth.</li>
                <li>• <strong>Instant Git Sync:</strong> GitHub push karne par automatic deploy.</li>
                <li>• <strong>Future Ready:</strong> Baad me Supabase integrate karne ke liye ready!</li>
              </ul>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-800/40 border-neutral-700/60' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center gap-2 font-semibold text-amber-400">
                <HelpCircle className="w-4 h-4" />
                <span>Cloudflare Workers</span>
              </div>
              <ul className="mt-2.5 space-y-2 text-xs text-neutral-400">
                <li>• Workers serverless functions / microservices ke liye design kiya gaya hai.</li>
                <li>• Frontend bundle host karne ke liye setup thoda complex ho jata hai.</li>
                <li>• Isliye Pages hi sabse simple aur perfect choice hai.</li>
              </ul>
            </div>
          </div>

          {/* WebRTC Zero-Backend Architecture */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-neutral-800/40 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
            <h4 className="font-semibold flex items-center gap-2 text-white">
              <ShieldCheck className="w-4 h-4 text-[#0494f4]" />
              Bina Backend ke WebRTC kaise kaam karta hai?
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-neutral-300">
              Gothwad Meet me Peer-to-Peer WebRTC use hota hai. Signaling ke liye cloud WebRTC broker 
              aur Google STUN servers (<code className="text-[#0494f4]">stun.l.google.com:19302</code>) 
              use hote hain. Audio, Video aur Chat seedha user-to-user (P2P mesh) encrypted stream hoti hai, 
              isliye aapko apna koi Express ya Node backend server chalane ki zaroorat nahi hai!
            </p>
          </div>

          {/* Deployment Steps */}
          <div>
            <h4 className="font-semibold text-base mb-3 text-white">Deploy karne ke 3 aasan steps:</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/80">
                <span className="w-5 h-5 rounded-full bg-[#0494f4] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <div>
                  <p className="font-medium text-white">GitHub par code push karein</p>
                  <p className="text-neutral-400 mt-0.5">Apne project ko GitHub repository me commit aur push karein.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/80">
                <span className="w-5 h-5 rounded-full bg-[#0494f4] text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <div>
                  <p className="font-medium text-white">Cloudflare Dashboard me Pages select karein</p>
                  <p className="text-neutral-400 mt-0.5">
                    <strong>Workers &amp; Pages</strong> &rarr; <strong>Create application</strong> &rarr; <strong>Pages</strong> &rarr; <strong>Connect to Git</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/80">
                <span className="w-5 h-5 rounded-full bg-[#0494f4] text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <div className="w-full">
                  <p className="font-medium text-white">Build Settings daalein:</p>
                  <div className="mt-2 p-2.5 rounded bg-black/60 font-mono text-[11px] text-neutral-300 space-y-1">
                    <p><span className="text-[#0494f4]">Framework preset:</span> Vite</p>
                    <p><span className="text-[#0494f4]">Build command:</span> npm run build</p>
                    <p><span className="text-[#0494f4]">Build output directory:</span> dist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supabase Roadmap note */}
          <div className="p-3 rounded-xl bg-purple-900/20 border border-purple-500/30 flex items-start gap-3 text-xs">
            <Database className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-purple-300">Supabase Integration (Future):</span>
              <p className="mt-0.5 text-neutral-300">
                Jab aap baad me Supabase connect karenge, tab seedha browser se <code className="text-purple-300">createClient(SUPABASE_URL, ANON_KEY)</code> use kar sakte hain ya Cloudflare Pages Functions use kar sakte hain — tab bhi kisi custom Node/Express server ki zaroorat nahi padegi!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-700/40 flex items-center justify-between">
          <button
            onClick={copyConfig}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Settings Copied!' : 'Copy Build Settings'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0494f4] hover:bg-[#037ed1] text-xs font-medium text-white shadow-lg shadow-[#0494f4]/20 transition-colors"
          >
            Got it, samajh gaya!
          </button>
        </div>
      </div>
    </div>
  );
};
