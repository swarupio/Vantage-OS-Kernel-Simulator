/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MemoryPartition, AllocationStrategy, ReplacementAlgorithm } from '../types/simulation.types';

export class MemoryManager {
  private partitions: MemoryPartition[] = [];
  private strategy: AllocationStrategy = 'FIRST_FIT';
  private replacementAlgorithm: ReplacementAlgorithm = 'FIFO';
  private pageFaultCount: number = 0;
  
  // Track order for replacement
  private accessLog: { pid: string, timestamp: number }[] = [];
  private arrivalLog: { pid: string, timestamp: number }[] = [];

  constructor(totalMemory: number, partitionSize: number, strategy: AllocationStrategy = 'FIRST_FIT') {
    this.configure(totalMemory, partitionSize, strategy);
  }

  configure(totalMemory: number, partitionSize: number, strategy: AllocationStrategy, replacementAlgo: ReplacementAlgorithm = 'FIFO') {
    this.strategy = strategy;
    this.replacementAlgorithm = replacementAlgo;
    const count = Math.floor(totalMemory / partitionSize);
    this.partitions = Array.from({ length: count }, (_, i) => ({
      id: i,
      size: partitionSize,
      free: true,
      owner: null,
    }));
  }

  setStrategy(strategy: AllocationStrategy) {
    this.strategy = strategy;
  }

  setReplacementAlgorithm(algo: ReplacementAlgorithm) {
    this.replacementAlgorithm = algo;
  }

  allocate(pid: string, memRequired: number, clock: number): { blocks: number[], fault: boolean } | null {
    const partitionsNeeded = Math.ceil(memRequired / this.partitions[0].size);
    
    let blocks = this.tryAllocate(pid, partitionsNeeded);
    let fault = false;

    if (!blocks) {
      // Memory full or fragmented, trigger replacement
      fault = true;
      this.pageFaultCount++;
      const replacedPids = this.findProcessesToReplace(partitionsNeeded);
      
      if (replacedPids.length > 0) {
        replacedPids.forEach(p => this.free(p));
        blocks = this.tryAllocate(pid, partitionsNeeded);
      }
    }

    if (blocks) {
      this.arrivalLog.push({ pid, timestamp: clock });
      this.accessLog = this.accessLog.filter(a => a.pid !== pid);
      this.accessLog.push({ pid, timestamp: clock });
      return { blocks, fault };
    }

    return null;
  }

  private tryAllocate(pid: string, needed: number): number[] | null {
    if (this.strategy === 'FIRST_FIT') {
      return this.allocateFirstFit(pid, needed);
    } else {
      return this.allocateBestFit(pid, needed);
    }
  }

  private findProcessesToReplace(needed: number): string[] {
    const activeProcesses = [...new Set(this.partitions.filter(p => !p.free).map(p => p.owner as string))];
    if (activeProcesses.length === 0) return [];

    if (this.replacementAlgorithm === 'FIFO') {
      // Sort by arrival time
      const sorted = this.arrivalLog
        .filter(a => activeProcesses.includes(a.pid))
        .sort((a, b) => a.timestamp - b.timestamp);
      
      return this.greedySelect(sorted.map(s => s.pid), needed);
    } else {
      // LRU: Sort by last access time
      const sorted = this.accessLog
        .filter(a => activeProcesses.includes(a.pid))
        .sort((a, b) => a.timestamp - b.timestamp);
      
      return this.greedySelect(sorted.map(s => s.pid), needed);
    }
  }

  private greedySelect(pids: string[], needed: number): string[] {
    const selected: string[] = [];
    let freedPartitions = 0;
    
    for (const pid of pids) {
      const count = this.getProcessPartitionCount(pid);
      selected.push(pid);
      freedPartitions += count;
      if (freedPartitions >= needed) break;
    }
    
    return selected;
  }

  private getProcessPartitionCount(pid: string): number {
    return this.partitions.filter(p => p.owner === pid).length;
  }

  private allocateFirstFit(pid: string, needed: number): number[] | null {
    let contiguousFound = 0;
    let startIdx = -1;

    for (let i = 0; i < this.partitions.length; i++) {
      if (this.partitions[i].free) {
        if (startIdx === -1) startIdx = i;
        contiguousFound++;
        if (contiguousFound === needed) {
          const indices = [];
          for (let j = startIdx; j < startIdx + needed; j++) {
            this.partitions[j].free = false;
            this.partitions[j].owner = pid;
            indices.push(j);
          }
          return indices;
        }
      } else {
        contiguousFound = 0;
        startIdx = -1;
      }
    }
    return null;
  }

  private allocateBestFit(pid: string, needed: number): number[] | null {
    // Find all free blocks and choose the ones that leave the smallest leftover if we were doing dynamic,
    // but here it's fixed partitions, so "Best Fit" usually refers to finding the smallest free chunk 
    // that fits the request. In fixed partition with contiguous requirement, it's about finding the 
    // block of free partitions that is closest in size to 'needed'.
    
    let bestStart = -1;
    let minGap = Infinity;

    let currentStart = -1;
    let currentLen = 0;

    for (let i = 0; i <= this.partitions.length; i++) {
      if (i < this.partitions.length && this.partitions[i].free) {
        if (currentStart === -1) currentStart = i;
        currentLen++;
      } else {
        if (currentStart !== -1) {
          if (currentLen >= needed) {
            const gap = currentLen - needed;
            if (gap < minGap) {
              minGap = gap;
              bestStart = currentStart;
            }
          }
          currentStart = -1;
          currentLen = 0;
        }
      }
    }

    if (bestStart !== -1) {
      const indices = [];
      for (let j = bestStart; j < bestStart + needed; j++) {
        this.partitions[j].free = false;
        this.partitions[j].owner = pid;
        indices.push(j);
      }
      return indices;
    }

    return null;
  }

  free(pid: string) {
    this.partitions.forEach(p => {
      if (p.owner === pid) {
        p.free = true;
        p.owner = null;
      }
    });
  }

  getMap(): MemoryPartition[] {
    return [...this.partitions];
  }

  getStats() {
    const total = this.partitions.length * this.partitions[0].size;
    const used = this.partitions.filter(p => !p.free).length * this.partitions[0].size;
    const free = total - used;
    
    // Fragmentation calculation: ratio of free blocks to total possible free space in non-contiguous chunks?
    // Let's use a simpler one: % of total memory that is free but potentially fragmented.
    // Or just count the number of free "holes".
    let holes = 0;
    let inHole = false;
    for (const p of this.partitions) {
      if (p.free && !inHole) {
        holes++;
        inHole = true;
      } else if (!p.free) {
        inHole = false;
      }
    }
    
    const fragmentation = total === 0 ? 0 : (holes > 1 ? (free / total) * 100 : 0);

    return { total, used, free, fragmentation: Math.round(fragmentation), pageFaults: this.pageFaultCount };
  }
}
