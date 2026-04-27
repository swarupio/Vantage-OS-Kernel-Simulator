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
  
  // Simulation State
  clock: number;
  processes: PCB[];
  readyQueue: string[]; // PIDs
  runningPid: string | null;
  isSwitching: boolean;
  switchRemaining: number;
  isPageFault: boolean;
  compactMode: boolean;
  logs: LogEntry[];
  ganttLog: GanttEntry[];
  
  // Constants
  CONTEXT_SWITCH_MS: number;
  IO_WAIT_MS: number;
  
  // Engine Instances (Internal)
  memoryManager: MemoryManager;
  fileSystem: FileSystem;

  speed: number;
  
  // Actions
  setup: (config: { totalMemory: number, partitionSize: number, algorithm: SchedulingAlgorithm, strategy: AllocationStrategy, quantum: number, replacementAlgo: ReplacementAlgorithm }) => void;
  setAlgorithm: (algorithm: SchedulingAlgorithm) => void;
  setMemoryStrategy: (strategy: AllocationStrategy) => void;
  setQuantum: (q: number) => void;
  setReplacementAlgorithm: (algo: ReplacementAlgorithm) => void;
  setSpeed: (speed: number) => void;
  addProcess: (pid: string, name: string, priority: number, burstTime: number, memRequired: number, arrivalTime?: number) => boolean;
  step: () => void;
  reset: () => void;
  loadDemo: () => void;
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

    clock: 0,
    processes: [],
    readyQueue: [],
    runningPid: null,
    isSwitching: false,
    switchRemaining: 0,
    isPageFault: false,
    compactMode: false,
    logs: [],
    ganttLog: [],
    speed: 1,

    CONTEXT_SWITCH_MS: 2,
    IO_WAIT_MS: 10,

    memoryManager,
    fileSystem,

    setup: (config) => {
      const memMgr = new MemoryManager(config.totalMemory, config.partitionSize, config.strategy);
      memMgr.setReplacementAlgorithm(config.replacementAlgo);
      set({
        ...config,
        memoryManager: memMgr,
        clock: 0,
        processes: [],
        readyQueue: [],
        runningPid: null,
        isSwitching: false,
        switchRemaining: 0,
        isPageFault: false,
        logs: [EventLogger.createEntry('SYSTEM', `Simulation setup: ${config.algorithm}, ${config.strategy}, ${config.replacementAlgo}`)],
        ganttLog: [],
      });
    },

    setAlgorithm: (algorithm) => {
      set((s) => ({ 
        algorithm,
        logs: [EventLogger.createEntry('SYSTEM', `Switched scheduler to ${algorithm}`), ...s.logs]
      }));
    },

    setMemoryStrategy: (memoryStrategy) => {
      get().memoryManager.configure(get().totalMemory, get().partitionSize, memoryStrategy, get().replacementAlgorithm);
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

    setReplacementAlgorithm: (replacementAlgorithm) => {
      get().memoryManager.setReplacementAlgorithm(replacementAlgorithm);
      set((s) => ({
        replacementAlgorithm,
        logs: [EventLogger.createEntry('SYSTEM', `Switched replacement to ${replacementAlgorithm}`), ...s.logs]
      }));
    },

    setSpeed: (speed) => set({ speed }),

    addProcess: (pid, name, priority, burstTime, memRequired, arrivalTime) => {
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
      };

      set((s) => ({
        processes: [...s.processes, newProcess],
        logs: [EventLogger.createEntry('PROCESS', `${pid} created and state: NEW`, pid), ...s.logs]
      }));

      return true;
    },

    step: () => {
      const state = get();
      const { algorithm, quantum, clock, readyQueue, runningPid, processes, ganttLog, isSwitching, switchRemaining, CONTEXT_SWITCH_MS, IO_WAIT_MS } = state;
      
      let nextClock = clock;
      let nextReadyQueue = [...readyQueue];
      let nextRunningPid = runningPid;
      let nextProcesses = processes.map(p => ({ ...p }));
      let nextGanttLog = [...ganttLog];
      let nextIsSwitching = isSwitching;
      let nextSwitchRemaining = switchRemaining;
      let nextIsPageFault = false;
      let newLogs: LogEntry[] = [];

      // 0. Handle Arrival of Processes
      nextProcesses.forEach(p => {
        if (p.state === 'NEW' && clock >= p.arrivalTime) {
          p.state = 'READY';
          nextReadyQueue.push(p.pid);
          newLogs.push(EventLogger.createEntry('SCHEDULER', `Process ${p.pid} arrived and moved to READY queue.`, p.pid));
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
            newLogs.push(EventLogger.createEntry('SCHEDULER', `I/O Complete: ${p.pid} moved to READY`, p.pid));
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
          newLogs.push(EventLogger.createEntry('SYSTEM', 'Context switch complete. CPU ready.', 'KERNEL'));
        } else {
          set({
            clock: nextClock,
            processes: nextProcesses,
            readyQueue: nextReadyQueue,
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
        
        const runTime = algorithm === 'RR' ? Math.min(p.remainingTime, 1) : 1; 
        p.remainingTime -= runTime;
        runTimePassed = runTime;
        nextClock += runTime;

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
          newLogs.push(EventLogger.createEntry('SCHEDULER', `${p.pid} finished. Entering context switch...`, p.pid));
          
          nextIsSwitching = true;
          nextSwitchRemaining = CONTEXT_SWITCH_MS;
          // Look ahead for next target if possible
          if (nextReadyQueue.length > 0) {
            set({ nextContextPid: nextReadyQueue[0] });
          }
        } else if (algorithm === 'RR' && (nextClock % quantum === 0)) {
          p.state = 'READY';
          nextReadyQueue.push(p.pid);
          nextRunningPid = null;
          newLogs.push(EventLogger.createEntry('SCHEDULER', `${p.pid} quantum expired. Entering context switch...`, p.pid));
          
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
            newLogs.push(EventLogger.createEntry('SCHEDULER', `Aging: ${p.pid} priority improved to ${p.priority}`, p.pid));
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
              newLogs.push(EventLogger.createEntry('MEMORY', `Page Fault! Replaced pages to fit ${p.pid}`, p.pid));
            }
          } else {
            // Should theoretically not happen with replacement unless process itself > total memory
            newLogs.push(EventLogger.createEntry('MEMORY', `Critical Memory Error: Cannot fit ${p.pid} even after replacement`, p.pid));
            // Rotate the queue
            nextReadyQueue.push(nextReadyQueue.splice(selectedIdx, 1)[0]);
            set({ clock: nextClock, logs: [...newLogs, ...state.logs] });
            return;
          }
        }

        nextRunningPid = nextReadyQueue.splice(selectedIdx, 1)[0];
        p.state = 'RUNNING';
        if (p.startTime === undefined) p.startTime = nextClock - runTimePassed;
        newLogs.push(EventLogger.createEntry('SCHEDULER', `Dispatched ${p.pid}`, p.pid));
        set({ nextContextPid: null });
      }

      set({
        clock: nextClock,
        processes: nextProcesses,
        readyQueue: nextReadyQueue,
        runningPid: nextRunningPid,
        isSwitching: nextIsSwitching,
        switchRemaining: nextSwitchRemaining,
        isPageFault: nextIsPageFault,
        ganttLog: nextGanttLog,
        logs: [...newLogs, ...state.logs]
      });
    },

    reset: () => {
      set({
        clock: 0,
        processes: [],
        readyQueue: [],
        runningPid: null,
        logs: [EventLogger.createEntry('SYSTEM', 'Simulation reset')],
        ganttLog: [],
      });
      get().memoryManager.configure(get().totalMemory, get().partitionSize, get().memoryStrategy);
    },

    loadDemo: () => {
      const { reset, addProcess, createFile, writeFile } = get();
      reset();
      
      const demos = [
        { name: 'Init', priority: 5, burst: 50, mem: 32, arrival: 0 },
        { name: 'Browser', priority: 6, burst: 100, mem: 96, arrival: 0 },
        { name: 'Background Service', priority: 8, burst: 200, mem: 32, arrival: 0 },
      ];

      demos.forEach((d, i) => {
        const pid = `P${(i + 1).toString().padStart(3, '0')}`;
        addProcess(pid, d.name, d.priority, d.burst, d.mem, d.arrival);
      });

      // Starvation trigger: Higher priority processes arriving constantly
      addProcess('P004', 'Critical Task', 1, 20, 64, 10);
      addProcess('P005', 'System Watchdog', 2, 20, 32, 40);

      // Create demo files
      createFile('kernel_boot.log', 'P001');
      writeFile(0, 'System boot successful. All modules initialized.');
      createFile('user_config.json', 'P002');
      
      set(s => ({
        logs: [EventLogger.createEntry('SYSTEM', 'Demo environment (Starvation Case) loaded'), ...s.logs]
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
