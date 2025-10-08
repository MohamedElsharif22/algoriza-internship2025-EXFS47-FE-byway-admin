// import api from './api.config';
import api from './api.config';
import { ApiResponse } from '../types/api.types';

export interface DashboardStats {
  instructorsCount: number;
  coursesCount: number;
  categoriesCount: number;
  totalRevenue: number;
  revenueStats: {
    month: string;
    deposits: number;
    withdrawals: number;
  }[];
  distributionStats: {
    instructors: number;
    categories: number;
    courses: number;
  };
}

export const dashboardService = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    // Fetch courses, categories, instructors
    const [coursesResp, categoriesResp, instructorsResp] = await Promise.all([
      api.get('/Courses?PageSize=30&PageIndex=1'),
      api.get('/Courses/categories'),
      api.get('/instructors?pagesize=20&pageindex=1&search='),
    ]);

  const coursesPayload = coursesResp.data || {};
  const coursesData = coursesPayload.data || [];
  const coursesCount = coursesPayload.count ?? coursesData.length;

  const categoriesData = categoriesResp.data || [];
  const categoriesCount = Array.isArray(categoriesData) ? categoriesData.length : 0;

  const instructorsPayload = instructorsResp.data || {};
  const instructorsData = instructorsPayload.data || [];
  const instructorsCount = instructorsPayload.count ?? instructorsData.length;

    // totalRevenue: sum of course prices (as a rough metric)
  const totalRevenue = coursesData.reduce((sum: number, c: any) => sum + (c.price || 0), 0);

    // Build simple revenueStats from courses by month (mocked if not available)
    const revenueStats = [
      { month: 'SEP', deposits: 2400, withdrawals: 1600 },
      { month: 'OCT', deposits: 3000, withdrawals: 2000 },
      { month: 'NOV', deposits: 2800, withdrawals: 1800 },
      { month: 'DEC', deposits: 3200, withdrawals: 2100 },
      { month: 'JAN', deposits: 3600, withdrawals: 2400 },
    ];

  const total = (instructorsCount + categoriesCount + coursesCount) || 1;
    const distributionStats = {
      instructors: Math.round((instructorsCount / total) * 100),
      categories: Math.round((categoriesCount / total) * 100),
      courses: Math.round((coursesCount / total) * 100),
    };

    const result: ApiResponse<DashboardStats> = {
      status: 200,
      data: {
        instructorsCount,
        coursesCount,
        categoriesCount,
        totalRevenue,
        revenueStats,
        distributionStats,
      },
    };

    return result;
  },
};