import React from 'react';

interface InfoBannerProps {
  message?: string;
}

const InfoBanner: React.FC<InfoBannerProps> = ({ 
  message = "Previewing a limited number of records. Run the report to see everything." 
}) => {
  return (
    <div className="bg-blue-50 text-blue-700 px-4 py-2 text-sm border-b border-blue-100">
      {message}
    </div>
  );
};

export default InfoBanner; 