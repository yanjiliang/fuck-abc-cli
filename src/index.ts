#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import axios from 'axios';
import { configManager, ConfigManager } from './config/config';
import { createProvider } from './ai/provider';
import { Optimizer } from './core/optimizer';
import { InteractiveEditor } from './core/editor';
import { InstantEditor } from './core/instant-editor';
import { BatchProcessor } from './core/batch';
import { HistoryLogger } from './history/logger';
import { CustomPromptLoader } from './prompts/custom';
import { OptimizationMode } from './types';
import { displayWelcome, displayError, displayInfo } from './utils/display';

const PACKAGE_NAME = 'english-optimizer-cli';

const program = new Command();

program
  .name('fuck-abc')
  .description('CLI tool to help non-native English speakers improve their writing using AI')
  .version('1.0.0');

program
  .command('start', { isDefault: true })
  .description('Start interactive optimization mode')
  .option('-c, --classic', 'Use classic mode (submit text then optimize)', false)
  .action(async (options) => {
    try {
      const config = configManager.getConfig();

      // Initialize provider
      const provider = createProvider(config);

      // Check if provider is available
      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        displayError(
          config.ai.provider === 'ollama'
            ? 'Ollama is not running. Please start Ollama or run: docker-compose up -d'
            : 'API provider is not available. Please check your API key and configuration.'
        );
        process.exit(1);
      }

      // Initialize optional features
      let historyLogger: HistoryLogger | undefined;
      if (config.features.enableHistory) {
        ConfigManager.ensureConfigDir();
        historyLogger = new HistoryLogger(config.features.historyPath);
      }

      let customPromptLoader: CustomPromptLoader | undefined;
      if (config.features.enableCustomPrompts) {
        ConfigManager.ensureConfigDir();
        customPromptLoader = new CustomPromptLoader(config.features.customPromptsPath);
      }

      // Initialize optimizer
      const optimizer = new Optimizer(provider, historyLogger);

      // Start editor (instant mode by default, or classic mode with flag)
      if (options.classic) {
        const editor = new InteractiveEditor(optimizer, historyLogger, customPromptLoader);
        await editor.start();
      } else {
        const editor = new InstantEditor(optimizer, historyLogger);
        await editor.start();
      }
    } catch (error) {
      displayError(error as Error);
      process.exit(1);
    }
  });

program
  .command('history')
  .description('View optimization history')
  .option('-n, --number <count>', 'Number of recent entries to show', '10')
  .action(async (options) => {
    try {
      const config = configManager.getConfig();

      if (!config.features.enableHistory) {
        displayInfo('History is disabled in configuration.');
        process.exit(0);
      }

      const historyLogger = new HistoryLogger(config.features.historyPath);
      const history = historyLogger.getRecentEntries(parseInt(options.number));

      if (history.length === 0) {
        displayInfo('No history yet.');
        process.exit(0);
      }

      console.log(`\nShowing ${history.length} recent optimizations:\n`);

      for (const entry of history) {
        console.log('─'.repeat(60));
        console.log(`ID: ${entry.id}`);
        console.log(`Time: ${entry.timestamp.toLocaleString()}`);
        console.log(`Mode: ${entry.mode}`);
        console.log(`Original: ${entry.original.substring(0, 100)}...`);
        console.log(`Optimized: ${entry.optimized.substring(0, 100)}...`);
        console.log('');
      }
    } catch (error) {
      displayError(error as Error);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    try {
      const config = configManager.getConfig();
      console.log(JSON.stringify(config, null, 2));
    } catch (error) {
      displayError(error as Error);
      process.exit(1);
    }
  });

program
  .command('prompts')
  .description('List custom prompts')
  .action(() => {
    try {
      const config = configManager.getConfig();
      const customPromptLoader = new CustomPromptLoader(config.features.customPromptsPath);
      const prompts = customPromptLoader.getCustomPrompts();

      if (prompts.length === 0) {
        displayInfo('No custom prompts found.');
        process.exit(0);
      }

      console.log('\nCustom Prompts:\n');
      for (const prompt of prompts) {
        console.log(`Name: ${prompt.name}`);
        console.log(`Description: ${prompt.description}`);
        console.log(`Hotkey: ${prompt.hotkey || 'None'}`);
        console.log('');
      }
    } catch (error) {
      displayError(error as Error);
      process.exit(1);
    }
  });

program
  .command('prompt')
  .description('Manage translation prompt template')
  .option('-e, --edit', 'Edit the prompt file', false)
  .option('-s, --show', 'Show the current prompt', false)
  .action(async (options) => {
    try {
      const { TranslationPromptLoader } = await import('./prompts/translation-prompt');
      const { YAMLPromptLoader } = await import('./prompts/yaml-prompt');

      const yamlPromptLoader = new YAMLPromptLoader();
      const textPromptLoader = new TranslationPromptLoader();

      const hasYAMLPrompt = yamlPromptLoader.hasYAMLPrompt();

      if (hasYAMLPrompt) {
        console.log(chalk.cyan('\n✓ YAML prompt detected!\n'));
      }

      if (options.show) {
        if (hasYAMLPrompt) {
          console.log(
            chalk.cyan('📄 YAML Prompt file: ' + yamlPromptLoader.getPromptPath() + '\n')
          );
          console.log('─'.repeat(70));
          console.log(yamlPromptLoader.loadConfig());
          console.log('─'.repeat(70));
        } else {
          console.log(`\n📄 Prompt file location: ${textPromptLoader.getPromptPath()}\n`);
          console.log('Current prompt:');
          console.log('─'.repeat(70));
          console.log(textPromptLoader.getPrompt());
          console.log('─'.repeat(70));
        }
      } else if (options.edit) {
        const { execSync } = require('child_process');
        const promptPath = hasYAMLPrompt
          ? yamlPromptLoader.getPromptPath()
          : textPromptLoader.getPromptPath();
        console.log(`\n📝 Opening ${promptPath} in your default editor...\n`);
        try {
          execSync(`"${process.env.EDITOR || 'code'}" "${promptPath}"`, { stdio: 'inherit' });
        } catch {
          console.log(chalk.yellow('\n⚠️  Could not open editor. Please edit manually:'));
          console.log(chalk.gray(promptPath));
        }
      } else {
        if (hasYAMLPrompt) {
          console.log(`\n📄 YAML Prompt file: ${yamlPromptLoader.getPromptPath()}`);
          console.log(chalk.cyan('\n✓ Using YAML prompt configuration'));
        } else {
          console.log(`\n📄 Prompt file location: ${textPromptLoader.getPromptPath()}`);
        }
        console.log(chalk.gray('\nCommands:'));
        console.log('  fuck-abc prompt --show    Show current prompt');
        console.log('  fuck-abc prompt --edit    Edit prompt file');
        console.log(chalk.gray('\nEdit the file directly to customize translation behavior.\n'));
      }
    } catch (error) {
      displayError(error as Error);
      process.exit(1);
    }
  });

program
  .command('batch')
  .description('Batch optimize files')
  .argument('<files...>', 'Files to optimize')
  .option(
    '-m, --mode <mode>',
    'Optimization mode (professional, concise, grammar, senior_developer)',
    'professional'
  )
  .option('-i, --in-place', 'Modify files in place', false)
  .option('-s, --suffix <suffix>', 'Output file suffix', '.optimized')
  .action(async (files, options) => {
    try {
      const config = configManager.getConfig();

      // Validate mode
      const validModes = ['professional', 'concise', 'grammar', 'senior_developer'];
      if (!validModes.includes(options.mode)) {
        displayError(`Invalid mode: ${options.mode}. Valid modes: ${validModes.join(', ')}`);
        process.exit(1);
      }

      // Initialize provider
      const provider = createProvider(config);
      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        displayError('AI provider is not available.');
        process.exit(1);
      }

      // Initialize optimizer
      let historyLogger: HistoryLogger | undefined;
      if (config.features.enableHistory) {
        ConfigManager.ensureConfigDir();
        historyLogger = new HistoryLogger(config.features.historyPath);
      }

      const optimizer = new Optimizer(provider, historyLogger);
      const batchProcessor = new BatchProcessor(optimizer);

      await batchProcessor.processBatch({
        files,
        mode: options.mode as OptimizationMode,
        inPlace: options.inPlace,
        outputSuffix: options.suffix,
      });
    } catch (error) {
      displayError(error as Error);
      process.exit(1);
    }
  });

program
  .command('update')
  .description('Update to the latest version')
  .action(async () => {
    try {
      console.log(chalk.cyan('\n🔄 Checking for updates...\n'));

      // Get current version
      const { version: currentVersion } = require('../package.json');

      // Fetch latest version from npm
      try {
        const response = await axios.get(`https://registry.npmjs.org/${PACKAGE_NAME}/latest`);
        const latestVersion = response.data.version;

        console.log(chalk.gray(`Current version: ${currentVersion}`));
        console.log(chalk.gray(`Latest version: ${latestVersion}\n`));

        if (currentVersion === latestVersion) {
          console.log(chalk.green('✅ You are already using the latest version!\n'));
        } else {
          console.log(chalk.yellow('⚠️  A new version is available!\n'));
          console.log(chalk.cyan('To update, run:'));
          console.log(chalk.white.bold('  npm update -g english-optimizer-cli\n'));
          console.log(chalk.gray('Or reinstall:'));
          console.log(chalk.gray('  npm install -g english-optimizer-cli@latest\n'));
        }
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not check for updates.\n'));
        console.log(chalk.gray('Please check manually:'));
        console.log(chalk.gray('  npm view english-optimizer-cli version\n'));
      }
    } catch (error) {
      displayError(error as Error);
      process.exit(1);
    }
  });

program.parse();
