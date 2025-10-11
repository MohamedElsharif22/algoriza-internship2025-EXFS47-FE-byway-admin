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
import PageHeader from '../components/layout/PageHeader';
import { instructorsAtom, instructorFiltersAtom, selectedInstructorAtom, instructorLoadingAtom } from '../store/instructor.store';
import { instructorService } from '../services/instructor.service';
// types imported where needed in other modules
import { toast } from 'react-toastify';
import LoadingBanner from '../components/ui/LoadingBanner';

const InstructorsPage = () => {
  const [instructors, setInstructors] = useAtom(instructorsAtom);
  const [filters, setFilters] = useAtom(instructorFiltersAtom);
  const [selectedInstructor, setSelectedInstructor] = useAtom(selectedInstructorAtom);
  const [loading, setLoading] = useAtom(instructorLoadingAtom);
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

  // Clicking a row should open the view dialog (all screen sizes)
  const handleRowClick = (instructor: any) => {
    setSelectedInstructor(instructor);
    setIsViewDialogOpen(true);
  };

  // Columns configuration removed — page renders a custom table below

  return (
    <div>
      {loading && <LoadingBanner message="Loading instructors..." />}
      <PageHeader title="Instructors" subtitle={<><span className="text-slate-500">Dashboard</span> <span className="mx-1">/</span> <span>Instructors</span></>} />

      <div className="lg:px-6 md:px-4 sm: px-1">
      {/* Card with table and controls */}
      <div className="bg-white rounded-2xl shadow p-8 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-slate-800">Instructors</h2>
            <span className="bg-slate-100 text-slate-500 text-base font-semibold px-3 py-1 rounded-full">{instructors.count ?? instructors.data?.length ?? 0}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            <Button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold text-base shadow w-full sm:w-auto" onClick={() => setIsAddDialogOpen(true)}>
              Add Instructor
            </Button>
            <div className="relative w-full sm:w-auto">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for Instructors"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 pr-10 py-2 rounded-lg border border-slate-200 text-base focus:ring-2 focus:ring-blue-100 focus:border-blue-300 w-full sm:w-56"
              />
              <button aria-label="Open filters" title="Filter" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
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
                <tr key={instructor.id || idx} onClick={() => handleRowClick(instructor)} className="cursor-pointer hover:bg-slate-50 transition-colors">
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
                      <button className="text-blue-500 hover:text-blue-700 p-2 rounded-full bg-white hover:bg-slate-100 transition" title="View" onClick={(e) => { e.stopPropagation(); setSelectedInstructor(instructor); setIsViewDialogOpen(true); }}>
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-blue-500 hover:text-blue-700 p-2 rounded-full bg-white hover:bg-slate-100 transition" title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInstructor(instructor);
                          setIsEditDialogOpen(true);
                        }}>
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button className="text-red-400 hover:text-red-600 p-2 rounded-full bg-white hover:bg-slate-100 transition" title="Delete" onClick={(e) => { e.stopPropagation(); setSelectedInstructor(instructor); setIsDeleteDialogOpen(true); }}>
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
          <div className="space-y-4">
            <InstructorForm
              instructor={selectedInstructor}
              onSubmit={async () => {}}
              onCancel={() => setIsViewDialogOpen(false)}
              readOnly
            />
            <div className="flex justify-end gap-3">
              <button className="text-blue-500 hover:text-blue-700 rounded-lg px-4 py-2 bg-white shadow-sm" onClick={() => { setIsViewDialogOpen(false); setSelectedInstructor(selectedInstructor); setIsEditDialogOpen(true); }}>
                <PencilIcon className="inline-block h-4 w-4 mr-2" /> Edit
              </button>
              <button className="text-red-500 hover:text-red-700 rounded-lg px-4 py-2 bg-white shadow-sm" onClick={() => { setIsViewDialogOpen(false); setSelectedInstructor(selectedInstructor); setIsDeleteDialogOpen(true); }}>
                <TrashIcon className="inline-block h-4 w-4 mr-2" /> Delete
              </button>
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
  </div>
  );
};

export default InstructorsPage;