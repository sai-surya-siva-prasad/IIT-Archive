import React, { useEffect, useRef, useState } from 'react';
import { X, Download, ExternalLink, Send, PanelRightClose, PanelRightOpen } from 'lucide-react';

interface ChatEntry {
  id: string;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: string;
}

interface PDFViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, onClose }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [chatLog, setChatLog] = useState<ChatEntry[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      message: `Hi! I am your IIT Study Assistant. Ask me anything about "${title}".`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [chatLog.length]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title.replace(/\s+/g, '-') + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(url, '_blank');
  };

  const quickPrompts = [
    'Summarize the questions on this page.',
    'Highlight the key formulas used in the paper.',
    'Explain the concept behind question 2.',
    'List the chapters this paper covers.',
  ];

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userEntry: ChatEntry = {
      id: `user-${Date.now()}`,
      sender: 'user',
      message: inputValue.trim(),
      timestamp,
    };

    const assistantEntry: ChatEntry = {
      id: `assistant-${Date.now() + 1}`,
      sender: 'assistant',
      message: `Here is a quick insight related to "${title}": ${inputValue.trim()}`,
      timestamp,
    };

    setChatLog((prev) => [...prev, userEntry, assistantEntry]);
    setInputValue('');
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-200"
    >
      {/* Header Bar */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white shrink-0 z-20 relative shadow-sm">
        <div className="flex items-center gap-4 overflow-hidden">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            title="Back"
          >
            <X className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold text-slate-900 truncate">{title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
           <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-colors hidden lg:flex ${isSidebarOpen ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'}`}
              title={isSidebarOpen ? "Hide Assistant" : "Show Assistant"}
            >
              {isSidebarOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1 hidden lg:block" />
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-[#1e40af] hover:bg-blue-50 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="p-2 text-gray-600 hover:text-[#1e40af] hover:bg-blue-50 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* PDF Viewer */}
        <div className={`flex-1 h-full bg-gray-100 transition-all duration-300 ${isSidebarOpen ? 'mr-0' : ''}`}>
          <iframe
            src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0"
            title={title}
          />
        </div>

        {/* Sidebar - Fixed width, collapsible */}
        <div 
          className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out absolute right-0 top-0 bottom-0 h-full z-10 lg:static shadow-xl lg:shadow-none
            ${isSidebarOpen ? 'translate-x-0 w-[350px] lg:w-[400px]' : 'translate-x-full w-0 lg:w-0 lg:border-l-0 overflow-hidden'}
          `}
        >
            <div className="px-4 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">IIT Study Assistant</p>
                  <p className="text-xs text-slate-500 mt-0.5">Context-aware helper</p>
                </div>
                <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
            </div>

            <div
              ref={conversationRef}
              className="flex-1 px-4 py-3 space-y-4 overflow-y-auto bg-slate-50 text-slate-900 text-sm scroll-smooth"
            >
              {chatLog.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex ${entry.sender === 'assistant' ? 'flex-row' : 'flex-row-reverse'} items-start gap-3`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[85%] shadow-sm leading-relaxed text-sm ${
                      entry.sender === 'assistant' ? 'bg-white text-slate-800 border border-gray-100' : 'bg-slate-900 text-white'
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wide opacity-70 mb-1 font-medium">
                      {entry.sender === 'assistant' ? 'Assistant' : 'You'}
                    </p>
                    <p className="whitespace-pre-wrap">{entry.message}</p>
                    <p className={`text-[10px] mt-1 text-right opacity-60 ${entry.sender === 'assistant' ? 'text-slate-400' : 'text-slate-300'}`}>{entry.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-4 border-t border-gray-100 bg-white space-y-3 shrink-0">
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-xs text-left text-slate-700 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-colors truncate"
                    title={prompt}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-center pt-2">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about this paper..."
                  className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all shadow-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="flex items-center justify-center rounded-full bg-blue-600 p-2.5 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// End of component
export default PDFViewer;

