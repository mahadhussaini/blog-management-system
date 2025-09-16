import React from 'react';
import { ClipLoader } from 'react-spinners';

const LoadingSpinner = ({ size = 50, color = '#3B82F6' }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <ClipLoader size={size} color={color} />
    </div>
  );
};

export default LoadingSpinner;
