'use client';

import type * as React from 'react';
import Link from 'next/link';
import {
  Home,
  MessageCircle,
  Clock,
  FileText,
  Folder,
  Share2,
  Settings,
  Headphones,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function AppSideBar({ className }: SidebarProps) {
  return (
    <div
      className={cn(
        'flex h-screen w-16 flex-col items-center justify-between border-r bg-white py-4',
        className
      )}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900">
          <div className="h-6 w-6 rounded-full border-2 border-white"></div>
        </div>

        {/* Main navigation */}
        <nav className="flex flex-col items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-zinc-500 hover:bg-purple-50 hover:text-purple-600"
            asChild
          >
            <Link href="#">
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-purple-100 text-purple-600"
            asChild
          >
            <Link href="#">
              <MessageCircle className="h-5 w-5" />
              <span className="sr-only">Chat</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-zinc-500 hover:bg-purple-50 hover:text-purple-600"
            asChild
          >
            <Link href="#">
              <Clock className="h-5 w-5" />
              <span className="sr-only">History</span>
            </Link>
          </Button>
        </nav>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-zinc-500 hover:bg-purple-50 hover:text-purple-600"
          asChild
        >
          <Link href="#">
            <Headphones className="h-5 w-5" />
            <span className="sr-only">Support</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-zinc-500 hover:bg-purple-50 hover:text-purple-600"
          asChild
        >
          <Link href="#">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>
        <Avatar className="h-10 w-10 border-2 border-purple-200">
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
