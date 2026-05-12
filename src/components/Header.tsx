import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useSimulationStore } from '../store/simulationStore';
import { 
  Play, 
  Activity, 
  Cpu, 
  HelpCircle, 
  FastForward,
  ChevronDown,
  Layers,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';

interface HeaderProps {
  showGuide: boolean;
  setShowGuide: (val: boolean) => void;
  onHome?: () => void;
}

export const Header = ({ showGuide, setShowGuide, onHome }: HeaderProps) => {
  const { 
    clock, 
    algorithm, 
    setAlgorithm,
    memoryStrategy,
    setMemoryStrategy,
    quantum, 
    setQuantum, 
    step, 
    reset, 
    loadStarvationDemo, 
    loadWaitingDemo,
    loadBalancedDemo,
    loadFirstFitDemo,
    loadBestFitDemo,
    loadWorstFitDemo,
    isAutoPlay,
    setIsAutoPlay,
    playbackSpeed,
    setPlaybackSpeed,
    demoOverlay,
    setDemoOverlay
  } = useSimulationStore();
  
  const cycleSpeed = () => {
    const speeds = [1, 2, 4, 8];
    const currentIndex = speeds.indexOf(playbackSpeed);
    setPlaybackSpeed(speeds[(currentIndex + 1) % speeds.length]);
  };

  return (
    <header className="h-16 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-4 shrink-0 sticky top-0 z-50 shadow-2xl">
      <div className="flex items-center gap-4 2xl:w-full 2xl:justify-between 2xl:pr-8">
        <div className="flex items-center gap-2">
          {onHome && (
            <button 
              onClick={onHome}
              className="p-1 px-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors flex items-center justify-center mr-1"
              title="Return to Landing"
            >
              <ArrowLeft size={14} />
            </button>
          )}
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-900/20">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[10px] font-black uppercase tracking-widest text-white leading-none">Vantage Kernel Sim</h1>
          </div>
        </div>

        <div className="h-6 w-px bg-zinc-800/50" />

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-start">
            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1 ml-0.5">Scheduler</span>
            <div className="flex gap-px bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 h-8 flex-shrink-0 shadow-inner">
              {(['RR', 'PRIORITY', 'SJF'] as const).map(algo => (
                <Tooltip.Root key={algo}>
                  <Tooltip.Trigger asChild>
                    <button 
                      onClick={() => { setIsAutoPlay(false); setAlgorithm(algo); }}
                      className={`px-3 flex items-center h-full rounded text-[9px] font-black uppercase transition-all duration-200 ${
                        algorithm === algo 
                        ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/20' 
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {algo}
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="bg-zinc-900 text-white text-[10px] px-3 py-2 rounded-lg border border-zinc-800 shadow-2xl z-[200]" sideOffset={5}>
                      Switch to {algo === 'RR' ? 'RR' : algo === 'SJF' ? 'SJF' : 'Priority'}
                      <Tooltip.Arrow className="fill-zinc-800" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ))}
            </div>
          </div>

            <div className="flex flex-col items-start px-2 py-0.5 rounded border border-emerald-900/30 bg-emerald-900/10 mb-0">
              <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1 ml-0.5 whitespace-nowrap">Memory Allocator Map Strategy</span>
              <div className="flex gap-px bg-zinc-900 p-0.5 rounded-md border border-zinc-800 h-7 flex-shrink-0 shadow-inner">
                {(['FIRST_FIT', 'BEST_FIT', 'WORST_FIT'] as const).map(strat => (
                  <Tooltip.Root key={strat}>
                    <Tooltip.Trigger asChild>
                      <button 
                        onClick={() => { setMemoryStrategy(strat); }}
                        className={`px-3 flex items-center h-full rounded text-[8px] font-black uppercase transition-all duration-200 ${
                          memoryStrategy === strat 
                          ? 'bg-emerald-600 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)] border border-emerald-500/20' 
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {strat.replace('_', ' ')}
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content 
                        className="bg-[#0c0c0e] border border-emerald-900 p-2.5 text-[9px] text-zinc-400 rounded-lg shadow-2xl z-[200] max-w-[200px] text-left leading-relaxed" 
                        sideOffset={5}
                      >
                        <p className="font-black text-[10px] text-emerald-400 mb-1 tracking-wider whitespace-nowrap">
                          {strat.replace('_', ' ')} ALLOCATION
                        </p>
                        {strat === 'FIRST_FIT' && "Allocates the very first free block that is large enough. It is fast but can scatter processes randomly."}
                        {strat === 'BEST_FIT' && "Allocates the smallest free block that can hold the process. It saves large holes but creates tiny, unusable fragments."}
                        {strat === 'WORST_FIT' && "Allocates the largest available free block. It leaves larger, more usable leftover spaces (holes)."}
                        <p className="mt-2 text-[8px] text-emerald-500/70 italic inline-flex items-center gap-1">
                          <Activity size={10} /> Watch the Physical Page Map
                        </p>
                        <Tooltip.Arrow className="fill-emerald-900/50" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                ))}
              </div>
            </div>

          {algorithm === 'RR' && (
            <div className="flex flex-col items-start">
              <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1 ml-0.5">Quantum: <span className="text-indigo-400">{quantum}ms</span></span>
              <div className="flex items-center bg-zinc-900 px-2 h-8 rounded-lg border border-zinc-800 shadow-inner">
                <input 
                  type="range" min="1" max="20" step="1" 
                  value={quantum} 
                  onChange={(e) => setQuantum(parseInt(e.target.value))}
                  className="w-16 accent-indigo-500 cursor-pointer h-1"
                />
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-zinc-800/50" />

        <div className="flex items-center gap-2 h-10">
           <Tooltip.Root>
             <Tooltip.Trigger asChild>
               <div className="flex bg-zinc-900/50 p-0.5 rounded-lg border border-zinc-800/50 gap-0.5 h-8 items-stretch">
                 <button 
                   onClick={() => setIsAutoPlay(!isAutoPlay)}
                   className={`flex items-center gap-2 px-3 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${isAutoPlay ? 'bg-rose-600 text-white shadow-md' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-900/20'}`}
                 >
                   {isAutoPlay ? <Activity size={10} /> : <Play size={10} />}
                   {isAutoPlay ? 'STOP' : 'RUN'}
                 </button>
                 
                 <button 
                  onClick={cycleSpeed}
                  className={`flex items-center px-2 rounded-md text-[9px] font-black transition-all ${playbackSpeed > 1 ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                 >
                   {playbackSpeed}x
                 </button>
               </div>
             </Tooltip.Trigger>
             <Tooltip.Portal>
               <Tooltip.Content className="bg-zinc-900 text-white text-[10px] px-3 py-2 rounded-lg border border-zinc-800 shadow-2xl z-[200]" sideOffset={5}>
                 {isAutoPlay ? 'Pause Autoplay' : 'Start Autoplay'}
                 <Tooltip.Arrow className="fill-zinc-800" />
               </Tooltip.Content>
             </Tooltip.Portal>
           </Tooltip.Root>

           <Tooltip.Root>
             <Tooltip.Trigger asChild>
               <button 
                 onClick={() => step()}
                 className="h-8 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[9px] font-black uppercase transition-all flex flex-col items-center justify-center leading-tight min-w-[70px]"
               >
                 <span>STEP</span>
                 <span className="text-[7px] text-zinc-500 opacity-80">CYCLE</span>
               </button>
             </Tooltip.Trigger>
             <Tooltip.Portal>
               <Tooltip.Content className="bg-zinc-900 text-white text-[10px] px-3 py-2 rounded-lg border border-zinc-800 shadow-2xl z-[200]" sideOffset={5}>
                 Step 1ms Forward
                 <Tooltip.Arrow className="fill-zinc-800" />
               </Tooltip.Content>
             </Tooltip.Portal>
           </Tooltip.Root>

           <div className="h-6 w-px bg-zinc-800/50 mx-1" />

           <div className="flex gap-1 h-8">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="h-full px-3 border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2">
                  <Layers size={10} />
                  LOAD DEMO
                  <ChevronDown size={10} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content 
                  className="min-w-[280px] bg-zinc-900 border border-zinc-800 rounded-lg p-2 shadow-2xl z-[200] animate-in fade-in zoom-in duration-100"
                  sideOffset={5}
                >
                  <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest px-2 pb-1 mb-1 border-b border-zinc-800/50">CPU Scheduling Demos</div>
                  <DropdownMenu.Item 
                    onClick={() => { setIsAutoPlay(false); loadBalancedDemo(); setIsAutoPlay(true); }}
                    className="flex flex-col px-2 py-1.5 text-zinc-300 hover:bg-zinc-800 rounded-md cursor-pointer outline-none transition-colors"
                  >
                    <span className="text-[10px] font-bold text-indigo-400">Balanced Workload</span>
                    <span className="text-[9px] text-zinc-500 mt-0.5">Standard mix of processes to test basic functionality.</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onClick={() => { setIsAutoPlay(false); loadStarvationDemo(); setIsAutoPlay(true); }}
                    className="flex flex-col px-2 py-1.5 text-zinc-300 hover:bg-zinc-800 rounded-md cursor-pointer outline-none transition-colors"
                  >
                    <span className="text-[10px] font-bold text-rose-500">Starvation Priority</span>
                    <span className="text-[9px] text-zinc-500 mt-0.5">Watch high priority tasks block lower ones.</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onClick={() => { setIsAutoPlay(false); loadWaitingDemo(); setIsAutoPlay(true); }}
                    className="flex flex-col px-2 py-1.5 text-zinc-300 hover:bg-zinc-800 rounded-md cursor-pointer outline-none transition-colors"
                  >
                    <span className="text-[10px] font-bold text-amber-500">I/O Wait Handling</span>
                    <span className="text-[9px] text-zinc-500 mt-0.5">Simulate interrupt-driven I/O context switching.</span>
                  </DropdownMenu.Item>

                  <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest px-2 pb-1 mt-2 mb-1 border-b border-zinc-800/50">Memory Allocation Demos (Watch MMU at t=35)</div>
                  
                  <DropdownMenu.Item 
                    onClick={() => { setIsAutoPlay(false); loadFirstFitDemo(); setIsAutoPlay(true); }}
                    className="flex flex-col px-2 py-1.5 text-zinc-300 hover:bg-zinc-800 rounded-md cursor-pointer outline-none transition-colors group"
                  >
                    <span className="text-[10px] font-bold text-emerald-400 group-hover:text-emerald-300">First Fit Allocation</span>
                    <span className="text-[9px] text-zinc-500 mt-0.5">Will allocate the new process into the first hole large enough (top of memory map).</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onClick={() => { setIsAutoPlay(false); loadBestFitDemo(); setIsAutoPlay(true); }}
                    className="flex flex-col px-2 py-1.5 text-zinc-300 hover:bg-zinc-800 rounded-md cursor-pointer outline-none transition-colors group"
                  >
                    <span className="text-[10px] font-bold text-emerald-400 group-hover:text-emerald-300">Best Fit Allocation</span>
                    <span className="text-[9px] text-zinc-500 mt-0.5">Will scan all holes and place the process perfectly in the second hole, leaving no tiny fragments.</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onClick={() => { setIsAutoPlay(false); loadWorstFitDemo(); setIsAutoPlay(true); }}
                    className="flex flex-col px-2 py-1.5 text-zinc-300 hover:bg-zinc-800 rounded-md cursor-pointer outline-none transition-colors group"
                  >
                    <span className="text-[10px] font-bold text-emerald-400 group-hover:text-emerald-300">Worst Fit Allocation</span>
                    <span className="text-[9px] text-zinc-500 mt-0.5">Will choose the largest available hole, intentionally leaving a large, usable fragment behind.</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button 
                  onClick={() => { setIsAutoPlay(false); reset(); }}
                  className="h-full px-3 border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center"
                >
                  <RotateCcw size={12} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-zinc-900 text-white text-[10px] px-3 py-2 rounded-lg border border-zinc-800 shadow-2xl z-[200]" sideOffset={5}>
                  Reset Kernel System
                  <Tooltip.Arrow className="fill-zinc-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className={`flex items-center gap-2 px-3 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showGuide ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300 border border-zinc-800'}`}
        >
          <HelpCircle size={14} />
          DOCS
        </button>

        <div className="h-6 w-px bg-zinc-800/50" />
        <div className="flex flex-col items-end h-8 justify-center min-w-[70px]">
           <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Sys Clock</span>
           <span className="text-[10px] font-mono font-bold text-indigo-400">{clock.toString().padStart(6, '0')}ms</span>
        </div>

        <div className="h-6 w-px bg-zinc-800/50" />

        <div className="flex items-center">
           <span className={`inline-flex items-center px-3 h-8 rounded border text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
             useSimulationStore.getState().runningPid ? 'bg-indigo-900/20 border-indigo-500/50 text-indigo-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
           }`}>
             CPU: {useSimulationStore.getState().runningPid ? useSimulationStore.getState().runningPid : 'IDLE'}
           </span>
        </div>
      </div>
    </header>
  );
};
