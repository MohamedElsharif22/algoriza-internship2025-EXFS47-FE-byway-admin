// removed duplicate useEffect import
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import Button from './Button';
import { StarIcon, CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { instructorService } from '../../services/instructor.service';
import { Instructor, JobTitle } from '../../types/api.types';

interface InstructorFormProps {
  instructor?: Instructor;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

const InstructorForm = ({ instructor, onSubmit, onCancel }: InstructorFormProps) => {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);

  useEffect(() => {
    const loadJobTitles = async () => {
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
      }
    };
    loadJobTitles();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: instructor?.name || '',
      jobTitle: '', // will be set after jobTitles are loaded
      about: instructor?.about || '',
      profilePicture: null as File | null,
      rating: instructor?.rating || 0,
    },
    validationSchema: Yup.object({
      name: Yup.string().min(5, 'Name must be at least 5 characters').required('Name is required'),
      jobTitle: Yup.number().typeError('Job title is required').required('Job title is required').min(1).max(12),
      about: Yup.string().min(10, 'Description must be at least 10 characters').required('Description is required'),
      profilePicture: instructor
        ? Yup.mixed()
        : Yup.mixed().required('Profile picture is required'),
      // rating is not required by API
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append('Name', values.name);
      formData.append('JopTitle', String(values.jobTitle));
      formData.append('About', values.about);
      if (values.profilePicture) {
        formData.append('ProfilePicture', values.profilePicture);
      }
      await onSubmit(formData);
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
        formik.setFieldValue('jobTitle', match.value ?? match.id);
      }
    }
  }, [instructor, jobTitles]);

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6 px-4 py-6">
      {/* Image upload circle */}
      <div className="flex justify-center mb-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-slate-100 flex items-center justify-center">
            {formik.values.profilePicture ? (
              <img src={URL.createObjectURL(formik.values.profilePicture)} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <PhotoIcon className="w-10 h-10 text-slate-400" />
            )}
          </div>
          <label htmlFor="profilePicture" className="absolute bottom-0 right-0 bg-white rounded-full shadow p-2 cursor-pointer">
            <CameraIcon className="w-6 h-6 text-blue-600" />
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
        </div>
      </div>
      {formik.touched.profilePicture && formik.errors.profilePicture && (
        <p className="mt-1 text-sm text-red-600 text-center">{formik.errors.profilePicture as string}</p>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-base font-semibold text-slate-600 mb-1">Nama</label>
        <input
          type="text"
          id="name"
          placeholder="Write here"
          {...formik.getFieldProps('name')}
          className="block w-full rounded-lg border border-slate-200 px-4 py-3 text-base focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
        />
        {formik.touched.name && formik.errors.name && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
        )}
      </div>

      {/* Job Title and Rate */}
      <div className="flex gap-6">
        <div className="flex-1">
          <label htmlFor="jobTitle" className="block text-base font-semibold text-slate-600 mb-1">Job Title</label>
          <select
            id="jobTitle"
            name="jobTitle"
            value={formik.values.jobTitle}
            onChange={e => formik.setFieldValue('jobTitle', Number(e.target.value))}
            className="block w-full rounded-lg border border-slate-200 px-4 py-3 text-base text-slate-700 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 appearance-none"
            style={{ minHeight: '48px' }}
          >
            <option value="" className="text-slate-400">Choose</option>
            {jobTitles.map((title) => (
              <option key={title.value ?? title.id} value={title.value ?? title.id} className="text-slate-700 bg-white">{title.title}</option>
            ))}
          </select>
          {formik.touched.jobTitle && formik.errors.jobTitle && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.jobTitle}</p>
          )}
        </div>
        <div className="flex flex-col items-start">
          <label className="block text-base font-semibold text-slate-600 mb-1">Rate</label>
          <div className="flex gap-1 mt-2">
            {[1,2,3,4,5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none"
                onClick={() => formik.setFieldValue('rating', star)}
              >
                <StarIcon className={
                  'w-7 h-7 ' + (formik.values.rating >= star ? 'text-yellow-400' : 'text-slate-300')
                } />
              </button>
            ))}
          </div>
          {formik.touched.rating && formik.errors.rating && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.rating}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="about" className="block text-base font-semibold text-slate-600 mb-1">Description</label>
        <textarea
          id="about"
          placeholder="Write here"
          rows={4}
          {...formik.getFieldProps('about')}
          className="block w-full rounded-lg border border-slate-200 px-4 py-3 text-base focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
        />
        {formik.touched.about && formik.errors.about && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.about}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1 bg-slate-100 text-slate-500 text-lg py-3 rounded-lg"
          disabled={formik.isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-slate-900 text-white text-lg py-3 rounded-lg"
          disabled={formik.isSubmitting}
          isLoading={formik.isSubmitting}
        >
          Add
        </Button>
      </div>
    </form>
  );
};

export default InstructorForm;