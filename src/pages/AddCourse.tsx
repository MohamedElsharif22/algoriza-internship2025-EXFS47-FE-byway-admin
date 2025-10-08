import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import CourseDetailsForm from '../components/ui/CourseDetailsForm';
import CourseContentsForm from '../components/ui/CourseContentsForm';
import { courseService } from '../services/course.service';
import { instructorService } from '../services/instructor.service';
import { toast } from 'react-toastify';
import { Category } from '../types/api.types';

const AddCoursePage = () => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<{ id: number; name: string }[]>([]);
  const [details, setDetails] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // load categories and instructors (simple fetch via courseService or instructor service)
    (async () => {
      try {
  const catsRaw = await courseService.getAllCategories();
  // courseService.getAllCategories should return an array; be defensive in case it's wrapped
  const catsAny = catsRaw as any;
  const catsArr = Array.isArray(catsAny) ? catsAny : (catsAny?.data ?? []);
        console.log('Loaded categories', catsArr);
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
        console.log('Loaded instructors', mapped);
        setInstructors(mapped);
      } catch (err) {
        console.error('Failed loading instructors', err);
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
      formData.append('CousrseLevel', String(details.courseLevel ?? 1));
      formData.append('InstructorId', String(details.instructorId));
      formData.append('CategoryId', String(details.categoryId));
      if (details.coverPicture && details.coverPicture instanceof File) {
        formData.append('CoverPicture', details.coverPicture, (details.coverPicture as File).name);
      } else {
        console.warn('No cover picture File found on details:', details.coverPicture);
      }

      // append contents as JSON string (server accepts JSON string in 'Contents')
      const normalizedContents = contents.map((c, idx) => ({ contentId: idx + 1, Name: c.name, LecturesNumber: Number(c.lecturesNumber), DurationInHours: Number(c.time) }));
      formData.append('Contents', JSON.stringify(normalizedContents));

      // DEBUG: log all FormData entries so we can verify what will be sent
      console.group('CreateCourse FormData (before indexed fallback)');
      for (const pair of (formData as any).entries()) {
        try {
          const [k, v] = pair as [string, any];
          if (v instanceof File) {
            console.log(k, `File(${v.name}, ${v.type}, ${v.size} bytes)`);
          } else {
            console.log(k, v);
          }
        } catch (err) {
          console.log('FormData entry', pair);
        }
      }
      console.groupEnd();

    //   // Fallback: also append Contents as indexed fields (some servers prefer this)
    //   normalizedContents.forEach((item, idx) => {
    //     formData.append(`Contents[${idx}].contentId`, String(item.contentId));
    //     formData.append(`Contents[${idx}].Name`, String(item.Name));
    //     formData.append(`Contents[${idx}].LecturesNumber`, String(item.LecturesNumber));
    //     formData.append(`Contents[${idx}].DurationInHours`, String(item.DurationInHours));
    //   });

      console.group('CreateCourse FormData (after indexed fallback)');
      for (const pair of (formData as any).entries()) {
        try {
          const [k, v] = pair as [string, any];
          if (v instanceof File) {
            console.log(k, `File(${v.name}, ${v.type}, ${v.size} bytes)`);
          } else {
            console.log(k, v);
          }
        } catch (err) {
          console.log('FormData entry', pair);
        }
      }
      console.groupEnd();

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
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <PageHeader title="Add Course" subtitle={<span>Dashboard / Courses / Add Course</span>} />

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
