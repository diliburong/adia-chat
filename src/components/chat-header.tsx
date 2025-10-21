'use client';

import { useWindowSize } from 'usehooks-ts';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ModelSelector } from '@/components/model-selector';
import { signOut } from 'next-auth/react';

export const ChatHeader = () => {
  const router = useRouter();
  const { width } = useWindowSize();

  return (
    <header className="bg-background sticky top-0 flex items-center gap-2 px-2 py-1.5 md:px-2">
      <SidebarTrigger className="-ml-1 cursor-pointer" />
      <Button
        onClick={() => {
          signOut();
        }}
      >
        logout
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="order-2 ml-auto cursor-pointer px-2 md:order-1 md:ml-0 md:h-fit md:px-2"
            onClick={() => {
              router.push('/');
              router.refresh();
            }}
          >
            <PlusIcon />
            <span className="md:sr-only">New Chat</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>New Chat</p>
        </TooltipContent>
      </Tooltip>
      <ModelSelector />
    </header>
  );
};
