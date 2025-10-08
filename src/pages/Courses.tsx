import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
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

const CoursesPage = () => {
  const [courses, setCourses] = useAtom(coursesAtom);
  const [filters, setFilters] = useAtom(courseFiltersAtom);
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [selectedCourse, setSelectedCourse] = useAtom(selectedCourseAtom);
  const [loading, setLoading] = useAtom(courseLoadingAtom);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await courseService.getAllCourses(filters);
      console.log('[CoursesPage] fetched payload:', response);
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

  const handleEditCourse = async (formData: FormData) => {
    if (!selectedCourse) return;

    try {
      await courseService.updateCourse(selectedCourse.id, formData);
      toast.success('Course updated successfully');
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
    }
  };

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
      toast.error('Failed to delete course');
    }
  };

  return (
    <div className="space-y-4">
      {import.meta.env.DEV && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">DEV: Courses component mounted</div>
      )}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
              {courses.total ?? courses.data?.length ?? 0}
            </span>
          </div>

          <div className="flex-1 flex justify-center">
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-black text-white px-4 py-2 rounded-full">
              Add Course
            </Button>
          </div>

          <div className="flex items-center space-x-3 w-96 justify-end">
            <div className="relative w-40">
              <select
                value={(filters.categories || [])[0] || ''}
                onChange={(e) => {
                  const categoryId = e.target.value ? Number(e.target.value) : undefined;
                  setFilters({ ...filters, categories: categoryId ? [categoryId] : undefined, pageIndex: 1 });
                }}
                className="w-full rounded-full border-gray-200 px-4 py-2 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for Courses"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, pageIndex: 1 })}
                className="pl-10 w-full rounded-full border-gray-200 px-3 py-2 text-sm"
              />
            </div>

            <button className="p-2 rounded-full border border-gray-200 bg-white">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 17v-4.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
            </div>
          ) : (
            (courses.data || []).map((course) => (
              <div key={course.id} className="border border-gray-100 rounded-xl overflow-hidden bg-white">
                <div className="relative">
                  <img src={course.coverPictureUrl ?? course.coverPicture} alt={course.title} className="w-full h-40 object-cover" />
                  <span className="absolute top-3 left-3 bg-white/90 text-xs px-2 py-1 rounded-full font-medium text-primary-600">
                    {course.categoryName || categories.find((c) => c.id === course.categoryId)?.name}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">By {course.instructorName || course.instructorId}</p>

                  <div className="flex items-center gap-2 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`h-4 w-4 ${i < Math.round(course.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.377 2.455a1 1 0 00-.364 1.118l1.287 3.965c.3.922-.755 1.688-1.54 1.118l-3.377-2.455a1 1 0 00-1.176 0L5.34 18.848c-.785.57-1.84-.196-1.54-1.118l1.287-3.965a1 1 0 00-.364-1.118L1.346 9.192c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69L9.05 2.927z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-500">{Math.round(course.rating || 0)}</span>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">{course.durationInMinutes ?? 0} Total Hours. {course.lecturesCount ?? 0} Lectures. Beginner</p>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">${(course.price || 0).toFixed(2)}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelectedCourse(course); setIsViewDialogOpen(true); }} className="p-2 bg-white border border-gray-100 rounded-full text-gray-500 hover:text-gray-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => { setSelectedCourse(course); setIsEditDialogOpen(true); }} className="p-2 bg-white border border-gray-100 rounded-full text-gray-500 hover:text-gray-900">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => { setSelectedCourse(course); setIsDeleteDialogOpen(true); }} className="p-2 bg-white border border-gray-100 rounded-full text-red-500 hover:text-red-700">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
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

      {/* Edit Course Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Edit Course"
      >
        {selectedCourse && (
          <CourseForm
            course={selectedCourse}
            categories={categories}
            onSubmit={handleEditCourse}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        )}
      </Dialog>

      {/* View Course Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        title="Course Details"
      >
        {selectedCourse && (
          <div className="space-y-4">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={selectedCourse.coverPicture}
                alt={selectedCourse.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {selectedCourse.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedCourse.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Category</h4>
                <p className="mt-1 text-sm text-gray-500">
                  {categories.find((c) => c.id === selectedCourse.categoryId)?.name}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Price</h4>
                <p className="mt-1 text-sm text-gray-500">
                  ${selectedCourse.price.toFixed(2)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Rating</h4>
                <div className="mt-1 flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-sm text-gray-900">
                    {selectedCourse.rating}
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Instructor</h4>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedCourse.instructorId}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <Button
                variant="secondary"
                onClick={() => setIsViewDialogOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>

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