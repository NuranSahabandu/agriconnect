import { useEffect, useState } from "react";
import { searchProducts } from "../api.js";
import SearchBar from "../listing/SearchBar.jsx";
import FilterBar from "../listing/FilterBar.jsx";
import ProductCard from "../listing/ProductCard.jsx";
import ProductDetailModal from "../listing/ProductDetailModal.jsx";
import { useDebouncedValue } from "../listing/useDebouncedValue.js";
import { useLang } from "../context/LangContext.jsx";

function Search() {
  const { t } = useLang();
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    location: "",
    maxPrice: "",
    sortBy: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const debouncedSearch = useDebouncedValue(filters.search, 400);

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      setLoading(true);
      setError(null);

      try {
        const data = await searchProducts({
          search: debouncedSearch,
          category: filters.category,
          location: filters.location,
          maxPrice: filters.maxPrice,
          sortBy: filters.sortBy,
        });

        if (!cancelled) {
          setResults(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load products");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    runSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, filters.category, filters.location, filters.maxPrice, filters.sortBy]);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Search</h1>

      <div className="mb-4 flex flex-col gap-3">
        <SearchBar
          value={filters.search}
          onChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
        />
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {loading && <p className="text-sm text-gray-500">Loading products...</p>}

      {!loading && error && (
        <p className="text-sm text-red-600">Error: {error}</p>
      )}

      {!loading && !error && results.length === 0 && (
        <p className="text-sm text-gray-500">{t("noResults")}</p>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      )}

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

export default Search;
