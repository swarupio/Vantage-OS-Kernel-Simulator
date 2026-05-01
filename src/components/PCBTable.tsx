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
  // Filter for active processes only
  const activeProcesses = processes.filter(p => p.state !== 'TERMINATED');
  const displayProcesses = [...activeProcesses].reverse(); // Show newest at top

  const headers = [
    { label: 'PID', desc: 'Process Identifier (Unique ID)' },
    { label: 'PRI', desc: 'Priority Level (Lower = More Important)' },
    { label: 'BRST', desc: 'Burst Time (Total execution time needed)' },
    { label: 'ARRV', desc: 'Arrival Time (Clock tick when created)' },
    { label: 'MEM', desc: 'Memory Required (MB)' },
    { label: 'STAT', desc: 'Current Process State' },
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
       <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_1fr_1.5fr] bg-[#0c0c0e] border-b border-zinc-900 py-1.5 px-3 flex-none shrink-0 sticky top-0 z-10 w-full relative">
          {headers.map(h => (
            <Tooltip.Provider key={h.label}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest cursor-help hover:text-zinc-400 truncate">
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
        <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar pb-10 relative bg-zinc-950/20">
          {displayProcesses.map(p => (
            <div 
              key={p.pid} 
              className={`grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_1fr_1.5fr] items-center py-2.5 px-3 border-b border-zinc-800/10 transition-all ${
                runningPid === p.pid ? 'bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30' : 'hover:bg-zinc-800/5'
              }`}
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                 <div className={`w-1 h-1 rounded-full shrink-0 ${getPidColor(p.pid)} ${runningPid === p.pid ? 'animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.4)]' : ''}`} />
                 <span className={`text-[10px] font-mono font-bold leading-none ${getPidTextColor(p.pid)} truncate`} title={p.pid}>{p.pid}</span>
                 {p.isIOBound && p.state !== 'TERMINATED' && (
                   <Tooltip.Root>
                     <Tooltip.Trigger asChild>
                       <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 animate-pulse cursor-help shrink-0" />
                     </Tooltip.Trigger>
                     <Tooltip.Portal>
                       <Tooltip.Content className="bg-zinc-900 text-white text-[8px] px-2 py-1 rounded border border-zinc-800 shadow-xl z-[250]" side="right">
                         AUTO I/O ENABLED
                       </Tooltip.Content>
                     </Tooltip.Portal>
                   </Tooltip.Root>
                 )}
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-500">{p.priority}</span>
              <span className="text-[10px] font-mono font-bold text-zinc-500">{p.burstTime}</span>
              <span className="text-[10px] font-mono font-bold text-zinc-500">{p.arrivalTime}</span>
              <span className="text-[10px] font-mono font-bold text-zinc-500">{p.memRequired}M</span>
              <div className="flex items-center gap-1.5 justify-end">
                 <span className={`text-[8px] font-black px-1.5 rounded-sm uppercase tracking-tighter leading-none py-0.5 ${
                    p.state === 'RUNNING' ? 'bg-indigo-600 text-white shadow-[0_0_8px_rgba(99,102,241,0.4)]' :
                    p.state === 'READY' ? 'bg-emerald-900/40 text-emerald-400' :
                    p.state === 'WAITING' ? 'bg-amber-900/40 text-amber-500' :
                    'bg-zinc-800 text-zinc-600'
                  }`}>
                    {p.state === 'WAITING' ? 'WAIT' : p.state === 'RUNNING' ? 'RUN' : p.state}
                  </span>
                  {p.state !== 'TERMINATED' && (
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button 
                          disabled={p.state !== 'RUNNING'}
                          onClick={() => useSimulationStore.getState().triggerIO(p.pid)}
                          className={`text-[8px] font-black px-2 py-0.5 rounded uppercase leading-none transition-all ${
                            p.state === 'RUNNING' 
                            ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 cursor-pointer shadow-lg shadow-amber-950/40 active:scale-90 opacity-100' 
                            : 'bg-zinc-900 text-zinc-700 cursor-not-allowed opacity-30 shadow-none'
                          }`}
                        >
                          I/O
                        </button>
                      </Tooltip.Trigger>
                     <Tooltip.Portal>
                       <Tooltip.Content 
                         className="bg-zinc-900 text-white text-[9px] px-2 py-1 rounded border border-zinc-800 shadow-xl z-[200] max-w-[120px]" 
                         sideOffset={5}
                       >
                         {p.state === 'RUNNING' 
                           ? 'Force I/O Wait (Interrupt)' 
                           : 'Only running processes can initiate I/O'}
                         <Tooltip.Arrow className="fill-zinc-800" />
                       </Tooltip.Content>
                     </Tooltip.Portal>
                   </Tooltip.Root>
                 )}
              </div>
            </div>
          ))}
          {displayProcesses.length === 0 && (
            <div className="py-10 text-center text-[9px] font-black text-zinc-800 uppercase tracking-widest italic opacity-40">Dormant...</div>
          )}
       </div>
    </div>
  );
};
