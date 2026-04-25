/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { v4 as uuidv4 } from 'uuid';
import { LogEntry, LogModule } from '../types/simulation.types';

export class EventLogger {
  static createEntry(module: LogModule, message: string, pid?: string): LogEntry {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}`;

    return {
      id: uuidv4(),
      timestamp,
      module,
      pid,
      message,
    };
  }
}
