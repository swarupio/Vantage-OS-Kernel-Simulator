/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSimulationStore } from '../store/simulationStore';
import { getPidColor } from '../lib/utils';
import { ArrowRight } from 'lucide-react';

export const ReadyQueueFlow = () => {
  const { readyQueue, runningPid, isSwitching, nextContextPid } = useSimulationStore();
  
  return (
    <div className="flex items-center gap-1 h-12 px-2 bg-black/40 rounded-xl border border-zinc-800/50 overflow-hidden relative">
      <div className="absolute left-2 top-1 text-[7px] font-black text-zinc-600 uppercase tracking-widest pointer-events-none">READY QUEUE</div>
      
      <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
        <AnimatePresence mode="popLayout">
          {readyQueue.map((pid, idx) => (
            <motion.div
              key={`${pid}-${idx}`}
              layout
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className={`min-w-[40px] h-6 rounded flex items-center justify-center text-[9px] font-bold border border-white/10 ${getPidColor(pid)} text-white shadow-sm`}
            >
              {pid}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {readyQueue.length === 0 && (
          <span className="text-[8px] text-zinc-700 italic ml-2">Queue Empty</span>
        )}
      </div>

      <div className="w-8 flex items-center justify-center">
        <ArrowRight size={14} className="text-zinc-700" />
      </div>

      <div className="w-20 h-8 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-indigo-500/5 border border-indigo-500/20 rounded-lg" />
        <AnimatePresence mode="wait">
          {runningPid ? (
            <motion.div
              key={runningPid}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-14 h-6 rounded flex items-center justify-center text-[9px] font-black ${getPidColor(runningPid)} text-white shadow-lg shadow-indigo-500/20 z-10 border border-white/20`}
            >
              RUNNING
            </motion.div>
          ) : isSwitching ? (
            <motion.div
              key="switching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="text-[7px] font-black text-amber-500 uppercase leading-none mb-1 text-center">SWITCHING</div>
              {nextContextPid && (
                <div className={`w-8 h-2 rounded-full ${getPidColor(nextContextPid)}/50 animate-pulse`} />
              )}
            </motion.div>
          ) : (
            <span  key="idle" className="text-[9px] font-black text-zinc-700">IDLE</span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
