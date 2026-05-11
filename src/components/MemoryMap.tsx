/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Database } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export const MemoryMap = () => {
  const { memoryManager, memoryStrategy, runningPid, demoOverlay } = useSimulationStore();
  const map = memoryManager.getMap();
  const stats = memoryManager.getStats();

  const isMemoryDemoActive = !!demoOverlay && (demoOverlay.title.includes('Fit') || demoOverlay.title.includes('Memory') || demoOverlay.title.includes('Demanding'));

  return (
    <div className={`flex flex-col relative w-full transition-all duration-700 ${isMemoryDemoActive ? 'ring-2 ring-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] z-[400]' : ''}`}>
        <div className="p-4 border-b border-slate-800 bg-[#0f172a] flex flex-col gap-1 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
               <Database size={14} className="text-amber-500" /> Physical Page Map (MMU)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                STRAT: {memoryStrategy.replace('_', ' ')}
              </span>
              <span className="text-[8px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Frag: {stats.fragmentation}%
              </span>
              <span className="text-[8px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Faults: {stats.pageFaults}
              </span>
            </div>
          </div>
          <span className="text-[8px] text-slate-500 font-medium leading-tight">
            Physical RAM segments (Frames). When a process is active, its memory pages are mapped to these physical addresses. Highlighted blocks show active execution memory.
          </span>
        </div>
       
        <div className="p-3 grid grid-cols-4 gap-1.5 bg-slate-950/20 font-mono transition-all duration-500">
          {map.map((p, idx) => {
            const isOwnedByRunning = runningPid === p.owner;
            const isDemoHighlight = isMemoryDemoActive && p.owner === 'P007';
            return (
              <div 
                key={p.id}
                className={`rounded border transition-all duration-500 flex flex-col items-center justify-center p-1 relative ${
                  map.length > 8 ? 'h-10' : 'aspect-square'
                } ${
                  p.free ? 'bg-slate-900/40 border-slate-800' : 
                  isDemoHighlight ? 'bg-fuchsia-500 border-fuchsia-400 shadow-[0_0_25px_rgba(217,70,239,0.8)] z-20 animate-pulse' :
                  isOwnedByRunning ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10' :
                  'bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                }`}
              >
                <span className={`text-[6px] font-black absolute top-1 left-1 px-1 py-0.5 rounded-sm ${isDemoHighlight ? 'text-fuchsia-100 bg-fuchsia-900/40' : isOwnedByRunning ? 'text-indigo-100 bg-indigo-900/40' : 'text-slate-500 bg-slate-900/50'}`}>
                  0x{idx.toString(16).toUpperCase().padStart(2, '0')}
                </span>
                {!p.free && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute bottom-1 right-1 text-[6.5px] font-black px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${
                      isDemoHighlight
                      ? 'bg-white/30 text-white shadow-sm'
                      : isOwnedByRunning 
                      ? 'bg-white/20 text-white shadow-sm' 
                      : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                    }`}
                  >
                    <span className="opacity-70">PID</span>
                    <span>{p.owner}</span>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
    </div>
  );
};
