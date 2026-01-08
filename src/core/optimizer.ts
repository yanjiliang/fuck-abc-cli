import { AIProvider, OptimizationMode, OptimizationResult, CustomPrompt } from '../types';
import { HistoryLogger } from '../history/logger';
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
    const optimized = await this.provider.optimize(text, mode);
    return this.createResult(text, optimized, mode);
  }

  async optimizeWithYAMLPrompt(text: string): Promise<OptimizationResult> {
    if (!this.yamlPromptLoader || !this.yamlPromptLoader.hasYAMLPrompt()) {
      throw new Error('YAML prompt not available');
    }

    const prompt = this.yamlPromptLoader.buildPrompt(text);
    const optimized = await this.provider.generateWithPrompt(prompt);
    return this.createResult(text, optimized, OptimizationMode.PROFESSIONAL);
  }

  hasYAMLPrompt(): boolean {
    return this.yamlPromptLoader?.hasYAMLPrompt() || false;
  }

  async optimizeWithCustomPrompt(
    text: string,
    _customPrompt: CustomPrompt
  ): Promise<OptimizationResult> {
    const optimized = await this.provider.optimize(text, OptimizationMode.PROFESSIONAL);
    return this.createResult(text, optimized, OptimizationMode.PROFESSIONAL);
  }

  private createResult(
    original: string,
    optimized: string,
    mode: OptimizationMode
  ): OptimizationResult {
    const result: OptimizationResult = {
      original,
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

  private getProviderName(): string {
    return this.provider.constructor.name;
  }

  private getModelName(): string {
    return 'unknown';
  }
}
