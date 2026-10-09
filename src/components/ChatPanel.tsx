import React, { useState, useRef, useEffect } from 'react';
import { X, Send, ShieldAlert } from 'lucide-react';
import { ChatMessage } from '../types/meet';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
  isDark: boolean;
}

export const ChatPanel: React.FC<Props> = ({
  messages,
  onSendMessage,
  onClose,
  isDark,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        <h3 className="font-semibold text-base tracking-tight">In-call messages</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-neutral-500/20 text-neutral-400 hover:text-white transition-colors"
          title="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Info notice */}
      <div className="px-5 py-2.5 bg-neutral-800/30 border-b border-neutral-800/40 text-[11px] text-neutral-400 flex items-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-[#0494f4] shrink-0" />
        <span>Messages are delivered directly peer-to-peer via WebRTC data channel.</span>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-2">
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-xl">
              💬
            </div>
            <p className="text-xs font-medium">No messages yet</p>
            <p className="text-[11px] text-neutral-500">
              Messages can be seen only by people in the call and disappear when the call ends.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isLocal ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-neutral-400">
                <span className="font-medium text-neutral-300">
                  {msg.isLocal ? 'You' : msg.senderName}
                </span>
                <span>•</span>
                <span>{formatTime(msg.timestamp)}</span>
              </div>
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                  msg.isLocal
                    ? 'bg-[#0494f4] text-white rounded-tr-xs'
                    : isDark
                    ? 'bg-neutral-800 text-neutral-100 rounded-tl-xs border border-neutral-700'
                    : 'bg-neutral-100 text-neutral-800 rounded-tl-xs border border-neutral-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSend} className="p-3 border-t border-inherit flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send a message to everyone"
          maxLength={500}
          className={`flex-1 px-4 py-2.5 rounded-full text-xs outline-none border transition-colors ${
            isDark
              ? 'bg-neutral-800 border-neutral-700 focus:border-[#0494f4] text-white placeholder:text-neutral-500'
              : 'bg-neutral-50 border-neutral-300 focus:border-[#0494f4] text-neutral-900 placeholder:text-neutral-500'
          }`}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`p-2.5 rounded-full transition-all ${
            inputText.trim()
              ? 'bg-[#0494f4] text-white hover:bg-[#037ed1] shadow-md shadow-[#0494f4]/30'
              : 'bg-neutral-700/50 text-neutral-500 cursor-not-allowed'
          }`}
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
};
