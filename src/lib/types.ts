import { DBSuggestionItem } from '@/database/schemas';
import type { InferUITool, UIMessage } from 'ai';
import { z } from 'zod';
import { getWeather } from './ai/tools/get-weather';
import { AppUsage } from './usage';

export type DataPart = { type: 'append-message'; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

type weatherTool = InferUITool<typeof getWeather>;
// type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
// type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
// type requestSuggestionsTool = InferUITool<ReturnType<typeof requestSuggestions>>;
export type ChatTools = {
  getWeather: weatherTool;
  // getWeather: weatherTool;
  // createDocument: createDocumentTool;
  // updateDocument: updateDocumentTool;
  // requestSuggestions: requestSuggestionsTool;
};

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: DBSuggestionItem;
  appendMessage: string;
  id: string;
  title: string;
  // kind: ArtifactKind;
  clear: null;
  finish: null;
  usage: AppUsage;
};

export type ChatMessage = UIMessage<MessageMetadata, CustomUIDataTypes, ChatTools>;

export type VisibilityType = 'public' | 'private';
