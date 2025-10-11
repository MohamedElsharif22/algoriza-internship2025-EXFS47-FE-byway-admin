import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent } from '../components/ui/Card';
import { ChartBarIcon, UsersIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardStatsAtom, dashboardLoadingAtom } from '../store/dashboard.store';
import { dashboardService } from '../services/dashboard.service';
import LoadingBanner from '../components/ui/LoadingBanner';

const getStatsData = (stats: any) => [
  {
    id: 1,
    name: 'Total Instructors',
    value: stats?.instructorsCount || '0',
    icon: UsersIcon,
    change: '+12%',
    changeType: 'positive' as const,
  },
  {
    id: 2,
    name: 'Categories',
    value: stats?.categoriesCount || '0',
    icon: ChartBarIcon,
    change: '+5%',
    changeType: 'positive' as const,
  },
  {
    id: 3,
    name: 'Total Courses',
    value: stats?.coursesCount || '0',
    icon: AcademicCapIcon,
    change: '+18%',
    changeType: 'positive' as const,
  },
];

const StatCard = ({
  name,
  value,
  icon: Icon,
  change,
  changeType,
}: {
  name: string;
  value: string;
  icon: any;
  change: string;
  changeType: 'positive' | 'negative';
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
          <p className="text-sm text-gray-500">{name}</p>
        </div>
        {change && (
          <div className="ml-auto">
            <span
              className={`inline-flex text-sm font-medium ${
                changeType === 'positive'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {change}
            </span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useAtom(dashboardStatsAtom);
  const [loading, setLoading] = useAtom(dashboardLoadingAtom);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [setStats, setLoading]);

  if (loading || !stats) {
    return (
      <>
        <LoadingBanner message="Loading dashboard data..." />
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  const statsData = getStatsData(stats);

  // Prepare dashboard-specific data for charts
  const dashboardData = {
    walletBalance: stats.totalRevenue || 0,
    walletChange: 2.45, // placeholder percent change
  };

  const walletChartData = stats.revenueStats?.map((r: any) => ({
    month: r.month,
    deposits: r.deposits,
    withdrawals: r.withdrawals,
  })) || [];

  const statisticsData = [
    { name: 'Instructors', value: stats.distributionStats.instructors, color: '#5B21B6' },
    { name: 'Categories', value: stats.distributionStats.categories, color: '#60A5FA' },
    { name: 'Courses', value: stats.distributionStats.courses, color: '#93C5FD' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="text-sm text-gray-500">&nbsp;</div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statsData.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Section */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Wallet</h2>
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">This month</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-4xl font-bold text-gray-900">${(dashboardData.walletBalance / 1000).toFixed(1)}K</div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-gray-500">Wallet Balance</span>
              <span className="text-green-500 text-sm font-medium">+{dashboardData.walletChange}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-green-50 text-green-600 rounded-lg w-fit">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">On your account</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={walletChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#999" />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="deposits" stroke="#4F46E5" strokeWidth={3} dot={{ fill: '#4F46E5', r: 4 }} />
                <Line type="monotone" dataKey="withdrawals" stroke="#38BDF8" strokeWidth={3} dot={{ fill: '#38BDF8', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Deposits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-sky-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Withdrawals</span>
            </div>
          </div>
        </div>

        {/* Statistics Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Statistics</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statisticsData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {statisticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 mt-6">
            {statisticsData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;