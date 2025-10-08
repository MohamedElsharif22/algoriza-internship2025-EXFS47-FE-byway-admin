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
    <aside className="flex flex-col w-64 bg-white border-r px-6 py-6">
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
              // Clear stored auth and navigate to login
              // Importing authService directly here would create an additional dependency; using localStorage removal is sufficient
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
  );
};

export default Sidebar;