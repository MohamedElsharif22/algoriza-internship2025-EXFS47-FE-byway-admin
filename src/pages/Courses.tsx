import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { DarkButton } from '../components/ui/Button';
import MultiSelect from '../components/ui/MultiSelect';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Dialog from '../components/ui/Dialog';
import CourseForm from '../components/ui/CourseForm';
import {
  coursesAtom,
  courseFiltersAtom,
  categoriesAtom,
  selectedCourseAtom,
  courseLoadingAtom,
} from '../store/course.store';
import { courseService } from '../services/course.service';
import { toast } from 'react-toastify';
import DeleteConfirmation from '../components/ui/DeleteConfirmation';
import Pagination from '../components/ui/Pagination';
import LoadingBanner from '../components/ui/LoadingBanner';

const CoursesPage = () => {
  const [courses, setCourses] = useAtom(coursesAtom);
  const [filters, setFilters] = useAtom(courseFiltersAtom);
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [selectedCourse, setSelectedCourse] = useAtom(selectedCourseAtom);
  const [loading, setLoading] = useAtom(courseLoadingAtom);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>(filters.search ?? '');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  // categories will be handled inside the popover
  const [popoverCategories, setPopoverCategories] = useState<number[] | undefined>(filters.categories);
  const [popoverSort, setPopoverSort] = useState<1|2|3|4|5|6|undefined>(filters.sort as 1|2|3|4|5|6|undefined);
  const [popoverPageSize, setPopoverPageSize] = useState<number | undefined>(filters.pageSize);
  const filterMenuRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  // edit flow moved to dedicated Edit Course page
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await courseService.getAllCourses(filters);
      setCourses(response);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await courseService.getAllCategories();
      setCategories(response || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  // debounce searchTerm -> filters.search
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm || undefined, pageIndex: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm, setFilters]);

  // close filter popover when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (filterMenuOpen && filterMenuRef.current && !filterMenuRef.current.contains(target) && filterButtonRef.current && !filterButtonRef.current.contains(target)) {
        setFilterMenuOpen(false);
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [filterMenuOpen]);

  const handleAddCourse = async (formData: FormData) => {
    try {
      await courseService.createCourse(formData);
      toast.success('Course added successfully');
      setIsAddDialogOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error('Failed to add course');
    }
  };

  // handled by edit dialog flow below

  // edit flow moved to dedicated Edit Course page

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      await courseService.deleteCourse(selectedCourse.id);
      toast.success('Course deleted successfully');
  setIsDeleteDialogOpen(false);
  setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);

      // If the error was enriched by the service, show the server message and status
      const anyErr = error as any;
      const serverMessage = anyErr?.message || anyErr?.details?.serverMessage;
      const status = anyErr?.details?.status ?? anyErr?.status ?? (anyErr?.response?.status);

      // Provide diagnostic info for 401 specifically
      if (status === 401) {
        // Check token presence in localStorage / AuthUtils
        try {
          const { AuthUtils } = await import('../utils/auth.utils');
          const t = AuthUtils.getToken();
          console.debug('DeleteCourse 401 diagnostics - token present:', !!t, 'token len:', t ? t.length : 0);
        } catch (diagErr) {
          console.debug('Failed to read token for diagnostics', diagErr);
        }
      }

      toast.error(serverMessage || 'Failed to delete course');
    }
  };

  return (
    <div className="space-y-4">
        {loading && <LoadingBanner message="Loading courses..." />}
        <PageHeader
          title="Courses"
          subtitle={
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Dashboard</span>
              <span className="mx-1">/</span>
              <span>Courses</span>
              
            </div>
          }
        />
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="p-6">
          <div className="flex items-center flex-wrap justify-between mb-6">
              <div className="flex mb-3">
                <h4 className="text-3xl font-extrabold text-slate-800 tracking-tight">Courses</h4>
                <span className="inline-flex items-center ml-3 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                        {courses.total ?? courses.data?.length ?? 0}
                      </span>
              </div>
            <div />

            <div className="flex items-center gap-4">
              <DarkButton onClick={() => navigate('/courses/add')} className="rounded-lg px-4 py-2 min-w-[110px] whitespace-nowrap flex-shrink-0">
                Add Course
              </DarkButton>

              <div className="flex items-center gap-4 w-full max-w-3xl">
                {/* Removed inline sort & pageSize per request; only category multi-select, search and filter button remain */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for Courses"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); }}
                    className="pl-12 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm bg-white shadow-sm"
                  />
                </div>

                <div className="flex items-center">
                  <div className="relative">
                    <button
                      ref={filterButtonRef}
                      title="Filter"
                      onClick={() => {
                        // sync popover state from global filters when opening
                        setPopoverSort(filters.sort);
                        setPopoverPageSize(filters.pageSize);
                        setFilterMenuOpen((s) => !s);
                      }}
                      className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 17v-4.586L3.293 6.707A1 1 0 013 6V4z" />
                      </svg>
                    </button>

                    {filterMenuOpen && (
                      <div ref={filterMenuRef} className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-lg shadow-lg p-3 z-40">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Categories</label>
                            <MultiSelect
                              options={categories.map((c) => ({ id: c.id, name: c.name }))}
                              value={popoverCategories ?? []}
                              onChange={(selected) => setPopoverCategories(selected.length ? selected : undefined)}
                              placeholder="All Categories"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Sort</label>
                            <select aria-label="Sort options" value={popoverSort ?? 5} onChange={(e) => setPopoverSort(Number(e.target.value) as 1|2|3|4|5|6)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                              <option value={5}>Newest</option>
                              <option value={6}>Oldest</option>
                              <option value={1}>Price: Low to High</option>
                              <option value={2}>Price: High to Low</option>
                              <option value={3}>Rating: Low to High</option>
                              <option value={4}>Rating: High to Low</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Per page</label>
                            <select aria-label="Per page" value={popoverPageSize ?? 9} onChange={(e) => setPopoverPageSize(Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                              <option value={6}>6</option>
                              <option value={9}>9</option>
                              <option value={12}>12</option>
                              <option value={24}>24</option>
                            </select>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                // Apply categories, sort and pageSize to global filters and close
                                setFilters({ ...filters, categories: popoverCategories, sort: popoverSort, pageSize: popoverPageSize, pageIndex: 1 });
                                setFilterMenuOpen(false);
                              }}
                              className="flex-1 bg-primary-600 text-white px-3 py-2 rounded-lg text-sm"
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => {
                                setFilters({ ...filters, search: undefined, pageIndex: 1, sort: 5, pageSize: 9 });
                                setFilterMenuOpen(false);
                              }}
                              className="flex-1 border border-gray-200 px-3 py-2 rounded-lg text-sm"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
              </div>
            ) : (
              (courses.data || []).map((course) => (
                <div key={course.id} className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                  <div className="relative rounded-lg overflow-hidden ove p-3">
                    <img src={course.coverPictureUrl ?? course.coverPicture} alt={course.title} className="w-full h-44 object-cover rounded-lg shadow-sm" />
                    <span className="absolute top-5 left-5 bg-white/95 text-xs px-3 py-1 rounded-full font-medium text-primary-600 shadow">
                      {course.categoryName || categories.find((c) => c.id === course.categoryId)?.name}
                    </span>
                  </div>

                  <div className="p-4 flex-1">
                    <h3 className="text-md font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">By {course.instructorName ?? course.instructorId}</p>

                    <div className="flex items-center gap-2 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`h-4 w-4 ${i < Math.round(course.rating ?? 0) ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.377 2.455a1 1 0 00-.364 1.118l1.287 3.965c.3.922-.755 1.688-1.54 1.118l-3.377-2.455a1 1 0 00-1.176 0L5.34 18.848c-.785.57-1.84-.196-1.54-1.118l1.287-3.965a1 1 0 00-.364-1.118L1.346 9.192c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69L9.05 2.927z" />
                        </svg>
                      ))}
                      <span className="text-xs text-gray-500">{Math.round(course.rating ?? 0)}</span>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                      {(typeof course.durationInHours === 'number'
                        ? course.durationInHours
                        : (typeof course.durationInMinutes === 'number' ? Math.round((course.durationInMinutes || 0) / 60) : 0))} Total Hours. {course.lecturesCount ?? 0} Lectures. {(() => {
                        if (course.level) return course.level;
                        if (course.courseLevel === 2) return 'Intermediate';
                        if (course.courseLevel === 3) return 'Advanced';
                        return 'Beginner';
                      })()}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900">${(course.price ?? 0).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-start items-center p-4 bg-white">
                    <div className="rounded-lg shadow-lg bg-white p-2 pb-0">
                      <button title="View" onClick={() => navigate(`/courses/view/${course.id}`)} className="text-blue-500 hover:text-blue-700">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="rounded-lg shadow-lg bg-white p-2 pb-0">
                      <button title="Edit" onClick={() => navigate(`/courses/edit/${course.id}`)} className="text-blue-500 hover:text-blue-700">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="rounded-lg shadow-lg bg-white p-2 pb-0">
                      <button title="Delete" onClick={() => { setSelectedCourse(course); setIsDeleteDialogOpen(true); }} className="text-red-400 hover:text-red-600">
                        <TrashIcon className="h-5 w-5 mb-0" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-center mt-6">
            <Pagination
              currentPage={Number(filters.pageIndex ?? courses.current_page ?? 1)}
              totalPages={Number(courses.last_page ?? 1)}
              onPageChange={(page) => setFilters({ ...filters, pageIndex: Number(page) })}
            />
          </div>
        </div>
      </div>

      {/* Add Course Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Add Course"
      >
        <CourseForm
          categories={categories}
          onSubmit={handleAddCourse}
          onCancel={() => setIsAddDialogOpen(false)}
        />
      </Dialog>

      {/* Edit flow moved to dedicated page: /courses/edit/:id */}

      {/* View handled by dedicated page: /courses/view/:id */}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteCourse}
        targetName={selectedCourse?.title}
        title={`Delete Course ${selectedCourse?.title ?? ''}`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default CoursesPage;