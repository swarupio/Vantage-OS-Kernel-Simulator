/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Database } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export const MemoryMap = () => {
  const { memoryManager, runningPid } = useSimulationStore();
  const map = memoryManager.getMap();
  const stats = memoryManager.getStats();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
               <Database size={14} className="text-amber-500" /> Physical Page Map (MMU)
            </span>
            <div className="flex items-center gap-2">
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
       
        <div className="flex-1 p-4 grid grid-cols-5 gap-2 overflow-y-auto custom-scrollbar bg-slate-950/20 font-mono">
          {map.map((p, idx) => {
            const isOwnedByRunning = runningPid === p.owner;
            return (
              <div 
                key={p.id}
                className={`aspect-square rounded-lg border transition-all duration-500 flex flex-col items-center justify-center p-1 relative ${
                  p.free ? 'bg-slate-900/40 border-slate-800' : 
                  isOwnedByRunning ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10' :
                  'bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                }`}
              >
                <span className={`text-[7px] font-black absolute top-1 left-1 ${isOwnedByRunning ? 'text-white/50' : 'text-slate-600'}`}>0x{idx.toString(16).toUpperCase().padStart(2, '0')}</span>
                {!p.free && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`text-[9px] font-black truncate w-full text-center ${isOwnedByRunning ? 'text-white' : 'text-emerald-400'}`}
                  >
                    {p.owner}
                  </motion.span>
                )}
              </div>
            );
          })}
        </div>
    </div>
  );
};
