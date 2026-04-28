/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { Minus, Plus } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface NumericStepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  accentColor: 'indigo' | 'emerald' | 'amber' | 'zinc';
  isHighImportance?: boolean;
  isDimmed?: boolean;
}

const NumericStepper = ({ label, value, min = 0, max = Infinity, step = 1, onChange, accentColor, isHighImportance, isDimmed }: NumericStepperProps) => {
  const colors = {
    indigo: 'text-indigo-400 focus-within:border-indigo-500 hover:border-indigo-500/50',
    emerald: 'text-emerald-400 focus-within:border-emerald-500 hover:border-emerald-500/50',
    amber: 'text-amber-500 focus-within:border-amber-500 hover:border-amber-500/50',
    zinc: 'text-zinc-400 focus-within:border-zinc-500 hover:border-zinc-500/50'
  };

  const glows = {
    indigo: 'shadow-[0_0_15px_rgba(99,102,241,0.2)] border-indigo-500/50',
    emerald: 'shadow-[0_0_15px_rgba(16,185,129,0.2)] border-emerald-500/50',
    amber: 'shadow-[0_0_15px_rgba(245,158,11,0.2)] border-amber-500/50',
    zinc: 'shadow-[0_0_15px_rgba(113,113,122,0.2)] border-zinc-500/50'
  };

  const btnColors = {
    indigo: 'hover:bg-indigo-500/10 text-indigo-500/50 hover:text-indigo-400',
    emerald: 'hover:bg-emerald-500/10 text-emerald-500/50 hover:text-emerald-400',
    amber: 'hover:bg-amber-500/10 text-amber-500/50 hover:text-amber-400',
    zinc: 'hover:bg-zinc-500/10 text-zinc-500/50 hover:text-zinc-400'
  };

  return (
    <div className={`space-y-1 transition-all duration-300 ${isDimmed ? 'opacity-30 grayscale saturate-0' : 'opacity-100'}`}>
      <label className={`text-[8px] font-black uppercase mb-1 block transition-colors duration-300 ${isHighImportance ? 'text-zinc-200' : 'text-zinc-600'}`}>
        {label}
        {isHighImportance && <span className="ml-1 text-indigo-500 animate-pulse">●</span>}
      </label>
      <div className={`flex items-center bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden transition-all duration-300 ${colors[accentColor]} ${isHighImportance ? glows[accentColor] : ''}`}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className={`px-1.5 py-1.5 transition-colors border-r border-zinc-800/50 ${btnColors[accentColor]}`}
        >
          <Minus size={10} strokeWidth={3} />
        </button>
        <input 
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseInt(e.target.value) || 0)}
          className={`w-full bg-transparent px-1 py-1.5 text-[10px] text-center outline-none font-mono font-bold appearance-none`}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className={`px-1.5 py-1.5 transition-colors border-l border-zinc-800/50 ${btnColors[accentColor]}`}
        >
          <Plus size={10} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export const ProcessForm = () => {
  const { addProcess, processes, algorithm } = useSimulationStore();
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: 'Process-Alpha',
    priority: 5,
    burstTime: 200,
    memRequired: 32,
    arrivalTime: 0
  });

  const profiles = {
    NORMAL: { name: 'Standard-App', priority: 5, burstTime: 200, memRequired: 48, arrivalTime: 0 },
    CRITICAL: { name: 'System-RT', priority: 1, burstTime: 50, memRequired: 16, arrivalTime: 0 },
    BACKGROUND: { name: 'Worker-BG', priority: 10, burstTime: 500, memRequired: 64, arrivalTime: 0 },
    STARVER: { name: 'Starve-X', priority: 1, burstTime: 5, memRequired: 32, arrivalTime: 0 }
  };

  const applyProfile = (key: keyof typeof profiles) => {
    setFormData({ ...profiles[key], arrivalTime: formData.arrivalTime });
    setActiveProfile(key);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setActiveProfile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pid = `P${(processes.length + 1).toString().padStart(3, '0')}`;
    addProcess(pid, formData.name, formData.priority, formData.burstTime, formData.memRequired, formData.arrivalTime);
    setActiveProfile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Kernel Dispatcher</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className="text-[8px] font-black text-zinc-600 uppercase mb-1 block">Quick Profiles</label>
          <div className="flex gap-1.5 mb-2">
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button 
                  type="button"
                  onClick={() => applyProfile('NORMAL')}
                  className={`flex-1 py-1 px-1 border rounded text-[7px] font-black uppercase transition-all ${
                    activeProfile === 'NORMAL' 
                    ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]' 
                    : 'border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400'
                  }`}
                >
                  Normal
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-zinc-900 border border-zinc-800 p-2 text-[9px] text-zinc-300 rounded shadow-xl z-[100] max-w-[150px]" sideOffset={5}>
                  <p className="font-bold text-indigo-400 mb-1">NORMAL PROFILE</p>
                  Balanced priority and burst. Ideal for general purpose testing.
                  <Tooltip.Arrow className="fill-zinc-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button 
                  type="button"
                  onClick={() => applyProfile('CRITICAL')}
                  className={`flex-1 py-1 px-1 border rounded text-[7px] font-black uppercase transition-all ${
                    activeProfile === 'CRITICAL' 
                    ? 'border-rose-500 bg-rose-500/20 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]' 
                    : 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500'
                  }`}
                >
                  Critical
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-zinc-900 border border-zinc-800 p-2 text-[9px] text-zinc-300 rounded shadow-xl z-[100] max-w-[150px]" sideOffset={5}>
                  <p className="font-bold text-rose-400 mb-1">CRITICAL PROFILE</p>
                  High priority, short burst for real-time simulation.
                  <Tooltip.Arrow className="fill-zinc-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button 
                  type="button"
                  onClick={() => applyProfile('BACKGROUND')}
                  className={`flex-1 py-1 px-1 border rounded text-[7px] font-black uppercase transition-all ${
                    activeProfile === 'BACKGROUND' 
                    ? 'border-slate-400 bg-slate-800 text-white shadow-[0_0_10px_rgba(148,163,184,0.2)]' 
                    : 'border-slate-500/30 bg-zinc-950 hover:bg-zinc-800 text-slate-400'
                  }`}
                >
                  Backgr.
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-zinc-900 border border-zinc-800 p-2 text-[9px] text-zinc-300 rounded shadow-xl z-[100] max-w-[150px]" sideOffset={5}>
                  <p className="font-bold text-zinc-400 mb-1">BACKGROUND PROFILE</p>
                  Low priority, long burst (susceptible to starvation).
                  <Tooltip.Arrow className="fill-zinc-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button 
                  type="button"
                  onClick={() => applyProfile('STARVER')}
                  className={`flex-1 py-1 px-1 border rounded text-[7px] font-black uppercase transition-all ${
                    activeProfile === 'STARVER' 
                    ? 'border-amber-500 bg-amber-500/20 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                    : 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500'
                  }`}
                >
                  Starver
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-zinc-900 border border-zinc-800 p-2 text-[9px] text-zinc-300 rounded shadow-xl z-[100] max-w-[150px]" sideOffset={5}>
                  <p className="font-bold text-amber-400 mb-1">STARVER PROFILE</p>
                  High priority, tiny burst. Dispatch repeatedly to manually "starve" background tasks.
                  <Tooltip.Arrow className="fill-zinc-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>

          <label className="text-[8px] font-black text-zinc-600 uppercase mb-1 block">Process ID/Name</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[10px] text-zinc-200 outline-none focus:border-indigo-500 transition-all font-mono font-bold"
          />
        </div>
        <div className="space-y-1">
           <Tooltip.Root>
             <Tooltip.Trigger asChild>
                <div>
                  <NumericStepper 
                    label="Priority"
                    value={formData.priority}
                    min={1}
                    max={10}
                    onChange={val => handleInputChange('priority', val)}
                    accentColor="indigo"
                    isHighImportance={algorithm === 'PRIORITY'}
                    isDimmed={algorithm === 'RR'}
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
                <div>
                  <NumericStepper 
                    label="Burst (ms)"
                    value={formData.burstTime}
                    min={1}
                    onChange={val => handleInputChange('burstTime', val)}
                    accentColor="emerald"
                    isHighImportance={algorithm === 'SJF'}
                  />
                </div>
             </Tooltip.Trigger>
             <Tooltip.Portal>
               <Tooltip.Content className="bg-zinc-900 border border-zinc-800 p-2 text-[9px] text-zinc-300 rounded shadow-xl" side="bottom">
                 Total CPU execution time needed
                 <Tooltip.Arrow className="fill-zinc-800" />
               </Tooltip.Content>
             </Tooltip.Portal>
           </Tooltip.Root>
        </div>
        <div className="space-y-1">
           <NumericStepper 
             label="Arrival (ms)"
             value={formData.arrivalTime}
             min={0}
             onChange={val => handleInputChange('arrivalTime', val)}
             accentColor="zinc"
           />
        </div>
        <div className="space-y-1">
          <NumericStepper 
            label="Memory (MB)"
            value={formData.memRequired}
            min={1}
            max={256}
            step={16}
            onChange={val => handleInputChange('memRequired', val)}
            accentColor="amber"
          />
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
