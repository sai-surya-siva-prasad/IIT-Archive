import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import PaperList from './components/PaperList';
import Login from './components/Login';
import { YEARS, BOOKS } from './constants';
import { View, YearData, Subject } from './types';
import { Calendar, BookOpen, Download, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('papers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<YearData | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Reset drill-down state when view changes
  const handleViewChange = (view: View) => {
    setCurrentView(view);
    setSearchQuery('');
    setSelectedYear(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter Papers (Years)
  const filteredYears = useMemo(() => {
    if (!searchQuery) return YEARS;
    return YEARS.filter(y => y.year.toString().includes(searchQuery));
  }, [searchQuery]);

  // Filter Books
  const filteredBooks = useMemo(() => {
    if (!searchQuery) return BOOKS;
    const q = searchQuery.toLowerCase();
    return BOOKS.filter(
      b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q) ||
        b.subject.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Number of items to show before locking
  const PREVIEW_LIMIT = 12;

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-900 pb-20 relative">
      <Header currentView={currentView} onViewChange={handleViewChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* VIEW: PAPERS */}
        {currentView === 'papers' && (
          <div>
            {!selectedYear ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">Question Papers Archive</h1>
                    <p className="text-gray-500 mt-1">Browse past JEE papers from 1985 to 2025</p>
                  </div>
                  <SearchBar 
                    value={searchQuery} 
                    onChange={setSearchQuery} 
                    placeholder="Search year (e.g., 2015)..." 
                  />
                </div>

                {filteredYears.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <p>No papers found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {filteredYears.map((data, index) => {
                        const isLocked = !isAuthenticated && index >= PREVIEW_LIMIT;
                        
                        return (
                          <button
                            key={data.year}
                            onClick={() => !isLocked && setSelectedYear(data)}
                            disabled={isLocked}
                            className={`group relative bg-white border border-gray-200 p-6 rounded-lg shadow-sm transition-all duration-200 flex flex-col items-center justify-center h-32
                              ${isLocked ? 'opacity-40 blur-[2px] cursor-not-allowed' : 'hover:border-[#1e40af] hover:shadow-md'}
                            `}
                          >
                            <Calendar className={`h-6 w-6 mb-2 transition-colors ${isLocked ? 'text-gray-300' : 'text-gray-300 group-hover:text-[#1e40af]'}`} />
                            <span className={`text-xl font-bold transition-colors ${isLocked ? 'text-gray-400' : 'text-slate-800 group-hover:text-[#1e40af]'}`}>{data.year}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Lock Overlay */}
                    {!isAuthenticated && filteredYears.length > PREVIEW_LIMIT && (
                      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#f9fafb] via-[#f9fafb]/90 to-transparent flex flex-col items-center justify-end pb-10 pointer-events-none">
                         <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 text-center max-w-md mx-4 mb-4 pointer-events-auto transform translate-y-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Lock className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Unlock the full archive</h3>
                            <p className="text-gray-600 mb-6 text-sm">Sign in to access all 40+ years of question papers and recommended books.</p>
                            <button 
                              onClick={() => setIsAuthModalOpen(true)}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm shadow-blue-200"
                            >
                              Sign in to unlock
                            </button>
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <PaperList data={selectedYear} onBack={() => setSelectedYear(null)} />
            )}
          </div>
        )}

        {/* VIEW: BOOKS */}
        {currentView === 'books' && (
          <div>
             {/* ... existing books view ... */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Recommended Books</h1>
                <p className="text-gray-500 mt-1">Standard reference texts for JEE preparation</p>
              </div>
              <SearchBar 
                value={searchQuery} 
                onChange={setSearchQuery} 
                placeholder="Search title, author, subject..." 
              />
            </div>

            {filteredBooks.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p>No books found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
                    <div className="aspect-[3/4] w-full bg-gray-100 relative overflow-hidden group">
                      <img 
                        src={book.coverUrl} 
                        alt={book.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="mb-4 flex-1">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${
                            book.subject === Subject.MATH ? 'bg-blue-100 text-blue-800' :
                            book.subject === Subject.PHYSICS ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {book.subject}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{book.title}</h3>
                        <p className="text-sm text-gray-600">{book.author}</p>
                      </div>
                      <a 
                        href={book.downloadUrl}
                        className="w-full flex items-center justify-center px-4 py-2 border border-[#1e40af] text-[#1e40af] text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors duration-150"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
           <div className="flex min-h-full items-center justify-center p-4 text-center">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsAuthModalOpen(false)} />
              
              <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-md">
                 <div className="absolute top-4 right-4 z-10">
                    <button onClick={() => setIsAuthModalOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                       </svg>
                    </button>
                 </div>
                 <Login onLogin={handleLoginSuccess} />
              </div>
           </div>
        </div>
      )}

      {/* Simple Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-8 border-t border-gray-200 text-center">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} IIT Archive. Educational use only.
        </p>
      </footer>
    </div>
  );
};

export default App;