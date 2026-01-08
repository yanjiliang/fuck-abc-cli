import { z } from 'zod';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import dotenv from 'dotenv';
import * as yaml from 'js-yaml';
import type { Config } from '../types';

// Load environment variables
dotenv.config();

// Zod schema for validation
const ConfigSchema = z.object({
  ai: z.object({
    provider: z.enum(['ollama', 'api']),
    ollama: z
      .object({
        baseUrl: z.string().url(),
        model: z.string(),
      })
      .optional(),
    api: z
      .object({
        provider: z.enum(['openai', 'glm', 'custom']),
        apiKey: z.string(),
        baseUrl: z.string().url(),
        model: z.string(),
      })
      .optional(),
  }),
  hotkeys: z.record(z.string()),
  features: z.object({
    enableHistory: z.boolean(),
    historyPath: z.string(),
    enableCustomPrompts: z.boolean(),
    customPromptsPath: z.string(),
  }),
});

const DEFAULT_CONFIG: Config = {
  ai: {
    provider: 'ollama',
    ollama: {
      baseUrl: 'http://localhost:11434',
      model: 'llama3.2:3b',
    },
    api: {
      provider: 'openai',
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
    },
  },
  hotkeys: {
    professional: 'p',
    concise: 'c',
    grammar: 'g',
    senior_developer: 'd',
    reset: 'r',
    history: 'h',
    quit: 'q',
  },
  features: {
    enableHistory: true,
    historyPath: join(homedir(), '.english-optimizer', 'history.json'),
    enableCustomPrompts: true,
    customPromptsPath: join(homedir(), '.english-optimizer', 'prompts.json'),
  },
};

const CONFIG_DIR = join(homedir(), '.english-optimizer');
const CONFIG_FILE_YAML = join(CONFIG_DIR, 'config.yaml');
const CONFIG_FILE_JSON = join(CONFIG_DIR, 'config.json');

export class ConfigManager {
  private config: Config;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): Config {
    // Try to load from YAML config file first, then JSON
    let fileContent = '';

    if (existsSync(CONFIG_FILE_YAML)) {
      try {
        fileContent = readFileSync(CONFIG_FILE_YAML, 'utf-8');
        const fileConfig = yaml.load(fileContent) as any;
        const mergedConfig = this.mergeWithDefaults(fileConfig);
        const validated = ConfigSchema.parse(mergedConfig);
        return validated;
      } catch (error) {
        console.warn('Failed to load YAML config file, trying JSON:', error);
      }
    }

    if (existsSync(CONFIG_FILE_JSON)) {
      try {
        fileContent = readFileSync(CONFIG_FILE_JSON, 'utf-8');
        const fileConfig = JSON.parse(fileContent);
        const mergedConfig = this.mergeWithDefaults(fileConfig);
        const validated = ConfigSchema.parse(mergedConfig);
        return validated;
      } catch (error) {
        console.warn('Failed to load JSON config file, using defaults:', error);
      }
    }

    // Load from environment variables
    const envConfig = this.loadFromEnv();
    const mergedConfig = this.mergeWithDefaults(envConfig);
    return ConfigSchema.parse(mergedConfig);
  }

  private loadFromEnv(): Partial<Config> {
    const env: Partial<Config> = {};

    if (process.env.AI_PROVIDER) {
      env.ai = {
        provider: process.env.AI_PROVIDER as 'ollama' | 'api',
      };

      if (process.env.AI_PROVIDER === 'ollama') {
        env.ai!.ollama = {
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
          model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
        };
      } else if (process.env.AI_PROVIDER === 'api') {
        env.ai!.api = {
          provider: (process.env.API_PROVIDER as 'openai' | 'glm' | 'custom') || 'openai',
          apiKey: process.env.API_KEY || '',
          baseUrl: process.env.API_BASE_URL || 'https://api.openai.com/v1',
          model: process.env.API_MODEL || 'gpt-3.5-turbo',
        };
      }
    }

    if (process.env.ENABLE_HISTORY !== undefined) {
      env.features = {
        enableHistory: process.env.ENABLE_HISTORY === 'true',
        enableCustomPrompts:
          process.env.ENABLE_CUSTOM_PROMPTS !== undefined
            ? process.env.ENABLE_CUSTOM_PROMPTS === 'true'
            : true,
        historyPath: join(homedir(), '.english-optimizer', 'history.json'),
        customPromptsPath: join(homedir(), '.english-optimizer', 'prompts.json'),
      };
    }

    return env;
  }

  private mergeWithDefaults(partial: Partial<Config>): Config {
    return {
      ai: {
        ...DEFAULT_CONFIG.ai,
        ...partial.ai,
        ollama: partial.ai?.ollama
          ? { ...DEFAULT_CONFIG.ai.ollama, ...partial.ai.ollama }
          : DEFAULT_CONFIG.ai.ollama,
        api: partial.ai?.api
          ? { ...DEFAULT_CONFIG.ai.api!, ...partial.ai.api }
          : DEFAULT_CONFIG.ai.api,
      },
      hotkeys: { ...DEFAULT_CONFIG.hotkeys, ...partial.hotkeys },
      features: { ...DEFAULT_CONFIG.features, ...partial.features },
    };
  }

  getConfig(): Config {
    return this.config;
  }

  saveConfig(config: Config): void {
    const validated = ConfigSchema.parse(config);

    // Ensure config directory exists
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }

    // Save to YAML if it exists or by default, otherwise use JSON
    const configFilePath = existsSync(CONFIG_FILE_YAML) ? CONFIG_FILE_YAML : CONFIG_FILE_JSON;

    if (configFilePath.endsWith('.yaml')) {
      writeFileSync(configFilePath, yaml.dump(validated, { indent: 2 }), 'utf-8');
    } else {
      writeFileSync(configFilePath, JSON.stringify(validated, null, 2), 'utf-8');
    }

    this.config = validated;
  }

  static ensureConfigDir(): void {
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }
}

export const configManager = new ConfigManager();
