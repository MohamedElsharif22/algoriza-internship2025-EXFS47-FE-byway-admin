import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
// ...existing code uses plain table markup below; Card/Table components removed
import Button from '../components/ui/Button';
import Dialog from '../components/ui/Dialog';
import DeleteConfirmation from '../components/ui/DeleteConfirmation';
import Pagination from '../components/ui/Pagination';
import InstructorForm from '../components/ui/InstructorForm';
import { instructorsAtom, instructorFiltersAtom, selectedInstructorAtom, instructorLoadingAtom } from '../store/instructor.store';
import { instructorService } from '../services/instructor.service';
// types imported where needed in other modules
import { toast } from 'react-toastify';

const InstructorsPage = () => {
  const [instructors, setInstructors] = useAtom(instructorsAtom);
  const [filters, setFilters] = useAtom(instructorFiltersAtom);
  const [selectedInstructor, setSelectedInstructor] = useAtom(selectedInstructorAtom);
  // Undo editInstructorData state
  // loading state is available in the store but not used in this page's current markup
  const [, setLoading] = useAtom(instructorLoadingAtom);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const response = await instructorService.getAllInstructors(filters);
      setInstructors(response);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      toast.error('Failed to load instructors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, [filters]);

  const handleAddInstructor = async (formData: FormData) => {
    try {
      await instructorService.createInstructor(formData);
      toast.success('Instructor added successfully');
      setIsAddDialogOpen(false);
      fetchInstructors();
    } catch (error) {
      console.error('Error adding instructor:', error);
      toast.error('Failed to add instructor');
    }
  };

  const handleEditInstructor = async (formData: FormData) => {
    if (!selectedInstructor) return;
    try {
      await instructorService.updateInstructor(selectedInstructor.id, formData);
      toast.success('Instructor updated successfully');
      setIsEditDialogOpen(false);
      setSelectedInstructor(null);
      fetchInstructors();
    } catch (error) {
      console.error('Error updating instructor:', error);
      toast.error('Failed to update instructor');
    }
  };

  const handleDeleteInstructor = async () => {
    if (!selectedInstructor) return;

    try {
      const resp = await instructorService.deleteInstructor(selectedInstructor.id);
      const message = resp?.message || 'Instructor deleted successfully';
      toast.success(message);
      setIsDeleteDialogOpen(false);
      fetchInstructors();
      setSelectedInstructor(null);
    } catch (error) {
      console.error('Error deleting instructor:', error);
      toast.error('Failed to delete instructor');
    }
  };

  // Columns configuration removed — page renders a custom table below

  return (
    <div className="px-2 pt-8 pb-2">
      {/* Header with breadcrumbs */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Instructors</h1>
        <div className="mt-2 text-sm text-slate-400 font-medium">
          Dashboard <span className="mx-1">/</span> <span className="text-slate-500">Instructors</span>
        </div>
        <hr className="mt-4" />
      </div>

      {/* Card with table and controls */}
      <div className="bg-white rounded-2xl shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-slate-800">Instructors</h2>
            <span className="bg-slate-100 text-slate-500 text-base font-semibold px-3 py-1 rounded-full">{instructors.count ?? instructors.data?.length ?? 0}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold text-base shadow" onClick={() => setIsAddDialogOpen(true)}>
              Add Instructor
            </Button>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for Instructors"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 pr-10 py-2 rounded-lg border border-slate-200 text-base focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                style={{ width: 220 }}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <FunnelIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-base font-semibold text-slate-500">Name</th>
                <th className="px-6 py-3 text-left text-base font-semibold text-slate-500">Job Title</th>
                <th className="px-6 py-3 text-left text-base font-semibold text-slate-500">Rate</th>
                <th className="px-6 py-3 text-right text-base font-semibold text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {(instructors.data || []).map((instructor: any, idx: number) => (
                <tr key={instructor.id || idx}>
                  <td className="px-6 py-4 text-slate-700 text-base flex items-center gap-3">
                    <img src={instructor.profilePictureUrl} alt={instructor.name} className="w-8 h-8 rounded-full object-cover" />
                    {instructor.name}
                  </td>
                  <td className="px-6 py-4 text-slate-700 text-base">{instructor.jopTitle}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={
                            'w-5 h-5 ' +
                            (i < Math.round(instructor.averageRating)
                              ? 'text-yellow-400'
                              : 'text-gray-300')
                          }
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4">
                      <button className="text-blue-500 hover:text-blue-700" title="View" onClick={() => { setSelectedInstructor(instructor); setIsViewDialogOpen(true); }}>
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-blue-500 hover:text-blue-700" title="Edit"
                        onClick={() => {
                          setSelectedInstructor(instructor);
                          setIsEditDialogOpen(true);
                        }}>
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button className="text-red-400 hover:text-red-600" title="Delete" onClick={() => { setSelectedInstructor(instructor); setIsDeleteDialogOpen(true); }}>
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - only show if there are multiple pages */}
        {instructors.count > instructors.pageSize && (
          <div className="flex justify-center mt-8">
            <Pagination
              currentPage={Number(filters.pageIndex || 1)}
              totalPages={Math.ceil(Number(instructors.count ?? 0) / Number(instructors.pageSize ?? 1))}
              onPageChange={(page) => setFilters({ ...filters, pageIndex: Number(page) })}
            />
          </div>
        )}
      </div>

      {/* Dialogs (unchanged) */}
      {/* ...existing code for dialogs... */}
      {/* Add Instructor Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Add Instructor"
      >
        <InstructorForm
          onSubmit={handleAddInstructor}
          onCancel={() => setIsAddDialogOpen(false)}
        />
      </Dialog>

      {/* Edit Instructor Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Edit Instructor"
      >
        {selectedInstructor && (
          <InstructorForm
            instructor={selectedInstructor}
            onSubmit={handleEditInstructor}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        )}
      </Dialog>

      {/* View Instructor Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        title="View Instructor"
      >
        {selectedInstructor && (
          <div className="px-6 py-4">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                  <img src={(selectedInstructor as any).profilePictureUrl || (selectedInstructor as any).profilePicture} alt={selectedInstructor.name} className="w-20 h-20 rounded-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 -translate-y-1/3 translate-x-1/3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-600">Nama</label>
                <input type="text" value={selectedInstructor.name} readOnly className="mt-2 block w-full rounded-lg border border-slate-100 px-4 py-3 bg-white placeholder-slate-300" />

                <div className="mt-4 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-600">Job Title</label>
                    <select value={(selectedInstructor as any).jopTitle ?? (selectedInstructor as any).jobTitle} disabled className="mt-2 block w-full rounded-lg border border-slate-100 px-4 py-3 bg-white text-slate-700">
                      <option>{(selectedInstructor as any).jopTitle ?? (selectedInstructor as any).jobTitle}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600">Rate</label>
                    <div className="mt-2 flex items-center gap-2">
                      {[1,2,3,4,5].map((star)=> (
                        <svg key={star} className={`w-6 h-6 ${star <= Math.round((selectedInstructor as any).averageRating ?? (selectedInstructor as any).rating) ? 'text-yellow-400' : 'text-slate-300'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.177 3.623a1 1 0 00.95.69h3.805c.969 0 1.371 1.24.588 1.81l-3.08 2.24a1 1 0 00-.364 1.118l1.177 3.623c.3.921-.755 1.688-1.54 1.118l-3.08-2.24a1 1 0 00-1.176 0l-3.08 2.24c-.784.57-1.838-.197-1.539-1.118l1.177-3.623a1 1 0 00-.364-1.118L2.34 9.05c-.783-.57-.38-1.81.588-1.81h3.804a1 1 0 00.951-.69L9.05 2.927z"/></svg>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-600">Description</label>
                  <textarea readOnly value={(selectedInstructor as any).about} className="mt-2 block w-full rounded-lg border border-slate-100 px-4 py-3 h-28 bg-white placeholder-slate-300"></textarea>
                </div>

                <div className="mt-6">
                  <Button variant="secondary" onClick={() => setIsViewDialogOpen(false)} className="w-full">Close</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation (reusable) */}
      <DeleteConfirmation
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteInstructor}
        targetName={selectedInstructor?.name}
      />
    </div>
  );
};

export default InstructorsPage;