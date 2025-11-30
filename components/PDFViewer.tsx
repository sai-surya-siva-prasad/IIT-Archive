import React, { useEffect, useRef, useState } from 'react';
import { X, Download, ExternalLink, Send, PanelRightClose, PanelRightOpen, Loader2, FileText, CheckCircle } from 'lucide-react';
import { sendChatMessage, Message } from '../utils/openrouter';
import { extractPDFText, truncateForContext } from '../utils/pdfExtractor';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

interface ChatEntry {
  id: string;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: string;
  isLoading?: boolean;
  isError?: boolean;
}

interface PDFViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, onClose }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(400); // Default width
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfContent, setPdfContent] = useState<string>('');
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<ChatEntry[]>([]);

  // Handle Resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      // Clamp width between 300px and 600px (or 50% of screen)
      const clampedWidth = Math.min(Math.max(newWidth, 300), window.innerWidth * 0.5);
      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Extract PDF content on mount
  useEffect(() => {
    const loadPdfContent = async () => {
      setIsPdfLoading(true);
      setPdfLoadError(null);
      
      try {
        const result = await extractPDFText(url);
        
        if (result.success) {
          if (!result.text || result.text.trim().length < 50) {
             setPdfContent('');
             setPdfLoadError('This appears to be a scanned PDF (images only). I cannot read the text directly, but I can still help with general concepts.');
             setChatLog([{
              id: 'welcome',
              sender: 'assistant',
              message: `Hi! I've loaded "${title}". \n\n⚠️ **Note:** This seems to be a scanned paper (images only), so I can't read the specific questions automatically. \n\nYou can: \n1. Copy-paste the text of a question here\n2. Ask general conceptual questions`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
          } else {
            const truncatedContent = truncateForContext(result.text, 25000);
            setPdfContent(truncatedContent);
            
            // Update welcome message with context info
            setChatLog([{
              id: 'welcome',
              sender: 'assistant',
              message: `Hi! I am your IIT Study Assistant. I've loaded "${title}" (${result.pageCount} pages) and can help you with any questions about the problems, concepts, or solutions. What would you like to know?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
          }
        } else {
          setPdfLoadError(result.error || 'Failed to load PDF content');
          setChatLog([{
            id: 'welcome',
            sender: 'assistant',
            message: `Hi! I am your IIT Study Assistant for "${title}". Note: I couldn't extract the text from this PDF, but I can still help with general JEE concepts and problem-solving techniques. What would you like to know?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        }
      } catch (error) {
        console.error('PDF loading error:', error);
        setPdfLoadError('Failed to load PDF');
        setChatLog([{
          id: 'welcome',
          sender: 'assistant',
          message: `Hi! I am your IIT Study Assistant for "${title}". I can help with JEE concepts and problem-solving. What would you like to know?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      } finally {
        setIsPdfLoading(false);
      }
    };

    loadPdfContent();
  }, [url, title]);

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

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = inputValue.trim();
    
    const userEntry: ChatEntry = {
      id: `user-${Date.now()}`,
      sender: 'user',
      message: userMessage,
      timestamp,
    };

    // Add loading placeholder
    const loadingEntry: ChatEntry = {
      id: `loading-${Date.now()}`,
      sender: 'assistant',
      message: 'Thinking...',
      timestamp,
      isLoading: true,
    };

    setChatLog((prev) => [...prev, userEntry, loadingEntry]);
    setInputValue('');
    setIsLoading(true);

    // Build conversation history for context
    const conversationHistory: Message[] = chatLog
      .filter(entry => !entry.isLoading && entry.id !== 'welcome')
      .map(entry => ({
        role: entry.sender === 'user' ? 'user' : 'assistant',
        content: entry.message
      })) as Message[];
    
    // Add the new user message
    conversationHistory.push({ role: 'user', content: userMessage });

    try {
      const response = await sendChatMessage(conversationHistory, title, pdfContent);
      
      const assistantEntry: ChatEntry = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        message: response.success ? response.message : `Sorry, I encountered an error: ${response.error}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: !response.success,
      };

      // Replace loading entry with actual response
      setChatLog((prev) => prev.filter(e => !e.isLoading).concat(assistantEntry));
    } catch (error) {
      const errorEntry: ChatEntry = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        message: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setChatLog((prev) => prev.filter(e => !e.isLoading).concat(errorEntry));
    } finally {
      setIsLoading(false);
    }
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

        {/* Sidebar - Fixed width, collapsible, resizable */}
        <div 
          ref={sidebarRef}
          style={{ width: isSidebarOpen ? `${sidebarWidth}px` : '0px' }}
          className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out absolute right-0 top-0 bottom-0 h-full z-10 lg:static shadow-xl lg:shadow-none overflow-hidden ${isResizing ? 'transition-none' : ''}`}
        >
            {/* Drag Handle */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-20"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
              }}
            />

            <div className="px-4 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">IIT Study Assistant</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isPdfLoading ? 'Loading paper...' : pdfContent ? 'Paper loaded' : 'General assistance'}
                  </p>
                </div>
                {isPdfLoading ? (
                  <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading
                  </span>
                ) : pdfContent ? (
                  <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Ready
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Basic
                  </span>
                )}
              </div>
              {pdfContent && (
                <div className="mt-2 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-md">
                  <p className="text-[10px] text-emerald-700">
                    ✓ Paper content loaded - I can answer questions about specific problems!
                  </p>
                </div>
              )}
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
                      entry.sender === 'assistant' 
                        ? entry.isError 
                          ? 'bg-red-50 text-red-800 border border-red-200' 
                          : 'bg-white text-slate-800 border border-gray-100' 
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wide opacity-70 mb-1 font-medium">
                      {entry.sender === 'assistant' ? 'Assistant' : 'You'}
                    </p>
                    {entry.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    ) : (
                      <div className="markdown-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkMath, remarkGfm]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            code: ({node, ...props}) => <code className="bg-gray-100 px-1 rounded text-xs font-mono" {...props} />,
                            pre: ({node, ...props}) => <pre className="bg-gray-100 p-2 rounded overflow-x-auto mb-2 text-xs" {...props} />,
                          }}
                        >
                          {entry.message}
                        </ReactMarkdown>
                      </div>
                    )}
                    {!entry.isLoading && (
                      <p className={`text-[10px] mt-1 text-right opacity-60 ${entry.sender === 'assistant' ? 'text-slate-400' : 'text-slate-300'}`}>{entry.timestamp}</p>
                    )}
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
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask about this paper..."
                  disabled={isLoading}
                  className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex items-center justify-center rounded-full bg-blue-600 p-2.5 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
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

