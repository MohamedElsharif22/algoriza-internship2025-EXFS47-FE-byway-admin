import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingBanner from '../components/ui/LoadingBanner';
import PageHeader from '../components/layout/PageHeader';
import CourseDetailsForm from '../components/ui/CourseDetailsForm';
import CourseContentsForm from '../components/ui/CourseContentsForm';
import { courseService } from '../services/course.service';
import { instructorService } from '../services/instructor.service';
import { toast } from 'react-toastify';
import { Category } from '../types/api.types';

const AddCoursePage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<{ id: number; name: string }[]>([]);
  const [details, setDetails] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // load categories and instructors (simple fetch via courseService or instructor service)
    setLoading(true);
    (async () => {
      try {
  const catsRaw = await courseService.getAllCategories();
  // courseService.getAllCategories should return an array; be defensive in case it's wrapped
  const catsAny = catsRaw as any;
  const catsArr = Array.isArray(catsAny) ? catsAny : (catsAny?.data ?? []);
  // categories loaded
        setCategories(catsArr);
      } catch (e) {
        console.error('Failed loading categories', e);
      }
    })();
    (async () => {
      try {
        // fetch first page of instructors (pageSize=10)
  const resp = await instructorService.getAllInstructors({ pageIndex: 1, pageSize: 10, search: '' });
  // resp might be the InstructorsListResponse { data: [...] } or an ApiResponse wrapper
  const respAny = resp as any;
  const dataArr = Array.isArray(respAny) ? respAny : (respAny?.data ?? respAny?.data?.data ?? respAny?.items ?? []);
        const mapped = (dataArr || []).map((i: any) => ({ id: i.id, name: i.name }));
  // instructors loaded
        setInstructors(mapped);
      } catch (err) {
        console.error('Failed loading instructors', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDetailsNext = (values: any) => {
    setDetails(values);
    setStep(2);
  };

  const handleSubmitContents = async (contents: any[]) => {
    try {
      if (!details) {
        toast.error('Course details are missing. Please complete step 1.');
        setStep(1);
        return;
      }
      const formData = new FormData();
      // map details into required CourseRequest fields
      formData.append('Title', details.title);
      formData.append('Description', details.description);
      formData.append('Rating', String(details.rating ?? 5));
  formData.append('Price', String(details.price ?? 0));
  formData.append('CourseLevel', String(details.courseLevel ?? 1));
      formData.append('InstructorId', String(details.instructorId));
      formData.append('CategoryId', String(details.categoryId));
      if (details.coverPicture && details.coverPicture instanceof File) {
        formData.append('CoverPicture', details.coverPicture, (details.coverPicture as File).name);
      } else {
        console.warn('No cover picture File found on details:', details.coverPicture);
      }

      // append contents as JSON string (server accepts JSON string in 'Contents')
  const normalizedContents = contents.map((c, idx) => ({ contentId: idx + 1, Name: c.name, LecturesCount: Number(c.lecturesCount), DurationInHours: Number(c.durationInHours) }));
      formData.append('Contents', JSON.stringify(normalizedContents));


    //   // Fallback: also append Contents as indexed fields (some servers prefer this)
    //   normalizedContents.forEach((item, idx) => {
    //     formData.append(`Contents[${idx}].contentId`, String(item.contentId));
    //     formData.append(`Contents[${idx}].Name`, String(item.Name));
    //     formData.append(`Contents[${idx}].LecturesNumber`, String(item.LecturesNumber));
    //     formData.append(`Contents[${idx}].DurationInHours`, String(item.DurationInHours));
    //   });

      // FormData prepared for submission
      // Debug: serialize FormData to an object for easier inspection in console
      try {
        const fdObj: Record<string, any> = {};
        formData.forEach((value, key) => {
          // For File objects, log the name to keep the output readable
          if (value instanceof File) fdObj[key] = (value as File).name;
          else fdObj[key] = value;
        });
        // eslint-disable-next-line no-console
        console.debug('CreateCourse FormData:', fdObj);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Failed serializing FormData for debug', err);
      }

      await courseService.createCourse(formData);
      toast.success('Course created');
      navigate('/courses');
    } catch (e) {
      console.error(e);
      toast.error('Failed to create course');
    }
  };

  return (
    <div className="space-y-4">
        {loading && <LoadingBanner message="Loading data..." />}
        <PageHeader title="Add Course" subtitle={<span>Dashboard / Courses / Add Course</span>} />
      <div className="bg-white rounded-2xl p-6 shadow-sm">

        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-4">Step {step} of 2</div>

          <div className="bg-white rounded-lg p-6">
            {step === 1 && (
              <CourseDetailsForm
                categories={categories}
                instructors={instructors}
                onNext={handleDetailsNext}
                onCancel={() => navigate('/courses')}
              />
            )}

            {step === 2 && (
              <CourseContentsForm
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

export default AddCoursePage;
