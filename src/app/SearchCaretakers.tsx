interface SearchCaretakersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isSearching: boolean;
  searchResults: { uid: string; displayName?: string; email: string }[];
  sendConnectionRequest: (uid: string) => void;
}

export default function SearchCaretakers({ searchQuery, setSearchQuery, handleSearch, isSearching, searchResults, sendConnectionRequest }: SearchCaretakersProps) {
    return (
      <div className="mb-8">
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          placeholder="Search for caretakers..." 
          className="w-full px-4 py-2 border rounded-lg"
        />
        <button 
          onClick={handleSearch} 
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Search
        </button>
  
        {isSearching && <p>Searching...</p>}
  
        {!isSearching && searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((result) => (
              <div key={result.uid} className="bg-white rounded-lg shadow p-4">
                <h3 className="font-bold text-lg mb-1">{result.displayName || result.email}</h3>
                <p className="text-sm text-gray-500 mb-2">{result.email}</p>
                <button 
                  onClick={() => sendConnectionRequest(result.uid)} 
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Send Connection Request
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }