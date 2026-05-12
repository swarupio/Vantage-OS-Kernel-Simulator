/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSimulationStore } from '../store/simulationStore';
import { Activity, Clock } from 'lucide-react';
import { getPidColor } from '../lib/utils';
import { ReadyQueueFlow } from './ReadyQueueFlow';
import { StateTransitionDiagram } from './StateTransitionDiagram';

import * as Tooltip from '@radix-ui/react-tooltip';

export const SchedulerVisualization = () => {
  const { ganttLog, clock, getSimulationStats, algorithm, runId } = useSimulationStore();
  const [zoom, setZoom] = React.useState(100); 
  const [isAutoFit, setIsAutoFit] = React.useState(true);
  
  const basePixelsPerMs = 12;
  const pixelsPerMs = (basePixelsPerMs * zoom) / 100;
  
  // Logical time window - Stabilized to avoid constant rescaling
  // We use chunks of 50ms to prevent flickering
  const stabilizedMaxTime = Math.max(150, Math.ceil((clock + 20) / 50) * 50);
  const maxDisplayTime = isAutoFit ? Math.max(100, clock + 10) : stabilizedMaxTime;
  
  // Visual width
  const chartWidth = isAutoFit ? '100%' : `${stabilizedMaxTime * pixelsPerMs}px`;
  
  const stats = getSimulationStats();

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to follow clock if not in auto-fit
  React.useEffect(() => {
    if (scrollContainerRef.current && !isAutoFit) {
      const container = scrollContainerRef.current;
      const targetScroll = (clock * pixelsPerMs) - (container.clientWidth / 2);
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
    }
  }, [clock, isAutoFit, pixelsPerMs]);
  
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0c0c0e]">
       <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <Activity size={18} className="text-indigo-500" />
             <div className="flex flex-col">
               <span className="text-sm font-black text-zinc-100 uppercase tracking-tight">Kernel Dispatcher Trace</span>
               <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest leading-none mt-1">CPU Execution Gantt Chart</span>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-lg border border-zinc-800">
                <button 
                  onClick={() => setIsAutoFit(!isAutoFit)}
                  className={`px-2 py-1 rounded text-[9px] font-black uppercase transition-all ${isAutoFit ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                >
                  {isAutoFit ? 'Fill View' : 'Auto-Fit'}
                </button>
                <div className="h-4 w-px bg-zinc-800" />
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Zoom</span>
                <input 
                  type="range" min="10" max="200" step="10" 
                  disabled={isAutoFit}
                  value={zoom} 
                  onChange={(e) => setZoom(parseInt(e.target.value))}
                  className={`w-24 h-1 accent-indigo-500 cursor-pointer ${isAutoFit ? 'opacity-30' : ''}`}
                />
             </div>

             <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-zinc-800">
                <Clock size={12} className="text-indigo-400" />
                <span className="text-[10px] font-mono font-bold text-indigo-400">{clock}ms</span>
             </div>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col custom-scrollbar">
          <div className="p-4 flex flex-col gap-2 shrink-0">
             <StateTransitionDiagram />
             <ReadyQueueFlow />
          </div>

          <div className="px-4 flex flex-col mt-2 shrink-0">
            <div 
              ref={scrollContainerRef}
              className="w-full px-2 pt-4 pb-2 rounded-xl border border-zinc-800/50 relative overflow-x-auto overflow-y-hidden custom-scrollbar bg-black/20"
            >
            <div 
              className="relative h-12 bg-zinc-900/30 border border-zinc-800/50 rounded-xl transition-all duration-300 mt-2 shrink-0"
              style={{ width: chartWidth, minWidth: '100%', marginBottom: '36px' }}
            >
             {/* Background Grid - Fixed intervals of 10ms */}
             <div className="absolute inset-0 pointer-events-none">
               {Array.from({ length: Math.ceil(maxDisplayTime / 10) + 1 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute top-0 bottom-0 border-r border-zinc-800/20" 
                    style={{ left: `${(i * 10 / maxDisplayTime) * 100}%` }}
                  />
                ))}
             </div>

             <AnimatePresence mode="popLayout">
               {ganttLog.map((entry, idx) => {
                 const widthPercent = (entry.duration / maxDisplayTime) * 100;
                 const leftPercent = (entry.startTime / maxDisplayTime) * 100;
                 
                 return (
                   <motion.div
                     key={`${runId}-${entry.pid}-${entry.startTime}`}
                     initial={{ opacity: 0, scaleX: 0 }}
                     animate={{ width: `${widthPercent}%`, opacity: 1, scaleX: 1 }}
                     exit={{ opacity: 0 }}
                     className={`absolute h-full border-r border-[#0c0c0e]/50 flex flex-col items-center justify-center ${getPidColor(entry.pid)} group/item transition-colors cursor-help overflow-hidden origin-left`}
                     style={{
                       left: `${leftPercent}%`,
                     }}
                   >
                      <div className="opacity-0 group-hover/item:opacity-100 absolute -top-12 bg-zinc-900 text-white text-[9px] px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none z-[60] transition-all font-bold uppercase tracking-widest border border-zinc-700 flex flex-col gap-0.5">
                        <span className="text-indigo-400">{entry.pid === 'SWITCHING' ? 'Context Switch' : entry.pid}</span>
                        <span className="text-[8px] text-zinc-400">{entry.startTime}ms → {entry.startTime + entry.duration}ms ({entry.duration}ms)</span>
                      </div>
                      
                      {/* Show Label */}
                      {widthPercent > 0.5 && (
                        <span className="text-[10px] font-black text-zinc-950 font-mono select-none pointer-events-none leading-none z-10 truncate px-0.5" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}>
                          {widthPercent > 10 ? (entry.pid === 'SWITCHING' ? 'SWITCH' : entry.pid) : 
                           (widthPercent > 4 ? (entry.pid === 'SWITCHING' ? 'S' : entry.pid.replace('Process-', 'P').replace('P00', 'P')) : 
                            (entry.pid === 'SWITCHING' ? '' : entry.pid.replace(/[^0-9]/g, '')))}
                        </span>
                      )}

                      {entry.pid === 'SWITCHING' && (
                        <div className="absolute inset-0 bg-zinc-950/20 flex items-center justify-center">
                           <div className="w-1 h-full bg-white/5 animate-pulse" />
                        </div>
                      )}
                   </motion.div>
                 );
               })}
             </AnimatePresence>
             
              {/* Timeline markers */}
              <div className="absolute -bottom-8 left-0 right-0 h-8">
                {/* Always show 0ms */}
                <div 
                   className="absolute flex flex-col items-center"
                   style={{ left: '0%' }}
                >
                  <div className="w-px h-2 bg-zinc-400" />
                  <span className="text-[8px] font-mono text-zinc-500 font-bold mt-0.5">0ms</span>
                </div>

                {/* Transition markers - Show both start and end times clearly */}
                {ganttLog.map((entry, i) => {
                  const startTime = entry.startTime;
                  const endTime = entry.startTime + entry.duration;
                  const leftStart = (startTime / maxDisplayTime) * 100;
                  const leftEnd = (endTime / maxDisplayTime) * 100;
                  const widthPercent = (entry.duration / maxDisplayTime) * 100;
                  const isLast = i === ganttLog.length - 1;

                  return (
                    <React.Fragment key={`${runId}-${entry.pid}-${entry.startTime}-ts`}>
                      {/* Start tick for short blocks or start of the sequence */}
                      {i > 0 && widthPercent > 1 && (
                         <div 
                           className="absolute flex flex-col items-center pointer-events-none opacity-40"
                           style={{ left: `${leftStart}%` }}
                         >
                           <div className="w-px h-1 bg-zinc-600" />
                           <span className="text-[7px] font-mono text-zinc-500">{startTime}</span>
                         </div>
                      )}

                      {/* End Time Marker - Main Transition Point */}
                      <div 
                        className="absolute flex flex-col items-center transition-all duration-300 pointer-events-none"
                        style={{ left: `${leftEnd}%` }}
                      >
                        <div className={`w-px ${isLast ? 'h-3 bg-indigo-500' : 'h-1.5 bg-zinc-600/60'}`} />
                        <span className={`text-[8px] font-mono font-black mt-0.5 drop-shadow-md ${isLast ? 'text-indigo-400 scale-110' : 'text-zinc-400'}`}>
                          {endTime}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

             {/* Current clock indicator */}
             <motion.div 
               className="absolute top-0 bottom-0 w-[1.5px] bg-rose-500 z-10" 
               animate={{ left: `${(clock / maxDisplayTime) * 100}%` }}
               transition={{ type: 'spring', stiffness: 100, damping: 20 }}
             >
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[2px] w-2.5 h-2.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/50 border-[1.5px] border-white" />
             </motion.div>
          </div>
        </div>
       </div>

       <div className="px-4 py-6 grid grid-cols-2 lg:grid-cols-4 w-full gap-4 shrink-0">
          <StatBox 
            label="Avg Waiting Time" 
            value={`${stats.avgWaitTime.toFixed(1)}ms`} 
            color="text-amber-500" 
            desc="Average time processes spend in READY state before execution."
          />
          <StatBox 
            label="Avg Turnaround" 
            value={`${stats.avgTurnaroundTime.toFixed(1)}ms`} 
            color="text-indigo-500" 
            desc="Average time from arrival to completion (TAT = Exit - Arrival)."
          />
          <StatBox 
            label="CPU Utilization" 
            value={`${stats.cpuUtilization.toFixed(0)}%`} 
            color="text-emerald-500" 
            desc="Percentage of time the CPU was busy executing processes."
          />
          <StatBox 
            label="Throughput" 
            value={`${stats.throughput.toFixed(2)}/s`} 
            color="text-rose-500" 
            desc="Number of processes completed per unit of time (scaled to seconds)."
          />
       </div>

       <div className="flex-1 bg-transparent shrink-0 min-h-8"></div>
       </div>
    </div>
  );
};

const StatBox = ({ label, value, color, desc }: { label: string, value: string, color: string, desc: string }) => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:border-slate-700 cursor-help h-full min-h-[80px]">
          <div className="min-h-[24px] flex items-start">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">{label}</span>
          </div>
          <span className={`text-xl font-black font-mono tracking-tighter ${color} leading-none mt-2`}>{value}</span>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="bg-zinc-900 text-white text-[10px] px-3 py-2 rounded-lg border border-zinc-800 shadow-2xl max-w-[200px]" sideOffset={5}>
          {desc}
          <Tooltip.Arrow className="fill-zinc-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);
