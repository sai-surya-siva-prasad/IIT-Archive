import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import PaperList from './components/PaperList';
import { YEARS, BOOKS } from './constants';
import { View, YearData, Subject } from './types';
import { Calendar, BookOpen, Download } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('papers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<YearData | null>(null);

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

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-900 pb-20">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredYears.map((data) => (
                      <button
                        key={data.year}
                        onClick={() => setSelectedYear(data)}
                        className="group relative bg-white border border-gray-200 hover:border-[#1e40af] p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center h-32"
                      >
                        <Calendar className="h-6 w-6 text-gray-300 group-hover:text-[#1e40af] mb-2 transition-colors" />
                        <span className="text-xl font-bold text-slate-800 group-hover:text-[#1e40af] transition-colors">{data.year}</span>
                      </button>
                    ))}
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