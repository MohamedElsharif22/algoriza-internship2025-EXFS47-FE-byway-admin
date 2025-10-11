// removed duplicate useEffect import
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import Button from './Button';
import { StarIcon, CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { instructorService } from '../../services/instructor.service';
import { Instructor, JobTitle } from '../../types/api.types';
import LoadingBanner from './LoadingBanner';

interface InstructorFormProps {
  instructor?: Instructor;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  readOnly?: boolean;
}

const InstructorForm = ({ instructor, onSubmit, onCancel, readOnly = false }: InstructorFormProps) => {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingJobTitles, setIsLoadingJobTitles] = useState(false);

  useEffect(() => {
    const loadJobTitles = async () => {
      setIsLoadingJobTitles(true);
      try {
        const response = await instructorService.getAllJobTitles();
        // API returns either array or { data: array }
        if (Array.isArray(response)) {
          setJobTitles(response);
        } else if (response.data) {
          setJobTitles(response.data);
        }
      } catch (error) {
        console.error('Error loading job titles:', error);
      } finally {
        setIsLoadingJobTitles(false);
      }
    };
    loadJobTitles();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: instructor?.name || '',
      jobTitle: (instructor as any)?.jopTitle ?? instructor?.jobTitle ?? '', // will be set after jobTitles are loaded
      about: instructor?.about || '',
      profilePicture: null as File | null,
      rating: instructor?.rating || 0,
    },
    validationSchema: Yup.object({
      name: Yup.string().min(5, 'Name must be at least 5 characters').required('Name is required'),
      jobTitle: Yup.number().typeError('Job title is required').required('Job title is required').min(1).max(12),
      about: Yup.string().min(10, 'Description must be at least 10 characters').required('Description is required'),
  // profile picture is required only when creating a new instructor
  profilePicture: !instructor ? Yup.mixed().required('Profile picture is required') : Yup.mixed().nullable().notRequired(),
      // rating is not required by API
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('Name', values.name);
        formData.append('JopTitle', String(values.jobTitle));
        formData.append('About', values.about);
        if (values.profilePicture) {
          formData.append('ProfilePicture', values.profilePicture);
        }
        await onSubmit(formData);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // When jobTitles and instructor are loaded, set jobTitle to the matching value
  useEffect(() => {
    if (instructor && jobTitles.length > 0) {
      // instructor may come with different property names depending on where it came from
      const instructorTitleRaw = (instructor as any)?.jobTitle ?? (instructor as any)?.jopTitle ?? '';
      const normalize = (s?: string) => (s ?? '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
      const match = jobTitles.find((jt) => {
        if (!jt || !jt.title) return false;
        return normalize(jt.title) === normalize(instructorTitleRaw);
      });
      if (match) {
        const val = match.value ?? match.id;
        if (typeof val !== 'undefined' && val !== null) {
          formik.setFieldValue('jobTitle', Number(val));
        }
      }
    }
  }, [instructor, jobTitles]);

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {(isLoading || isLoadingJobTitles) && (
        <LoadingBanner message={isLoading ? 'Saving changes...' : 'Loading job titles...'} />
      )}
      {/* Image upload circle */}
      <div className="flex justify-center mt-4">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-slate-100 flex items-center justify-center">
            {formik.values.profilePicture ? (
              <img src={URL.createObjectURL(formik.values.profilePicture)} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
            ) : (instructor as any)?.profilePictureUrl || instructor?.profilePicture ? (
              <img src={(instructor as any)?.profilePictureUrl || instructor?.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <PhotoIcon className="w-14 h-14 text-slate-400" />
            )}
          </div>
          {!readOnly && (
            <label htmlFor="profilePicture" aria-label="Upload profile picture" title="Upload profile picture" className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full shadow p-2.5 cursor-pointer">
              <CameraIcon className="w-6 h-6 text-white" />
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  formik.setFieldValue('profilePicture', file || null);
                }}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
      {formik.touched.profilePicture && formik.errors.profilePicture && (
        <p className="mt-1 text-sm text-red-600 text-center">{String(formik.errors.profilePicture)}</p>
      )}

      {/* Name */}
      <div className="px-6">
        <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-1">Nama</label>
        <input
          type="text"
          id="name"
          placeholder="Write here"
          {...formik.getFieldProps('name')}
          disabled={readOnly}
          className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-500 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 disabled:opacity-80"
        />
        {formik.touched.name && formik.errors.name && (
          <p className="mt-1 text-sm text-red-600">{String(formik.errors.name)}</p>
        )}
      </div>

      {/* Job Title and Rate */}
      <div className="px-6 flex gap-6">
        <div className="flex-1">
          <label htmlFor="jobTitle" className="block text-base font-medium text-gray-700 mb-1">Job Title</label>
          <select
            id="jobTitle"
            name="jobTitle"
            value={String(formik.values.jobTitle ?? '')}
            onChange={e => formik.setFieldValue('jobTitle', Number(e.target.value))}
            disabled={readOnly}
            className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-500 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 appearance-none disabled:opacity-80"
          >
            <option value="" className="text-gray-400">Choose</option>
            {jobTitles.map((title) => (
              <option key={String(title.value ?? title.id)} value={String(title.value ?? title.id)}>{title.title}</option>
            ))}
          </select>
          {formik.touched.jobTitle && formik.errors.jobTitle && (
            <p className="mt-1 text-sm text-red-600">{String(formik.errors.jobTitle)}</p>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-base font-medium text-gray-700 mb-1">Rate</label>
          <div className="flex gap-1 mt-2">
            {[1,2,3,4,5].map((star) => {
              const rating = instructor ? (instructor as any)?.averageRating || instructor.rating || 0 : formik.values.rating;
              // show static stars when editing or when in readOnly mode
              if (instructor || readOnly) {
                return (
                  <StarIcon
                    key={star}
                    className={`w-7 h-7 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                );
              }

              return (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  title={`Set rating ${star}`}
                  aria-label={`Set rating ${star}`}
                  onClick={() => formik.setFieldValue('rating', star)}
                >
                  <StarIcon className={
                    'w-7 h-7 ' + (rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')
                  } />
                </button>
              );
            })}
          </div>
          {formik.touched.rating && formik.errors.rating && (
            <p className="mt-1 text-sm text-red-600">{String(formik.errors.rating)}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="px-6">
        <label htmlFor="about" className="block text-base font-medium text-gray-700 mb-1">Description</label>
        <textarea
          id="about"
          placeholder="Write here"
          rows={4}
          {...formik.getFieldProps('about')}
          disabled={readOnly}
          className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-500 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 mb-4"
        />
        {formik.touched.about && formik.errors.about && (
          <p className="mt-1 text-sm text-red-600">{String(formik.errors.about)}</p>
        )}
      </div>

      {/* Buttons */}
      {!readOnly && (
        <div className="flex gap-4 px-6 py-4 bg-gray-50 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1 bg-white border border-gray-200 text-gray-700 text-base py-3 rounded-lg hover:bg-gray-50"
            disabled={formik.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-slate-900 text-white text-base py-3 rounded-lg hover:bg-slate-800"
            disabled={formik.isSubmitting}
            isLoading={formik.isSubmitting}
          >
            {instructor ? 'Update' : 'Add'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default InstructorForm;