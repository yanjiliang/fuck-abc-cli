import { AIProvider, OptimizationMode, OptimizationResult, CustomPrompt } from '../types';
import { HistoryLogger } from '../history/logger';
import { getPromptTemplate } from '../prompts/templates';
import { YAMLPromptLoader } from '../prompts/yaml-prompt';

export class Optimizer {
  public provider: AIProvider;
  private historyLogger?: HistoryLogger;
  private yamlPromptLoader?: YAMLPromptLoader;

  constructor(provider: AIProvider, historyLogger?: HistoryLogger, useYAMLPrompt: boolean = false) {
    this.provider = provider;
    this.historyLogger = historyLogger;

    if (useYAMLPrompt) {
      this.yamlPromptLoader = new YAMLPromptLoader();
    }
  }

  async optimize(text: string, mode: OptimizationMode): Promise<OptimizationResult> {
    const startTime = Date.now();
    const optimized = await this.provider.optimize(text, mode);
    const duration = Date.now() - startTime;

    const result: OptimizationResult = {
      original: text,
      optimized,
      mode,
      timestamp: new Date(),
      provider: this.getProviderName(),
      model: this.getModelName(),
    };

    // Save to history if enabled
    if (this.historyLogger) {
      this.historyLogger.addEntry(result);
    }

    return result;
  }

  async optimizeWithYAMLPrompt(text: string): Promise<OptimizationResult> {
    if (!this.yamlPromptLoader || !this.yamlPromptLoader.hasYAMLPrompt()) {
      throw new Error('YAML prompt not available');
    }

    const prompt = this.yamlPromptLoader.buildPrompt(text);
    const optimized = await this.provider.generateWithPrompt(prompt);

    const result: OptimizationResult = {
      original: text,
      optimized,
      mode: OptimizationMode.PROFESSIONAL,
      timestamp: new Date(),
      provider: this.getProviderName(),
      model: this.getModelName(),
    };

    // Save to history if enabled
    if (this.historyLogger) {
      this.historyLogger.addEntry(result);
    }

    return result;
  }

  hasYAMLPrompt(): boolean {
    return this.yamlPromptLoader?.hasYAMLPrompt() || false;
  }

  async optimizeWithCustomPrompt(
    text: string,
    customPrompt: CustomPrompt
  ): Promise<OptimizationResult> {
    const optimized = await this.provider.optimize(text, OptimizationMode.PROFESSIONAL);
    return {
      original: text,
      optimized,
      mode: OptimizationMode.PROFESSIONAL,
      timestamp: new Date(),
      provider: this.getProviderName(),
      model: this.getModelName(),
    };
  }

  private getProviderName(): string {
    return this.provider.constructor.name;
  }

  private getModelName(): string {
    return 'unknown';
  }
}
