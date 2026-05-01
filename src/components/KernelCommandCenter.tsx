/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, Play, ChevronRight, RotateCcw, Workflow } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export const KernelCommandCenter = ({ isAuto, setIsAuto }: { isAuto: boolean, setIsAuto: (v: boolean) => void }) => {
  const { step, reset, loadBalancedDemo, algorithm, setAlgorithm, memoryStrategy, setMemoryStrategy } = useSimulationStore();
  
  return (
    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kernel Command Center</span>
        <Activity size={14} className={isAuto ? 'text-rose-500 animate-pulse' : 'text-slate-700'} />
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">CPU Scheduler</span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-lg">
            {(['RR', 'PRIORITY', 'SJF'] as const).map(algo => (
              <button 
                key={algo}
                onClick={() => setAlgorithm(algo)}
                className={`py-1.5 rounded text-[9px] font-black transition-all ${algorithm === algo ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-300'}`}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Memory Allocation</span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-lg">
            {(['FIRST_FIT', 'BEST_FIT', 'MOST_FIT'] as const).map(strat => (
              <button 
                key={strat}
                onClick={() => setMemoryStrategy(strat)}
                className={`py-1.5 rounded text-[9px] font-black transition-all ${memoryStrategy === strat ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-300'}`}
              >
                {strat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
           <button 
             onClick={() => setIsAuto(!isAuto)}
             className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isAuto ? 'bg-rose-600 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
           >
             <span className="flex items-center gap-2">
               {isAuto ? <Activity size={16} /> : <Play size={16} />} 
               {isAuto ? 'Stop Simulation' : 'Run Simulation'}
             </span>
             <span className="text-[8px] opacity-60">AUTO</span>
           </button>

           <div className="grid grid-cols-2 gap-2">
             <button 
               onClick={() => step()}
               className="flex items-center gap-2 justify-center px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[9px] font-black uppercase transition-all"
             >
               <ChevronRight size={14} /> Step Cycle
             </button>
             <button 
               onClick={() => { setIsAuto(false); reset(); }}
               className="flex items-center gap-2 justify-center px-3 py-2 border border-slate-800 hover:bg-slate-800 text-slate-500 rounded-xl text-[9px] font-black uppercase transition-all"
             >
               <RotateCcw size={14} /> Clear Cache
             </button>
           </div>

           <button 
             onClick={() => loadBalancedDemo()}
             className="flex items-center gap-2 justify-center py-2 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border border-amber-600/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
           >
             <Workflow size={14} /> Load Reference Env
           </button>
        </div>
      </div>
    </section>
  );
};
