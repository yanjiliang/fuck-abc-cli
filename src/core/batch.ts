import { readFileSync, writeFileSync } from 'fs';
import { OptimizationMode } from '../types';
import { Optimizer } from './optimizer';
import { displayModeInfo, displayOptimization, displayInfo } from '../utils/display';

export interface BatchOptions {
  files: string[];
  mode: OptimizationMode;
  inPlace: boolean;
  outputSuffix?: string;
}

export class BatchProcessor {
  private optimizer: Optimizer;

  constructor(optimizer: Optimizer) {
    this.optimizer = optimizer;
  }

  async processBatch(options: BatchOptions): Promise<void> {
    displayInfo(`Processing ${options.files.length} file(s)...`);

    for (const file of options.files) {
      await this.processFile(file, options);
    }

    displayInfo(`Batch processing complete!`);
  }

  private async processFile(filePath: string, options: BatchOptions): Promise<void> {
    try {
      // Read file
      const content = readFileSync(filePath, 'utf-8');

      displayModeInfo(options.mode);
      console.log(`\nProcessing: ${filePath}`);

      // Optimize content
      const result = await this.optimizer.optimize(content, options.mode);

      displayOptimization(result.original, result.optimized);

      // Write output
      if (options.inPlace) {
        writeFileSync(filePath, result.optimized, 'utf-8');
        console.log(`✅ Updated: ${filePath}`);
      } else {
        const outputPath = options.outputSuffix
          ? filePath.replace(/(\.[^.]+)$/, `${options.outputSuffix}$1`)
          : `${filePath}.optimized`;

        writeFileSync(outputPath, result.optimized, 'utf-8');
        console.log(`✅ Created: ${outputPath}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error);
    }
  }
}
