export enum OptimizationMode {
  PROFESSIONAL = 'professional',
  CONCISE = 'concise',
  GRAMMAR = 'grammar',
  SENIOR_DEVELOPER = 'senior_developer',
}

export interface AIProvider {
  optimize(text: string, mode: OptimizationMode): Promise<string>;
  generateWithPrompt(prompt: string): Promise<string>;
  isAvailable(): Promise<boolean>;
}

export interface OptimizationResult {
  original: string;
  optimized: string;
  mode: OptimizationMode;
  timestamp: Date;
  provider: string;
  model: string;
}

export interface HistoryEntry extends OptimizationResult {
  id: string;
}

export interface Config {
  ai: {
    provider: 'ollama' | 'api';
    ollama?: {
      baseUrl: string;
      model: string;
    };
    api?: {
      provider: 'openai' | 'glm' | 'custom';
      apiKey: string;
      baseUrl: string;
      model: string;
    };
  };
  hotkeys: {
    [mode: string]: string;
  };
  features: {
    enableHistory: boolean;
    historyPath: string;
    enableCustomPrompts: boolean;
    customPromptsPath: string;
  };
}

export interface CustomPrompt {
  name: string;
  description: string;
  prompt: string;
  hotkey?: string;
}

export interface PromptTemplate {
  name: string;
  description: string;
  template: (text: string) => string;
}

export interface YAMLPromptConfig {
  role: {
    name: string;
    description: string;
  };
  goals: string[];
  user_profile: {
    background: string;
    native_language: string;
    learning_goal: string;
  };
  instructions: string[];
  output_format: {
    style: string;
    structure: string[];
  };
  examples: Array<{
    input: string;
    output: string;
  }>;
  constraints: string[];
}
