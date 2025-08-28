
import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', ...rest }) => {
  return (
    <div
      {...rest}
      className={`bg-black/20 backdrop-blur-xl border border-cyan-400/20 rounded-2xl shadow-lg shadow-cyan-500/5 ${className}`}
    >
      {children}
    </div>
  );
};