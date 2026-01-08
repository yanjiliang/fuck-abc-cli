import axios, { AxiosError } from 'axios';
import chalk from 'chalk';
import { AIProvider, OptimizationMode } from '../types';
import { getPromptTemplate } from '../prompts/templates';

export interface ApiProviderConfig {
  provider: 'openai' | 'glm' | 'custom';
  apiKey: string;
  baseUrl: string;
  model: string;
}

export class ApiProvider implements AIProvider {
  private config: ApiProviderConfig;

  constructor(config: ApiProviderConfig) {
    this.config = config;
  }

  private handleApiError(error: any): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data: any = axiosError.response.data;

        // Handle GLM specific errors
        if (data?.error?.code === '1113') {
          throw new Error(
            'GLM account balance is insufficient. Please recharge your account at https://open.bigmodel.cn/usercenter/finance'
          );
        }

        if (status === 401) {
          throw new Error('Invalid API key. Please check your API credentials.');
        } else if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
      }
      throw new Error(`API error: ${axiosError.message}`);
    }
    throw error;
  }

  async optimize(text: string, mode: OptimizationMode): Promise<string> {
    const prompt = getPromptTemplate(mode, text);
    const result = await this.callAPI(prompt);
    return this.cleanupResponse(result, true);
  }

  async generateWithPrompt(prompt: string): Promise<string> {
    const result = await this.callAPI(prompt);
    return this.cleanupResponse(result, false);
  }

  private async callAPI(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/chat/completions`,
        {
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim();
      }

      throw new Error('Invalid response from API');
    } catch (error) {
      this.handleApiError(error);
    }
  }

  private cleanupResponse(result: string, removePrefixes: boolean): string {
    // Remove quotes if model wrapped the response in them
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
    if (!this.config.apiKey) {
      return false;
    }

    try {
      // Try a simple API call to check if key is valid
      const response = await axios.post(
        `${this.config.baseUrl}/chat/completions`,
        {
          model: this.config.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5,
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      return response.status === 200;
    } catch (error: any) {
      if (error.response) {
        console.log(
          '\n' + chalk.yellow('API connection failed with status:'),
          error.response.status
        );
        if (error.response.data) {
          console.log(chalk.yellow('Error details:'), JSON.stringify(error.response.data));

          // Throw error for GLM balance issues
          if (error.response.data?.error?.code === '1113') {
            throw new Error(
              'GLM account balance is insufficient. Please recharge your account at https://open.bigmodel.cn/usercenter/finance'
            );
          }
        }
      } else if (error.request) {
        console.log('\n' + chalk.yellow('No response from API'));
        console.log(chalk.gray('Possible issues:'));
        console.log(chalk.gray('  - Network connectivity'));
        console.log(chalk.gray('  - API URL is incorrect'));
        console.log(chalk.gray('  - Firewall blocking the request'));
      } else {
        console.log('\n' + chalk.yellow('Request setup error:'), error.message);
      }
      return false;
    }
  }
}
