import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface LoadingBannerProps {
  message?: string;
}

const LoadingBanner = ({ message = 'Loading...' }: LoadingBannerProps) => {
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-center gap-2 shadow-lg">
        <ArrowPathIcon className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default LoadingBanner;