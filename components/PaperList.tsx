import React from 'react';
import { YearData, Subject } from '../types';
import { ArrowLeft, Download, FileText } from 'lucide-react';

interface PaperListProps {
  data: YearData;
  onBack: () => void;
}

const PaperList: React.FC<PaperListProps> = ({ data, onBack }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-[#1e40af] transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to All Years
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 pb-4 border-b border-gray-100">
          JEE Papers {data.year}
        </h2>

        <div className="grid gap-10 md:grid-cols-3">
          {Object.values(Subject).map((subject) => (
            <div key={subject} className="flex flex-col">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${
                    subject === Subject.MATH ? 'bg-blue-500' :
                    subject === Subject.PHYSICS ? 'bg-purple-500' : 'bg-teal-500'
                }`}></span>
                {subject}
              </h3>
              <div className="space-y-3">
                {data.papers[subject]?.map((paper) => (
                  <a
                    key={paper.id}
                    href={paper.url}
                    className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all duration-200"
                    onClick={(e) => e.preventDefault()} // Prevent actual nav for demo
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 group-hover:text-[#1e40af] mr-3" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#1e40af]">{paper.title}</span>
                    </div>
                    <Download className="h-4 w-4 text-gray-400 group-hover:text-[#1e40af]" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaperList;