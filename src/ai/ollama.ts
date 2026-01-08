import axios, { AxiosError } from 'axios';
import { AIProvider, OptimizationMode } from '../types';
import { getPromptTemplate } from '../prompts/templates';

export interface OllamaConfig {
  baseUrl: string;
  model: string;
}

export class OllamaProvider implements AIProvider {
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    this.config = config;
  }

  async optimize(text: string, mode: OptimizationMode): Promise<string> {
    const prompt = getPromptTemplate(mode, text);
    const result = await this.callOllama(prompt);
    return this.cleanupResponse(result, true);
  }

  async generateWithPrompt(prompt: string): Promise<string> {
    const result = await this.callOllama(prompt);
    return this.cleanupResponse(result, false);
  }

  private async callOllama(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/generate`,
        {
          model: this.config.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        },
        {
          timeout: 60000,
        }
      );

      if (response.data && response.data.response) {
        return response.data.response.trim();
      }

      throw new Error('Invalid response from Ollama');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.code === 'ECONNREFUSED') {
          throw new Error(
            `Cannot connect to Ollama at ${this.config.baseUrl}. Make sure Ollama is running.`
          );
        }
        throw new Error(`Ollama API error: ${axiosError.message}`);
      }
      throw error;
    }
  }

  private cleanupResponse(result: string, removePrefixes: boolean): string {
    // Remove quotes if the model wrapped the response in them
    if (result.startsWith('"') && result.endsWith('"')) {
      result = result.slice(1, -1);
    }

    // Remove common prefixes if present
    if (removePrefixes) {
      const prefixesToRemove = ['Rewritten text:', 'Corrected text:', 'Optimized text:'];
      for (const prefix of prefixesToRemove) {
        if (result.startsWith(prefix)) {
          result = result.slice(prefix.length).trim();
          break;
        }
      }
    }

    return result;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.baseUrl}/api/tags`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
