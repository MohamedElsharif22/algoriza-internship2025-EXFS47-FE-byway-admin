import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* add pb-16 on small screens to make room for the mobile navbar */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-20 md:pb-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;