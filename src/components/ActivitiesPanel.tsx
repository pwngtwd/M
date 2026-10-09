import React, { useState } from 'react';
import { X, Edit3, BarChart2, FileText, Plus, Check, Trash2 } from 'lucide-react';
import { Poll } from '../types/meet';

interface Props {
  onClose: () => void;
  onOpenWhiteboard: () => void;
  polls: Poll[];
  onCreatePoll: (question: string, options: string[]) => void;
  onVotePoll: (pollId: string, optionId: string) => void;
  localUserId: string;
  notesText: string;
  onChangeNotes: (text: string) => void;
  isDark: boolean;
}

export const ActivitiesPanel: React.FC<Props> = ({
  onClose,
  onOpenWhiteboard,
  polls,
  onCreatePoll,
  onVotePoll,
  localUserId,
  notesText,
  onChangeNotes,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'polls' | 'notes'>('menu');
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);

  const handleAddOption = () => {
    if (newOptions.length < 5) {
      setNewOptions([...newOptions, '']);
    }
  };

  const handleCreatePollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = newOptions.map((o) => o.trim()).filter(Boolean);
    if (!newQuestion.trim() || validOptions.length < 2) return;

    onCreatePoll(newQuestion.trim(), validOptions);
    setNewQuestion('');
    setNewOptions(['', '']);
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
        <div className="flex items-center gap-2">
          {activeTab !== 'menu' && (
            <button
              onClick={() => setActiveTab('menu')}
              className="text-xs text-[#0494f4] hover:underline font-medium mr-1"
            >
              &larr; Back
            </button>
          )}
          <h3 className="font-semibold text-base tracking-tight">
            {activeTab === 'menu' ? 'Activities' : activeTab === 'polls' ? 'Polls' : 'Meeting Notes'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-neutral-500/20 text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'menu' && (
          <div className="space-y-3">
            {/* Whiteboarding */}
            <button
              onClick={() => {
                onOpenWhiteboard();
                onClose();
              }}
              className={`w-full p-4 rounded-2xl border flex items-center gap-4 text-left transition-all ${
                isDark
                  ? 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800/80 hover:border-neutral-700'
                  : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-[#0494f4]/20 text-[#0494f4] flex items-center justify-center shrink-0">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Whiteboarding</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Start a collaborative Jamboard scratchpad
                </p>
              </div>
            </button>

            {/* Polls */}
            <button
              onClick={() => setActiveTab('polls')}
              className={`w-full p-4 rounded-2xl border flex items-center gap-4 text-left transition-all ${
                isDark
                  ? 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800/80 hover:border-neutral-700'
                  : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Polls</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Ask questions and collect real-time votes
                </p>
              </div>
            </button>

            {/* Shared Notes */}
            <button
              onClick={() => setActiveTab('notes')}
              className={`w-full p-4 rounded-2xl border flex items-center gap-4 text-left transition-all ${
                isDark
                  ? 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800/80 hover:border-neutral-700'
                  : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Meeting Notes</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Real-time agenda and minutes scratchpad
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Polls View */}
        {activeTab === 'polls' && (
          <div className="space-y-5">
            {/* Poll Creator */}
            <form onSubmit={handleCreatePollSubmit} className="space-y-3 p-3.5 rounded-2xl bg-black/20 border border-neutral-700/60">
              <h4 className="font-semibold text-xs text-[#0494f4]">Start a poll</h4>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs outline-none focus:border-[#0494f4]"
              />

              <div className="space-y-2">
                {newOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...newOptions];
                      updated[idx] = e.target.value;
                      setNewOptions(updated);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700 text-xs outline-none focus:border-[#0494f4]"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                {newOptions.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs text-[#0494f4] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add option</span>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!newQuestion.trim() || newOptions.filter((o) => o.trim()).length < 2}
                  className="px-4 py-1.5 rounded-xl bg-[#0494f4] hover:bg-[#037ed1] text-white text-xs font-medium disabled:opacity-40"
                >
                  Launch Poll
                </button>
              </div>
            </form>

            {/* Polls List */}
            <div className="space-y-4">
              {polls.length === 0 ? (
                <p className="text-center text-xs text-neutral-500 py-6">
                  No polls active yet. Create one above!
                </p>
              ) : (
                polls.map((poll) => {
                  const totalVotes = poll.options.reduce((acc, o) => acc + o.votes.length, 0);

                  return (
                    <div
                      key={poll.id}
                      className="p-4 rounded-2xl border border-neutral-700 bg-neutral-800/40 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-xs text-white">{poll.question}</h4>
                          <span className="text-[10px] text-neutral-400">
                            By {poll.creatorName} • {totalVotes} votes
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {poll.options.map((option) => {
                          const hasVoted = option.votes.includes(localUserId);
                          const percentage = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;

                          return (
                            <button
                              key={option.id}
                              onClick={() => onVotePoll(poll.id, option.id)}
                              className={`w-full p-2.5 rounded-xl border text-left relative overflow-hidden flex items-center justify-between transition-all ${
                                hasVoted
                                  ? 'border-[#0494f4] bg-[#0494f4]/15'
                                  : 'border-neutral-700 hover:bg-neutral-800'
                              }`}
                            >
                              <div
                                className="absolute inset-y-0 left-0 bg-[#0494f4]/20 transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                              <div className="relative z-10 flex items-center gap-2 text-xs">
                                {hasVoted && <Check className="w-3.5 h-3.5 text-[#0494f4]" />}
                                <span>{option.text}</span>
                              </div>
                              <span className="relative z-10 text-[11px] font-mono text-neutral-300">
                                {percentage}% ({option.votes.length})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Notes View */}
        {activeTab === 'notes' && (
          <div className="space-y-3 flex flex-col h-full">
            <p className="text-xs text-neutral-400">
              Shared meeting notes synced in real-time between all participants:
            </p>
            <textarea
              value={notesText}
              onChange={(e) => onChangeNotes(e.target.value)}
              placeholder="Type agenda, key decisions, or minutes here..."
              rows={16}
              className="w-full flex-1 p-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700 text-xs text-neutral-200 outline-none focus:border-[#0494f4] resize-none font-mono"
            />
          </div>
        )}
      </div>
    </aside>
  );
};
