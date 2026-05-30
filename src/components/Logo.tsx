import React from 'react';

const Logo = ({ size = 48, className = "" }: { size?: number, className?: string }) => {
  return (
    <div 
      className={`relative flex items-center justify-center bg-white rounded-2xl shadow-sm overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img 
        src="/logo.png" 
        alt="Svastha.AI Logo"
        className="w-full h-full object-contain p-1"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback if the local file is missing or fails to load
          (e.target as HTMLImageElement).src = "https://picsum.photos/seed/health/200/200";
        }}
      />
    </div>
  );
};

export default Logo;
