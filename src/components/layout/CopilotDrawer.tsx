import React, { useState, useRef, useEffect } from 'react';
import { CycloneData, InfrastructureAsset, CopilotMessage, RiskLevel } from '../../types';
import { answerCopilotQuestion } from '../../services/aiService';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { playButtonClickTone, playSuccessChime } from '../../utils/audio';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cyclone: CycloneData;
  selectedAsset: InfrastructureAsset | null;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  cyclone,
  selectedAsset
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      timestamp: '08:35 UTC',
      content: `AegisTwin AI Copilot standing by. Active scenario: Category 4 Cyclone VARUN (185 km/h sustained winds, 4.8m storm surge, landfall in T-12h). Select a suggested query or enter a strategic operations question.`,
      structuredResponse: {
        observation: 'Severe Cyclone VARUN approaching Bay of Bengal coastline with 185 km/h eyewall winds.',
        risk: 'High risk to low-lying hospitals, bridges, and power grid nodes within 5km coastal strip.',
        recommendedAction: 'Verify critical hospital backup fuel supplies, execute Phase 3 coastal evacuations, and monitor flood-prone bridges.',
        priority: 'CRITICAL',
        actionList: [
          '01. Clear evacuation routes around Coastal Zone A.',
          '02. Verify emergency power at 3 critical hospitals.',
          '03. Move vulnerable populations from high flood-risk areas.',
          '04. Position emergency response teams near major bridges.',
          '05. Increase shelter readiness in coastal districts.'
        ]
      }
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const suggestedPrompts = [
    'What should authorities prioritize in the next 6 hours?',
    'Which infrastructure requires immediate attention?',
    'Identify the highest-risk evacuation zones.',
    'Generate a district emergency action plan.',
    'Which hospitals may face accessibility problems?'
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || inputVal).trim();
    if (!q || isLoading) return;

    playButtonClickTone();
    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      content: q
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await answerCopilotQuestion(q, {
        cyclone,
        selectedAsset
      });

      const botMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
        content: res.reply,
        structuredResponse: res.structured
      };

      setMessages((prev) => [...prev, botMsg]);
      playSuccessChime();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="AI Emergency Copilot"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#070b13] border-l border-[#161f30] shadow-2xl flex flex-col font-sans select-none"
    >
      {/* Drawer Header */}
      <div className="bg-[#090e1a] px-4 py-3.5 border-b border-[#161f30] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white tracking-wide">
                CYCLONEGUARD COPILOT
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              AI Emergency Decision Support • Gemini 3.8
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close Copilot Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="bg-[#05080e] px-3.5 py-2.5 border-b border-[#161f30] space-y-1.5">
        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>Operational Decision Prompts</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {suggestedPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="text-left whitespace-nowrap px-2.5 py-1 rounded bg-[#0c121e] hover:bg-[#121c2e] border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#05070a] bg-grid-pattern">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-slate-400 px-1">
              <span>{m.sender === 'user' ? 'Emergency Authority' : 'CycloneGuard AI'}</span>
              <span>• {m.timestamp}</span>
              {m.sender === 'assistant' && (
                <button
                  onClick={() => handleCopy(m.id, m.content)}
                  className="hover:text-cyan-300 p-0.5 rounded cursor-pointer"
                  title="Copy Directive"
                >
                  {copiedId === m.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              )}
            </div>

            <div
              className={`p-3.5 rounded-lg text-xs leading-relaxed max-w-[95%] border ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-900/60 to-blue-900/60 text-slate-100 border-cyan-500/40'
                  : 'bg-[#0a0f19] text-slate-200 border-[#1a2538]'
              }`}
            >
              {/* If Structured Response exists, show the enterprise format: Observation, Risk, Action, Priority */}
              {m.structuredResponse ? (
                <div className="space-y-3 font-sans">
                  {/* Priority Badge */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      INCIDENT DIRECTIVE
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        m.structuredResponse.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      PRIORITY: {m.structuredResponse.priority}
                    </span>
                  </div>

                  {/* 4 Pillars */}
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] uppercase block">
                        • OBSERVATION
                      </span>
                      <p className="text-slate-200 mt-0.5">{m.structuredResponse.observation}</p>
                    </div>

                    <div>
                      <span className="text-rose-400 font-mono text-[10px] uppercase block">
                        • RISK
                      </span>
                      <p className="text-slate-200 mt-0.5">{m.structuredResponse.risk}</p>
                    </div>

                    <div>
                      <span className="text-cyan-400 font-mono text-[10px] uppercase block">
                        • RECOMMENDED ACTION
                      </span>
                      <p className="text-slate-200 mt-0.5">{m.structuredResponse.recommendedAction}</p>
                    </div>
                  </div>

                  {/* Action List items */}
                  {m.structuredResponse.actionList && m.structuredResponse.actionList.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="text-[10px] font-mono uppercase text-slate-400 mb-1.5 font-bold">
                        EXECUTION CHECKLIST
                      </div>
                      <div className="space-y-1 font-mono text-[11px] text-slate-300">
                        {m.structuredResponse.actionList.map((item, idx) => (
                          <div key={idx} className="p-1.5 rounded bg-slate-950/80 border border-slate-800/60">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-sans text-xs">{m.content}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono bg-[#0a0f19] p-3 rounded border border-slate-800 w-fit">
            <Bot className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Formulating emergency decision directives...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Box */}
      <div className="bg-[#090e1a] p-3 border-t border-[#161f30]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask AI Copilot for emergency decision support..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-[#05080f] border border-slate-800 focus:border-cyan-500 rounded px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !inputVal.trim()}
            className="px-3.5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            <span>Send</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </aside>
  );
};
