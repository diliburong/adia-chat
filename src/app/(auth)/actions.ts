'use server';

import { signIn } from './auth';

export const login = async () => {
  const providerId = 'github';

  const result = await signIn(providerId, {
    redirectTo: '/',
  });
  console.log(result, 'result');

  return {
    status: 'success',
  };
};
