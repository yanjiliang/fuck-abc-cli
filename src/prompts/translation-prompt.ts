import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

export class TranslationPromptLoader {
  private promptPath: string;

  constructor(promptPath?: string) {
    this.promptPath = promptPath || join(homedir(), '.english-optimizer', 'translation-prompt.txt');
  }

  getPrompt(): string {
    if (existsSync(this.promptPath)) {
      try {
        return readFileSync(this.promptPath, 'utf-8');
      } catch {
        // Fall back to default
        return this.getDefaultPrompt();
      }
    }

    // Create default prompt file
    this.createDefaultPromptFile();
    return this.getDefaultPrompt();
  }

  private getDefaultPrompt(): string {
    return `You are a professional translator and editor for software developers.

Your task is to:
1. Detect if the text is Chinese or English
2. If Chinese: Translate to natural, professional English
3. If English: Optimize the English to be more natural and professional
4. Use terminology and phrasing common in software development
5. Make it sound like a native English-speaking developer
6. Preserve technical terms, API names, and code snippets
7. For multi-line text, maintain the paragraph structure

Text to process:
"{text}"

Provide ONLY the translated/optimized English text, nothing else.
Do not include any explanations, notes, or additional text.`;
  }

  private createDefaultPromptFile(): void {
    const dir = dirname(this.promptPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(this.promptPath, this.getDefaultPrompt(), 'utf-8');
  }

  getPromptPath(): string {
    return this.promptPath;
  }
}
