import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  "[    0.000000] BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable",
  "[    0.000000] NX (Execute Disable) protection: active",
  "[    0.000000] SMBIOS 2.8 present.",
  "[    0.000000] DMI: Vantage Systems V-Kernel 2.0.4/Simulator-X, BIOS 1.0.0",
  "[    0.004281] CPU0: Intel(R) Core(TM) Simulator @ 2.40GHz",
  "[    0.005112] Memory: 65536K/65536K available (1024K kernel code)",
  "[    0.012441] Initializing VANTAGE_KERNEL subsystems...",
  "[    0.015882] [OK] Process Scheduler (Round Robin, Priority, SJF)",
  "[    0.018221] [OK] Virtual Memory Manager (MMU_SIM)",
  "[    0.021554] [OK] VFS Block Device Interface (sda1)",
  "[    0.025332] [OK] Network Stack (IPv4/IPv6 Tunneling)",
  "[    0.038441] Mounting root filesystem...",
  "[    0.045221] [DONE] VFS Mounted (type: ext4, flags: rw,noatime)",
  "[    0.052119] Starting System Telemetry...",
  "[    0.061225] [OK] Core Metrics: CPU_CLOCK, MEM_POOL, IO_STACK",
  "[    0.075442] Initializing User Interface Layer...",
  "[    0.088221] Decrypting Kernel GUI Buffers...",
  "[    0.112441] Checksum: 0x1A4F - PASSED",
  "[    0.125112] CHECKING PERMISSIONS...",
  "[    0.142554] ACCESS GRANTED.",
  "[    0.155662] BOOT_FLAG: 0xDEADBEEF",
  "[    0.168442] LOADING VANTAGE_ENVIRONMENT_v2.0",
  "[    0.182221] READY.",
];

const CODE_SNIPPETS = [
  "function kernel_init() {",
  "  mem_map = mmap(NULL, size, PROT_READ);",
  "  if (mem_map == MAP_FAILED) return -1;",
  "  sched_init(&core_scheduler);",
  "  vfs_mount(\"/dev/sda1\", \"/\");",
  "  while(1) { cpu_idle(); }",
  "}",
  "void* alloc_pcb() {",
  "  pcb_t *p = kmalloc(sizeof(pcb_t));",
  "  p->state = STATE_NEW;",
  "  return p;",
  "}",
  "varying vec2 vUv;",
  "uniform float uTime;",
  "void main() {",
  "  gl_FragColor = vec4(vUv, uTime, 1.0);",
  "}"
];

const FallingCode = () => {
  const [columns, setColumns] = useState<number>(0);
  
  useEffect(() => {
    setColumns(Math.floor(window.innerWidth / 20));
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.15 }}>
      {Array.from({ length: columns }).map((_, i) => (
        <CodeColumn key={i} delay={Math.random() * 5} x={i * 20} />
      ))}
    </div>
  );
};

const CodeColumn = ({ delay, x }: { delay: number, x: number }) => {
  const [chars, setChars] = useState<string[]>([]);
  
  useEffect(() => {
    const symbols = "010101<>[]{}/\\|!@#$%^&*()-=_+";
    const update = () => {
      setChars(Array.from({ length: 30 }).map(() => symbols[Math.floor(Math.random() * symbols.length)]));
    };
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ y: -500 }}
      animate={{ y: window.innerHeight + 500 }}
      transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay, ease: "linear" }}
      style={{
        position: 'absolute',
        top: 0,
        left: x,
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#4f8ef7',
        display: 'flex',
        flexDirection: 'column',
        textShadow: '0 0 8px rgba(79,142,247,0.5)'
      }}
    >
      {chars.map((c, i) => (
        <span key={i} style={{ opacity: (i / chars.length) }}>{c}</span>
      ))}
    </motion.div>
  );
};

const CodeLine = ({ index }: { index: number }) => {
  const [snippet, setSnippet] = useState("");
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSnippet(CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]);
      setOpacity(1);
      
      const interval = setInterval(() => {
        setOpacity(0.4);
        setTimeout(() => {
          setSnippet(CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]);
          setOpacity(1);
        }, 100);
      }, 2000 + Math.random() * 3000);

      return () => clearInterval(interval);
    }, index * 150);

    return () => clearTimeout(timeout);
  }, [index]);

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      fontSize: '11px', 
      color: '#4f8ef7', 
      opacity: opacity * 0.7,
      transition: 'opacity 0.3s ease',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    }}>
      <span style={{ marginRight: '8px', opacity: 0.3 }}>{index.toString().padStart(2, '0')}</span>
      {snippet}
    </div>
  );
};

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'logging' | 'decoding' | 'complete'>('logging');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < BOOT_LOGS.length) {
        setDisplayedLogs(prev => [...prev, BOOT_LOGS[logIndex]]);
        setProgress(((logIndex + 1) / BOOT_LOGS.length) * 100);
        logIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase('decoding'), 400);
      }
    }, 70);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedLogs]);

  useEffect(() => {
    if (phase === 'decoding') {
      setTimeout(() => {
        setPhase('complete');
        // Give time for the final visual state before calling onComplete
        setTimeout(onComplete, 100);
      }, 800);
    }
  }, [phase, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "linear" }}
      style={{
      position: 'fixed',
      inset: 0,
      background: '#020202',
      color: '#4f8ef7',
      fontFamily: 'JetBrains Mono, monospace',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 40px',
      overflow: 'hidden'
    }}>
      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
      {/* Matrix-like Background Grain */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.1,
        backgroundImage: 'radial-gradient(#4f8ef7 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Decorative Grid Lines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, rgba(79,142,247,0.03) 1px, transparent 1px), linear-gradient(0deg, rgba(79,142,247,0.03) 1px, transparent 1px)',
        backgroundSize: '100px 100px',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Header Info */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(79,142,247,0.2)', paddingBottom: '12px', fontSize: '12px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span className="font-bold text-indigo-400">HOST: KERNEL_SIM_V2</span>
          <span className="opacity-60">ADDR: 0x1A4F_990B</span>
          <span className="opacity-60">ID: VANT_OS_2.0</span>
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          <span className="text-emerald-500 font-bold animate-pulse">● SYSTEM_ACTIVE</span>
          <span className="font-bold">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Matrix falling code effect */}
      <FallingCode />

      {/* Main Terminal Area */}
      <div className="flex gap-8 flex-1 overflow-hidden relative z-10">
        {/* Left Dashboard Panel */}
        <div className="hidden xl:flex flex-col gap-4 w-80">
          {/* Time & Date Widget */}
          <div className="border border-indigo-500/30 bg-indigo-500/[0.05] p-5 rounded-xl backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-4 border-b border-indigo-500/20 pb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-300">Chronos_Unit</span>
              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_12px_#4f8ef7]" />
            </div>
            <div className="text-4xl font-bold tracking-tighter mb-1 font-mono">
              {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
              <span className="text-xl opacity-30 ml-1">:{new Date().getSeconds().toString().padStart(2, '0')}</span>
            </div>
            <div className="text-[10px] opacity-40 uppercase tracking-[0.15em] font-medium">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Memory Status Widget */}
          <div className="border border-indigo-500/30 bg-indigo-500/[0.05] p-5 rounded-xl backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-4 border-b border-indigo-500/20 pb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-300">V_Mem_Sync</span>
              <span className="text-[10px] font-mono text-emerald-500">ACTIVE</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-2 opacity-60 font-bold uppercase">
                  <span>Kernel_Pool</span>
                  <span className="text-indigo-400">{Math.floor(progress)}%</span>
                </div>
                <div className="h-1.5 bg-indigo-500/10 rounded-full overflow-hidden p-[1px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-indigo-500 shadow-[0_0_15px_#4f8ef7]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[8px] opacity-30 uppercase">Swap_Stat</div>
                  <div className="h-0.5 bg-indigo-500/10 rounded-full" />
                </div>
                <div className="space-y-1">
                  <div className="text-[8px] opacity-30 uppercase">Page_Freq</div>
                  <div className="h-0.5 bg-indigo-500/10 rounded-full overflow-hidden">
                    <motion.div animate={{ x: [-20, 20] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-1/2 h-full bg-indigo-400/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Node Info Widget */}
          <div className="border border-indigo-500/30 bg-indigo-500/[0.05] p-5 rounded-xl backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)] flex-1 overflow-hidden min-h-0 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-indigo-500/20 pb-2 shrink-0">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-300">Telemetrics</span>
              <span className="text-[10px] opacity-30 font-mono">v2.0.4.X</span>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {[
                { k: 'LOCATION_NODE', v: 'NET_HUB_ALPHA' },
                { k: 'SYS_CORE_TEMP', v: '24.2°C' },
                { k: 'LINK_PROTOCOL', v: 'TCP/SIM_SEC' },
                { k: 'DATA_ENCRYPTION', v: 'V_VAULT_X' },
                { k: 'IO_THROUGHPUT', v: '124.5 GB/s' },
              ].map(item => (
                <div key={item.k} className="flex justify-between text-[10px] items-center">
                  <span className="opacity-30 tracking-wider text-[9px]">{item.k}</span>
                  <span className="font-bold opacity-80 font-mono text-indigo-200">{item.v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-indigo-500/10 shrink-0">
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ opacity: [0.2, 0.6, 0.2] }} 
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                    className="h-1 bg-indigo-500/30 rounded-sm" 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Logging Terminal */}
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', position: 'relative', padding: '15px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(79,142,247,0.1)', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
            {displayedLogs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1 }}
                className="font-mono"
              >
                <span style={{ opacity: 0.3, width: '90px', display: 'inline-block' }}>{log?.substring(0, 14)}</span>
                <span style={{ color: log?.includes('[OK]') || log?.includes('[DONE]') || log?.includes('PASSED') ? '#10b981' : '#fff', marginLeft: '12px', fontWeight: log?.includes('[OK]') ? 600 : 400 }}>
                  {log?.substring(14)}
                </span>
              </motion.div>
            ))}
            {phase === 'decoding' && (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', color: '#10b981', fontWeight: 600, fontSize: '14px' }}>
                  <span className="opacity-50">[SYSTEM_MSG]</span>
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="tracking-widest"
                  >
                    DECODING_V_OS_ENVIRONMENT...
                  </motion.span>
                </div>
                <div style={{ width: '100%', maxWidth: '400px', height: '4px', background: 'rgba(79,142,247,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    style={{ height: '100%', background: '#4f8ef7', boxShadow: '0 0 15px #4f8ef7' }}
                  />
                </div>
              </div>
            )}
            <div ref={logEndRef} />
          </div>

          {/* System Load Visualizer Widget */}
          <div className="border border-indigo-500/20 bg-indigo-500/[0.04] p-5 rounded-xl flex items-center gap-6 shadow-lg h-28">
            <div className="flex-1 overflow-hidden h-full">
              <div className="text-[9px] opacity-40 uppercase tracking-[0.25em] mb-2 font-bold text-indigo-300">Processor_Load_Telemetry</div>
              <div className="flex items-end gap-1 h-12">
                {Array.from({ length: 48 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: [`${20 + Math.random() * 40}%`, `${40 + Math.random() * 60}%`, `${20 + Math.random() * 40}%`] }}
                    transition={{ repeat: Infinity, duration: 1.5 + Math.random(), delay: i * 0.04 }}
                    className="w-1 bg-indigo-500/30 rounded-full"
                  />
                ))}
              </div>
            </div>
            <div className="w-px h-10 bg-indigo-500/10" />
            <div className="space-y-2 shrink-0">
              <div className="text-right">
                <div className="text-[8px] opacity-30 uppercase font-bold tracking-widest">Core_01</div>
                <div className="text-[10px] font-mono text-emerald-500 font-bold">42.4%</div>
              </div>
              <div className="text-right">
                <div className="text-[8px] opacity-30 uppercase font-bold tracking-widest">Network</div>
                <div className="text-[10px] font-mono text-indigo-400 font-bold">94ms</div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Code Execution Terminal */}
        <div className="hidden lg:flex flex-col flex-1 border border-indigo-500/30 bg-indigo-500/[0.05] rounded-xl p-6 overflow-hidden relative backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-4 border-b border-indigo-500/20 pb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">Execution_Queue</span>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
            </div>
          </div>
          <div className="space-y-1.5 flex-1 overflow-hidden">
            {Array.from({ length: 18 }).map((_, i) => (
              <CodeLine key={i} index={i} />
            ))}
          </div>

          {/* Sub-system Status Matrix Widget */}
          <div className="mt-6 pt-4 border-t border-indigo-500/10 shrink-0">
            <div className="text-[9px] opacity-40 uppercase tracking-widest mb-3 font-bold text-indigo-300">Node_Matrix</div>
            <div className="grid grid-cols-4 gap-1.5">
              {['VFS', 'MMU', 'SCHED', 'PIPE', 'IO', 'NET', 'GPU', 'USB'].map((label, i) => (
                <div key={label} className="p-1.5 border border-indigo-500/10 rounded flex flex-col gap-1 items-center bg-white/[0.02]">
                  <span className="text-[7px] opacity-40 font-bold">{label}</span>
                  <div className="w-full h-1 bg-indigo-500/10 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ opacity: [0.3, 1, 0.3] }} 
                      transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                      className="w-full h-full bg-emerald-500" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Progress */}
      <div style={{ marginTop: '20px', borderTop: '1px solid rgba(79,142,247,0.1)', paddingTop: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ fontSize: '9px', opacity: 0.4, width: '80px', letterSpacing: '0.1em' }}>V_OS_CORE</div>
        <div style={{ flex: 1, height: '4px', background: 'rgba(79,142,247,0.05)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#4f8ef7', transition: 'width 0.1s' }} />
        </div>
        <div style={{ fontSize: '10px', fontWeight: 600, width: '35px', opacity: 0.7 }}>{Math.floor(progress)}%</div>
      </div>

      {/* Scanline / CRT Effect Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)',
        backgroundSize: '100% 4px',
        pointerEvents: 'none',
        opacity: 0.2,
        zIndex: 50
      }} />

      {/* Moving Scanline */}
      <motion.div
        animate={{ y: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '100px',
          background: 'linear-gradient(to bottom, transparent, rgba(79,142,247,0.05), transparent)',
          pointerEvents: 'none',
          zIndex: 51
        }}
      />
    </motion.div>
  );
};
