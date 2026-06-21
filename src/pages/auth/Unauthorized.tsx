import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 border border-red-200">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Restrained</h1>
      <p className="text-gray-600 max-w-md mb-8">
        Your account role does not have permission keys to access this route. If this is an error, please contact your School Administrator.
      </p>
      <Link 
        to="/" 
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-[#F4F1EA] bg-[#1E3F20] hover:bg-[#28532C] transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
