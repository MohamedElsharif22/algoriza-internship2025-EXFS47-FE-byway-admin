import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import LoadingBanner from '../components/ui/LoadingBanner';
import CourseDetailsForm from '../components/ui/CourseDetailsForm';
import CourseContentsForm from '../components/ui/CourseContentsForm';
import { courseService } from '../services/course.service';
import { Category } from '../types/api.types';

const ViewCoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<{ id: number; name: string }[]>([]);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
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
    setLoading(false);
  }, [courseId, navigate]);

  return (
    <div className="space-y-4">
      {loading && <LoadingBanner message="Loading course details..." />}
        <PageHeader title="View Course" subtitle={<span>Dashboard / Courses / View Course</span>} />
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-gray-900">Course details</h3>
              <div className="text-sm text-gray-500">Step {step} of 2</div>
            </div>
            <div className="flex items-center gap-2">
              {step === 2 && (
                <button
                  aria-label="Back to details"
                  className="inline-flex items-center text-4xl  text-gray-700 rounded-md hover:bg-gray-100"
                  onClick={() => setStep(1)}
                >
                  ←
                </button>
              )}
              {step === 1 && (
                <button
                  aria-label="View contents"
                  className="inline-flex items-center  text-4xl  text-gray-700 rounded-md hover:bg-gray-100"
                  onClick={() => setStep(2)}
                >
                  →
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            {details && step === 1 && (
              <>
                <CourseDetailsForm
                  initialValues={details}
                  categories={categories}
                  instructors={instructors}
                  onCancel={() => {}}
                  disabled={true}
                  showHeader={false}
                />
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => navigate('/courses')}
                    className="px-4 py-2 bg-red-50 border border-red-200 text-red-500 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold text-base shadow w-full sm:w-auto hover:bg-cyan-900"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {details && step === 2 && (
              <CourseContentsForm
                initialContents={details.existingContents ?? []}
                onBack={() => setStep(1)}
                onSubmit={() => { }}
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
