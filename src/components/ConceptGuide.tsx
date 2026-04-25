/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Info, BookOpen, Layers, Database, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export const ConceptGuide = () => {
  const concepts = [
    {
      title: "Scheduling Algorithms",
      icon: <Cpu className="text-indigo-400" size={16} />,
      items: [
        { name: "RR (Round Robin)", desc: "Each process gets a fixed time slice (quantum). Good for fair sharing." },
        { name: "SJF (Shortest Job First)", desc: "Executes the process with the smallest burst time first. Minimizes average wait time." },
        { name: "Priority", desc: "Highest priority (lowest number) executes first. Watch out for starvation!" }
      ]
    },
    {
      title: "Memory Management",
      icon: <Database className="text-amber-400" size={16} />,
      items: [
        { name: "MMU", desc: "Memory Management Unit mapping physical addresses to logical process blocks." },
        { name: "Page Fault", desc: "Occurs when a process tries to access memory not currently in physical RAM." }
      ]
    },
    {
      title: "File System",
      icon: <Layers className="text-sky-400" size={16} />,
      items: [
        { name: "Inode", desc: "Index Node containing metadata about a file and pointers to its data blocks." },
        { name: "Physical Sectors", desc: "Actual locations on disk where file data is stored." }
      ]
    }
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <BookOpen size={16} className="text-indigo-500" />
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-100 italic">Vantage Knowledge Base</h3>
      </div>
      
      <div className="space-y-6">
        {concepts.map((section, idx) => (
          <div key={idx} className="space-y-3">
             <div className="flex items-center gap-2">
                {section.icon}
                <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400">{section.title}</span>
             </div>
             <div className="space-y-2">
                {section.items.map((item, i) => (
                  <div key={i} className="group p-2 rounded-lg bg-zinc-950 border border-zinc-800/50 hover:border-indigo-500/30 transition-all">
                    <div className="text-[10px] font-bold text-zinc-200 mb-1">{item.name}</div>
                    <p className="text-[9px] text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">{item.desc}</p>
                  </div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
