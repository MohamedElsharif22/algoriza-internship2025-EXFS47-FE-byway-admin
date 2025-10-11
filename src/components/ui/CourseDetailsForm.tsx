import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PhotoIcon } from '@heroicons/react/24/outline';
import LoadingBanner from './LoadingBanner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './course-quill.css';
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
  levels?: { level: string; value: number }[];
  onNext?: (values: CourseDetailsValues) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

const CourseDetailsForm: React.FC<Props> = ({ initialValues = {}, categories, instructors, levels = [], onNext, onCancel, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required').max(200),
  description: Yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
    price: Yup.number().typeError('Price must be a number').min(0).required('Price is required'),
    categoryId: Yup.number().typeError('Category is required').required('Category is required'),
    instructorId: Yup.number().typeError('Instructor is required').required('Instructor is required'),
    rating: Yup.number().typeError('Rating is required').min(1).max(5).required('Rating is required'),
    courseLevel: Yup.number().typeError('Level is required').min(1).max(3).required('Level is required'),
  });

  // Already declared above with initialInstructorName
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialValues.coverPictureUrl ?? null);

  // (kept instructorSearch state for potential future use)

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
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await onNext?.(values as CourseDetailsValues);
      } finally {
        setIsLoading(false);
      }
    },
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
      {isLoading && <LoadingBanner message="Saving course details..." />}
      <h3 className="text-xl font-semibold text-gray-900">Course details</h3>

      <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64 h-36 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center w-full h-full flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="cover preview" className="w-full h-full object-cover rounded-md" />
              ) : (
                <>
                  <PhotoIcon className="w-6 h-6 text-gray-400 ms-auto align-baseline my-auto" />
                  <span className="text-gray-500 text-sm me-auto">Upload Image</span>
                </>
              )}
            </div>
          </div>

          <div className="flex-1">
            <p className="text-gray-700 font-medium mb-1 text-sm sm:text-base">Size: 700x430 pixels</p>
            <p className="text-gray-700 mb-3 text-sm sm:text-base">File Support: .jpg, .jpeg, png, or .gif</p>
            <div className="mt-2">
              {!disabled && (
              <>
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
              </>
              )}
            </div>
            {formik.touched.coverPicture && formik.errors.coverPicture && <p className="text-red-500 text-sm mt-2">{String(formik.errors.coverPicture)}</p>}
          </div>
        </div>

            <div className="mt-6 space-y-4">
          
          <div>
            <label className="block text-gray-900 font-medium mb-2">Course Name</label>
              {disabled ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">{String(formik.values.title)}</div>
              ) : (
                <input type="text" placeholder="Write here" {...formik.getFieldProps('title')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              )}
            {formik.touched.title && formik.errors.title && <p className="text-red-500 text-sm mt-1">{formik.errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-900 font-medium mb-2">Category</label>
              {disabled ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">{(categories.find(c => String(c.id) === String(formik.values.categoryId))?.name) ?? ''}</div>
              ) : (
                <select {...formik.getFieldProps('categoryId')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500">
                  <option value="">Choose</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              {formik.touched.categoryId && formik.errors.categoryId && <p className="text-red-500 text-sm mt-1">{String(formik.errors.categoryId)}</p>}
            </div>

            <div>
              <label className="block text-gray-900 font-medium mb-2">Level</label>
              {disabled ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">{(levels.find(l => String(l.value) === String(formik.values.courseLevel))?.level) ?? (formik.values.courseLevel ? String(formik.values.courseLevel) : '')}</div>
              ) : (
                <select {...formik.getFieldProps('courseLevel')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500">
                  <option value="">Choose</option>
                  {levels.length ? (
                    levels.map((l) => <option key={l.value} value={l.value}>{l.level}</option>)
                  ) : (
                    <>
                      <option value={1}>Beginner</option>
                      <option value={2}>Intermediate</option>
                      <option value={3}>Advanced</option>
                    </>
                  )}
                </select>
              )}
              {formik.touched.courseLevel && formik.errors.courseLevel && <p className="text-red-500 text-sm mt-1">{String(formik.errors.courseLevel)}</p>}
            </div>
            <div>
              <label className="block text-gray-900 font-medium mb-2">Rating</label>
              {disabled ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">{String(formik.values.rating ?? '')}</div>
              ) : (
                <select {...formik.getFieldProps('rating')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500">
                  <option value="">Choose</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              )}
              {formik.touched.rating && formik.errors.rating && <p className="text-red-500 text-sm mt-1">{String(formik.errors.rating)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-900 font-medium mb-2">Instructor</label>
              {disabled ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">{(instructors.find(i => String(i.id) === String(formik.values.instructorId))?.name) ?? ''}</div>
              ) : (
                <select
                  {...formik.getFieldProps('instructorId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500"
                >
                  <option value="">Choose</option>
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              )}
              {formik.touched.instructorId && formik.errors.instructorId && <p className="text-red-500 text-sm mt-1">{String(formik.errors.instructorId)}</p>}
            </div>

            <div>
              <label className="block text-gray-900 font-medium mb-2">Cost</label>
              {disabled ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">{String(formik.values.price ?? '')}</div>
              ) : (
                <input {...formik.getFieldProps('price')} type="number" placeholder="Write here" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              )}
              {formik.touched.price && formik.errors.price && <p className="text-red-500 text-sm mt-1">{String(formik.errors.price)}</p>}
            </div>
            
          </div>
<div>
            <label className="block text-gray-900 font-medium mb-2">Description</label>
            {disabled ? (
              <div className="w-full px-3 py-2 rounded-lg text-sm h-40 border border-gray-300 bg-gray-50 text-gray-600 overflow-auto" dangerouslySetInnerHTML={{ __html: String(formik.values.description) }} />
            ) : (
              // use react-quill for rich text editing
              <div className="rounded-lg border border-gray-300 bg-white overflow-hidden course-quill">
                {/* react-quill provides its own toolbar; apply wrapper styles so it matches other inputs */}
                {/* @ts-ignore */}
                <ReactQuill
                  theme="snow"
                  value={formik.values.description as any}
                  onChange={(val: any) => formik.setFieldValue('description', val)}
                  className="bg-white"
                  style={{ minHeight: 160 }}
                />
              </div>
            )}
            {formik.touched.description && formik.errors.description && <p className="text-red-500 text-sm mt-1">{String(formik.errors.description)}</p>}
          </div>
          {!disabled && (
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
          )}
        </div>
      </div>
    </form>
  );
};

export default CourseDetailsForm;
