import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Course, Category } from '../../types/api.types';
import Button from './Button';

interface CourseFormProps {
  course?: Course;
  categories: Category[];
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  disabled?: boolean;
}

const CourseForm = ({ course, categories, onSubmit, onCancel, disabled }: CourseFormProps) => {
  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    price: Yup.number()
      .required('Price is required')
      .min(0, 'Price must be at least 0'),
    categoryId: Yup.number().required('Category is required'),
    coverPicture: course ? Yup.mixed() : Yup.mixed().required('Cover image is required'),
  });

  const formik = useFormik({
    initialValues: {
      title: course?.title || '',
      description: course?.description || '',
      price: course?.price || 0,
      categoryId: course?.categoryId || '',
      coverPicture: null as File | null,
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('price', values.price.toString());
      formData.append('categoryId', values.categoryId.toString());
      
      if (values.coverPicture) {
        formData.append('coverPicture', values.coverPicture);
      }

      await onSubmit(formData);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          {...formik.getFieldProps('title')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          disabled={!!disabled}
        />
        {formik.touched.title && formik.errors.title && (
          <div className="mt-1 text-sm text-red-600">{formik.errors.title}</div>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          {...formik.getFieldProps('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          disabled={!!disabled}
        />
        {formik.touched.description && formik.errors.description && (
          <div className="mt-1 text-sm text-red-600">{formik.errors.description}</div>
        )}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price
        </label>
        <input
          type="number"
          step="0.01"
          id="price"
          {...formik.getFieldProps('price')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          disabled={!!disabled}
        />
        {formik.touched.price && formik.errors.price && (
          <div className="mt-1 text-sm text-red-600">{formik.errors.price}</div>
        )}
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="categoryId"
          {...formik.getFieldProps('categoryId')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          disabled={!!disabled}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {formik.touched.categoryId && formik.errors.categoryId && (
          <div className="mt-1 text-sm text-red-600">{formik.errors.categoryId}</div>
        )}
      </div>

      <div>
        <label htmlFor="coverPicture" className="block text-sm font-medium text-gray-700">
          Cover Image
        </label>
        <input
          type="file"
          id="coverPicture"
          accept="image/*"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0] || null;
            formik.setFieldValue('coverPicture', file);
          }}
          className="mt-1 block w-full"
          disabled={!!disabled}
        />
        {formik.touched.coverPicture && formik.errors.coverPicture && (
          <div className="mt-1 text-sm text-red-600">
            {formik.errors.coverPicture as string}
          </div>
        )}
        {(course?.coverPictureUrl || course?.coverPicture) && (
          <div className="mt-2">
            <img
              src={course.coverPictureUrl ?? course.coverPicture}
              alt="Current cover"
              className="h-32 w-48 object-cover rounded"
            />
            <p className="mt-1 text-sm text-gray-500">Current cover image</p>
          </div>
        )}
      </div>

  {!disabled && (
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <Button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full sm:w-auto sm:ml-3"
          >
            {course ? 'Update' : 'Create'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="mt-3 w-full sm:mt-0 sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
};

export default CourseForm;