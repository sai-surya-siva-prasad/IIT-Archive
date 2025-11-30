import React, { useState } from 'react';
import { YearData, Paper } from '../types';
import { ArrowLeft, Download, FileText, Eye, AlertCircle } from 'lucide-react';
import PDFViewer from './PDFViewer';

interface PaperListProps {
  data: YearData;
  onBack: () => void;
}

const PaperList: React.FC<PaperListProps> = ({ data, onBack }) => {
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [loadingPaperId, setLoadingPaperId] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [unavailablePapers, setUnavailablePapers] = useState<Record<string, boolean>>({});

  const verifyPaperAvailability = async (paper: Paper) => {
    if (!paper.url || paper.url === '#') {
      return false;
    }

    try {
      const response = await fetch(paper.url, { method: 'HEAD', cache: 'no-store' });
      if (!response.ok) return false;
      const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
      if (!contentType.includes('application/pdf')) return false;
      return true;
    } catch {
      return false;
    }
  };

  const handlePaperClick = async (paper: Paper) => {
    setAvailabilityError(null);
    if (unavailablePapers[paper.id]) {
      setAvailabilityError('PDF not available yet.');
      return;
    }

    setLoadingPaperId(paper.id);

    const exists = await verifyPaperAvailability(paper);
    setLoadingPaperId(null);

    if (!exists) {
      setUnavailablePapers((prev) => ({ ...prev, [paper.id]: true }));
      setAvailabilityError('PDF not available yet.');
      return;
    }

    setSelectedPaper(paper);
  };

  const handleDownload = async (e: React.MouseEvent, paper: Paper) => {
    e.stopPropagation();
    if (unavailablePapers[paper.id]) {
      setAvailabilityError('PDF not available yet.');
      return;
    }

    const exists = await verifyPaperAvailability(paper);
    if (!exists) {
      setUnavailablePapers((prev) => ({ ...prev, [paper.id]: true }));
      setAvailabilityError('PDF not available yet.');
      return;
    }

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

          {availabilityError && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{availabilityError}</span>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {data.papers.map((paper) => {
              const isUnavailable = unavailablePapers[paper.id];
              const isLoading = loadingPaperId === paper.id;
              return (
              <div
                key={paper.id}
                className={`group flex items-center justify-between p-6 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                  isLoading ? 'pointer-events-none opacity-70' : ''
                } ${isUnavailable ? 'opacity-70 border-dashed' : ''}`}
                onClick={() => handlePaperClick(paper)}
              >
                <div className="flex items-center flex-1">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 mr-4 group-hover:border-blue-100">
                    <FileText className="h-6 w-6 text-gray-400 group-hover:text-[#1e40af] transition-colors" />
                  </div>
                  <div>
                    <span className="block text-lg font-semibold text-gray-800 group-hover:text-[#1e40af] transition-colors">
                      {paper.title}
                    </span>
                    <span className="text-sm text-gray-500">Click to view PDF</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePaperClick(paper);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isUnavailable
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-400 hover:text-[#1e40af] hover:bg-blue-100'
                    }`}
                    title="View PDF"
                    disabled={isLoading || isUnavailable}
                  >
                    {isLoading ? (
                      <svg className="h-5 w-5 animate-spin text-[#1e40af]" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : isUnavailable ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDownload(e, paper)}
                    className={`p-2 rounded-lg transition-colors ${
                      isUnavailable
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-400 hover:text-[#1e40af] hover:bg-blue-100'
                    }`}
                    title="Download PDF"
                    disabled={isLoading || isUnavailable}
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
          </div>

          {data.papers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No papers uploaded for this year yet.
            </div>
          )}
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