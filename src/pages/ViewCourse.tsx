import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import CourseDetailsForm from '../components/ui/CourseDetailsForm';
import CourseContentsForm from '../components/ui/CourseContentsForm';
import { courseService } from '../services/course.service';
import { Category } from '../types/api.types';

const ViewCoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<{ id: number; name: string }[]>([]);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const catsRaw = await courseService.getAllCategories();
        setCategories(catsRaw || []);
      } catch (e) {
        // ignore
      }
    })();
    (async () => {
      try {
        if (!courseId) return;
        const course = await courseService.getCourseById(courseId);
        if (!course) {
          navigate('/courses');
          return;
        }
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
          // keep the raw level string so view shows the original text (e.g. "Intermediate")
          courseLevel: course.level ?? course.courseLevel ?? '',
          coverPicture: null,
          coverPictureUrl: course.coverPictureUrl ?? course.coverPicture,
          existingContents: (course.contents || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            lecturesCount: c.lecturesCount,
            durationInHours: c.durationInHours,
          })),
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        });
      } catch (err) {
        // ignore
      }
    })();

    // load instructors so the details form shows the same options as edit/add
    (async () => {
      try {
        const resp = await import('../services/instructor.service').then(m => m.instructorService.getAllInstructors({ pageIndex: 1, pageSize: 50, search: '' }));
        const respAny = resp as any;
        const dataArr = Array.isArray(respAny) ? respAny : (respAny?.data ?? respAny?.data?.data ?? respAny?.items ?? []);
        const mapped = (dataArr || []).map((i: any) => ({ id: i.id, name: i.name }));
        setInstructors(mapped);
      } catch (err) {
        // ignore
      }
    })();
  }, [courseId, navigate]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <PageHeader title="View Course" subtitle={<span>Dashboard / Courses / View Course</span>} />
        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-4">Step {step} of 2</div>
          <div className="flex justify-end mb-3">
            {step === 1 ? (
              <button className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200" onClick={() => setStep(2)}>
                View Contents →
              </button>
            ) : (
              <button className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200" onClick={() => setStep(1)}>
                ← Back to Details
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg p-6">
            {details && step === 1 && (
              <CourseDetailsForm
                initialValues={details}
                categories={categories}
                instructors={instructors}
                onCancel={() => navigate('/courses')}
                disabled={true}
              />
            )}

            {details && step === 2 && (
              <CourseContentsForm
                initialContents={details.existingContents ?? []}
                onBack={() => setStep(1)}
                onSubmit={() => {}}
                disabled={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCoursePage;
