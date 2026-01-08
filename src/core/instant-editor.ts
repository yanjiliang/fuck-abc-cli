import readline from 'readline';
import { stdin as input, stdout as output } from 'process';
import chalk from 'chalk';
import clipboardy from 'clipboardy';
import { Optimizer } from './optimizer';
import { HistoryLogger } from '../history/logger';
import { TranslationPromptLoader } from '../prompts/translation-prompt';
import { YAMLPromptLoader } from '../prompts/yaml-prompt';
import { displayError } from '../utils/display';

export class InstantEditor {
  private optimizer: Optimizer;
  private historyLogger?: HistoryLogger;
  private promptLoader: TranslationPromptLoader;
  private yamlPromptLoader?: YAMLPromptLoader;
  private useYAMLPrompt: boolean = false;
  private rl: readline.Interface;
  private currentText: string = '';
  private pendingLines: string[] = [];

  constructor(optimizer: Optimizer, historyLogger?: HistoryLogger, promptPath?: string) {
    this.optimizer = optimizer;
    this.historyLogger = historyLogger;
    this.promptLoader = new TranslationPromptLoader(promptPath);

    // Check for YAML prompt
    this.yamlPromptLoader = new YAMLPromptLoader(promptPath);
    this.useYAMLPrompt = this.yamlPromptLoader.hasYAMLPrompt();

    if (this.useYAMLPrompt) {
      console.log(
        chalk.cyan(
          '✓ Using YAML prompt configuration from: ' + this.yamlPromptLoader.getPromptPath()
        )
      );
    }

    this.rl = readline.createInterface({
      input,
      output,
      terminal: true,
      prompt: '> ',
    });
  }

  async start(): Promise<void> {
    this.displayWelcome();
    this.displayInstructions();

    console.log(chalk.cyan('\n✨ Ready! Start typing...\n'));

    this.rl.prompt();

    this.rl.on('line', async (line) => {
      if (line.trim() === '') {
        // Empty line - trigger optimization
        if (this.pendingLines.length > 0) {
          await this.translateAndOptimize();
        } else {
          this.rl.prompt();
        }
        return;
      }

      // Accumulate text
      this.pendingLines.push(line);
      this.currentText = this.pendingLines.join('\n');

      console.log(
        chalk.gray(
          `  ✓ Line ${this.pendingLines.length} added. Press Enter (empty line) to optimize`
        )
      );
      this.rl.prompt();
    });

    this.rl.on('SIGINT', () => {
      console.log('\n\n' + chalk.gray('─'.repeat(60)));
      console.log(chalk.cyan('\n👋 Goodbye!\n'));
      this.close();
      process.exit(0);
    });
  }

  private async translateAndOptimize(): Promise<void> {
    const fullText = this.currentText.trim() || this.pendingLines.join('\n').trim();

    if (!fullText) {
      console.log(chalk.yellow('\n⚠️  No text to optimize. Type something first!\n'));
      this.rl.prompt();
      return;
    }

    try {
      console.log(chalk.cyan('\n🔄 Translating and optimizing...\n'));

      let result: string;

      if (this.useYAMLPrompt && this.yamlPromptLoader) {
        // Use YAML prompt
        const prompt = this.yamlPromptLoader.buildPrompt(fullText);
        result = await this.optimizer.provider.generateWithPrompt(prompt);
      } else {
        // Use text-based prompt
        const promptTemplate = this.promptLoader.getPrompt();
        const prompt = promptTemplate.replace('{text}', fullText);
        result = await this.optimizer.provider.generateWithPrompt(prompt);
      }

      // Show bilingual comparison
      this.displayBilingualResult(fullText, result);

      // Clear pending lines for next input
      this.pendingLines = [];
      this.currentText = '';

      console.log(chalk.cyan('\n✨ Ready for next input!\n'));
      this.rl.prompt();
    } catch (error) {
      displayError(error as Error);
      console.log(chalk.cyan('\nContinue typing...\n'));
      this.rl.prompt();
    }
  }

  private displayBilingualResult(original: string, optimized: string): void {
    console.log(chalk.gray('\n' + '═'.repeat(70)));

    console.log(chalk.cyan.bold('\n📝 中英文对照 / Bilingual Comparison:\n'));

    console.log(chalk.yellow('Original / 原文:'));
    console.log(chalk.gray(original));

    console.log(chalk.green('\nOptimized English / 优化后的英文:'));
    console.log(chalk.white.bold(optimized));

    console.log(chalk.gray('\n' + '═'.repeat(70)));

    // Copy to clipboard
    try {
      clipboardy.writeSync(optimized);
      console.log(chalk.green.bold('\n✓ 已复制到剪贴板 / Copied to clipboard!\n'));
    } catch {
      console.log(chalk.yellow('\n⚠️  剪贴板复制失败 / Failed to copy to clipboard\n'));
    }

    // Save to history
    if (this.historyLogger) {
      this.historyLogger.addEntry({
        original,
        optimized,
        mode: 'professional' as any,
        timestamp: new Date(),
        provider: 'Translation',
        model: 'Bilingual',
      } as any);
    }
  }

  private displayWelcome(): void {
    console.log(chalk.cyan.bold('\n🚀 English Optimizer CLI - 中英文优化模式\n'));
  }

  private displayInstructions(): void {
    console.log(chalk.white.bold('使用说明 / How to use:'));
    console.log(
      chalk.gray('1. 输入你的内容（中文或英文）/ Type your content (Chinese or English)')
    );
    console.log(chalk.gray('2. 每行结束后按 Enter / Press Enter after each line'));
    console.log(chalk.white('3. 输入完成后，按 ' + chalk.cyan.bold('Enter (空行)') + ' 触发优化'));
    console.log(
      chalk.white(
        '   When done, press ' + chalk.cyan.bold('Enter (empty line)') + ' to translate & optimize'
      )
    );
    console.log(chalk.gray('4. 查看中英文对照结果 / See bilingual result'));
    console.log(
      chalk.green('5. 优化后的英文会自动复制到剪贴板 / Optimized English auto-copied to clipboard')
    );
    console.log(chalk.yellow('\n提示词配置 / Prompt Config:'));
    console.log(chalk.gray(`   编辑自定义提示词: ${this.promptLoader.getPromptPath()}`));
    console.log(chalk.gray('   Edit custom prompt: ' + this.promptLoader.getPromptPath()));
    console.log(chalk.yellow('\n其他 / Other:'));
    console.log(chalk.gray('   Ctrl+C - 退出 / Quit\n'));
  }

  close(): void {
    this.rl.close();
  }
}
