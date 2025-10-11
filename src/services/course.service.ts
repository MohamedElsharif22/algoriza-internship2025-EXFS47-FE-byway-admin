import api from './api.config';
import {
  Course,
  CourseFilters,
  Category,
  PaginatedResponse,
  ApiResponse,
} from '../types/api.types';

export const courseService = {
  getAllCourses: async (filters: CourseFilters): Promise<PaginatedResponse<Course>> => {
    // Map local filter keys to API query params and enforce PageSize cap of 30
    const requestedPageSize = Math.min(30, filters.pageSize ?? 9);

    // Build query string using URLSearchParams to allow repeated keys like Categories=1&Categories=2
    const params = new URLSearchParams();
    params.append('PageSize', String(requestedPageSize));
    params.append('PageIndex', String(filters.pageIndex ?? 1));

    if (filters.search !== undefined) params.append('Search', String(filters.search ?? ''));
    if (filters.sort !== undefined) params.append('Sort', String(filters.sort));
    if (filters.instructorId !== undefined) params.append('InstructorId', String(filters.instructorId));

    if (filters.priceRange) {
      params.append('PriceRange.Min', String(filters.priceRange.min ?? 0));
      params.append('PriceRange.Max', String(filters.priceRange.max ?? 0));
    }

    if (filters.rangeOfLectures) {
      params.append('RangeOfLectures.Min', String(filters.rangeOfLectures.min ?? 0));
      params.append('RangeOfLectures.Max', String(filters.rangeOfLectures.max ?? 0));
    }

    if (filters.categories && filters.categories.length > 0) {
      filters.categories.forEach((c) => params.append('Categories', String(c)));
    }

    const url = `/Courses?${params.toString()}`;
      const response = await api.get<any>(url);
      // Handle both shapes: ApiResponse<T> -> { data: T } or direct payload
      const payload = response.data ?? {};

    // Normalize various possible pagination shapes into PaginatedResponse
    const data: Course[] = payload.data || [];
    const current_page: number = payload.current_page ?? payload.pageIndex ?? 1;
  const pageSize: number = payload.pageSize ?? payload.page_size ?? payload.pageSize ?? requestedPageSize ?? 10;
    const total: number = payload.total ?? payload.count ?? data.length;
    const last_page: number = payload.last_page ?? payload.lastPage ?? Math.max(1, Math.ceil(total / pageSize));

    return {
      data,
      current_page,
      last_page,
      total,
    } as PaginatedResponse<Course>;
  },

  getCourseById: async (id: number): Promise<Course | null> => {
    // Use the correct endpoint and map the response shape
    const response = await api.get(`/Courses/${id}`);
    // If response.data is the course object directly, return it
    if (response.data && typeof response.data === 'object' && response.data.id) {
      return response.data;
    }
    // If wrapped in { data: ... }
    return response.data?.data ?? null;
  },

  createCourse: async (data: FormData): Promise<Course | null> => {
    // Let the browser/axios set the Content-Type (including boundary) for multipart/form-data
    const response = await api.post<ApiResponse<Course>>('/Courses', data);
    return response.data?.data ?? null;
  },

  updateCourse: async (id: number, data: FormData): Promise<Course | null> => {
    const response = await api.put<ApiResponse<Course>>(`/Courses/${id}`, data);
    return response.data?.data ?? null;
  },

  deleteCourse: async (id: number): Promise<string | void> => {
    // DELETE /Courses/{id} — ensure token present and surface server errors clearly
    const token = (await import('../utils/auth.utils')).AuthUtils.getToken();
    if (!token) {
      throw new Error('No auth token available. Please login.');
    }

    try {
      const response = await api.delete<ApiResponse<string>>(`/Courses/${id}`);
      return response.data?.message;
    } catch (err: any) {
      // Normalize axios error to include server message and status
      const serverMessage = err?.response?.data?.message || err?.response?.data || err?.message;
      const status = err?.response?.status;
      const details = {
        status,
        serverMessage,
        url: err?.config?.url,
        method: err?.config?.method,
      };
      // Attach details to error for upstream handling
      const error = new Error(`DeleteCourse failed: ${serverMessage || 'Unknown error'}`);
      (error as any).details = details;
      throw error;
    }
  },

  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get('/Courses/categories');
    // API may return either an ApiResponse wrapper ({ data: [...] }) or the raw array.
    const payload = response.data;
    if (Array.isArray(payload)) return payload as Category[];
    if (payload && Array.isArray(payload.data)) return payload.data as Category[];
    return [];
  },
  getCourseLevels: async (): Promise<Array<{ level: string; value: number }>> => {
    const response = await api.get('/Courses/levels');
    const payload = response.data;
    // API may return array directly or wrapper
    if (Array.isArray(payload)) return payload as any;
    if (payload && Array.isArray(payload.data)) return payload.data as any;
    return [];
  },
};