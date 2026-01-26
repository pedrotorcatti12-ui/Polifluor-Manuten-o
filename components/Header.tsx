import React from 'react';

interface HeaderProps {
    title: string;
    subtitle: string;
    actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-gray-200 mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          {title}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
      </div>
       {actions && <div className="flex-shrink-0">{actions}</div>}
    </header>
  );
};
