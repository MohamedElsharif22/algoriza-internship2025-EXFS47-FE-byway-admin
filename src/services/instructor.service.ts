import api from './api.config';
import { 
  Instructor, 
  InstructorFilters, 
  JobTitle, 
  InstructorsListResponse,
  ApiResponse 
} from '../types/api.types';

export const instructorService = {
  getAllInstructors: async (filters: InstructorFilters): Promise<InstructorsListResponse> => {
    const response = await api.get<InstructorsListResponse>('/instructors', { params: filters });
    return response.data;
  },

  getInstructorById: async (id: number): Promise<ApiResponse<Instructor>> => {
    const response = await api.get<ApiResponse<Instructor>>(`/instructors/${id}`);
    return response.data;
  },

  createInstructor: async (data: FormData): Promise<ApiResponse<Instructor>> => {
    const response = await api.post<ApiResponse<Instructor>>('/instructors', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateInstructor: async (id: number, data: FormData): Promise<ApiResponse<Instructor>> => {
    const response = await api.put<ApiResponse<Instructor>>(`/instructors/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteInstructor: async (id: number): Promise<ApiResponse<{ message: string; statusCode?: number }>> => {
    const response = await api.delete<ApiResponse<{ message: string; statusCode?: number }>>(`/instructors/${id}`);
    return response.data;
  },

  getAllJobTitles: async (): Promise<ApiResponse<JobTitle[]>> => {
    const response = await api.get<ApiResponse<JobTitle[]>>('/instructors/jobtitles');
    return response.data;
  },
};