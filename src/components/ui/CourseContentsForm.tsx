import React, { useState } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import LoadingBanner from './LoadingBanner';
import Button from './Button';
import { TrashIcon } from '@heroicons/react/24/outline';

interface ContentItem {
	id?: number;
	name: string;
	lecturesCount: number | '';
	durationInHours: number | '';
}

interface Props {
	initialContents?: ContentItem[];
	onBack: () => void;
	onSubmit: (contents: ContentItem[]) => void;
	disabled?: boolean;
}

const ContentComponent = ({ idx, formik, canDelete, onDelete, disabled }: { idx: number; formik: any; canDelete: boolean; onDelete: () => void; disabled?: boolean }) => (
	<div className="bg-gray-50 rounded-lg p-6 mb-4 border border-gray-100">
		{/* Hidden input for content id, always included so it is submitted with the form */}
		<input type="hidden" name={`contents.${idx}.id`} value={formik.values.contents?.[idx]?.id ?? ''} />
		<div className="space-y-4">
			<div>
				<label className="block text-gray-900 font-medium mb-2">Name</label>
				{disabled ? (
					<div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">{String(formik.values.contents?.[idx]?.name ?? '')}</div>
				) : (
					<input
						className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
						{...formik.getFieldProps(`contents.${idx}.name`)}
						placeholder="Write here"
					/>
				)}
				{formik.touched.contents?.[idx]?.name && formik.errors.contents?.[idx]?.name && (
					<p className="text-red-500 text-sm mt-1">{formik.errors.contents[idx].name}</p>
				)}
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label className="block text-gray-900 font-medium mb-2">Lectures Count</label>
					{disabled ? (
						<div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">{String(formik.values.contents?.[idx]?.lecturesCount ?? '')}</div>
					) : (
						<input
							type="number"
							min={1}
							step={1}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
							{...formik.getFieldProps(`contents.${idx}.lecturesCount`)}
							placeholder="Write here"
						/>
					)}
					{formik.touched.contents?.[idx]?.lecturesCount && formik.errors.contents?.[idx]?.lecturesCount && (
						<p className="text-red-500 text-sm mt-1">{formik.errors.contents[idx].lecturesCount}</p>
					)}
				</div>

				<div>
					<label className="block text-gray-900 font-medium mb-2">Duration In Hours</label>
					{disabled ? (
						<div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700">{String(formik.values.contents?.[idx]?.durationInHours ?? '')}</div>
					) : (
						<input
							type="number"
							min={0.01}
							step={0.01}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
							{...formik.getFieldProps(`contents.${idx}.durationInHours`)}
							placeholder="Write here"
						/>
					)}
					{formik.touched.contents?.[idx]?.durationInHours && formik.errors.contents?.[idx]?.durationInHours && (
						<p className="text-red-500 text-sm mt-1">{formik.errors.contents[idx].durationInHours}</p>
					)}
				</div>
			</div>

			{canDelete && !disabled && (
				<button type="button" onClick={onDelete} className="inline-flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-lg mt-2">
					<TrashIcon className="w-5 h-5 mr-2" /> Delete
				</button>
			)}
		</div>
	</div>
);

const CourseContentsForm: React.FC<Props> = ({
	initialContents = [{ name: '', lecturesCount: '', durationInHours: '' }],
	onBack,
	onSubmit,
	disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
	const validationSchema = Yup.object({
		contents: Yup.array().of(
			Yup.object({
				name: Yup.string().required('Name required'),
				// Coerce empty string -> undefined so required() triggers correctly
				lecturesCount: Yup.number()
					.transform((value, originalValue) => (typeof originalValue === 'string' && originalValue.trim() === '' ? undefined : value))
					.typeError('Lectures must be a number')
					.integer('Lectures must be a whole number')
					.min(1, 'Lectures must be at least 1')
					.required('Lectures required'),
				// Allow decimals for duration; coerce empty string -> undefined
				durationInHours: Yup.number()
					.transform((value, originalValue) => (typeof originalValue === 'string' && originalValue.trim() === '' ? undefined : value))
					.typeError('Duration must be a number')
					.moreThan(0, 'Duration must be greater than 0')
					.required('Duration required'),
			})
		),
	});

	const normalizedInitialContents = initialContents.map((item: any) => ({
		id: item.id ?? undefined,
		name: item.name ?? '',
		lecturesCount: item.lecturesCount ?? item.lecturesNumber ?? '',
		durationInHours: item.durationInHours ?? item.time ?? '',
	}));

	const isEditMode = Array.isArray(initialContents) && initialContents.length > 0 && initialContents.some((c) => c.id !== undefined);

	const formik = useFormik({
		initialValues: { contents: normalizedInitialContents },
		validationSchema,
		onSubmit: async (values) => {
			setIsLoading(true);
			try {
				await onSubmit(values.contents);
			} finally {
				setIsLoading(false);
			}
		},
	});

	return (
		<FormikProvider value={formik}>
			<form onSubmit={formik.handleSubmit} className="space-y-4">
				{isLoading && <LoadingBanner message="Saving course contents..." />}
				<div className="flex items-center justify-between">
					<div>
						{!disabled && (
							<button type="button" onClick={onBack} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
								← Back
							</button>
						)}
					</div>
				</div>

				<h3 className="text-xl font-semibold text-gray-900 mb-2">{isEditMode ? 'Edit Content' : 'Add Content'}</h3>

				{formik.values.contents.map((_: any, idx: number) => (
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
						disabled={disabled}
					/>
				))}

				{!disabled && (
					<div className="border-dashed border-2 border-gray-200 p-4 rounded-lg text-center mb-4">
						<button type="button" onClick={() => formik.setFieldValue('contents', [...formik.values.contents, { name: '', lecturesCount: '', durationInHours: '' }])} className="text-sm text-gray-600">
							Add Another Content <span className="ml-1">+</span>
						</button>
					</div>
				)}

				{!disabled && (
					<div className="flex justify-between items-center mt-6">
						<Button type="button" variant="secondary" onClick={onBack} className="px-6 py-3">
							Cancel
						</Button>
						<Button type="submit" variant="dark" className="px-6 py-3">
							{isEditMode ? 'Update' : 'Add'}
						</Button>
					</div>
				)}
			</form>
		</FormikProvider>
	);
};

export default CourseContentsForm;

