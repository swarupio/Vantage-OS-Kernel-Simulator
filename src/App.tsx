/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Terminal, 
  Layers, 
  Terminal as TerminalIcon,
  HelpCircle,
  X,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as Tooltip from '@radix-ui/react-tooltip';

import { useSimulationStore } from './store/simulationStore';
import { getPidTextColor, getPidBorderColor } from './lib/utils';

// Components
import { Header } from './components/Header';
import { ProcessForm } from './components/ProcessForm';
import { PCBTable } from './components/PCBTable';
import { SchedulerVisualization } from './components/SchedulerVisualization';
import { MemoryMap } from './components/MemoryMap';
import { FileSystemPanel } from './components/FileSystemPanel';
import { TelemetryLogs } from './components/TelemetryLogs';
import { HistoryModal } from './components/HistoryModal';
import { ConceptGuide } from './components/ConceptGuide';

import { AICopilot } from './components/AICopilot';

export default function App() {
  const { 
    step, processes, logs, clearLogs, speed
  } = useSimulationStore();
  const [isAuto, setIsAuto] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isTelemetryExpanded, setIsTelemetryExpanded] = useState(false);
  const [telemetryHeight, setTelemetryHeight] = useState(176); 
  const [isResizing, setIsResizing] = useState(false);
  const telemetryRef = React.useRef<HTMLDivElement>(null);
  
  // Resizing logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !isTelemetryExpanded) return;
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 100 && newHeight < window.innerHeight * 0.7) {
        setTelemetryHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isTelemetryExpanded]);

  // Auto-scroll telemetry
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    setShouldAutoScroll(isAtBottom);
  };

  useEffect(() => {
    if (telemetryRef.current && shouldAutoScroll) {
      telemetryRef.current.scrollTop = telemetryRef.current.scrollHeight;
    }
  }, [logs.length, shouldAutoScroll]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAuto) {
      interval = setInterval(() => {
        step();
      }, 800 / speed);
    }
    return () => clearInterval(interval);
  }, [isAuto, step, speed]);

  return (
    <Tooltip.Provider delayDuration={400}>
      <div className="h-screen w-screen bg-[#0a0a0c] text-zinc-400 font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col transition-all duration-300">
        <Header isAuto={isAuto} setIsAuto={setIsAuto} showGuide={showGuide} setShowGuide={setShowGuide} />
        
        <div className="flex-1 flex overflow-hidden p-0.5 gap-px bg-zinc-800/10 relative">
          {/* Column 1: Input Zone (FixedWidth for reliability) */}
          <div className="w-80 flex-none flex flex-col gap-px bg-[#0c0c0e] border-r border-zinc-800/50 overflow-hidden">
            <div className="flex-none p-4 border-b border-zinc-800/50">
              <ProcessForm />
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                  <Layers size={12} className="text-zinc-500" /> PCB Registry
                </span>
                <button 
                  onClick={() => setShowHistory(true)}
                  className="text-[9px] font-black text-indigo-500 hover:text-indigo-400 uppercase tracking-widest transition-colors"
                >
                  View Archive
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <PCBTable />
              </div>
            </div>
          </div>

          {/* Column 2: Execution Zone (Flexible) */}
          <div className="flex-1 flex flex-col bg-[#0c0c0e] relative overflow-hidden">
             <SchedulerVisualization />
          </div>

          {/* Column 3: System State (320px) */}
          <div className="w-80 flex-none flex flex-col gap-px border-l border-zinc-800/50 bg-zinc-900/10 overflow-hidden">
             <div className="flex-1 bg-[#0c0c0e] flex flex-col overflow-hidden border-b border-zinc-800/50 shadow-inner">
                <MemoryMap />
             </div>

             <div className="flex-1 bg-[#0c0c0e] flex flex-col overflow-hidden shadow-inner custom-scrollbar overflow-y-auto">
                <FileSystemPanel />
             </div>
          </div>

          {/* Knowledge Base Sidebar */}
          <AnimatePresence>
            {showGuide && (
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-0 right-0 bottom-0 w-80 bg-[#0c0c0e] border-l border-zinc-800 z-[55] shadow-[-20px_0_40px_rgba(0,0,0,0.4)] flex flex-col"
              >
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-zinc-500">Knowledge Base</span>
                    <button onClick={() => setShowGuide(false)} className="p-1 hover:bg-zinc-800 rounded">
                      <X size={14} />
                    </button>
                  </div>
                  <ConceptGuide />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AICopilot />
        </div>

        {/* Global Bottom: Telemetry */}
        <motion.div 
          animate={{ height: isTelemetryExpanded ? `${telemetryHeight}px` : '36px' }}
          className={`bg-[#0a0a0c] border-t border-zinc-800 flex flex-col overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative transition-shadow shrink-0 ${isResizing ? 'shadow-indigo-500/20' : ''}`}
        >
           {/* Resize Handle */}
           {isTelemetryExpanded && (
             <div 
               onMouseDown={() => setIsResizing(true)}
               className="h-2 w-full absolute -top-1 inset-x-0 cursor-row-resize z-[110] group"
             >
               <div className="h-0.5 w-full bg-transparent group-hover:bg-indigo-500/40 transition-colors" />
             </div>
           )}

           <div className="px-5 h-9 border-b border-zinc-800/30 bg-black/40 flex items-center justify-between shrink-0">
              <button 
                onClick={() => setIsTelemetryExpanded(!isTelemetryExpanded)}
                className="flex items-center gap-3 text-zinc-500 hover:text-zinc-300 transition-colors group"
              >
                 <TerminalIcon size={12} className={isTelemetryExpanded ? 'text-indigo-500' : 'text-zinc-600'} />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em]">Kernel Event Log & Telemetry Pipeline</span>
                 <div className={`px-1.5 py-0.5 rounded-full text-[7px] font-bold bg-zinc-800/50 text-zinc-600 group-hover:bg-zinc-700 transition-colors`}>
                   {logs.length}
                 </div>
              </button>
              
              <div className="flex items-center gap-4">
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     clearLogs();
                   }}
                   className="text-[8px] font-black uppercase text-zinc-700 hover:text-zinc-500 transition-colors"
                 >
                    Clear Buffer
                 </button>
                 <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.6)] animate-pulse" />
                    <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-tighter">System_Online</span>
                 </div>
                 <button 
                   onClick={() => setIsTelemetryExpanded(!isTelemetryExpanded)}
                   className="p-1 hover:bg-zinc-800 rounded transition-colors"
                 >
                    <motion.div animate={{ rotate: isTelemetryExpanded ? 0 : 180 }}>
                       <ArrowDown size={14} className="text-zinc-600" />
                    </motion.div>
                 </button>
              </div>
           </div>
           
           <AnimatePresence>
             {isTelemetryExpanded && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="flex-1 flex flex-col overflow-hidden relative"
               >
                 {!shouldAutoScroll && (
                   <motion.button
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     onClick={() => {
                       setShouldAutoScroll(true);
                       if (telemetryRef.current) {
                         telemetryRef.current.scrollTop = telemetryRef.current.scrollHeight;
                       }
                     }}
                     className="absolute bottom-6 right-8 z-20 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg shadow-2xl border border-indigo-500 hover:bg-indigo-500 transition-all flex items-center gap-2"
                   >
                     <ArrowDown size={12} />
                     Jump to Latest
                   </motion.button>
                 )}

                 <div 
                   ref={telemetryRef} 
                   onScroll={handleScroll}
                   className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/10"
                 >
                    <TelemetryLogs />
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {showHistory && (
            <HistoryModal processes={processes} onClose={() => setShowHistory(false)} />
          )}
        </AnimatePresence>
      </div>
    </Tooltip.Provider>
  );
}
