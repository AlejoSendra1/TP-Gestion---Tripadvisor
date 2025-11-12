import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// Definimos un tipo para los datos de la cancha, puedes ajustarlo según tu modelo
interface Field {
  id: number;
  name: string;
  location: string;
  zone: string;
  images: string[];
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const [results, setResults] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        // Hacemos la llamada al nuevo endpoint del backend
        const response = await fetch(
          `http://localhost:8080/fields/search?name=${encodeURIComponent(query)}`
        );
        if (!response.ok) {
          throw new Error("Error al obtener los resultados");
        }
        const data: Field[] = await response.json();
        setResults(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ocurrió un error inesperado"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) return <div className="p-8">Buscando...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Resultados para "{query}"</h1>
      {results.length > 0 ? (
        // Aquí puedes renderizar los resultados como tarjetas, una lista, etc.
        results.map((field) => <div key={field.id}>{field.name}</div>)
      ) : (
        <p>No se encontraron canchas con ese nombre.</p>
      )}
    </div>
  );
};

export default SearchResults;

