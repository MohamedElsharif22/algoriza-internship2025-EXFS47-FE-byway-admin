import { BellIcon } from '@heroicons/react/24/outline';

const Header = () => {
  

  return (
    <header className="h-20 bg-white border-b flex items-center justify-between px-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-800">Dashboard</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center">
            <BellIcon className="w-6 h-6 text-slate-600" />
          </button>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white"></span>
        </div>

        {/* (avatar removed per design) */}
      </div>
    </header>
  );
};

export default Header;