
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import Button from './Button';
import { TrashIcon } from '@heroicons/react/24/outline';

interface ContentItem {
  name: string;
  lecturesNumber: number | '';
  time: number | '';
}

interface Props {
  initialContents?: ContentItem[];
  onBack: () => void;
  onSubmit: (contents: ContentItem[]) => void;
}

const ContentComponent = ({ idx, formik, canDelete, onDelete }: { idx: number; formik: any; canDelete: boolean; onDelete: () => void }) => (
  <div className="bg-gray-50 rounded-lg p-6 mb-4 border border-gray-100">
    <div className="space-y-4">
      <div>
        <label className="block text-gray-900 font-medium mb-2">Name</label>
        <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" {...formik.getFieldProps(`contents.${idx}.name`)} placeholder="Write here" />
        {formik.touched.contents?.[idx]?.name && formik.errors.contents?.[idx]?.name && <p className="text-red-500 text-sm mt-1">{formik.errors.contents[idx].name}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-900 font-medium mb-2">Lectures Number</label>
          <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" {...formik.getFieldProps(`contents.${idx}.lecturesNumber`)} placeholder="Write here" />
          {formik.touched.contents?.[idx]?.lecturesNumber && formik.errors.contents?.[idx]?.lecturesNumber && <p className="text-red-500 text-sm mt-1">{formik.errors.contents[idx].lecturesNumber}</p>}
        </div>
        <div>
          <label className="block text-gray-900 font-medium mb-2">Time</label>
          <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" {...formik.getFieldProps(`contents.${idx}.time`)} placeholder="Write here" />
          {formik.touched.contents?.[idx]?.time && formik.errors.contents?.[idx]?.time && <p className="text-red-500 text-sm mt-1">{formik.errors.contents[idx].time}</p>}
        </div>
      </div>
      {canDelete && (
        <button type="button" onClick={onDelete} className="inline-flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-lg mt-2">
          <TrashIcon className="w-5 h-5 mr-2" /> Delete
        </button>
      )}
    </div>
  </div>
);

const CourseContentsForm = ({ initialContents = [{ name: '', lecturesNumber: '', time: '' }], onBack, onSubmit }: Props) => {
  const validationSchema = Yup.object({
    contents: Yup.array().of(
      Yup.object({
        name: Yup.string().required('Name required'),
        lecturesNumber: Yup.number().typeError('Required').required('Lectures required'),
        time: Yup.number().typeError('Required').required('Time required'),
      })
    ),
  });

  const formik = useFormik({
    initialValues: { contents: initialContents },
    validationSchema,
    onSubmit: (values) => onSubmit(values.contents),
  });

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Content</h3>
        {formik.values.contents.map((_c: any, idx: number) => (
          <ContentComponent
            key={idx}
            idx={idx}
            formik={formik}
            canDelete={formik.values.contents.length > 1}
            onDelete={() => {
              const arr = [...formik.values.contents];
              arr.splice(idx, 1);
              formik.setFieldValue('contents', arr);
            }}
          />
        ))}

        <div className="border-dashed border-2 border-gray-200 p-4 rounded-lg text-center mb-4">
          <button type="button" onClick={() => formik.setFieldValue('contents', [...formik.values.contents, { name: '', lecturesNumber: '', time: '' }])} className="text-sm text-gray-600">Add Another Content <span className="ml-1">+</span></button>
        </div>

        <div className="flex justify-between items-center mt-6">
          <Button type="button" variant="secondary" onClick={onBack} className="px-6 py-3">Cancel</Button>
          <Button type="submit" variant="dark" className="px-6 py-3">Add</Button>
        </div>
      </form>
    </FormikProvider>
  );
};

export default CourseContentsForm;
