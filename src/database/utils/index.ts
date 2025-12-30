import { createNanoId } from '@/lib/utils';

const prefixes = {
  model: 'model',
  file: 'file',
  messages: 'msg',
} as const;

export const idGenerator = (namespace: keyof typeof prefixes, size = 12) => {
  const hash = createNanoId(size);
  const prefix = prefixes[namespace];

  if (!prefix) throw new Error(`Invalid namespace: ${namespace}, please check your code.`);

  return `${prefix}_${hash()}`;
};
