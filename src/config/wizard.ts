import inquirer from 'inquirer';
import chalk from 'chalk';
import { ConfigManager } from './config';

export async function runConfigWizard(): Promise<void> {
  console.log(chalk.cyan.bold('\n🚀 English Optimizer CLI - Configuration Wizard\n'));

  const configManager = new ConfigManager();
  const currentConfig = configManager.getConfig();

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Select AI provider:',
      choices: [
        { name: '🤖 Ollama (Local)', value: 'ollama' },
        { name: '☁️  Cloud API (OpenAI, GLM, etc.)', value: 'api' },
      ],
      default: currentConfig.ai.provider,
    },
    {
      type: 'input',
      name: 'ollamaBaseUrl',
      message: 'Ollama base URL:',
      default: currentConfig.ai.ollama?.baseUrl || 'http://localhost:11434',
      when: (answers: any) => answers.provider === 'ollama',
      validate: (input: string) => {
        try {
          new URL(input);
          return true;
        } catch {
          return 'Please enter a valid URL';
        }
      },
    },
    {
      type: 'input',
      name: 'ollamaModel',
      message: 'Ollama model name:',
      default: currentConfig.ai.ollama?.model || 'llama3.2:3b',
      when: (answers: any) => answers.provider === 'ollama',
    },
    {
      type: 'list',
      name: 'apiProvider',
      message: 'Select API provider:',
      choices: [
        { name: '🔵 OpenAI (GPT-4, GPT-3.5)', value: 'openai' },
        { name: '🟢 GLM (Zhipu AI)', value: 'glm' },
        { name: '🔷 DeepSeek', value: 'deepseek' },
        { name: '🟣 Aliyun Qwen', value: 'qwen' },
        { name: '🌙 Moonshot (Kimi)', value: 'moonshot' },
        { name: '🔧 Custom API', value: 'custom' },
      ],
      default: currentConfig.ai.api?.provider || 'openai',
      when: (answers: any) => answers.provider === 'api',
    },
    {
      type: 'input',
      name: 'apiKey',
      message: 'Enter your API key:',
      default: currentConfig.ai.api?.apiKey || '',
      when: (answers: any) => answers.provider === 'api',
      validate: (input: string) => {
        if (!input || input.trim() === '') {
          return 'API key cannot be empty';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'apiBaseUrl',
      message: 'API base URL:',
      default: (answers: any) => {
        const currentUrl = currentConfig.ai.api?.baseUrl || '';
        const providerDefaults: Record<string, string> = {
          openai: 'https://api.openai.com/v1',
          glm: 'https://open.bigmodel.cn/api/paas/v4',
          deepseek: 'https://api.deepseek.com/v1',
          qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
          moonshot: 'https://api.moonshot.cn/v1',
          custom: currentUrl,
        };
        return providerDefaults[answers.apiProvider] || currentUrl;
      },
      when: (answers: any) => answers.provider === 'api',
      validate: (input: string) => {
        try {
          new URL(input);
          return true;
        } catch {
          return 'Please enter a valid URL';
        }
      },
    },
    {
      type: 'input',
      name: 'apiModel',
      message: 'Model name:',
      default: (answers: any) => {
        const currentModel = currentConfig.ai.api?.model || '';
        const modelDefaults: Record<string, string> = {
          openai: 'gpt-4o',
          glm: 'glm-4',
          deepseek: 'deepseek-chat',
          qwen: 'qwen-turbo',
          moonshot: 'moonshot-v1-8k',
          custom: currentModel,
        };
        return modelDefaults[answers.apiProvider] || currentModel;
      },
      when: (answers: any) => answers.provider === 'api',
    },
    {
      type: 'confirm',
      name: 'enableHistory',
      message: 'Enable optimization history?',
      default: currentConfig.features.enableHistory ?? true,
    },
    {
      type: 'confirm',
      name: 'enableYAMLPrompt',
      message: 'Use YAML prompt configuration (conversational mode)?',
      default: true,
    },
  ]);

  // Build new config
  const newConfig = {
    ...currentConfig,
    ai: {
      provider: answers.provider as 'ollama' | 'api',
      ollama:
        answers.provider === 'ollama'
          ? {
              baseUrl: answers.ollamaBaseUrl,
              model: answers.ollamaModel,
            }
          : undefined,
      api:
        answers.provider === 'api'
          ? {
              provider: answers.apiProvider,
              apiKey: answers.apiKey,
              baseUrl: answers.apiBaseUrl,
              model: answers.apiModel,
            }
          : undefined,
    },
    features: {
      ...currentConfig.features,
      enableHistory: answers.enableHistory,
      useYAMLPrompt: answers.enableYAMLPrompt,
    },
  };

  // Save config
  console.log(chalk.cyan('\n💾 Saving configuration...\n'));
  configManager.saveConfig(newConfig as any);

  console.log(chalk.green.bold('✅ Configuration saved successfully!\n'));

  // Show summary
  console.log(chalk.white.bold('Current Configuration:\n'));
  console.log(chalk.gray('─'.repeat(50)));

  if (answers.provider === 'ollama') {
    console.log(chalk.cyan(`Provider: ${chalk.bold('Ollama (Local)')}`));
    console.log(chalk.cyan(`  URL: ${newConfig.ai.ollama!.baseUrl}`));
    console.log(chalk.cyan(`  Model: ${newConfig.ai.ollama!.model}`));
  } else {
    console.log(chalk.cyan(`Provider: ${chalk.bold(answers.apiProvider)}`));
    console.log(chalk.cyan(`  URL: ${newConfig.ai.api!.baseUrl}`));
    console.log(chalk.cyan(`  Model: ${newConfig.ai.api!.model}`));
  }

  console.log(chalk.cyan(`History: ${answers.enableHistory ? 'Enabled' : 'Disabled'}`));
  console.log(chalk.cyan(`YAML Prompt: ${answers.enableYAMLPrompt ? 'Enabled' : 'Disabled'}`));
  console.log(chalk.gray('─'.repeat(50)));

  console.log(chalk.green('\n🎉 Ready to use! Run:'));
  console.log(chalk.white.bold('  cao\n'));
}
