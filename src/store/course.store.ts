import { atom } from 'jotai';
import { Course, Category, CourseFilters, PaginatedResponse } from '../types/api.types';

export const coursesAtom = atom<PaginatedResponse<Course>>({
  data: [],
  current_page: 1,
  last_page: 1,
  total: 0,
});
export const courseFiltersAtom = atom<CourseFilters>({
  pageSize: 9,
  pageIndex: 1,
  sort: 5, // Newest by default
});
export const categoriesAtom = atom<Category[]>([]);
export const selectedCourseAtom = atom<Course | null>(null);
export const courseLoadingAtom = atom<boolean>(false);