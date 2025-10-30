// SearchBar.tsx (actualizado con TypeScript)
import { useState } from "react";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    onSearch(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar flex gap-2 max-w-md mx-auto">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Buscar publicaciones por título..."
        className="search-input flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button 
        onClick={handleSearch} 
        className="search-button px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        Buscar
      </button>
    </div>
  );
};

export default SearchBar;