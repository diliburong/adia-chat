import { generateText, UIMessage } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';

export const generateTitleFromMessages = async (message: UIMessage) => {
  const title = await generateText({
    model: deepseek('deepseek-chat'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title.text;
};
