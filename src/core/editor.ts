import readline from 'readline';
import { stdin as input, stdout as output } from 'process';
import chalk from 'chalk';
import { OptimizationMode } from '../types';
import { Optimizer } from './optimizer';
import { displayWelcome, displayModeInfo, displayOptimization, displayHelp, displayHistoryEntry, displayError, displayInfo, displaySuccess } from '../utils/display';
import { HistoryLogger } from '../history/logger';
import { CustomPromptLoader } from '../prompts/custom';
import { configManager } from '../config/config';

export class InteractiveEditor {
  private optimizer: Optimizer;
  private historyLogger?: HistoryLogger;
  private customPromptLoader?: CustomPromptLoader;
  private currentText: string = '';
  private rl: readline.Interface;

  constructor(optimizer: Optimizer, historyLogger?: HistoryLogger, customPromptLoader?: CustomPromptLoader) {
    this.optimizer = optimizer;
    this.historyLogger = historyLogger;
    this.customPromptLoader = customPromptLoader;

    this.rl = readline.createInterface({
      input,
      output,
    });
  }

  async start(): Promise<void> {
    displayWelcome();
    displayHelp();

    console.log('\nEnter your text (press Enter twice to finish):\n');

    // Read multi-line input
    const lines: string[] = [];
    let emptyLineCount = 0;

    while (true) {
      const line = await this.question('');
      lines.push(line);

      if (line.trim() === '') {
        emptyLineCount++;
        if (emptyLineCount >= 1) {
          break;
        }
      } else {
        emptyLineCount = 0;
      }
    }

    this.currentText = lines.join('\n').trim();

    if (!this.currentText) {
      displayInfo('No text provided. Exiting...');
      this.rl.close();
      return;
    }

    await this.runOptimizationLoop();
  }

  private async runOptimizationLoop(): Promise<void> {
    const config = configManager.getConfig();

    while (true) {
      console.log('\n' + '═'.repeat(60));
      console.log(chalk.cyan('Current text:'));
      console.log(chalk.gray(this.currentText));
      console.log('═'.repeat(60));

      console.log(chalk.yellow('\nPress a hotkey (or Ctrl+Q to quit):'));

      // Use raw mode to capture single keypress
      const key = await this.captureKeypress();

      if (key === '\u0003' || key === 'q') {
        // Ctrl+C or q
        console.log('\n\nGoodbye! 👋\n');
        break;
      } else if (key === 'r') {
        // Reset
        console.log(chalk.yellow('\n↺ Reset to original'));
        continue;
      } else if (key === 'h') {
        // History
        await this.showHistory();
        continue;
      } else if (key === 'p') {
        // Professional
        await this.performOptimization(OptimizationMode.PROFESSIONAL);
      } else if (key === 'c') {
        // Concise
        await this.performOptimization(OptimizationMode.CONCISE);
      } else if (key === 'g') {
        // Grammar
        await this.performOptimization(OptimizationMode.GRAMMAR);
      } else if (key === 'd') {
        // Senior Developer
        await this.performOptimization(OptimizationMode.SENIOR_DEVELOPER);
      } else if (this.customPromptLoader && config.features.enableCustomPrompts) {
        // Check for custom prompt hotkeys
        const customPrompt = this.customPromptLoader.getPromptByHotkey(key);
        if (customPrompt) {
          await this.performCustomOptimization(customPrompt);
          continue;
        }
      }
    }

    this.rl.close();
  }

  private async performOptimization(mode: OptimizationMode): Promise<void> {
    try {
      displayModeInfo(mode);
      console.log(chalk.gray('Optimizing...'));

      const result = await this.optimizer.optimize(this.currentText, mode);

      displayOptimization(result.original, result.optimized);

      // Ask if user wants to use the optimized version
      const accept = await this.question('\nUse this version? (y/n): ');

      if (accept.toLowerCase() === 'y') {
        this.currentText = result.optimized;
        displaySuccess('Text updated!');
      }
    } catch (error) {
      displayError(error as Error);
    }
  }

  private async performCustomOptimization(customPrompt: any): Promise<void> {
    try {
      console.log(chalk.yellow(`\n[${customPrompt.name}]`));
      console.log(chalk.gray(customPrompt.description));
      console.log(chalk.gray('Optimizing...'));

      // For custom prompts, we'd need to extend the provider
      // For now, this is a placeholder
      displayInfo('Custom prompts will be implemented soon!');
    } catch (error) {
      displayError(error as Error);
    }
  }

  private async showHistory(): Promise<void> {
    if (!this.historyLogger) {
      displayInfo('History is disabled.');
      return;
    }

    const history = this.historyLogger.getRecentEntries(5);

    if (history.length === 0) {
      displayInfo('No history yet.');
      return;
    }

    console.log(chalk.cyan('\n📜 Recent Optimizations:\n'));

    for (const entry of history) {
      displayHistoryEntry(entry);
    }
  }

  private question(query: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(query, (answer) => {
        resolve(answer);
      });
    });
  }

  private captureKeypress(): Promise<string> {
    return new Promise((resolve) => {
      const originalRawMode = (input as any).isRaw;

      input.setRawMode(true);
      input.resume();

      input.once('data', (key: Buffer) => {
        input.setRawMode(originalRawMode);
        input.pause();
        input.removeAllListeners('data');

        const str = key.toString('utf8');
        resolve(str);
      });
    });
  }

  close(): void {
    this.rl.close();
  }
}
