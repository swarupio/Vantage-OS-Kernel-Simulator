/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inode } from '../types/simulation.types';

export class FileSystem {
  private inodes: Inode[] = [];
  private dataBlocks: boolean[] = new Array(64).fill(false); // 64 blocks, true = used
  private maxInodes = 16;
  private blockSize = 512; // bytes

  createFile(filename: string, ownerPid: string, virtualTime: number): Inode | string {
    if (this.inodes.length >= this.maxInodes) {
      return 'INODE_TABLE_FULL';
    }
    if (this.inodes.find(f => f.filename === filename)) {
      return 'DUPLICATE_FILENAME';
    }

    const newInode: Inode = {
      id: this.inodes.length,
      filename,
      size: 0,
      blocks: [],
      ownerPid,
      createdAt: virtualTime,
      content: '',
    };

    this.inodes.push(newInode);
    return newInode;
  }

  writeFile(inodeId: number, content: string): boolean | string {
    const inode = this.inodes.find(i => i.id === inodeId);
    if (!inode) return false;

    // Release old blocks
    inode.blocks.forEach(b => {
      this.dataBlocks[b] = false;
    });
    inode.blocks = [];

    const sizeInBytes = new Blob([content]).size;
    const blocksNeeded = Math.ceil(sizeInBytes / this.blockSize) || 1;

    // Find free blocks
    const freeIndices: number[] = [];
    for (let i = 0; i < this.dataBlocks.length; i++) {
      if (!this.dataBlocks[i]) {
        freeIndices.push(i);
        if (freeIndices.length === blocksNeeded) break;
      }
    }

    if (freeIndices.length < blocksNeeded) {
      return 'NO_FREE_BLOCKS';
    }

    // Allocate
    freeIndices.forEach(idx => {
      this.dataBlocks[idx] = true;
    });
    inode.blocks = freeIndices;
    inode.size = sizeInBytes;
    inode.content = content;

    return true;
  }

  readFile(inodeId: number): string | null {
    const inode = this.inodes.find(i => i.id === inodeId);
    return inode ? inode.content : null;
  }

  deleteFile(inodeId: number): boolean {
    const index = this.inodes.findIndex(i => i.id === inodeId);
    if (index === -1) return false;

    const inode = this.inodes[index];
    inode.blocks.forEach(b => {
      this.dataBlocks[b] = false;
    });

    this.inodes.splice(index, 1);
    return true;
  }

  getDirectory(): Inode[] {
    return [...this.inodes];
  }

  getBlockBitmap(): boolean[] {
    return [...this.dataBlocks];
  }
}
