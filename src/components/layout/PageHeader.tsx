import { ReactNode } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <div className="px-2 pt-8 pb-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
          {subtitle && (
            <div className="mt-2 text-sm text-slate-400 font-medium">
              {subtitle}
            </div>
          )}
        </div>

        <div className="flex items-center">
          <div className="relative">
            <button aria-label="Notifications" title="Notifications" className="w-14 h-14 bg-white rounded-full shadow flex items-center justify-center text-muted">
              <BellIcon className="w-6 h-6 text-slate-600 " />
            </button>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white"></span>
          </div>
        </div>
      </div>

      <hr className="mt-6 border-slate-200" />
    </div>
  );
};

export default PageHeader;
