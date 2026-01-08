import inquirer from 'inquirer';
import chalk from 'chalk';
import { configManager } from './config';
import { createProvider } from '../ai/provider';
import { displayError, displaySuccess } from '../utils/display';

export async function testConfiguration(): Promise<void> {
  console.log(chalk.cyan.bold('\n🧪 Testing API Configuration...\n'));

  const config = configManager.getConfig();

  try {
    const provider = createProvider(config);

    console.log(chalk.gray('Provider:'), chalk.white.bold(config.ai.provider));

    if (config.ai.provider === 'ollama') {
      console.log(chalk.gray('Ollama URL:'), chalk.white(config.ai.ollama!.baseUrl));
      console.log(chalk.gray('Ollama Model:'), chalk.white(config.ai.ollama!.model));
    } else {
      console.log(chalk.gray('API Provider:'), chalk.white.bold(config.ai.api!.provider));
      console.log(chalk.gray('API URL:'), chalk.white(config.ai.api!.baseUrl));
      console.log(chalk.gray('API Model:'), chalk.white(config.ai.api!.model));
      console.log(
        chalk.gray('API Key:'),
        chalk.white(config.ai.api!.apiKey.substring(0, 8) + '...')
      );
    }

    console.log(chalk.gray('\n' + '─'.repeat(50) + '\n'));
    console.log(chalk.cyan('🔄 Testing connection...\n'));

    const isAvailable = await provider.isAvailable();

    if (isAvailable) {
      console.log(chalk.green.bold('✅ API configuration is valid!\n'));

      if (config.ai.provider === 'api') {
        console.log(chalk.gray('Attempting a simple test request...\n'));

        try {
          const testText = 'Hello';
          const optimized = await provider.optimize(testText, 'professional' as any);

          console.log(chalk.cyan('Test Input:'), chalk.white(testText));
          console.log(chalk.cyan('Test Output:'), chalk.white(optimized));
          console.log(
            '\n' + chalk.green.bold('✅ Full test passed! Your API is working correctly.\n')
          );
        } catch (error: any) {
          console.log(chalk.yellow('\n⚠️  Connection successful but request failed:'));
          console.log(chalk.gray((error as Error).message));

          console.log('\n' + chalk.cyan('Possible issues:'));
          console.log(chalk.gray('  - API key may be invalid or expired'));
          console.log(chalk.gray('  - Model may not be available'));
          console.log(chalk.gray('  - API endpoint may have changed'));
          console.log('\n' + chalk.cyan('Please check your API configuration:'));
          console.log(chalk.white('  fuck-abc config --setup\n'));
        }
      } else {
        console.log(chalk.green.bold('🎉 Your local Ollama is ready!\n'));
        console.log(chalk.gray('You can start using:'));
        console.log(chalk.white.bold('  fuck-abc\n'));
      }
    } else {
      console.log(chalk.red.bold('❌ API configuration is invalid!\n'));

      if (config.ai.provider === 'ollama') {
        console.log(chalk.red('Issues:'));
        console.log(chalk.gray('  - Ollama is not running'));
        console.log(chalk.gray('  - Ollama URL is incorrect'));
        console.log('\n' + chalk.cyan('To start Ollama:'));
        console.log(chalk.gray('  docker-compose up -d'));
        console.log(chalk.gray('\nOr install Ollama locally:'));
        console.log(chalk.gray('  https://ollama.com/download'));
      } else {
        console.log(chalk.red('Issues:'));
        console.log(chalk.gray('  - API key is invalid or missing'));
        console.log(chalk.gray('  - API URL is incorrect'));
        console.log(chalk.gray('  - Network connection failed'));
        console.log('\n' + chalk.cyan('Please check your configuration:'));
        console.log(chalk.white('  fuck-abc config --setup'));
        console.log(chalk.gray('\nOr view current config:'));
        console.log(chalk.white('  fuck-abc config\n'));
      }

      process.exit(1);
    }
  } catch (error: any) {
    console.log(chalk.red.bold('\n❌ Configuration error!\n'));
    console.log(chalk.gray(error.message));

    if (error.message.includes('API key')) {
      console.log('\n' + chalk.cyan('💡 Tip: Make sure your API key is correct and active.'));
      console.log(chalk.gray('  For OpenAI: https://platform.openai.com/api-keys'));
      console.log(chalk.gray('  For GLM: https://open.bigmodel.cn/usercenter/apikeys'));
      console.log(chalk.gray('  For DeepSeek: https://platform.deepseek.com/\n'));
    }

    process.exit(1);
  }
}
