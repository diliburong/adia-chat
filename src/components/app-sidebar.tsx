'use client';

import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar';
import { SidebarHistory } from './sidebar-history';

export const AppSideBar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row items-center justify-between">
            <Link href="/">
              <span className="hover:bg-muted cursor-pointer rounded-md px-2 text-lg font-semibold">
                Chatbot
              </span>
            </Link>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
};
