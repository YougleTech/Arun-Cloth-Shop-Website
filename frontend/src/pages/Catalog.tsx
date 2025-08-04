import { Grid, List, Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useApp } from "../contexts/AppContext";
import { apiService } from "../services/api";
import type { Product, PaginatedResponse } from "../types";

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [viewMode, setViewMode] = useState("grid");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedMaterial, setSelectedMaterial] = useState(searchParams.get("material") || "");
  const [selectedUsage, setSelectedUsage] = useState(searchParams.get("usage") || "");
  const [priceMin, setPriceMin] = useState(searchParams.get("price_min") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("price_max") || "");
  const [gsmMin, setGsmMin] = useState(searchParams.get("gsm_min") || "");
  const [gsmMax, setGsmMax] = useState(searchParams.get("gsm_max") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("ordering") || "name");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("in_stock") === "true");

  const { state } = useApp();
  const { categories, filterOptions } = state;

  // Fetch products based on current filters
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: any = {};
      
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (selectedMaterial) filters.material = selectedMaterial;
      if (selectedUsage) filters.usage = selectedUsage;
      if (priceMin) filters.price_min = parseFloat(priceMin);
      if (priceMax) filters.price_max = parseFloat(priceMax);
      if (gsmMin) filters.gsm_min = parseInt(gsmMin);
      if (gsmMax) filters.gsm_max = parseInt(gsmMax);
      if (inStockOnly) filters.in_stock = true;
      if (sortBy) filters.ordering = sortBy;

      const response: PaginatedResponse<Product> = await apiService.getProducts(filters);
      setProducts(response.results);

      // Update URL with current filters
      const newSearchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          newSearchParams.set(key, value.toString());
        }
      });
      setSearchParams(newSearchParams);

    } catch (err) {
      setError("उत्पादनहरू लोड गर्न सकिएन। पछि प्रयास गर्नुहोस्।");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load products when component mounts or filters change
  useEffect(() => {
    fetchProducts();
  }, [selectedMaterial, selectedUsage, priceMin, priceMax, gsmMin, gsmMax, sortBy, inStockOnly]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedMaterial("");
    setSelectedUsage("");
    setPriceMin("");
    setPriceMax("");
    setGsmMin("");
    setGsmMax("");
    setSortBy("name");
    setInStockOnly(false);
    setSearchQuery("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800">
      <Header />

      {/* Hero Section */}
      <section className="py-16 relative">
        <div className="container mx-auto text-center text-white">
          <h1 className="text-4xl font-bold mb-4">कपडा सूची</h1>
          <p className="text-lg mb-8">नेपालको सबैभन्दा ठूलो कपडा संग्रह</p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="कपडा खोज्नुहोस्..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-3 rounded-lg bg-white/20 backdrop-blur-md text-white placeholder:text-white/70 border border-white/30 focus:border-yellow-300 focus:outline-none"
            />
            <Search className="absolute left-3 top-3 text-white/70" />
            <button
              type="submit"
              className="absolute right-2 top-2 bg-yellow-400 text-black px-4 py-1 rounded hover:bg-yellow-300 transition-colors"
            >
              खोज्नुहोस्
            </button>
          </form>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-80 space-y-4">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-white font-semibold flex items-center justify-center gap-2"
          >
            <Filter className="w-5 h-5" />
            फिल्टरहरू
          </button>

          <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Categories Filter */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-md">
              <h2 className="font-bold text-lg mb-4 text-white">प्रकारहरू</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedMaterial("");
                      setSearchParams({ category: category.id });
                      // This will trigger a re-fetch through useEffect
                    }}
                    className="block w-full text-left p-2 rounded text-white hover:bg-white/10 transition-colors"
                  >
                    {category.name} ({category.products_count})
                  </button>
                ))}
              </div>
            </div>

            {/* Material Filter */}
            {filterOptions?.materials && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-lg mb-3 text-white">सामग्री</h3>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded p-2 text-white"
                >
                  <option value="">सबै सामग्री</option>
                  {filterOptions.materials.map((material) => (
                    <option key={material} value={material} className="bg-purple-800">
                      {material === 'cotton' ? 'कपास' :
                       material === 'silk' ? 'रेशम' :
                       material === 'wool' ? 'ऊन' :
                       material === 'polyester' ? 'पलिएस्टर' :
                       material === 'linen' ? 'सन' :
                       material === 'khadi' ? 'खादी' :
                       material}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Usage Filter */}
            {filterOptions?.usages && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-md">
                <h3 className="font-bold text-lg mb-3 text-white">प्रयोग</h3>
                <select
                  value={selectedUsage}
                  onChange={(e) => setSelectedUsage(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded p-2 text-white"
                >
                  <option value="">सबै प्रयोग</option>
                  {filterOptions.usages.map((usage) => (
                    <option key={usage} value={usage} className="bg-purple-800">
                      {usage === 'shirt' ? 'शर्ट' :
                       usage === 'trouser' ? 'ट्राउजर' :
                       usage === 'dress' ? 'पोशाक' :
                       usage === 'saree' ? 'साडी' :
                       usage === 'ethnic_wear' ? 'जातीय पोशाक' :
                       usage === 'casual_wear' ? 'दैनिक पहिरन' :
                       usage}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Range Filter */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-md">
              <h3 className="font-bold text-lg mb-3 text-white">मूल्य दायरा (रुपैयाँमा)</h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="न्यूनतम"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded p-2 text-white placeholder:text-white/70"
                />
                <input
                  type="number"
                  placeholder="अधिकतम"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded p-2 text-white placeholder:text-white/70"
                />
              </div>
            </div>

            {/* GSM Range Filter */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-md">
              <h3 className="font-bold text-lg mb-3 text-white">GSM दायरा</h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="न्यूनतम"
                  value={gsmMin}
                  onChange={(e) => setGsmMin(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded p-2 text-white placeholder:text-white/70"
                />
                <input
                  type="number"
                  placeholder="अधिकतम"
                  value={gsmMax}
                  onChange={(e) => setGsmMax(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded p-2 text-white placeholder:text-white/70"
                />
              </div>
            </div>

            {/* Stock Filter */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-md">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded"
                />
                स्टकमा मात्र देखाउनुहोस्
              </label>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-white py-2 rounded transition-colors"
            >
              सबै फिल्टर हटाउनुहोस्
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6 text-white">
            <h2 className="text-xl font-bold">
              {loading ? "लोड हुँदै..." : `${products.length} वस्तुहरू फेला परे`}
            </h2>
            
            <div className="flex items-center gap-4">
              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/20 border border-white/30 rounded p-2 text-white text-sm"
              >
                <option value="name" className="bg-purple-800">नाम अनुसार</option>
                <option value="price_per_meter" className="bg-purple-800">मूल्य बढ्दो</option>
                <option value="-price_per_meter" className="bg-purple-800">मूल्य घट्दो</option>
                <option value="-created_at" className="bg-purple-800">नयाँ पहिले</option>
                <option value="created_at" className="bg-purple-800">पुरानो पहिले</option>
                <option value="gsm" className="bg-purple-800">GSM बढ्दो</option>
                <option value="-gsm" className="bg-purple-800">GSM घट्दो</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded backdrop-blur-md ${
                    viewMode === "grid" ? "bg-purple-600 text-white" : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <Grid />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded backdrop-blur-md ${
                    viewMode === "list" ? "bg-purple-600 text-white" : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <List />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <LoadingSpinner text="उत्पादनहरू लोड हुँदै..." />
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-xl mb-4">{error}</div>
              <button
                onClick={fetchProducts}
                className="bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-300 transition-colors"
              >
                पुन: प्रयास गर्नुहोस्
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white text-xl mb-4">कुनै उत्पादन फेला परेन</div>
              <button
                onClick={clearFilters}
                className="bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-300 transition-colors"
              >
                फिल्टरहरू हटाउनुहोस्
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              }`}
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode as "grid" | "list"}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Catalog;