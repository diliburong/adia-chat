'use client';

import Form from 'next/form';
import { providerMap } from '@/app/(auth)/auth';
import { useActionState } from 'react';
import { login } from '../actions';
import { GithubIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';

export default function Login() {
  const [state, formAction] = useActionState<{ status: string }>(login, {
    status: 'idle',
  });

  return (
    <>
      <div className="bg-muted flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md rounded-2xl p-6 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">登录到你的账户</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {providerMap.map(provider => (
              <form key={provider.id} action={formAction}>
                <Button variant="outline" className="flex w-full items-center gap-2">
                  <GithubIcon className="h-5 w-5" />
                  使用 {provider.name} 登录
                </Button>
              </form>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
