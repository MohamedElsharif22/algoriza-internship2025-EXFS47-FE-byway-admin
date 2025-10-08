import { atom } from 'jotai';
import { Instructor, InstructorFilters, JobTitle, InstructorsListResponse } from '../types/api.types';

export const instructorsAtom = atom<InstructorsListResponse>({
  pageIndex: 1,
  pageSize: 10,
  count: 0,
  data: [],
});
export const instructorFiltersAtom = atom<InstructorFilters>({
  pageSize: 10,
  pageIndex: 1,
});
export const jobTitlesAtom = atom<JobTitle[]>([]);
export const selectedInstructorAtom = atom<Instructor | null>(null);
export const instructorLoadingAtom = atom<boolean>(false);