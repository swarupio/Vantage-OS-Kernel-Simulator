/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProcessState = 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED';

export interface PCB {
  pid: string; // e.g. 'P001'
  name: string;
  state: ProcessState;
  priority: number; // 1 (highest) to 10 (lowest)
  arrivalTime: number; // virtual ms
  burstTime: number; // total CPU time required (ms)
  remainingTime: number; // decremented by scheduler
  memRequired: number; // MB
  allocatedBlocks: number[]; // memory partition indices
  createdAt: number; // real timestamp (Date.now())
  startTime?: number; // first dispatch time
  endTime?: number; // termination time
  waitingTime: number; // accumulated time in READY state
  ioWaitTimer?: number; // remaining virtual ms in WAITING state
}

export interface MemoryPartition {
  id: number; // partition index 0..N-1
  size: number; // MB per partition
  free: boolean;
  owner: string | null; // PID or null
}

export interface Inode {
  id: number; // inode number 0..15
  filename: string;
  size: number; // bytes
  blocks: number[]; // data block indices
  ownerPid: string;
  createdAt: number; // virtual clock ms
  content: string; // in-memory file content
}

export interface GanttEntry {
  pid: string | 'SWITCHING';
  startTime: number;
  endTime: number;
  duration: number;
  algorithm: SchedulingAlgorithm;
}

export type LogModule = 'PROCESS' | 'SCHEDULER' | 'MEMORY' | 'FILESYSTEM' | 'SYSTEM';

export interface LogEntry {
  id: string; // uuid
  timestamp: string; // HH:MM:SS.mmm
  module: LogModule;
  pid?: string;
  message: string;
}

export interface SimulationStats {
  avgWaitTime: number;
  avgTurnaroundTime: number;
  cpuUtilization: number;
  throughput: number; // processes per 100ms or 1s
}

export interface MemoryStats {
  total: number;
  used: number;
  free: number;
  fragmentation: number;
  pageFaults: number;
}

export type AllocationStrategy = 'FIRST_FIT' | 'BEST_FIT';
export type ReplacementAlgorithm = 'FIFO' | 'LRU';
export type SchedulingAlgorithm = 'RR' | 'PRIORITY' | 'SJF';
