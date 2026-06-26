import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UserPlus, LogIn } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content modal-sm">
        {/* Mobile drag handle */}
        <div className="modal-handle" />

        {/* Header */}
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-gray-900">Join the Community</h3>
          <button
            onClick={onClose}
            className="min-h-touch min-w-touch flex items-center justify-center -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body text-center">
          <p className="text-gray-600 mb-6">
            Please log in or register to perform this action.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleNavigate('/login')}
              className="btn-primary w-full justify-center"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Login
            </button>
            <button
              onClick={() => handleNavigate('/register')}
              className="btn-secondary w-full justify-center"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
