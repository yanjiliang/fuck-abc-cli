import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { HistoryEntry, OptimizationResult } from '../types';

export class HistoryLogger {
  private historyPath: string;

  constructor(historyPath: string) {
    this.historyPath = historyPath;
    this.ensureHistoryFile();
  }

  private ensureHistoryFile(): void {
    const dir = dirname(this.historyPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    if (!existsSync(this.historyPath)) {
      writeFileSync(this.historyPath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  addEntry(result: OptimizationResult): HistoryEntry {
    const history = this.getHistory();
    const entry: HistoryEntry = {
      ...result,
      id: uuidv4(),
    };

    history.unshift(entry); // Add to the beginning

    // Keep only the last 100 entries
    if (history.length > 100) {
      history.pop();
    }

    writeFileSync(this.historyPath, JSON.stringify(history, null, 2), 'utf-8');
    return entry;
  }

  getHistory(): HistoryEntry[] {
    try {
      const content = readFileSync(this.historyPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  clearHistory(): void {
    writeFileSync(this.historyPath, JSON.stringify([], null, 2), 'utf-8');
  }

  getEntryById(id: string): HistoryEntry | undefined {
    const history = this.getHistory();
    return history.find((entry) => entry.id === id);
  }

  getRecentEntries(count: number = 10): HistoryEntry[] {
    const history = this.getHistory();
    return history.slice(0, count);
  }
}
