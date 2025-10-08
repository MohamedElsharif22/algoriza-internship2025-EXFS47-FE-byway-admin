import React from 'react';
import Dialog from './Dialog';
import Button from './Button';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetName?: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const DeleteConfirmation: React.FC<Props> = ({ open, onClose, onConfirm, targetName, title, confirmLabel = 'Delete', cancelLabel = 'Cancel' }) => {
  return (
    <Dialog open={open} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center p-8">
        <div className="w-28 h-28 rounded-full bg-pink-50 flex items-center justify-center mb-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H5H21" stroke="#F97373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="#F97373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 11V17" stroke="#F97373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 11V17" stroke="#F97373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">{title ?? 'Are you sure you want to delete this Instructor'} <span className="text-slate-900 font-bold">{targetName}</span> ?</h3>
        <p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p>

        <div className="w-full flex gap-4">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1 bg-slate-100 text-slate-500 text-lg py-3 rounded-lg"
          >
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white text-lg py-3 rounded-lg"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteConfirmation;
