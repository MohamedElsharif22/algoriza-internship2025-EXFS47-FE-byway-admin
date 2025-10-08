import React, { useMemo, useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { Category } from '../../types/api.types';
import Button from './Button';

interface InstructorOption { id: number; name: string }

interface CourseDetailsValues {
    title: string;
    description: string;
    price: number | '';
    categoryId: number | '';
    instructorId: number | '';
    instructorName?: string;
    totalHours?: number | '';
    rating?: number;
    courseLevel: number | '';
    coverPicture: File | null;
    coverPictureUrl?: string;
}

interface Props {
  initialValues?: Partial<CourseDetailsValues>;
  categories: Category[];
  instructors: InstructorOption[];
  onNext: (values: CourseDetailsValues) => void;
  onCancel?: () => void;
}

const CourseDetailsForm: React.FC<Props> = ({ initialValues = {}, categories, instructors, onNext, onCancel }) => {
  const hasExistingCover = Boolean(initialValues.coverPictureUrl);

  // Set initial instructor name for datalist input if editing
  const [instructorSearch, setInstructorSearch] = useState(
    initialValues.instructorName ?? ''
  );

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required').max(200),
    description: Yup.string().required('Description is required').min(100, 'Description must be at least 100 characters'),
    price: Yup.number().typeError('Price must be a number').min(0).required('Price is required'),
    categoryId: Yup.number().typeError('Category is required').required('Category is required'),
    instructorId: Yup.number().typeError('Instructor is required').required('Instructor is required'),
    rating: Yup.number().typeError('Rating is required').min(1).max(5).required('Rating is required'),
    courseLevel: Yup.number().typeError('Level is required').min(1).max(3).required('Level is required'),
  });

  // Already declared above with initialInstructorName
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialValues.coverPictureUrl ?? null);

  const filteredInstructors = useMemo(() => {
    if (!instructorSearch) return instructors;
    const q = instructorSearch.toLowerCase();
    return instructors.filter((i) => i.name.toLowerCase().includes(q));
  }, [instructorSearch, instructors]);

  // utility to set instructorId on Formik when a name is selected from datalist
  const handleInstructorNameChange = (name: string) => {
    setInstructorSearch(name);
    const found = instructors.find((it) => it.name === name);
    if (found) {
      formik.setFieldValue('instructorId', found.id);
    } else {
      formik.setFieldValue('instructorId', '');
    }
  };

  const formik = useFormik<CourseDetailsValues>({
    initialValues: {
      title: initialValues.title ?? '',
      description: initialValues.description ?? '',
      price: (initialValues.price as number) ?? '',
      categoryId: (initialValues.categoryId as number) ?? '' as any,
      instructorId: (initialValues.instructorId as number) ?? '' as any,
      totalHours: (initialValues.totalHours as number) ?? '' as any,
      rating: initialValues.rating ?? 5,
      courseLevel: (initialValues.courseLevel !== undefined ? initialValues.courseLevel : '') as any,
      coverPicture: null,
      coverPictureUrl: initialValues.coverPictureUrl ?? undefined,
    },
    validationSchema,
    onSubmit: (values) => onNext(values),
  });

  // keep previewUrl in sync with selected file
  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Course details</h3>

      <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64 h-36 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center w-full h-full flex items-center justify-center">
              {previewUrl ? (
                // show preview
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem', maxWidth: '100%', maxHeight: '100%' }} />
              ) : (
                <>
                  <PhotoIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <span className="text-gray-500 text-sm">Upload Image</span>
                </>
              )}
            </div>
          </div>

          <div className="flex-1">
            <p className="text-gray-700 font-medium mb-1 text-sm sm:text-base">Size: 700x430 pixels</p>
            <p className="text-gray-700 mb-3 text-sm sm:text-base">File Support: .jpg, .jpeg, png, or .gif</p>
            <div className="mt-2">
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0] ?? null;
                  formik.setFieldValue('coverPicture', file);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                  }
                }}
                className="hidden"
              />
              <label htmlFor="cover-upload" className="inline-flex items-center px-3 py-2 border border-blue-500 text-blue-500 rounded-lg cursor-pointer"> <PhotoIcon className="w-4 h-4 mr-2" /> Upload Image</label>
            </div>
            {formik.touched.coverPicture && formik.errors.coverPicture && <p className="text-red-500 text-sm mt-2">{String(formik.errors.coverPicture)}</p>}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-gray-900 font-medium mb-2">Description</label>
            <textarea placeholder="Write here" {...formik.getFieldProps('description')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-32" />
            {formik.touched.description && formik.errors.description && <p className="text-red-500 text-sm mt-1">{String(formik.errors.description)}</p>}
          </div>
          <div>
            <label className="block text-gray-900 font-medium mb-2">Course Name</label>
            <input type="text" placeholder="Write here" {...formik.getFieldProps('title')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            {formik.touched.title && formik.errors.title && <p className="text-red-500 text-sm mt-1">{formik.errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-900 font-medium mb-2">Category</label>
              <select {...formik.getFieldProps('categoryId')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500">
                <option value="">Choose</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {formik.touched.categoryId && formik.errors.categoryId && <p className="text-red-500 text-sm mt-1">{String(formik.errors.categoryId)}</p>}
            </div>

            <div>
              <label className="block text-gray-900 font-medium mb-2">Level</label>
              <select {...formik.getFieldProps('courseLevel')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500">
                <option value="">Choose</option>
                <option value={1}>Beginner</option>
                <option value={2}>Intermediate</option>
                <option value={3}>Advanced</option>
              </select>
              {formik.touched.courseLevel && formik.errors.courseLevel && <p className="text-red-500 text-sm mt-1">{String(formik.errors.courseLevel)}</p>}
            </div>
            <div>
              <label className="block text-gray-900 font-medium mb-2">Rating</label>
              <select {...formik.getFieldProps('rating')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500">
                <option value="">Choose</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
              {formik.touched.rating && formik.errors.rating && <p className="text-red-500 text-sm mt-1">{String(formik.errors.rating)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-900 font-medium mb-2">Instructor</label>
              <select
                {...formik.getFieldProps('instructorId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500"
              >
                <option value="">Choose</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
              {formik.touched.instructorId && formik.errors.instructorId && <p className="text-red-500 text-sm mt-1">{String(formik.errors.instructorId)}</p>}
            </div>

            <div>
              <label className="block text-gray-900 font-medium mb-2">Cost</label>
              <input {...formik.getFieldProps('price')} type="number" placeholder="Write here" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              {formik.touched.price && formik.errors.price && <p className="text-red-500 text-sm mt-1">{String(formik.errors.price)}</p>}
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <Button type="button" variant="secondary" onClick={() => onCancel?.()} className="px-6 py-3">Cancel</Button>
            <Button
              type="button"
              variant="dark"
              className="px-6 py-3"
              onClick={async () => {
                // mark main fields as touched so validation messages show
                formik.setTouched({
                  title: true,
                  description: true,
                  price: true,
                  categoryId: true,
                  instructorId: true,
                  courseLevel: true,
                } as any);
                // trigger formik submission (runs validation then onSubmit)
                await formik.submitForm();
              }}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CourseDetailsForm;
