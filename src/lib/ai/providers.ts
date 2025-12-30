import { deepseek } from '@ai-sdk/deepseek';
import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from 'ai';

// export const myProviders = customProvider({

// });
export const myProvides = customProvider({
  languageModels: {
    'deepseek-chat': deepseek('deepseek-chat'),
  },
});
