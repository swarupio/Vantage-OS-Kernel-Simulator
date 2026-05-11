/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { 
  PCB, MemoryPartition, Inode, LogEntry, GanttEntry, 
  SchedulingAlgorithm, AllocationStrategy, ReplacementAlgorithm, SimulationStats, MemoryStats
} from '../types/simulation.types';
import { MemoryManager } from '../engine/MemoryManager';
import { FileSystem } from '../engine/FileSystem';
import { EventLogger } from '../engine/EventLogger';

interface SimulationState {
  // Config
  totalMemory: number;
  partitionSize: number;
  algorithm: SchedulingAlgorithm;
  memoryStrategy: AllocationStrategy;
  replacementAlgorithm: ReplacementAlgorithm;
  quantum: number;
  nextContextPid: string | null;
  ioRate: number; // 0 to 1, probability of I/O interrupt per running cycle
  
  // Simulation State
  clock: number;
  runId: number;
  processes: PCB[];
  readyQueue: string[]; // PIDs
  runningPid: string | null;
  currentQuantumUsed: number;
  isSwitching: boolean;
  switchRemaining: number;
  isPageFault: boolean;
  compactMode: boolean;
  logs: LogEntry[];
  ganttLog: GanttEntry[];
  isSimulationComplete: boolean;
  
  // Playback Control
  isAutoPlay: boolean;
  playbackSpeed: number;
  demoOverlay: { title: string, text: string } | null;
  
  // Constants
  CONTEXT_SWITCH_MS: number;
  IO_WAIT_MS: number;
  
  // Engine Instances (Internal)
  memoryManager: MemoryManager;
  fileSystem: FileSystem;
  
  // Actions
  setup: (config: { totalMemory: number, partitionSize: number, algorithm: SchedulingAlgorithm, strategy: AllocationStrategy, quantum: number, replacementAlgo: ReplacementAlgorithm }) => void;
  setAlgorithm: (algorithm: SchedulingAlgorithm) => void;
  setMemoryStrategy: (strategy: AllocationStrategy) => void;
  setQuantum: (q: number) => void;
  setIORate: (rate: number) => void;
  setReplacementAlgorithm: (algo: ReplacementAlgorithm) => void;
  setIsAutoPlay: (isAuto: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setDemoOverlay: (overlay: { title: string, text: string } | null) => void;
  addProcess: (pid: string, name: string, priority: number, burstTime: number, memRequired: number, arrivalTime?: number, isIOBound?: boolean) => boolean;
  step: () => void;
  reset: () => void;
  loadStarvationDemo: () => void;
  loadWaitingDemo: () => void;
  loadBalancedDemo: () => void;
  loadFirstFitDemo: () => void;
  loadBestFitDemo: () => void;
  loadWorstFitDemo: () => void;
  triggerIO: (pid: string) => void;
  
  // Stats
  getSimulationStats: () => SimulationStats;
  
  // File System Actions
  createFile: (filename: string, ownerPid: string) => void;
  writeFile: (inodeId: number, content: string) => void;
  deleteFile: (inodeId: number) => void;
  clearLogs: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => {
  const memoryManager = new MemoryManager(256, 32, 'FIRST_FIT');
  const fileSystem = new FileSystem();

  return {
    totalMemory: 256,
    partitionSize: 32,
    algorithm: 'RR',
    memoryStrategy: 'FIRST_FIT',
    replacementAlgorithm: 'FIFO',
    quantum: 4,
    nextContextPid: null,
    ioRate: 0.05, // 5% chance of I/O interrupt per cycle

    clock: 0,
    runId: 0,
    processes: [],
    readyQueue: [],
    runningPid: null,
    currentQuantumUsed: 0,
    isSwitching: false,
    switchRemaining: 0,
    isPageFault: false,
    compactMode: false,
    logs: [],
    ganttLog: [],
    isSimulationComplete: false,
    isAutoPlay: false,
    playbackSpeed: 1,
    demoOverlay: null,

    CONTEXT_SWITCH_MS: 2,
    IO_WAIT_MS: 10,

    memoryManager,
    fileSystem,

    setup: (config) => {
      const memMgr = new MemoryManager(config.totalMemory, config.partitionSize, config.strategy);
      memMgr.setReplacementAlgorithm(config.replacementAlgo);
      set((state) => ({
        totalMemory: config.totalMemory,
        partitionSize: config.partitionSize,
        algorithm: config.algorithm,
        memoryStrategy: config.strategy,
        replacementAlgorithm: config.replacementAlgo,
        quantum: config.quantum,
        memoryManager: memMgr,
        clock: 0,
        runId: state.runId + 1,
        processes: [],
        readyQueue: [],
        runningPid: null,
        isSwitching: false,
        switchRemaining: 0,
        isPageFault: false,
        isSimulationComplete: false,
        logs: [EventLogger.createEntry('SYSTEM', `Simulation setup: ${config.algorithm}, ${config.strategy}, ${config.replacementAlgo}`)],
        ganttLog: [],
      }));
    },

    setAlgorithm: (algorithm) => {
      set((s) => ({ 
        algorithm,
        logs: [EventLogger.createEntry('SYSTEM', `Switched scheduler to ${algorithm}`), ...s.logs]
      }));
    },

    setMemoryStrategy: (memoryStrategy) => {
      get().memoryManager.setStrategy(memoryStrategy);
      set((s) => ({
        memoryStrategy,
        logs: [EventLogger.createEntry('SYSTEM', `Switched memory strategy to ${memoryStrategy}`), ...s.logs]
      }));
    },

    setQuantum: (quantum) => {
      set((s) => ({ 
        quantum,
        logs: [EventLogger.createEntry('SYSTEM', `Time Quantum adjusted to ${quantum}ms`), ...s.logs]
      }));
    },

    setIORate: (ioRate) => {
      set({ ioRate });
    },

    setReplacementAlgorithm: (replacementAlgorithm) => {
      get().memoryManager.setReplacementAlgorithm(replacementAlgorithm);
      set((s) => ({
        replacementAlgorithm,
        logs: [EventLogger.createEntry('SYSTEM', `Switched replacement to ${replacementAlgorithm}`), ...s.logs]
      }));
    },

    setIsAutoPlay: (isAuto) => {
      set({ isAutoPlay: isAuto });
    },

    setPlaybackSpeed: (speed) => {
      set({ playbackSpeed: speed });
    },

    setDemoOverlay: (overlay) => {
      set({ demoOverlay: overlay });
    },

    addProcess: (pid, name, priority, burstTime, memRequired, arrivalTime, isIOBound) => {
      const state = get();
      
      const newProcess: PCB = {
        pid,
        name,
        state: 'NEW',
        priority,
        arrivalTime: arrivalTime !== undefined ? arrivalTime : state.clock,
        burstTime,
        remainingTime: burstTime,
        memRequired,
        allocatedBlocks: [], // No allocation yet
        createdAt: Date.now(),
        waitingTime: 0,
        ioWaitTimer: 0,
        isIOBound: isIOBound || false,
      };

      set((s) => ({
        processes: [...s.processes, newProcess],
        logs: [EventLogger.createEntry('PROCESS', `${pid} created and state: NEW`, pid), ...s.logs]
      }));

      return true;
    },

    step: () => {
      const state = get();
      const { algorithm, quantum, clock, readyQueue, runningPid, processes, ganttLog, isSwitching, switchRemaining, CONTEXT_SWITCH_MS, IO_WAIT_MS, ioRate, fileSystem } = state;
      
      let nextClock = clock;
      let nextReadyQueue = [...readyQueue];
      let nextRunningPid = runningPid;
      let nextProcesses = processes.map(p => ({ ...p }));
      let nextGanttLog = [...ganttLog];
      let nextIsSwitching = isSwitching;
      let nextSwitchRemaining = switchRemaining;
      let nextIsPageFault = false;
      let nextQuantumUsed = state.currentQuantumUsed;
      let newLogs: LogEntry[] = [];

      // 0. Handle Arrival of Processes
      nextProcesses.forEach(p => {
        if (p.state === 'NEW' && clock >= p.arrivalTime) {
          p.state = 'READY';
          nextReadyQueue.push(p.pid);
          newLogs.push(EventLogger.createEntry('SCHEDULER', `Arrival: ${p.pid} moved to READY queue.`, p.pid));
          
          if (p.allocatedBlocks.length === 0) {
            const allocRes = state.memoryManager.allocate(p.pid, p.memRequired, clock);
            if (allocRes) {
              p.allocatedBlocks = allocRes.blocks;
              if (allocRes.fault) {
                newLogs.push(EventLogger.createEntry('MEMORY', `Page Fault (Replacement): ${p.pid} loaded into active RAM.`, p.pid));
              } else {
                newLogs.push(EventLogger.createEntry('MEMORY', `Allocation: ${p.pid} allocated ${p.memRequired}MB using ${state.memoryStrategy}`, p.pid));
              }
            }
          }
        }
      });

      // 0.1 Handle Waiting (I/O) processes
      nextProcesses.forEach(p => {
        if (p.state === 'WAITING') {
          p.ioWaitTimer = (p.ioWaitTimer || 0) - 1;
          if (p.ioWaitTimer <= 0) {
            p.state = 'READY';
            p.ioWaitTimer = 0;
            nextReadyQueue.push(p.pid);
            newLogs.push(EventLogger.createEntry('SCHEDULER', `I/O Complete: ${p.pid} returned to READY state.`, p.pid));
          }
        }
      });

      // 1. Handle Context Switching
      if (nextIsSwitching) {
        nextClock += 1;
        nextSwitchRemaining -= 1;
        
        // Record Gantt for Switching
        const lastGantt = nextGanttLog[nextGanttLog.length - 1];
        if (lastGantt && lastGantt.pid === 'SWITCHING' && lastGantt.endTime === clock) {
          lastGantt.endTime = nextClock;
          lastGantt.duration += 1;
        } else {
          nextGanttLog.push({
            pid: 'SWITCHING',
            startTime: clock,
            endTime: nextClock,
            duration: 1,
            algorithm
          });
        }

        // Accumulate waiting time for READY processes during switch
        nextProcesses.forEach(p => {
          if (p.state === 'READY') p.waitingTime += 1;
        });

        if (nextSwitchRemaining <= 0) {
          nextIsSwitching = false;
          newLogs.push(EventLogger.createEntry('SYSTEM', 'Kernel context switch finished.', 'KERNEL'));
        } else {
          set({
            clock: nextClock,
            processes: nextProcesses,
            readyQueue: nextReadyQueue,
            runningPid: nextRunningPid,
            currentQuantumUsed: nextQuantumUsed,
            isSwitching: nextIsSwitching,
            switchRemaining: nextSwitchRemaining,
            logs: [...newLogs, ...state.logs]
          });
          return;
        }
      }

      let runTimePassed = 0;

      // 2. Manage currently running process
      if (nextRunningPid && !nextIsSwitching) {
        const pIdx = nextProcesses.findIndex(p => p.pid === nextRunningPid);
        const p = nextProcesses[pIdx];
        
        // 2a. Check for internal I/O interrupt (random basis for simulation - Only for I/O Bound processes)
        if (p.isIOBound && Math.random() < ioRate && p.remainingTime > 5) {
          p.state = 'WAITING';
          p.ioWaitTimer = IO_WAIT_MS;
          nextRunningPid = null;
          
          // Simulate some file interaction during I/O
          const fileName = `temp_${p.pid}_${clock}.dat`;
          const res = fileSystem.createFile(fileName, p.pid, clock);
          if (typeof res !== 'string') {
             fileSystem.writeFile(res.id, `Buffer data for ${p.pid} at clock ${clock}`);
             newLogs.push(EventLogger.createEntry('FILESYSTEM', `Auto I/O: ${p.pid} wrote to ${fileName}`, p.pid));
          }

          newLogs.push(EventLogger.createEntry('SCHEDULER', `Process Interrupt: ${p.pid} requested I/O, state -> WAITING`, p.pid));
          nextIsSwitching = true;
          nextSwitchRemaining = CONTEXT_SWITCH_MS;
          
          set({
            clock: nextClock,
            processes: nextProcesses,
            readyQueue: nextReadyQueue,
            runningPid: nextRunningPid,
            currentQuantumUsed: nextQuantumUsed,
            isSwitching: nextIsSwitching,
            switchRemaining: nextSwitchRemaining,
            logs: [...newLogs, ...state.logs]
          });
          return;
        }
        
        const runTime = algorithm === 'RR' ? Math.min(p.remainingTime, 1) : 1; 
        p.remainingTime -= runTime;
        runTimePassed = runTime;
        nextClock += runTime;
        if (algorithm === 'RR') {
          nextQuantumUsed += runTimePassed;
        }

        // Cumulative waiting time
        nextProcesses.forEach(proc => {
           if (proc.state === 'READY') proc.waitingTime += runTime;
        });

        // Record Gantt
        const lastGantt = nextGanttLog[nextGanttLog.length - 1];
        if (lastGantt && lastGantt.pid === p.pid && lastGantt.endTime === clock) {
          lastGantt.endTime = nextClock;
          lastGantt.duration += runTime;
        } else {
          nextGanttLog.push({
            pid: p.pid,
            startTime: clock,
            endTime: nextClock,
            duration: runTime,
            algorithm
          });
        }

        if (p.remainingTime <= 0) {
          p.state = 'TERMINATED';
          p.endTime = nextClock;
          state.memoryManager.free(p.pid);
          nextRunningPid = null;
          newLogs.push(EventLogger.createEntry('SCHEDULER', `${p.pid} execution complete. Releasing memory...`, p.pid));
          
          nextIsSwitching = true;
          nextSwitchRemaining = CONTEXT_SWITCH_MS;
          // Look ahead for next target if possible
          if (nextReadyQueue.length > 0) {
            set({ nextContextPid: nextReadyQueue[0] });
          }
        } else if (algorithm === 'RR' && nextQuantumUsed >= quantum) {
          p.state = 'READY';
          nextReadyQueue.push(p.pid);
          nextRunningPid = null;
          newLogs.push(EventLogger.createEntry('SCHEDULER', `Quantum expired for ${p.pid}. Switching...`, p.pid));
          
          nextIsSwitching = true;
          nextSwitchRemaining = CONTEXT_SWITCH_MS;
          set({ nextContextPid: nextReadyQueue[0] });
        }
      } else if (!nextIsSwitching) {
        if (nextReadyQueue.length === 0) {
          nextClock += 1;
          runTimePassed = 1;
          nextProcesses.forEach(proc => {
             if (proc.state === 'READY') proc.waitingTime += 1;
          });
        }
      }

      // 3. Apply Aging (Phase 3 requirement: every 1000ms)
      nextProcesses.forEach(p => {
        if (p.state === 'READY' && p.waitingTime > 0 && p.waitingTime % 1000 === 0) {
          const oldPriority = p.priority;
          p.priority = Math.max(1, p.priority - 1);
          if (p.priority !== oldPriority) {
            newLogs.push(EventLogger.createEntry('SCHEDULER', `Aging Active: ${p.pid} priority boosted to ${p.priority}`, p.pid));
          }
        }
      });

      // 4. Dispatch next process
      if (!nextRunningPid && !nextIsSwitching && nextReadyQueue.length > 0) {
        let selectedIdx = 0;
        if (algorithm === 'PRIORITY') {
          selectedIdx = nextReadyQueue.reduce((best, curr, idx) => {
            const pBest = nextProcesses.find(p => p.pid === nextReadyQueue[best])!;
            const pCurr = nextProcesses.find(p => p.pid === curr)!;
            return pCurr.priority < pBest.priority ? idx : best;
          }, 0);
        } else if (algorithm === 'SJF') {
          selectedIdx = nextReadyQueue.reduce((best, curr, idx) => {
            const pBest = nextProcesses.find(p => p.pid === nextReadyQueue[best])!;
            const pCurr = nextProcesses.find(p => p.pid === curr)!;
            return pCurr.remainingTime < pBest.remainingTime ? idx : best;
          }, 0);
        }

        const candidatePid = nextReadyQueue[selectedIdx];
        const pIdx = nextProcesses.findIndex(p => p.pid === candidatePid);
        const p = nextProcesses[pIdx];

        // Ensure in memory
        if (p.allocatedBlocks.length === 0) {
          const allocRes = state.memoryManager.allocate(p.pid, p.memRequired, nextClock);
          if (allocRes) {
            p.allocatedBlocks = allocRes.blocks;
            if (allocRes.fault) {
              nextIsPageFault = true;
              newLogs.push(EventLogger.createEntry('MEMORY', `Page Fault (Replacement): ${p.pid} loaded into active RAM.`, p.pid));
            } else {
              newLogs.push(EventLogger.createEntry('MEMORY', `Allocation: ${p.pid} allocated ${p.memRequired}MB using ${state.memoryStrategy}`, p.pid));
            }
          } else {
            newLogs.push(EventLogger.createEntry('MEMORY', `Allocation Fault: Insufficient space for ${p.pid}. Waiting for release...`, p.pid));
            // Rotate the queue to allow other processes to try
            nextReadyQueue.push(nextReadyQueue.splice(selectedIdx, 1)[0]);
            set({ clock: nextClock, logs: [...newLogs, ...state.logs] });
            return;
          }
        }

        nextRunningPid = nextReadyQueue.splice(selectedIdx, 1)[0];
        nextQuantumUsed = 0;
        p.state = 'RUNNING';
        if (p.startTime === undefined) p.startTime = nextClock - (nextClock > 0 ? 0 : 0);
        newLogs.push(EventLogger.createEntry('SCHEDULER', `Dispatcher: ${p.pid} CPU assigned.`, p.pid));
        set({ nextContextPid: null });
      }

      const isComplete = nextProcesses.length > 0 && nextProcesses.every(p => p.state === 'TERMINATED');

      let nextIsAutoPlay = state.isAutoPlay;
      let nextDemoOverlay = state.demoOverlay;

      // Pedagogical Demo Pauses
      const p007JustArrived = state.processes.find(p => p.pid === 'P007')?.state === 'NEW' 
                           && nextProcesses.find(p => p.pid === 'P007')?.state === 'READY';
      const p007Allocated = nextClock > 30 && state.processes.find(p => p.pid === 'P007')?.allocatedBlocks.length === 0 
                         && nextProcesses.find(p => p.pid === 'P007')?.allocatedBlocks.length > 0;

      if (nextClock === 30 && nextProcesses.some(p => p.pid === 'P007' && p.arrivalTime === 30)) {
         nextIsAutoPlay = false;
         nextDemoOverlay = {
            title: `[t=30] Demanding Memory...`,
            text: `P007 just arrived and requires 32MB (2 blocks). The OS will attempt to allocate it using ${state.memoryStrategy.replace('_', ' ')}. Check the memory holes mapped in the Memory Map above right now! Click Step (or Continue) to see where it gets placed.`
         };
      } else if (p007Allocated) {
         nextIsAutoPlay = false;
         nextDemoOverlay = {
            title: `[t=${nextClock}] Allocation Complete!`,
            text: state.memoryStrategy === 'FIRST_FIT' 
                ? "First Fit scanned from the top and found the first available hole that was large enough (a 3-block 48MB hole). It allocated the required 2 blocks (32MB) inside it, leaving a 1-block fragment behind."
                : state.memoryStrategy === 'BEST_FIT'
                ? "Best Fit scanned ALL holes and picked the PERFECT 2-block (32MB) hole. This is optimally dense and saves the bigger holes for later!"
                : "Worst Fit scanned ALL holes and intentionally chose the LARGEST hole (the 9-block 144MB one at the bottom), leaving a huge fully usable fragment behind."
         };
      } else if (nextDemoOverlay && nextDemoOverlay.title.includes('Allocation Complete!') && nextClock > 32) {
         if (state.clock !== nextClock) nextDemoOverlay = null;
      } else if (nextDemoOverlay && nextDemoOverlay.title.includes('Demanding Memory...') && nextClock > 30) {
         if (state.clock !== nextClock) nextDemoOverlay = null;
      } else if (nextDemoOverlay && nextDemoOverlay.title.includes('Balanced Workload') && nextClock > 0) {
         if (state.clock !== nextClock) nextDemoOverlay = null;
      }

      // Starvation Demo Overlay
      const p004JustStarted = state.processes.find(p => p.pid === 'P004')?.state !== 'RUNNING' 
                           && nextProcesses.find(p => p.pid === 'P004')?.state === 'RUNNING';
      const p005JustStarted = state.processes.find(p => p.pid === 'P005')?.state !== 'RUNNING' 
                           && nextProcesses.find(p => p.pid === 'P005')?.state === 'RUNNING';

      if (state.algorithm === 'PRIORITY' && p004JustStarted) {
         nextIsAutoPlay = false;
         nextDemoOverlay = {
            title: `[t=${nextClock}] Starvation in Progress!`,
            text: `Notice how P002 and P003 arrived at t=0, but P004 just jumped ahead of them because it has Priority 1! If high priority tasks keep arriving, the older tasks will starve.`
         };
      } else if (state.algorithm === 'PRIORITY' && p005JustStarted) {
         nextIsAutoPlay = false;
         nextDemoOverlay = {
            title: `[t=${nextClock}] Continued Starvation`,
            text: `P005 (Priority 2) just jumped the queue too! Poor P002 and P003 are still waiting despite arriving much earlier. This is the classic Priority Scheduling vulnerability.`
         };
      } else if (nextDemoOverlay && nextDemoOverlay.title.includes('Starvation')) {
         // Auto-hide when clock advances explicitly
         if (state.clock !== nextClock) {
            nextDemoOverlay = null;
         }
      }

      set({
        clock: nextClock,
        processes: nextProcesses,
        readyQueue: nextReadyQueue,
        runningPid: nextRunningPid,
        currentQuantumUsed: nextQuantumUsed,
        isSwitching: nextIsSwitching,
        switchRemaining: nextSwitchRemaining,
        isPageFault: nextIsPageFault,
        isSimulationComplete: isComplete,
        ganttLog: nextGanttLog,
        isAutoPlay: nextIsAutoPlay,
        demoOverlay: nextDemoOverlay,
        logs: [...newLogs, ...state.logs]
      });
    },

    reset: () => {
      set((state) => ({
        clock: 0,
        runId: state.runId + 1,
        processes: [],
        readyQueue: [],
        runningPid: null,
        isSwitching: false,
        switchRemaining: 0,
        isPageFault: false,
        isSimulationComplete: false,
        demoOverlay: null,
        logs: [EventLogger.createEntry('SYSTEM', 'Simulation reset')],
        ganttLog: [],
      }));
      get().memoryManager.configure(get().totalMemory, get().partitionSize, get().memoryStrategy);
    },

    loadStarvationDemo: () => {
      const { reset, addProcess, createFile, writeFile, setAlgorithm } = get();
      reset();
      setAlgorithm('PRIORITY');
      
      const demos = [
        { name: 'Init', priority: 5, burst: 30, mem: 32, arrival: 0, io: false },
        { name: 'Browser', priority: 6, burst: 60, mem: 96, arrival: 0, io: false },
        { name: 'Background Service', priority: 8, burst: 80, mem: 32, arrival: 0, io: false },
      ];

      demos.forEach((d, i) => {
        const pid = `P${(i + 1).toString().padStart(3, '0')}`;
        addProcess(pid, d.name, d.priority, d.burst, d.mem, d.arrival, d.io);
      });

      // Starvation trigger: Higher priority processes arriving constantly
      addProcess('P004', 'Critical Task', 1, 20, 64, 10);
      addProcess('P005', 'System Watchdog', 2, 20, 32, 40);
      addProcess('P006', 'High Pri Worker', 1, 30, 32, 60);
      addProcess('P007', 'Interrupt Handler', 1, 20, 16, 75);

      // Create demo files
      createFile('kernel_boot.log', 'P001');
      writeFile(0, 'System boot successful. All modules initialized.');
      createFile('user_config.json', 'P002');
      
      set(s => ({
        logs: [EventLogger.createEntry('SYSTEM', 'Demo: Starvation Case loaded'), ...s.logs]
      }));
    },

    loadWaitingDemo: () => {
      const { reset, addProcess, setAlgorithm, setQuantum } = get();
      reset();
      setAlgorithm('RR');
      setQuantum(4);
      
      // Processes that will be manually or automatically put into wait states
      addProcess('P001', 'Database Sync', 4, 80, 64, 0, true);
      addProcess('P002', 'Audio Buffer', 2, 60, 32, 0, true);
      addProcess('P003', 'User UI', 3, 90, 96, 5, false);
      
      set(s => ({
        logs: [
          EventLogger.createEntry('SYSTEM', 'Demo: I/O Waiting Case loaded.'),
          EventLogger.createEntry('SYSTEM', 'Tip: Use "INTERRUPT I/O" button on running process to test WAITING state.'),
          ...s.logs
        ]
      }));
    },

    loadBalancedDemo: () => {
      const { reset, addProcess, setAlgorithm, setQuantum, setDemoOverlay } = get();
      reset();
      setAlgorithm('RR');
      setQuantum(4);
      
      addProcess('P001', 'Web Server', 5, 70, 64, 0);
      addProcess('P002', 'Cache Service', 5, 50, 32, 2);
      addProcess('P003', 'UI Engine', 5, 90, 128, 5);
      
      setDemoOverlay({
        title: "Balanced Workload",
        text: "Three standard processes using Round Robin. Notice how they share CPU time equally (Quantum = 4ms)."
      });

      set(s => ({
        logs: [EventLogger.createEntry('SYSTEM', 'Demo: Balanced Workload loaded'), ...s.logs]
      }));
    },

    loadFirstFitDemo: () => {
      const { setup, addProcess } = get();
      setup({ totalMemory: 256, partitionSize: 16, algorithm: 'RR', strategy: 'FIRST_FIT', replacementAlgo: 'FIFO', quantum: 4 });
      
      // Initial blocks
      addProcess('P001', 'Task A (Top)', 4, 4, 48, 0); // 3 blocks. Finishes at <20
      addProcess('P002', 'Sys 1', 1, 90, 16, 0);        // 1 block.
      addProcess('P003', 'Task B (Mid)', 4, 4, 32, 0); // 2 blocks. Finishes at <20
      addProcess('P004', 'Sys 2', 1, 90, 16, 0);        // 1 block.
      addProcess('P005', 'Task C (Bot)', 4, 4, 64, 0); // 4 blocks. Finishes at <20
      
      // Arrives right after P001, P003, and P005 finish.
      // Memory holes will be: [3 blocks], [P002], [2 blocks], [P004], [4 blocks] + [5 blocks unallocated].
      // Hole 3 and Unallocated combine into a 9-block hole at the bottom.
      // First Fit should place P007 in the FIRST hole (the 3-block one), leaving a 1-block fragment.
      addProcess('P007', 'New Process (Wait for t=30)', 4, 60, 32, 30);
      
      set(s => ({
        logs: [
          EventLogger.createEntry('SYSTEM', 'Demo: First Fit Strategy loaded.'),
          EventLogger.createEntry('SYSTEM', 'Tip: Watch memory at t=30! First Fit will grab the FIRST hole big enough.'),
          ...s.logs
        ]
      }));
    },

    loadBestFitDemo: () => {
      const { setup, addProcess } = get();
      setup({ totalMemory: 256, partitionSize: 16, algorithm: 'RR', strategy: 'BEST_FIT', replacementAlgo: 'FIFO', quantum: 4 });
      
      // Initial blocks
      addProcess('P001', 'Task A (Top)', 4, 4, 48, 0); // 3 blocks. Finishes at <20
      addProcess('P002', 'Sys 1', 1, 90, 16, 0);        // 1 block.
      addProcess('P003', 'Task B (Mid)', 4, 4, 32, 0); // 2 blocks. Finishes at <20
      addProcess('P004', 'Sys 2', 1, 90, 16, 0);        // 1 block.
      addProcess('P005', 'Task C (Bot)', 4, 4, 64, 0); // 4 blocks. Finishes at <20
      
      // Arrives right after P001, P003, and P005 finish.
      // Best Fit should place it in the exact-matching 2-block hole (mid), leaving the 3-block hole intact.
      addProcess('P007', 'New Process (Wait for t=30)', 4, 60, 32, 30);
      
      set(s => ({
        logs: [
          EventLogger.createEntry('SYSTEM', 'Demo: Best Fit Strategy loaded.'),
          EventLogger.createEntry('SYSTEM', 'Tip: Watch memory at t=30! Best Fit will grab the SMALLEST hole that fits exactly.'),
          ...s.logs
        ]
      }));
    },

    loadWorstFitDemo: () => {
      const { setup, addProcess } = get();
      setup({ totalMemory: 256, partitionSize: 16, algorithm: 'RR', strategy: 'WORST_FIT', replacementAlgo: 'FIFO', quantum: 4 });
      
      // Initial blocks
      addProcess('P001', 'Task A (Top)', 4, 4, 48, 0); // 3 blocks. Finishes at <20
      addProcess('P002', 'Sys 1', 1, 90, 16, 0);        // 1 block.
      addProcess('P003', 'Task B (Mid)', 4, 4, 32, 0); // 2 blocks. Finishes at <20
      addProcess('P004', 'Sys 2', 1, 90, 16, 0);        // 1 block.
      addProcess('P005', 'Task C (Bot)', 4, 4, 64, 0); // 4 blocks. Finishes at <20
      
      // Arrives right after P001, P003, and P005 finish.
      // Worst Fit should place it in the largest hole (9-block combined hole at bottom).
      addProcess('P007', 'New Process (Wait for t=30)', 4, 60, 32, 30);
      
      set(s => ({
        logs: [
          EventLogger.createEntry('SYSTEM', 'Demo: Worst Fit Strategy loaded.'),
          EventLogger.createEntry('SYSTEM', 'Tip: Watch memory at t=30! Worst Fit will grab the LARGEST hole, leaving the biggest possible leftovers.'),
          ...s.logs
        ]
      }));
    },

    triggerIO: (pid) => {
      const state = get();
      const pIdx = state.processes.findIndex(p => p.pid === pid);
      if (pIdx === -1) return;

      const processes = [...state.processes];
      const p = { ...processes[pIdx] };
      
      if (p.state === 'RUNNING') {
        p.state = 'WAITING';
        p.ioWaitTimer = state.IO_WAIT_MS;
        processes[pIdx] = p;
        
        set(s => ({
          processes,
          runningPid: null,
          isSwitching: true,
          switchRemaining: s.CONTEXT_SWITCH_MS,
          logs: [EventLogger.createEntry('SCHEDULER', `I/O Request: ${pid} moved to WAITING state`, pid), ...s.logs]
        }));
      } else {
        set(s => ({
          logs: [EventLogger.createEntry('SYSTEM', `Cannot trigger I/O for ${pid}: not in RUNNING state`), ...s.logs]
        }));
      }
    },

    getSimulationStats: () => {
      const { processes, ganttLog, clock } = get();
      const terminated = processes.filter(p => p.state === 'TERMINATED');
      
      if (terminated.length === 0) {
        return { avgWaitTime: 0, avgTurnaroundTime: 0, cpuUtilization: 0, throughput: 0 };
      }

      let totalWaitTime = 0;
      let totalTurnaroundTime = 0;

      terminated.forEach(p => {
        const tat = (p.endTime || clock) - p.arrivalTime;
        const wt = Math.max(0, tat - p.burstTime);
        totalWaitTime += wt;
        totalTurnaroundTime += tat;
      });

      const busyTime = ganttLog.reduce((acc, curr) => acc + curr.duration, 0);
      const cpuUtilization = clock > 0 ? (busyTime / clock) * 100 : 0;
      const throughput = clock > 0 ? (terminated.length / clock) * 1000 : 0; // Processes per 1000 clock cycles

      return {
        avgWaitTime: totalWaitTime / terminated.length,
        avgTurnaroundTime: totalTurnaroundTime / terminated.length,
        cpuUtilization: Math.min(100, cpuUtilization),
        throughput: parseFloat(throughput.toFixed(2))
      };
    },

    createFile: (filename, ownerPid) => {
      const res = get().fileSystem.createFile(filename, ownerPid, get().clock);
      if (typeof res === 'string') {
        set(s => ({ logs: [EventLogger.createEntry('FILESYSTEM', `Error creating file: ${res}`), ...s.logs] }));
      } else {
        set(s => ({ logs: [EventLogger.createEntry('FILESYSTEM', `File created: ${filename} (Inode ${res.id})`), ...s.logs] }));
      }
    },

    writeFile: (inodeId, content) => {
      const res = get().fileSystem.writeFile(inodeId, content);
      if (typeof res === 'string') {
        set(s => ({ logs: [EventLogger.createEntry('FILESYSTEM', `Error writing file: ${res}`), ...s.logs] }));
      } else {
        set(s => ({ logs: [EventLogger.createEntry('FILESYSTEM', `Written content to Inode ${inodeId}`), ...s.logs] }));
      }
    },

    deleteFile: (inodeId) => {
      const res = get().fileSystem.deleteFile(inodeId);
      if (res) {
        set(s => ({ logs: [EventLogger.createEntry('FILESYSTEM', `Deleted file Inode ${inodeId}`), ...s.logs] }));
      }
    },
 
    clearLogs: () => {
      set({ logs: [] });
    }
  };
});
