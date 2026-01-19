import React from 'react';

interface HeaderProps {
    title: string;
    subtitle: string;
    actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <header className="flex justify-between items-start pb-4 border-b border-gray-200 dark:border-gray-700 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
      </div>
       {actions && <div className="flex-shrink-0 ml-4">{actions}</div>}
    </header>
  );
};
