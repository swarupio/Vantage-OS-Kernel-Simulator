/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';

import * as Tooltip from '@radix-ui/react-tooltip';

export const ProcessForm = () => {
  const { addProcess, processes } = useSimulationStore();
  const [formData, setFormData] = useState({
    name: 'Process-Alpha',
    priority: 5,
    burstTime: 10,
    memRequired: 32,
    arrivalTime: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pid = `P${(processes.length + 1).toString().padStart(3, '0')}`;
    addProcess(pid, formData.name, formData.priority, formData.burstTime, formData.memRequired, formData.arrivalTime);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Kernel Dispatcher</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className="text-[8px] font-black text-zinc-600 uppercase mb-1 block">Process ID/Name</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[10px] text-zinc-200 outline-none focus:border-indigo-500 transition-all font-mono font-bold"
          />
        </div>
        <div className="space-y-1">
           <Tooltip.Root>
             <Tooltip.Trigger asChild>
               <div className="space-y-1">
                 <label className="text-[8px] font-black text-zinc-600 uppercase">Priority</label>
                 <input 
                   type="number" min="1" max="10"
                   value={formData.priority}
                   onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}
                   className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-[10px] text-indigo-400 outline-none focus:border-indigo-500 font-mono font-bold"
                 />
               </div>
             </Tooltip.Trigger>
             <Tooltip.Portal>
               <Tooltip.Content className="bg-zinc-900 border border-zinc-800 p-2 text-[9px] text-zinc-300 rounded shadow-xl" side="left">
                 Lower number = Higher Priority (1-10)
                 <Tooltip.Arrow className="fill-zinc-800" />
               </Tooltip.Content>
             </Tooltip.Portal>
           </Tooltip.Root>
        </div>
        <div className="space-y-1">
           <Tooltip.Root>
             <Tooltip.Trigger asChild>
               <div className="space-y-1">
                 <label className="text-[8px] font-black text-zinc-600 uppercase">Burst (ms)</label>
                 <input 
                   type="number" min="1"
                   value={formData.burstTime}
                   onChange={e => setFormData({...formData, burstTime: parseInt(e.target.value)})}
                   className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-[10px] text-emerald-400 outline-none focus:border-emerald-500 font-mono font-bold"
                 />
               </div>
             </Tooltip.Trigger>
             <Tooltip.Portal>
               <Tooltip.Content className="bg-zinc-900 border border-zinc-800 p-2 text-[9px] text-zinc-300 rounded shadow-xl" side="right">
                 Total CPU execution time needed
                 <Tooltip.Arrow className="fill-zinc-800" />
               </Tooltip.Content>
             </Tooltip.Portal>
           </Tooltip.Root>
        </div>
      </div>
      
      <button 
        type="submit"
        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-950/20"
      >
        Execute Local Dispatch
      </button>
    </form>
  );
};
