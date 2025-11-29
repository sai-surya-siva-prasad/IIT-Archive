import React, { useState } from 'react';
import { YearData, Subject, Paper } from '../types';
import { ArrowLeft, Download, FileText, Eye } from 'lucide-react';
import PDFViewer from './PDFViewer';

interface PaperListProps {
  data: YearData;
  onBack: () => void;
}

const PaperList: React.FC<PaperListProps> = ({ data, onBack }) => {
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  const handlePaperClick = (paper: Paper) => {
    setSelectedPaper(paper);
  };

  const handleDownload = (e: React.MouseEvent, paper: Paper) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = paper.url;
    link.download = paper.title.replace(/\s+/g, '-') + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
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
                    <div
                      key={paper.id}
                      className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all duration-200 cursor-pointer"
                      onClick={() => handlePaperClick(paper)}
                    >
                      <div className="flex items-center flex-1">
                        <FileText className="h-5 w-5 text-gray-400 group-hover:text-[#1e40af] mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#1e40af]">{paper.title}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={(e) => handlePaperClick(paper)}
                          className="p-1.5 text-gray-400 hover:text-[#1e40af] hover:bg-blue-100 rounded transition-colors"
                          title="View PDF"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleDownload(e, paper)}
                          className="p-1.5 text-gray-400 hover:text-[#1e40af] hover:bg-blue-100 rounded transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedPaper && (
        <PDFViewer
          url={selectedPaper.url}
          title={selectedPaper.title}
          onClose={() => setSelectedPaper(null)}
        />
      )}
    </>
  );
};

export default PaperList;