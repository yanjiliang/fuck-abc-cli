import chalk from 'chalk';
import { diffLines } from 'diff';
import { OptimizationMode } from '../types';
import { getModeInfo } from '../prompts/templates';

export function displayWelcome(): void {
  console.log(chalk.cyan.bold('\n🚀 English Optimizer CLI\n'));
}

export function displayModeInfo(mode: OptimizationMode): void {
  const modeInfo = getModeInfo(mode);
  console.log(chalk.yellow(`\n[${modeInfo.name} Mode]`));
  console.log(chalk.gray(modeInfo.description));
}

export function displayOptimization(original: string, optimized: string): void {
  displaySeparator();
  displayOriginalAndOptimized(original, optimized);
  displaySeparator();
}

export function displayDiff(original: string, optimized: string): void {
  const differences = diffLines(original, optimized);

  differences.forEach((part) => {
    const color = part.added ? chalk.green : part.removed ? chalk.red : chalk.gray;
    const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
    process.stdout.write(color(prefix + part.value));
  });

  console.log();
}

export function displayError(error: Error | string): void {
  const message = typeof error === 'string' ? error : error.message;
  console.log(chalk.red('\n❌ Error:'), chalk.white(message));
}

export function displaySuccess(message: string): void {
  console.log(chalk.green('\n✅'), chalk.white(message));
}

export function displayInfo(message: string): void {
  console.log(chalk.cyan('\nℹ️'), chalk.white(message));
}

export function displayHelp(): void {
  console.log(chalk.cyan('\n📖 Hotkeys:\n'));
  console.log(chalk.gray('  Ctrl+P - Professional tone'));
  console.log(chalk.gray('  Ctrl+C - Concise version'));
  console.log(chalk.gray('  Ctrl+G - Grammar fix'));
  console.log(chalk.gray('  Ctrl+D - Senior developer style'));
  console.log(chalk.gray('  Ctrl+R - Reset to original'));
  console.log(chalk.gray('  Ctrl+H - View history'));
  console.log(chalk.gray('  Ctrl+Q - Quit\n'));
}

export function displayHistoryEntry(entry: {
  id: string;
  original: string;
  optimized: string;
  mode: OptimizationMode;
  timestamp: Date;
}): void {
  displaySeparator();
  console.log(chalk.cyan(`\nID: ${entry.id}`));
  console.log(chalk.gray(`Time: ${entry.timestamp.toLocaleString()}`));
  console.log(chalk.yellow(`Mode: ${getModeInfo(entry.mode).name}`));
  displayOriginalAndOptimized(entry.original, entry.optimized);
  displaySeparator();
}

// Helper functions
function displaySeparator(): void {
  console.log(chalk.gray('\n' + '─'.repeat(60)));
}

function displayOriginalAndOptimized(original: string, optimized: string): void {
  console.log(chalk.red('\n❌ Original:'));
  console.log(chalk.gray(original));
  console.log(chalk.green('\n✅ Optimized:'));
  console.log(chalk.white(optimized));
}
