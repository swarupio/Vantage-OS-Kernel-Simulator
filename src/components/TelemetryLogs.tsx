/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useSimulationStore } from '../store/simulationStore';
import { EventLogger } from '../engine/EventLogger';

export const TelemetryLogs = () => {
  const { logs } = useSimulationStore();
  return (
    <div className="space-y-1">
      {logs.map((log) => (
        <motion.div 
          key={log.id} 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3 text-[10px] font-mono group leading-relaxed border-b border-zinc-800/10 pb-0.5"
        >
          <span className="text-zinc-600 shrink-0 tabular-nums">[{log.timestamp}]</span>
          <span className={`font-black shrink-0 tracking-tighter ${
            log.module === 'SYSTEM' ? 'text-rose-500' :
            log.module === 'SCHEDULER' ? 'text-[#bc13fe]' :
            log.module === 'MEMORY' ? 'text-[#ffea00]' : 
            log.module === 'FILESYSTEM' ? 'text-[#00f2ff]' : 'text-[#39ff14]'
          }`}>
            {log.module}
          </span>
          <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{log.message}</span>
        </motion.div>
      ))}
      {logs.length === 0 && <div className="h-full flex items-center justify-center text-zinc-700 uppercase tracking-widest text-[9px] font-black py-10 italic">Buffer Empty</div>}
    </div>
  );
};
