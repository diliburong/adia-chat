import { deepseek } from '@ai-sdk/deepseek';
import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from 'ai';

// export const myProviders = customProvider({

// });

// MIGRATED: Commented out due to LanguageModelV2 vs LanguageModelV3 type incompatibility
// This export was not being used anywhere in the codebase
// export const myProvides = customProvider({
//   languageModels: {
//     'deepseek-chat': deepseek('deepseek-chat'),
//   },
// });
