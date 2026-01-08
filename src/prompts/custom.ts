import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { CustomPrompt } from '../types';
import { z } from 'zod';

const CustomPromptSchema = z.object({
  name: z.string(),
  description: z.string(),
  prompt: z.string(),
  hotkey: z.string().optional(),
});

export class CustomPromptLoader {
  private promptsPath: string;

  constructor(promptsPath: string) {
    this.promptsPath = promptsPath;
    this.ensurePromptsFile();
  }

  private ensurePromptsFile(): void {
    const dir = dirname(this.promptsPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    if (!existsSync(this.promptsPath)) {
      const examplePrompts: CustomPrompt[] = [
        {
          name: 'Academic',
          description: 'Rewrite in an academic style suitable for research papers',
          prompt: 'Please rewrite the following text in an academic style suitable for research papers or scholarly articles. Use formal language, precise terminology, and maintain objectivity.',
          hotkey: 'a',
        },
        {
          name: 'Friendly',
          description: 'Make the text more friendly and casual',
          prompt: 'Please rewrite the following text to sound more friendly and casual, while maintaining the core message. Use conversational language.',
          hotkey: 'f',
        },
      ];
      writeFileSync(this.promptsPath, JSON.stringify(examplePrompts, null, 2), 'utf-8');
    }
  }

  getCustomPrompts(): CustomPrompt[] {
    try {
      const content = readFileSync(this.promptsPath, 'utf-8');
      const prompts = JSON.parse(content);
      return prompts.map((p: any) => CustomPromptSchema.parse(p));
    } catch {
      return [];
    }
  }

  getPromptByName(name: string): CustomPrompt | undefined {
    const prompts = this.getCustomPrompts();
    return prompts.find((p) => p.name.toLowerCase() === name.toLowerCase());
  }

  getPromptByHotkey(hotkey: string): CustomPrompt | undefined {
    const prompts = this.getCustomPrompts();
    return prompts.find((p) => p.hotkey === hotkey);
  }

  addPrompt(prompt: CustomPrompt): void {
    const prompts = this.getCustomPrompts();
    prompts.push(prompt);
    writeFileSync(this.promptsPath, JSON.stringify(prompts, null, 2), 'utf-8');
  }

  removePrompt(name: string): boolean {
    const prompts = this.getCustomPrompts();
    const filtered = prompts.filter((p) => p.name.toLowerCase() !== name.toLowerCase());

    if (filtered.length === prompts.length) {
      return false; // Nothing was removed
    }

    writeFileSync(this.promptsPath, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  }
}
