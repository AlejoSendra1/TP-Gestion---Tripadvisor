import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navegamos a la página de resultados con el query en la URL
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar cancha por nombre..."
        className="border p-2 rounded-md flex-grow"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
        Buscar
      </button>
    </form>
  );
};

export default SearchBar;

