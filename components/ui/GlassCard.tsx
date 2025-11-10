import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', ...rest }) => {
  return (
    <div
      {...rest}
      className={`bg-[#161b22]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg ${className}`}
    >
      {children}
    </div>
  );
};
