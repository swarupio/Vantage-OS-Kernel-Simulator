/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, Activity, Play, HelpCircle, FastForward } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import { getPidTextColor, getPidBorderColor } from '../lib/utils';

import * as Tooltip from '@radix-ui/react-tooltip';

interface HeaderProps {
  isAuto: boolean;
  setIsAuto: (v: boolean) => void;
  speed: number;
  setSpeed: (v: number) => void;
  showGuide: boolean;
  setShowGuide: (v: boolean) => void;
}

export const Header = ({ isAuto, setIsAuto, speed, setSpeed, showGuide, setShowGuide }: HeaderProps) => {
  const { clock, runningPid, algorithm, setAlgorithm, quantum, setQuantum, step, reset, loadDemo } = useSimulationStore();
  
  const speeds = [1, 2, 4, 8];
  const cycleSpeed = () => {
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
  };

  return (
    <header className="h-12 bg-[#0c0c0e] border-b border-zinc-800/80 px-4 flex items-center justify-between shadow-lg sticky top-0 z-[100] backdrop-blur-md">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <Cpu size={14} className="text-white" />
           </div>
           <h1 className="font-black text-xs tracking-tight text-white uppercase italic">Vantage <span className="text-indigo-400 font-extrabold">Kernel</span></h1>
        </div>

        <div className="h-6 w-px bg-zinc-800/50" />

        <div className="flex items-center gap-4">
          <div className="flex gap-px bg-zinc-900 p-0.5 rounded-lg border border-zinc-800/50 h-7 flex-shrink-0">
            {(['RR', 'PRIORITY', 'SJF'] as const).map(algo => (
              <Tooltip.Root key={algo}>
                <Tooltip.Trigger asChild>
                  <button 
                    onClick={() => setAlgorithm(algo)}
                    className={`px-3 flex items-center h-full rounded text-[9px] font-bold transition-all ${algorithm === algo ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {algo}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-zinc-900 text-white text-[10px] px-3 py-2 rounded-lg border border-zinc-800 shadow-2xl z-[200] max-w-xs" sideOffset={5}>
                    {algo === 'RR' && "Round Robin: Time-sliced fair scheduling."}
                    {algo === 'PRIORITY' && "Priority Scheduling: Execute highest priority tasks first."}
                    {algo === 'SJF' && "Shortest Job First: Minimize wait time by picking shortest tasks."}
                    <Tooltip.Arrow className="fill-zinc-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            ))}
          </div>

          {algorithm === 'RR' && (
            <div className="flex items-center gap-3 bg-zinc-900/50 px-3 h-7 rounded-lg border border-zinc-800/50">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Quantum: <span className="text-indigo-400">{quantum}ms</span></span>
              <input 
                type="range" min="1" max="20" step="1" 
                value={quantum} 
                onChange={(e) => setQuantum(parseInt(e.target.value))}
                className="w-20 accent-indigo-500 cursor-pointer h-1"
              />
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-zinc-800/50" />

        <div className="flex items-center gap-1.5 h-8">
           <Tooltip.Root>
             <Tooltip.Trigger asChild>
               <div className="flex bg-zinc-900/50 p-0.5 rounded-lg border border-zinc-800/50 gap-0.5 h-full items-stretch">
                 <button 
                   onClick={() => setIsAuto(!isAuto)}
                   className={`flex items-center gap-2 px-3 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${isAuto ? 'bg-rose-600 text-white shadow-lg' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20'}`}
                 >
                   {isAuto ? <Activity size={12} /> : <Play size={12} />}
                   {isAuto ? 'Stop' : 'Run'}
                 </button>
                 
                 <button 
                  onClick={cycleSpeed}
                  className={`flex items-center gap-1.5 px-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${speed > 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                 >
                   <FastForward size={12} />
                   {speed}x
                 </button>
               </div>
             </Tooltip.Trigger>
             <Tooltip.Portal>
               <Tooltip.Content className="bg-zinc-900 text-white text-[10px] px-3 py-2 rounded-lg border border-zinc-800 shadow-2xl z-[200]" sideOffset={5}>
                 Simulation Controls: Run/Stop and adjust playback speed
                 <Tooltip.Arrow className="fill-zinc-800" />
               </Tooltip.Content>
             </Tooltip.Portal>
           </Tooltip.Root>

           <Tooltip.Root>
             <Tooltip.Trigger asChild>
               <button 
                 onClick={() => step()}
                 className="h-full px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center leading-none text-center"
               >
                 Execute Next Clock Cycle
               </button>
             </Tooltip.Trigger>
             <Tooltip.Portal>
               <Tooltip.Content className="bg-zinc-900 text-white text-[10px] px-3 py-2 rounded-lg border border-zinc-800 shadow-2xl z-[200]" sideOffset={5}>
                 Advance simulation by 1ms
                 <Tooltip.Arrow className="fill-zinc-800" />
               </Tooltip.Content>
             </Tooltip.Portal>
           </Tooltip.Root>

           <Tooltip.Root>
             <Tooltip.Trigger asChild>
               <button 
                 onClick={() => { setIsAuto(false); reset(); }}
                 className="h-full px-3 border border-zinc-800 hover:bg-zinc-800 text-zinc-500 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center leading-none text-center"
               >
                 Clear Cache
               </button>
             </Tooltip.Trigger>
             <Tooltip.Portal>
               <Tooltip.Content className="bg-zinc-900 text-white text-[10px] px-3 py-2 rounded-lg border border-zinc-800 shadow-2xl z-[200]" sideOffset={5}>
                 Wipe all processes and reset clock
                 <Tooltip.Arrow className="fill-zinc-800" />
               </Tooltip.Content>
             </Tooltip.Portal>
           </Tooltip.Root>

           <Tooltip.Root>
             <Tooltip.Trigger asChild>
               <button 
                 onClick={() => loadDemo()}
                 className="h-full px-3 text-amber-500 border border-amber-500/20 hover:bg-amber-500/10 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center leading-none text-center"
               >
                 Load Demo
               </button>
             </Tooltip.Trigger>
             <Tooltip.Portal>
               <Tooltip.Content className="bg-zinc-900 text-white text-[10px] px-3 py-2 rounded-lg border border-zinc-800 shadow-2xl z-[200]" sideOffset={5}>
                 Populate environment with test cases
                 <Tooltip.Arrow className="fill-zinc-800" />
               </Tooltip.Content>
             </Tooltip.Portal>
           </Tooltip.Root>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className={`flex items-center gap-2 px-3 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showGuide ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300 border border-zinc-800'}`}
        >
          <HelpCircle size={14} />
          Knowledge Base
        </button>

        <div className="h-6 w-px bg-zinc-800/50" />
        <div className="flex flex-col items-end h-8 justify-center">
           <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-0.5">System Clock</span>
           <span className="text-[10px] font-mono font-bold text-indigo-400">{clock.toString().padStart(6, '0')}ms</span>
        </div>

        <div className="h-6 w-px bg-zinc-800/50" />

        <div className="flex items-center gap-3">
           <span className={`inline-flex items-center px-3 h-8 rounded border text-[9px] font-black uppercase tracking-widest transition-all ${
             runningPid ? `bg-zinc-950 ${getPidTextColor(runningPid)} ${getPidBorderColor(runningPid)} shadow-[0_0_10px_rgba(0,0,0,0.5)]` : 'bg-zinc-900 border-zinc-800 text-zinc-600'
           }`}>
             {runningPid ? `CPU: ${runningPid}` : 'CPU: IDLE'}
           </span>
        </div>
      </div>
    </header>
  );
};
