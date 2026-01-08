import { OptimizationMode, PromptTemplate } from '../types';

export const PROMPT_TEMPLATES: Record<OptimizationMode, PromptTemplate> = {
  [OptimizationMode.PROFESSIONAL]: {
    name: 'Professional',
    description: 'Make the text sound more professional and formal',
    template: (text: string) =>
      `Please rewrite the following text to make it sound more professional and formal, while maintaining the original meaning. Use appropriate business language and tone.

Original text:
"${text}"

Rewritten text:`,
  },

  [OptimizationMode.CONCISE]: {
    name: 'Concise',
    description: 'Make the text more concise while keeping the meaning',
    template: (text: string) =>
      `Please rewrite the following text to be more concise and to the point, while preserving all the key information and meaning.

Original text:
"${text}"

Rewritten text:`,
  },

  [OptimizationMode.GRAMMAR]: {
    name: 'Grammar',
    description: 'Fix grammar and spelling errors only',
    template: (text: string) =>
      `Please fix any grammar, spelling, or punctuation errors in the following text. Do not change the style or meaning - only correct mistakes.

Original text:
"${text}"

Corrected text:`,
  },

  [OptimizationMode.SENIOR_DEVELOPER]: {
    name: 'Senior Developer',
    description: 'Rewrite as a senior software engineer would write it',
    template: (text: string) =>
      `Please rewrite the following text as a senior software engineer would write it in a professional context (e.g., code review, technical discussion, or documentation). Use clear, precise technical language and follow industry best practices for communication.

Original text:
"${text}"

Rewritten text:`,
  },
};

export function getPromptTemplate(mode: OptimizationMode, text: string): string {
  return PROMPT_TEMPLATES[mode].template(text);
}

export function getAllModes(): OptimizationMode[] {
  return Object.values(OptimizationMode);
}

export function getModeInfo(mode: OptimizationMode): PromptTemplate {
  return PROMPT_TEMPLATES[mode];
}
