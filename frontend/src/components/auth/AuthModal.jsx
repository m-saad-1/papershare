import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UserPlus, LogIn } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="mt-2">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Join the Community</h3>
          <p className="text-gray-600 mb-6">
            Please log in or register to perform this action.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => handleNavigate('/login')}
              className="w-full btn-primary py-3 flex items-center justify-center"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Login
            </button>
            <button
              onClick={() => handleNavigate('/register')}
              className="w-full btn-secondary py-3 flex items-center justify-center"
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
