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
  const [levels, setLevels] = useState<{ level: string; value: number }[]>([]);
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
        // helper to map API level string to numeric value expected by the form
        const mapLevelToValue = (lvl: any) => {
          if (!lvl && lvl !== 0) return '';
          const s = String(lvl).toLowerCase();
          if (s.includes('beginner') || s === '1') return 1;
          if (s.includes('intermediate') || s === '2') return 2;
          if (s.includes('advanced') || s === '3') return 3;
          return '';
        };

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
          // API now returns a 'level' string (e.g. 'Intermediate'), map it to numeric form value
          courseLevel: mapLevelToValue(course.level ?? course.courseLevel ?? ''),
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
        console.error('Failed loading course details', err);
      }
    })();

    (async () => {
      try {
        const lv = await courseService.getCourseLevels();
        setLevels(lv || []);
      } catch (err) {
        console.error('Failed loading course levels', err);
      }
    })();
  }, [courseId, navigate]);

  const handleDetailsNext = (values: any) => {
    setDetails((prev: any) => ({
      ...values,
      existingContents: prev?.existingContents ?? [{ name: '', lecturesCount: '', durationInHours: '' }]
    }));
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
  // Correct key name expected by API
  formData.append('CourseLevel', String(details.courseLevel ?? 1));
      formData.append('InstructorId', String(details.instructorId));
      formData.append('CategoryId', String(details.categoryId));
      if (details.coverPicture && details.coverPicture instanceof File) {
        formData.append('CoverPicture', details.coverPicture, (details.coverPicture as File).name);
      } else if (details.coverPictureUrl) {
        // If no new file, send the old path
        formData.append('CoverPictureUrl', details.coverPictureUrl);
      }

  const normalizedContents = contents.map((c, idx) => ({ contentId: idx + 1, Name: c.name, LecturesCount: Number(c.lecturesCount), DurationInHours: Number(c.durationInHours) }));
      formData.append('Contents', JSON.stringify(normalizedContents));
      normalizedContents.forEach((item, idx) => {
        formData.append(`Contents[${idx}].contentId`, String(item.contentId));
        formData.append(`Contents[${idx}].Name`, String(item.Name));
  formData.append(`Contents[${idx}].LecturesCount`, String(item.LecturesCount));
        formData.append(`Contents[${idx}].DurationInHours`, String(item.DurationInHours));
      });

      // Debug: log FormData entries (for dev only)
      try {
        const fdObj: Record<string, any> = {};
        formData.forEach((value, key) => {
          // If multiple values exist for a key, convert to array
          if (fdObj[key]) {
            if (!Array.isArray(fdObj[key])) fdObj[key] = [fdObj[key]];
            fdObj[key].push(value);
          } else {
            fdObj[key] = value;
          }
        });
        console.debug('Submitting updateCourse FormData:', fdObj);
      } catch (err) {
        console.debug('Unable to serialize FormData for debug', err);
      }

      try {
        await courseService.updateCourse(courseId, formData);
        toast.success('Course updated');
        navigate('/courses');
      } catch (err: any) {
        console.error('Update course failed:', err, err?.response?.data ?? err?.message);
        toast.error(err?.response?.data?.message || 'Failed to update course');
      }
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
                levels={levels}
                onNext={handleDetailsNext}
                onCancel={() => navigate('/courses')}
              />
            )}

            {step === 2 && (
              <CourseContentsForm
                initialContents={details?.existingContents ?? [{ name: '', lecturesCount: '', durationInHours: '' }]}
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
