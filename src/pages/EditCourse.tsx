import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import CourseDetailsForm from '../components/ui/CourseDetailsForm';
import CourseContentsForm from '../components/ui/CourseContentsForm';
import { courseService } from '../services/course.service';
import { instructorService } from '../services/instructor.service';
import { toast } from 'react-toastify';
import { Category } from '../types/api.types';

const EditCoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<{ id: number; name: string }[]>([]);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const catsRaw = await courseService.getAllCategories();
        setCategories(catsRaw || []);
      } catch (e) {
        console.error('Failed loading categories', e);
      }
    })();

    (async () => {
      try {
        const resp = await instructorService.getAllInstructors({ pageIndex: 1, pageSize: 50, search: '' });
        const respAny = resp as any;
        const dataArr = Array.isArray(respAny) ? respAny : (respAny?.data ?? respAny?.data?.data ?? respAny?.items ?? []);
        const mapped = (dataArr || []).map((i: any) => ({ id: i.id, name: i.name }));
        setInstructors(mapped);
      } catch (err) {
        console.error('Failed loading instructors', err);
      }
    })();

    (async () => {
      try {
        if (!courseId) return;
        const course = await courseService.getCourseById(courseId);
        if (!course) {
          toast.error('Course not found');
          navigate('/courses');
          return;
        }
        // Map API response to form initial values
        setDetails({
          id: course.id,
          title: course.title,
          description: course.description,
          price: course.price,
          categoryId: course.categoryId ?? '',
          categoryName: course.categoryName ?? '',
          instructorId: course.instructorId ?? '',
          instructorName: course.instructorName ?? '',
          totalHours: course.durationInHours ?? '',
          rating: course.rating ?? 5,
          lecturesCount: course.lecturesCount ?? 0,
          courseLevel: course.courseLevel ?? '',
          coverPicture: null,
          coverPictureUrl: course.coverPictureUrl ?? course.coverPicture,
          existingContents: (course.contents || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            lecturesNumber: c.lecturesCount,
            time: c.durationInHours,
          })),
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        });
      } catch (err) {
        console.error('Failed loading course details', err);
      }
    })();
  }, [courseId, navigate]);

  const handleDetailsNext = (values: any) => {
    setDetails(values);
    setStep(2);
  };

  const handleSubmitContents = async (contents: any[]) => {
    try {
      if (!details) {
        toast.error('Course details missing');
        setStep(1);
        return;
      }

      const formData = new FormData();
      formData.append('Title', details.title);
      formData.append('Description', details.description);
      formData.append('Rating', String(details.rating ?? 5));
      formData.append('Price', String(details.price ?? 0));
      formData.append('CousrseLevel', String(details.courseLevel ?? 1));
      formData.append('InstructorId', String(details.instructorId));
      formData.append('CategoryId', String(details.categoryId));
      if (details.coverPicture && details.coverPicture instanceof File) {
        formData.append('CoverPicture', details.coverPicture, (details.coverPicture as File).name);
      } else if (details.coverPictureUrl) {
        // If no new file, send the old path
        formData.append('CoverPictureUrl', details.coverPictureUrl);
      }

      const normalizedContents = contents.map((c, idx) => ({ contentId: idx + 1, Name: c.name, LecturesNumber: Number(c.lecturesNumber), DurationInHours: Number(c.time) }));
      formData.append('Contents', JSON.stringify(normalizedContents));
      normalizedContents.forEach((item, idx) => {
        formData.append(`Contents[${idx}].contentId`, String(item.contentId));
        formData.append(`Contents[${idx}].Name`, String(item.Name));
        formData.append(`Contents[${idx}].LecturesNumber`, String(item.LecturesNumber));
        formData.append(`Contents[${idx}].DurationInHours`, String(item.DurationInHours));
      });

      // debug
      console.group('UpdateCourse FormData (EditPage)');
      for (const pair of (formData as any).entries()) {
        const [k, v] = pair as [string, any];
        if (v instanceof File) console.log(k, `File(${v.name})`);
        else console.log(k, v);
      }
      console.groupEnd();

      await courseService.updateCourse(courseId, formData);
      toast.success('Course updated');
      navigate('/courses');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update course');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <PageHeader title="Edit Course" subtitle={<span>Dashboard / Courses / Edit Course</span>} />

        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-4">Step {step} of 2</div>

          <div className="bg-white rounded-lg p-6">
            {step === 1 && details && (
              <CourseDetailsForm
                initialValues={details}
                categories={categories}
                instructors={instructors}
                onNext={handleDetailsNext}
                onCancel={() => navigate('/courses')}
              />
            )}

            {step === 2 && (
              <CourseContentsForm
                initialContents={((details as any).existingContents || []).length ? (details as any).existingContents : [{ name: '', lecturesNumber: '', time: '' }]}
                onBack={() => setStep(1)}
                onSubmit={handleSubmitContents}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCoursePage;
