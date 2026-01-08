import { AIProvider } from '../types';
import { OllamaProvider } from './ollama';
import { ApiProvider } from './api-provider';
import { Config } from '../types';

export function createProvider(config: Config): AIProvider {
  if (config.ai.provider === 'ollama') {
    if (!config.ai.ollama) {
      throw new Error('Ollama configuration is missing');
    }
    return new OllamaProvider(config.ai.ollama);
  } else if (config.ai.provider === 'api') {
    if (!config.ai.api) {
      throw new Error('API configuration is missing');
    }
    return new ApiProvider(config.ai.api);
  }

  throw new Error(`Unknown provider: ${config.ai.provider}`);
}

export { OllamaProvider } from './ollama';
export { ApiProvider } from './api-provider';
