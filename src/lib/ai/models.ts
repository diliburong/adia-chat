export const ModelIdEnum = {
  chatModel: 'chat-model',
  chatModelReasoning: 'chat-model-reasoning',
} as const;

export type IModelId = (typeof ModelIdEnum)[keyof typeof ModelIdEnum];

export const DEFAULT_CHAT_MODEL: IModelId = 'chat-model';

export type IChatModel = {
  id: IModelId;
  // name: string;
  description: string;
};

export const chatModels: IChatModel[] = [
  {
    id: 'chat-model',
    // name: 'Grok Vision',
    description: 'Advanced multimodal model with vision and text capabilities',
  },
  {
    id: 'chat-model-reasoning',
    // name: 'Grok Reasoning',
    description: 'Uses advanced chain-of-thought reasoning for complex problems',
  },
];
