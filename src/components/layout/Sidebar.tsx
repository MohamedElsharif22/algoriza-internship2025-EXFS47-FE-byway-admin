import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { 
  HomeIcon, 
  UserGroupIcon, 
  AcademicCapIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Instructors', href: '/instructors', icon: UserGroupIcon },
  { name: 'Courses', href: '/courses', icon: AcademicCapIcon },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r px-6 py-6">
        {/* Logo + text */}
        <div className="flex items-center gap-3 mb-8">
          <img src={logo} alt="Byway Logo" className="w-8 h-8 rounded-full" />
          <span className="text-2xl font-semibold text-slate-700">Byway</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-3">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 text-lg rounded-xl',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-gray-50'
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="leading-none">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t pt-6">
          <button
            className="flex items-center gap-3 text-slate-500 text-base lowercase"
            onClick={() => {
              try {
                localStorage.removeItem('token');
              } catch (e) {
                // ignore
              }
              navigate('/login');
            }}
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span>logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom navbar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t md:hidden">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'flex-1 flex flex-col items-center justify-center text-xs py-2',
                    isActive ? 'text-blue-600' : 'text-slate-600'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="mt-1">{item.name}</span>
                </Link>
              );
            })}

            {/* Logout as a button on mobile */}
            <button
              onClick={() => {
                try { localStorage.removeItem('token'); } catch (e) {}
                navigate('/login');
              }}
              className="flex-1 flex flex-col items-center justify-center text-xs text-slate-600 py-2"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              <span className="mt-1">Logout</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;