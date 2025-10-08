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
    const params: any = {};
  const requestedPageSize = Math.min(30, filters.pageSize ?? 9);
  params.PageSize = requestedPageSize;
    params.PageIndex = filters.pageIndex ?? 1;
    if (filters.search) params.Search = filters.search;
    if (filters.sort) params.Sort = filters.sort;
    if (filters.instructorId) params.InstructorId = filters.instructorId;
    if (filters.categories) params.Categories = filters.categories;

  const response = await api.get<any>('/Courses', { params });
        // Handle both shapes: ApiResponse<T> -> { data: T } or direct payload
        console.log("response",response);
  const payload = response.data ?? {};
        console.log("Payload",response);

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
    const response = await api.get<ApiResponse<Course>>(`/Courses/${id}`);
    return response.data?.data ?? null;
  },

  createCourse: async (data: FormData): Promise<Course | null> => {
    const response = await api.post<ApiResponse<Course>>('/Courses', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data ?? null;
  },

  updateCourse: async (id: number, data: FormData): Promise<Course | null> => {
    const response = await api.put<ApiResponse<Course>>(`/Courses/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data ?? null;
  },

  deleteCourse: async (id: number): Promise<string | void> => {
    // Use the explicit API path as requested: /api/Courses/{id}
    const response = await api.delete<ApiResponse<string>>(`/api/Courses/${id}`);
    return response.data?.message;
  },

  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/Courses/categories');
    return response.data?.data ?? [];
  },
};