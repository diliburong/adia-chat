import { AppSideBar } from '@/components/layout';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen">
      <AppSideBar />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
};

export default MainLayout;
