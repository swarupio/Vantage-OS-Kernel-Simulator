/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { getPidColor, getPidTextColor } from '../lib/utils';
import * as Tooltip from '@radix-ui/react-tooltip';

export const PCBTable = () => {
  const { processes, runningPid } = useSimulationStore();
  const activeProcesses = processes.filter(p => p.state !== 'TERMINATED');

  const headers = [
    { label: 'PID', desc: 'Process Identifier (Unique ID)' },
    { label: 'PRI', desc: 'Priority Level (Lower = More Important)' },
    { label: 'BRST', desc: 'Burst Time (Total execution time needed)' },
    { label: 'ARRV', desc: 'Arrival Time (Clock tick when created)' },
    { label: 'STAT', desc: 'Current Process State' },
  ];

  return (
    <div className="w-full border-collapse">
       <div className="grid grid-cols-5 bg-black/40 border-b border-zinc-800 py-2 px-3 sticky top-0 z-10">
          {headers.map(h => (
            <Tooltip.Provider key={h.label}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest cursor-help hover:text-zinc-400">
                    {h.label}
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content 
                    className="bg-zinc-900 text-white text-[9px] px-2 py-1 rounded border border-zinc-800 shadow-xl z-[200]" 
                    sideOffset={5}
                  >
                    {h.desc}
                    <Tooltip.Arrow className="fill-zinc-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          ))}
       </div>
       <div className="flex flex-col">
          {activeProcesses.map(p => (
            <div 
              key={p.pid} 
              className={`grid grid-cols-5 items-center py-2 px-3 border-b border-zinc-800/10 transition-colors ${runningPid === p.pid ? 'bg-indigo-500/10' : 'hover:bg-zinc-800/5'}`}
            >
              <div className="flex items-center gap-1.5">
                 <div className={`w-1 h-1 rounded-full ${getPidColor(p.pid)} ${runningPid === p.pid ? 'animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.4)]' : ''}`} />
                 <span className={`text-[10px] font-mono font-bold leading-none ${getPidTextColor(p.pid)}`}>{p.pid}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-500">{p.priority}</span>
              <span className="text-[10px] font-mono font-bold text-zinc-500">{p.burstTime}</span>
              <span className="text-[10px] font-mono font-bold text-zinc-500">{p.arrivalTime}</span>
              <div className="flex items-center">
                 <span className={`text-[8px] font-black px-1 rounded-sm uppercase tracking-tighter leading-none py-0.5 ${
                   p.state === 'RUNNING' ? 'bg-indigo-600 text-white' :
                   p.state === 'READY' ? 'bg-emerald-900/40 text-emerald-400' :
                   'bg-zinc-800 text-zinc-600'
                 }`}>
                   {p.state.slice(0, 4)}
                 </span>
              </div>
            </div>
          ))}
          {activeProcesses.length === 0 && (
            <div className="py-10 text-center text-[9px] font-black text-zinc-800 uppercase tracking-widest italic opacity-40">Dormant...</div>
          )}
       </div>
    </div>
  );
};
