import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, X, BrainCircuit } from 'lucide-react';
import Markdown from 'react-markdown';
import { aiService, AIChatMessage } from '../services/aiService';
import { useSimulationStore } from '../store/simulationStore';

export const AICopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<AIChatMessage[]>([
    { role: 'model', text: "Systems online. I am the Vantage Kernel Copilot. How can I assist your simulation today? I can explain CPU scheduling, Memory strategies, or even perform operations for you." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Access simulation store actions
  const { step, reset, setAlgorithm, addProcess } = useSimulationStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: AIChatMessage = { role: 'user', text: input };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const result = await aiService.generateGuideResponse(input, history);
    
    // Handle Function Calls
    if (result.functionCalls) {
      for (const call of result.functionCalls) {
        try {
          if (call.name === 'step_simulation') {
            step();
          } else if (call.name === 'reset_kernel') {
            reset();
          } else if (call.name === 'set_scheduling_algorithm') {
            const args = call.args as { algorithm: any };
            setAlgorithm(args.algorithm);
          } else if (call.name === 'add_process') {
            const args = call.args as { pid: string, name: string, priority: number, burstTime: number, memRequired: number };
            addProcess(args.pid, args.name, args.priority, args.burstTime, args.memRequired);
          }
        } catch (e) {
          console.error("Function call execution error:", e);
        }
      }
    }

    setHistory(prev => [...prev, { role: 'model', text: result.text || "Kernel Operation Complete. How else can I help?" }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-slate-700/50"
            style={{ height: '500px' }}
          >
            {/* Header */}
            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-xl text-white">
                  <BrainCircuit size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Kernel Copilot</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] text-emerald-400 font-mono uppercase tracking-tighter">AI Subsystem Active</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent)]"
            >
              {history.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed prose prose-invert prose-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/10' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                  }`}>
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-700 text-[10px] italic flex items-center gap-2 shadow-inner">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" />
                    </div>
                    Computing system response...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-slate-800/30 border-t border-slate-800">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tell me to 'Reset kernel' or 'Add process P1'..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all pr-12"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 transition-all shadow-lg"
                >
                  <Send size={14} />
                </button>
              </form>
              <div className="mt-3 flex items-center gap-2 px-1">
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Live Actions:</span>
                <button 
                  onClick={() => setInput("Add a process P1 with 100MB")}
                  className="text-[8px] text-indigo-400 hover:text-indigo-300 font-bold uppercase transition-colors"
                >
                  Create P1
                </button>
                <button 
                  onClick={() => setInput("Step the simulation")}
                  className="text-[8px] text-indigo-400 hover:text-indigo-300 font-bold uppercase transition-colors"
                >
                  Run Step
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 group ${
          isOpen ? 'bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-500'
        }`}
      >
        {isOpen ? (
          <X className="text-white" />
        ) : (
          <div className="relative">
            <Bot className="text-white" size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-indigo-600 animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-indigo-600" />
          </div>
        )}
        <div className="absolute right-full mr-4 bottom-1/2 translate-y-1/2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-black uppercase text-white tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Kernel Copilot Active
        </div>
      </button>
    </div>
  );
};
