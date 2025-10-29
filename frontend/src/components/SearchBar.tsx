import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ onSearch }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchInput);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Buscar..."
        className="search-input"
      />
      <button onClick={handleSearch} className="search-button">
        Usar
      </button>
    </div>
  );
};

export default SearchBar;

