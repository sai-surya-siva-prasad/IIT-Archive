import React from 'react';
import { View } from '../types';
import { Library } from 'lucide-react';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('papers')}>
            <Library className="h-6 w-6 text-[#1e40af]" />
            <span className="font-bold text-xl tracking-tight text-slate-900">IIT Archive</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-8">
            <button
              onClick={() => onViewChange('papers')}
              className={`text-sm font-medium transition-colors duration-200 ${
                currentView === 'papers'
                  ? 'text-[#1e40af] border-b-2 border-[#1e40af]'
                  : 'text-gray-500 hover:text-gray-900'
              } h-16 flex items-center px-1`}
            >
              Question Papers
            </button>
            <button
              onClick={() => onViewChange('books')}
              className={`text-sm font-medium transition-colors duration-200 ${
                currentView === 'books'
                  ? 'text-[#1e40af] border-b-2 border-[#1e40af]'
                  : 'text-gray-500 hover:text-gray-900'
              } h-16 flex items-center px-1`}
            >
              Books
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;