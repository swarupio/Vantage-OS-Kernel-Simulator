/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, FilePlus, Trash2, ArrowRight,Terminal, Database, Share2, RotateCcw } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export const FileSystemPanel = () => {
  const { fileSystem, createFile, writeFile, deleteFile } = useSimulationStore();
  const directory = fileSystem.getDirectory();
  const bitmap = fileSystem.getBlockBitmap();
  const [newFile, setNewFile] = useState('');
  const [editingFile, setEditingFile] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [hoveredInode, setHoveredInode] = useState<number | null>(null);
  const [selectedInode, setSelectedInode] = useState<number | null>(null);

  const handleCreate = () => {
    if (newFile) {
      createFile(newFile, 'SC-01');
      setNewFile('');
    }
  };

  const handleSave = () => {
    if (editingFile !== null) {
      writeFile(editingFile, editContent);
      setEditingFile(null);
      setEditContent('');
    }
  };

  const getInodeBlocks = (inodeId: number | null) => {
    if (inodeId === null) return [];
    return directory.find(f => f.id === inodeId)?.blocks || [];
  };

  const activeBlocks = getInodeBlocks(hoveredInode || selectedInode);

  const calculateFragmentation = () => {
    if (directory.length === 0) return 0;
    let gaps = 0;
    let totalBlocks = 0;
    directory.forEach(f => {
      if (f.blocks.length > 1) {
        for (let i = 0; i < f.blocks.length - 1; i++) {
          if (Math.abs(f.blocks[i+1] - f.blocks[i]) > 1) gaps++;
        }
      }
      totalBlocks += f.blocks.length;
    });
    return totalBlocks === 0 ? 0 : Math.round((gaps / totalBlocks) * 100);
  };

  const fsFrag = calculateFragmentation();

  return (
    <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-xl shadow-md overflow-hidden flex flex-col transition-all min-h-[460px] text-zinc-400">
        <div className="px-6 py-5 border-b border-zinc-800/80 bg-[#0c0c0e] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
             <FileText size={18} className="text-sky-400 shrink-0" />
             <span className="text-sm font-black text-zinc-200 uppercase tracking-tight">Structured File System</span>
          </div>
          <div className="shrink-0">
             <span className="text-[10px] font-black text-sky-400 bg-sky-500/10 px-4 py-2 rounded-lg uppercase tracking-widest border border-sky-500/20 shadow-md whitespace-nowrap">
               Disk Frag: {fsFrag}%
             </span>
          </div>
        </div>
       <div className="flex-1 flex flex-col no-scrollbar">
          {/* File Operations */}
          <div className="p-6 space-y-6">
             <div className="flex items-center gap-2 p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-inner focus-within:ring-2 focus-within:ring-sky-500/30 transition-all overflow-hidden">
                <input 
                  type="text" 
                  placeholder="Allocate Inode..." 
                  value={newFile}
                  onChange={e => setNewFile(e.target.value)}
                  className="flex-1 bg-transparent px-2 py-2 text-xs text-zinc-200 font-bold outline-none placeholder:text-zinc-600 placeholder:italic placeholder:font-normal min-w-0"
                />
                <button 
                  onClick={handleCreate} 
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-sky-500 transition-all shadow-md active:scale-95 shrink-0"
                >
                  DISPATCH
                </button>
             </div>
             <div className="grid grid-cols-1 gap-3 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {directory.map(f => (
                    <motion.div 
                      key={f.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onMouseEnter={() => setHoveredInode(f.id)}
                      onMouseLeave={() => setHoveredInode(null)}
                      onClick={() => setSelectedInode(selectedInode === f.id ? null : f.id)}
                      className={`flex items-center justify-between p-4 bg-zinc-900 border rounded-xl group transition-all duration-300 cursor-pointer ${hoveredInode === f.id || selectedInode === f.id ? 'border-sky-500/50 shadow-lg shadow-sky-500/10' : 'border-zinc-800'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl transition-transform ${hoveredInode === f.id ? 'bg-sky-600 text-white translate-x-1' : 'bg-sky-500/10 text-sky-400 group-hover:scale-110'}`}>
                           <FileText size={18} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-sm font-black tracking-tight transition-colors ${hoveredInode === f.id ? 'text-sky-300' : 'text-zinc-200'}`}>{f.filename}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-sky-400 font-bold bg-sky-500/10 px-1.5 py-0.5 rounded uppercase tracking-tighter border border-sky-500/20">Inode {f.id}</span>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{f.size} Bytes</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingFile(f.id); setEditContent(f.content); }}
                          className="p-2 hover:bg-sky-500/10 rounded-lg text-zinc-500 hover:text-sky-400 border border-transparent hover:border-sky-500/20 transition-all"
                          title="Write Data"
                        >
                          <FilePlus size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteFile(f.id); }}
                          className="p-2 hover:bg-rose-500/10 rounded-lg text-zinc-500 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all"
                          title="Purge Inode"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {directory.length === 0 && (
                  <div className="text-center py-12 px-6 border-2 border-dashed border-zinc-800/50 rounded-2xl">
                    <Database size={32} className="mx-auto text-zinc-800 mb-4" />
                    <div className="text-[10px] text-zinc-600 uppercase font-black tracking-widest italic leading-relaxed">Disk initialized.<br/>Waiting for inode allocation...</div>
                  </div>
                )}
             </div>
          </div>

          {/* Inode Pointer Analysis */}
          <div className="px-6 py-4 bg-zinc-950/50 border-y border-zinc-800/50">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                 <Share2 size={12} className="text-sky-400" />
                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Inode Data Pointer Trace</span>
               </div>
               {selectedInode !== null && (
                 <button onClick={() => setSelectedInode(null)} className="text-[9px] font-bold text-rose-500 hover:text-rose-400 uppercase tracking-tighter">Clear focus</button>
               )}
             </div>
             <div className="flex flex-wrap gap-1.5">
                {directory.length > 0 ? (
                  directory.map(f => (
                    <div 
                      key={f.id}
                      onClick={() => setSelectedInode(selectedInode === f.id ? null : f.id)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-bold transition-all cursor-pointer ${hoveredInode === f.id || selectedInode === f.id ? 'bg-sky-600 border-sky-600 text-white scale-105 shadow-md' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                    >
                      <span className="font-mono">0x{f.id.toString(16).toUpperCase()}</span>
                      <div className="flex gap-0.5">
                        {f.blocks.length > 0 ? f.blocks.map(b => (
                          <span key={b} className={`w-3.5 h-3.5 flex items-center justify-center rounded-[2px] text-[7px] font-mono ${hoveredInode === f.id || selectedInode === f.id ? 'bg-white/20' : 'bg-zinc-800'}`}>
                            {b}
                          </span>
                        )) : <span className="text-zinc-700 italic opacity-50 underline decoration-dotted">EOF</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-[9px] text-zinc-700 italic font-medium">No active clusters detected...</span>
                )}
             </div>
          </div>

          {/* Detailed Inode Analysis (Conditional) */}
          <AnimatePresence>
            {selectedInode !== null && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-zinc-800/50"
              >
                <div className="p-6 bg-sky-950 text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-400">Inode Control Block (ICB)</span>
                    <span className="text-[10px] font-mono text-sky-600">#INF-00{selectedInode}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[8px] uppercase text-sky-600 font-bold">Metadata</div>
                      <div className="text-xs font-mono text-zinc-300">Owner: {directory.find(f => f.id === selectedInode)?.ownerPid}</div>
                      <div className="text-xs font-mono text-zinc-400">Created: {directory.find(f => f.id === selectedInode)?.createdAt}ms</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[8px] uppercase text-sky-600 font-bold">Disk Usage</div>
                      <div className="text-xs font-mono text-zinc-300">Size: {directory.find(f => f.id === selectedInode)?.size}B</div>
                      <div className="text-xs font-mono text-zinc-400">{directory.find(f => f.id === selectedInode)?.blocks.length} Blocks allocated</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-sky-900">
                    <div className="text-[8px] uppercase text-sky-600 font-bold mb-2">Block Mapping Table</div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                      {directory.find(f => f.id === selectedInode)?.blocks.map((b, idx) => (
                        <div key={idx} className="flex items-center gap-1 shrink-0">
                           <div className="px-2 py-1 bg-sky-900 rounded font-mono text-[9px] text-sky-200 border border-sky-800">L_{idx}</div>
                           <ArrowRight size={10} className="text-sky-700" />
                           <div className="px-2 py-1 bg-rose-900 text-rose-200 rounded font-mono text-[9px] border border-rose-800">P_{b}</div>
                           {idx < (directory.find(f => f.id === selectedInode)?.blocks.length || 0) - 1 && <div className="w-1 h-px bg-sky-900" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Editor Overlay */}
          <AnimatePresence>
            {editingFile !== null && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-x-6 bottom-6 bg-zinc-900 border border-sky-500/30 rounded-2xl shadow-2xl p-6 z-50 ring-8 ring-sky-500/5"
              >
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                     <div className="p-1.5 bg-sky-600 rounded-lg text-white"><Terminal size={14} /></div>
                     <span className="text-[11px] font-black uppercase text-zinc-100 tracking-widest">
                        Data Stream Write: Inode {editingFile}
                     </span>
                   </div>
                   <button onClick={() => setEditingFile(null)} className="text-zinc-500 hover:text-zinc-200 transition-colors p-1.5 hover:bg-zinc-800 rounded-full"><RotateCcw size={16} /></button>
                 </div>
                 <textarea 
                   className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-xs font-mono text-sky-400 h-40 outline-none focus:ring-1 focus:ring-sky-500/50 resize-none shadow-inner"
                   value={editContent}
                   autoFocus
                   spellCheck={false}
                   onChange={e => setEditContent(e.target.value)}
                 />
                 <div className="flex gap-4 mt-5">
                   <button onClick={handleSave} className="flex-1 py-3 bg-sky-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-sky-500 shadow-lg shadow-sky-950/20 transition-all active:scale-95">COMMIT TRANSACTION</button>
                   <button onClick={() => setEditingFile(null)} className="flex-1 py-3 bg-zinc-800 text-zinc-400 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-zinc-700 transition-all">ABORT OPERATION</button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Block Bitmap View */}
          <div className="mt-auto p-6 bg-zinc-950 border-t border-zinc-800/80">
             <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] uppercase font-black text-zinc-600 tracking-widest leading-none">Physical Sector Cluster Map</span>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-sky-500 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Allocated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Free Sector</span>
                  </div>
                </div>
             </div>
             <div className="grid grid-cols-16 gap-1 group">
               {bitmap.map((used, i) => {
                 const isPritedByHover = activeBlocks.includes(i);
                 return (
                   <div 
                     key={i} 
                     className={`aspect-square rounded-sm transition-all duration-300 ${
                       used 
                         ? isPritedByHover 
                           ? 'bg-rose-500 scale-125 z-10 shadow-lg shadow-rose-900/50 ring-1 ring-white/10' 
                           : 'bg-sky-600 scale-110 shadow-sm shadow-sky-900/50 ring-1 ring-white/5' 
                         : 'bg-zinc-900 hover:bg-zinc-800'
                     }`}
                     title={`Physical Cluster ID: 0x${i.toString(16).toUpperCase().padStart(2, '0')}`}
                   />
                 );
               })}
             </div>
          </div>
       </div>
    </div>
  );
};
