/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSimulationStore } from '../store/simulationStore';
import { Cpu, Clock, CheckCircle2, PlusCircle } from 'lucide-react';
import { getPidColor } from '../lib/utils';

export const StateTransitionDiagram = () => {
  const { processes, runId } = useSimulationStore();
  
  const getProcessesInState = (state: string) => 
    processes.filter(p => p.state === state);

  const states = [
    { id: 'NEW', icon: <PlusCircle size={10} />, label: 'NEW', color: 'text-zinc-500' },
    { id: 'READY', icon: <Clock size={10} />, label: 'READY', color: 'text-amber-500' },
    { id: 'RUNNING', icon: <Cpu size={10} />, label: 'RUNNING', color: 'text-indigo-500' },
    { id: 'WAITING', icon: <Clock size={10} />, label: 'WAIT', color: 'text-rose-500' },
    { id: 'TERMINATED', icon: <CheckCircle2 size={10} />, label: 'EXIT', color: 'text-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-5 gap-1 p-1.5 bg-black/40 border border-zinc-800/50 rounded-xl">
      {states.map((state) => {
        const stageProcesses = getProcessesInState(state.id);
        const hasProcesses = stageProcesses.length > 0;

        return (
          <div key={state.id} className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-zinc-900/30 border border-white/5 relative overflow-hidden group min-h-[48px] 2xl:min-h-[5rem] 2xl:p-3">
            <div className={`flex items-center gap-1 font-black text-[7px] 2xl:text-[9px] uppercase tracking-widest ${state.color} z-10`}>
                {state.icon}
                {state.label}
            </div>
            
            <div className="relative z-10 w-full flex flex-wrap justify-center gap-1 mt-0.5">
               <AnimatePresence mode="popLayout">
                 {stageProcesses.map((p) => (
                   <motion.div
                     key={`${runId}-${p.pid}`}
                     layoutId={`badge-${runId}-${p.pid}`}
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0.8, opacity: 0 }}
                     className={`px-1.5 py-0.5 rounded text-[8px] font-black text-slate-950 shadow-sm ${getPidColor(p.pid)} border border-black/10`}
                   >
                     {p.pid.replace('Process-', '')}
                   </motion.div>
                 ))}
               </AnimatePresence>
               
               {!hasProcesses && (
                 <span className="text-[10px] font-black text-zinc-800 opacity-20">0</span>
               )}
            </div>

            {hasProcesses && (
              <motion.div 
                layoutId={`active-bg-${state.id}`}
                className="absolute -inset-1 border border-indigo-500/20 rounded-lg animate-pulse" 
              />
            )}
            
            {hasProcesses && (
              <div className={`absolute inset-0 opacity-5 bg-gradient-to-br from-transparent to-current ${state.color.replace('text-', 'bg-')}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};
