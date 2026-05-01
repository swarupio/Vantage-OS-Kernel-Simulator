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
  isAuto: boolean;
  setIsAuto: (val: boolean) => void;
  speed: number;
  setSpeed: (val: number) => void;
  showGuide: boolean;
  setShowGuide: (val: boolean) => void;
  onHome?: () => void;
}

export const Header = ({ isAuto, setIsAuto, speed, setSpeed, showGuide, setShowGuide, onHome }: HeaderProps) => {
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
    loadBalancedDemo 
  } = useSimulationStore();
  
  const cycleSpeed = () => {
    const speeds = [1, 2, 4, 8];
    const currentIndex = speeds.indexOf(speed);
    setSpeed(speeds[(currentIndex + 1) % speeds.length]);
  };

  return (
    <header className="h-16 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-4 shrink-0 sticky top-0 z-50 shadow-2xl">
      <div className="flex items-center gap-4">
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
                      onClick={() => { setIsAuto(false); setAlgorithm(algo); }}
                      className={`px-3 flex items-center h-full rounded text-[9px] font-black uppercase transition-all duration-200 ${
                        algorithm === algo 
                        ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.4)] border border-indigo-400/20' 
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

          <div className="flex flex-col items-start">
            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1 ml-0.5">Mem Allocation</span>
            <div className="flex gap-px bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 h-8 flex-shrink-0 shadow-inner">
              {(['FIRST_FIT', 'BEST_FIT', 'MOST_FIT'] as const).map(strat => (
                <Tooltip.Root key={strat}>
                  <Tooltip.Trigger asChild>
                    <button 
                      onClick={() => { setMemoryStrategy(strat); }}
                      className={`px-3 flex items-center h-full rounded text-[9px] font-black uppercase transition-all duration-200 ${
                        memoryStrategy === strat 
                        ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] border border-emerald-400/20' 
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {strat.replace('_', ' ')}
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="bg-zinc-900 text-white text-[10px] px-3 py-2 rounded-lg border border-zinc-800 shadow-2xl z-[200]" sideOffset={5}>
                      Mode: {strat === 'FIRST_FIT' ? 'Fast arrival, more fragmentation' : strat === 'BEST_FIT' ? 'Slower arrival, less fragmentation' : 'Uses largest free block to reduce small fragments'}
                      <Tooltip.Arrow className="fill-zinc-800" />
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
                   onClick={() => setIsAuto(!isAuto)}
                   className={`flex items-center gap-2 px-3 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${isAuto ? 'bg-rose-600 text-white shadow-lg' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20'}`}
                 >
                   {isAuto ? <Activity size={10} /> : <Play size={10} />}
                   {isAuto ? 'STOP' : 'RUN'}
                 </button>
                 
                 <button 
                  onClick={cycleSpeed}
                  className={`flex items-center px-2 rounded-md text-[9px] font-black transition-all ${speed > 1 ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                 >
                   {speed}x
                 </button>
               </div>
             </Tooltip.Trigger>
             <Tooltip.Portal>
               <Tooltip.Content className="bg-zinc-900 text-white text-[10px] px-3 py-2 rounded-lg border border-zinc-800 shadow-2xl z-[200]" sideOffset={5}>
                 {isAuto ? 'Pause Autoplay' : 'Start Autoplay'}
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
                  className="min-w-[160px] bg-zinc-900 border border-zinc-800 rounded-lg p-1 shadow-2xl z-[200] animate-in fade-in zoom-in duration-100"
                  sideOffset={5}
                >
                  <DropdownMenu.Item 
                    onClick={() => { setIsAuto(false); loadBalancedDemo(); }}
                    className="flex items-center px-3 py-2 text-[10px] font-bold text-zinc-300 hover:bg-indigo-600 hover:text-white rounded-md cursor-pointer outline-none transition-colors"
                  >
                    1. Balanced Workload
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onClick={() => { setIsAuto(false); loadStarvationDemo(); }}
                    className="flex items-center px-3 py-2 text-[10px] font-bold text-zinc-300 hover:bg-indigo-600 hover:text-white rounded-md cursor-pointer outline-none transition-colors"
                  >
                    2. Starvation Case
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onClick={() => { setIsAuto(false); loadWaitingDemo(); }}
                    className="flex items-center px-3 py-2 text-[10px] font-bold text-zinc-300 hover:bg-indigo-600 hover:text-white rounded-md cursor-pointer outline-none transition-colors"
                  >
                    3. I/O Waiting Demo
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button 
                  onClick={() => { setIsAuto(false); reset(); }}
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
