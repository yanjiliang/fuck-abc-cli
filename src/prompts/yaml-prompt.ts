import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import type { YAMLPromptConfig } from '../types';

export class YAMLPromptLoader {
  private promptPath: string;

  constructor(promptPath?: string) {
    this.promptPath = promptPath || join(process.cwd(), 'prompt.yaml');
  }

  loadConfig(): YAMLPromptConfig | null {
    if (!existsSync(this.promptPath)) {
      return null;
    }

    try {
      const content = readFileSync(this.promptPath, 'utf-8');
      const config = yaml.load(content) as YAMLPromptConfig;
      return config;
    } catch (error) {
      console.warn('Failed to load YAML prompt config:', error);
      return null;
    }
  }

  buildPrompt(text: string): string {
    const config = this.loadConfig();

    if (!config) {
      throw new Error('YAML prompt config not found');
    }

    const sections: string[] = [];

    sections.push(`## Role\n${config.role.name}\n${config.role.description}`);

    if (config.goals && config.goals.length > 0) {
      sections.push(`## Goals\n${config.goals.map((g) => `- ${g}`).join('\n')}`);
    }

    if (config.user_profile) {
      sections.push(
        `## User Profile\n` +
          `Background: ${config.user_profile.background}\n` +
          `Native Language: ${config.user_profile.native_language}\n` +
          `Learning Goal: ${config.user_profile.learning_goal}`
      );
    }

    if (config.instructions && config.instructions.length > 0) {
      sections.push(`## Instructions\n${config.instructions.map((i) => `- ${i}`).join('\n')}`);
    }

    if (config.output_format) {
      sections.push(
        `## Output Format\n` +
          `Style: ${config.output_format.style}\n` +
          `Structure: ${config.output_format.structure.join(', ')}`
      );
    }

    if (config.examples && config.examples.length > 0) {
      sections.push(
        `## Examples\n` +
          config.examples.map((ex) => `Input: "${ex.input}"\nOutput: ${ex.output}`).join('\n\n')
      );
    }

    if (config.constraints && config.constraints.length > 0) {
      sections.push(`## Constraints\n${config.constraints.map((c) => `- ${c}`).join('\n')}`);
    }

    sections.push(`\n## Input to Optimize\n"${text}"`);
    sections.push('\n## Output\nProvide ONLY the optimized English text, nothing else.');

    return sections.join('\n\n');
  }

  hasYAMLPrompt(): boolean {
    return this.loadConfig() !== null;
  }

  getPromptPath(): string {
    return this.promptPath;
  }
}
