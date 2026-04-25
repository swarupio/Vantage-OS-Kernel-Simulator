/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, X } from 'lucide-react';
import { PCB } from '../types/simulation.types';
import * as Tooltip from '@radix-ui/react-tooltip';

export const HistoryModal = ({ processes, onClose }: { processes: PCB[], onClose: () => void }) => {
  const terminated = processes.filter(p => p.state === 'TERMINATED');
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#0c0c0e] border border-zinc-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <RotateCcw className="text-indigo-500" />
            <h2 className="text-xl font-bold text-white italic font-black uppercase tracking-tighter">System Execution History</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors group">
            <X size={24} className="text-zinc-500 group-hover:text-rose-500 transition-colors" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar bg-black/10">
           <table className="w-full text-left">
             <thead>
               <tr className="text-[10px] uppercase font-black text-zinc-600 border-b border-zinc-800/50">
                 <th className="pb-4 tracking-widest leading-none">PID</th>
                 <th className="pb-4 tracking-widest leading-none">Process Identifier</th>
                 <th className="pb-4 tracking-widest leading-none">Turnaround (TAT)</th>
                 <th className="pb-4 tracking-widest leading-none">Waiting Time (WT)</th>
                 <th className="pb-4 tracking-widest leading-none">Exit Time</th>
               </tr>
             </thead>
             <tbody className="text-sm font-medium">
               {terminated.map(p => {
                  const tat = (p.endTime || 0) - p.arrivalTime;
                  const wt = tat - p.burstTime;
                  return (
                    <tr key={p.pid} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-4 font-mono font-bold text-indigo-400">{p.pid}</td>
                      <td className="py-4 text-zinc-300 font-bold">{p.name}</td>
                      <td className="py-4 text-emerald-400 font-mono tracking-tighter">
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger>{tat}ms</Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content className="bg-zinc-900 text-white text-[10px] px-3 py-2 rounded border border-zinc-800 shadow-xl">
                                TAT = Exit Time - Arrival Time
                                <Tooltip.Arrow className="fill-zinc-800" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </td>
                      <td className="py-4 text-amber-400 font-mono tracking-tighter">
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger>{wt}ms</Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content className="bg-zinc-900 text-white text-[10px] px-3 py-2 rounded border border-zinc-800 shadow-xl">
                                WT = Turnaround - Burst Time
                                <Tooltip.Arrow className="fill-zinc-800" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </td>
                      <td className="py-4 text-zinc-500 font-mono tracking-tighter">{p.endTime}ms</td>
                    </tr>
                  )
               })}
               {terminated.length === 0 && (
                 <tr><td colSpan={5} className="py-20 text-center text-zinc-700 uppercase font-black text-xs tracking-[0.2em] italic opacity-50">Log Archive Empty</td></tr>
               )}
             </tbody>
           </table>
        </div>
      </motion.div>
    </motion.div>
  );
};
