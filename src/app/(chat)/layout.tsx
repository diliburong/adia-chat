import { DataStreamProvider } from '@/components/data-stream-provider';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSideBar } from '@/components/app-sidebar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataStreamProvider>
      <SidebarProvider>
        <AppSideBar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </DataStreamProvider>
  );
}
