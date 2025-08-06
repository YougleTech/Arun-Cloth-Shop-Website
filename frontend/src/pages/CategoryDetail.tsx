import { ArrowLeft, Filter, Grid, List } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/ProductCard";
import { useApp } from "../contexts/AppContext";
import { apiService } from "../services/api";
import type { Category, Product } from "../types";

const CategoryDetail = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedUsage, setSelectedUsage] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [gsmMin, setGsmMin] = useState("");
  const [gsmMax, setGsmMax] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedColor, setSelectedColor] = useState("");

  const { state } = useApp();
  const { categories, filterOptions } = state;

  // Find current category
  useEffect(() => {
    if (categoryId && categories.length > 0) {
      const foundCategory = categories.find(cat => cat.id === categoryId);
      setCategory(foundCategory || null);
    }
  }, [categoryId, categories]);

  // Fetch products for this category
  const fetchCategoryProducts = async () => {
    if (!categoryId) return;
    
    setLoading(true);
    setError(null);

    try {
      const filters: any = {};
      
      if (selectedMaterial) filters.material = selectedMaterial;
      if (selectedUsage) filters.usage = selectedUsage;
      if (priceMin) filters.price_min = parseFloat(priceMin);
      if (priceMax) filters.price_max = parseFloat(priceMax);
      if (gsmMin) filters.gsm_min = parseInt(gsmMin);
      if (gsmMax) filters.gsm_max = parseInt(gsmMax);
      if (selectedColor) filters.color = selectedColor;
      if (sortBy) filters.sort_by = sortBy;

      const productsData = await apiService.getCategoryProducts(categoryId, filters);
      setProducts(productsData);
    } catch (err) {
      setError("उत्पादनहरू लोड गर्न सकिएन। पछि प्रयास गर्नुहोस्।");
      console.error("Error fetching category products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryProducts();
  }, [categoryId, selectedMaterial, selectedUsage, priceMin, priceMax, gsmMin, gsmMax, sortBy, selectedColor]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedMaterial("");
    setSelectedUsage("");
    setPriceMin("");
    setPriceMax("");
    setGsmMin("");
    setGsmMax("");
    setSortBy("name");
    setSelectedColor("");
  };

  if (!category && categories.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-white text-xl mb-4">प्रकार फेला परेन</div>
          <Link
            to="/catalog"
            className="bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-300 transition-colors"
          >
            सूचीमा फर्किनुहोस्
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800">
      <Header />

      {/* Hero Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            सूचीमा फर्किनुहोस्
          </Link>

          {category && (
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
              <p className="text-lg mb-4 max-w-2xl mx-auto">
                {category.description}
              </p>
              <div className="text-yellow-300 text-xl font-semibold">
                {products.length} उत्पादनहरू उपलब्ध
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
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

            {/* Color Filter */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-md">
              <h3 className="font-bold text-lg mb-3 text-white">रङ</h3>
              <input
                type="text"
                placeholder="रङ खोज्नुहोस्..."
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded p-2 text-white placeholder:text-white/70"
              />
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
                <option value="price_low" className="bg-purple-800">मूल्य बढ्दो</option>
                <option value="price_high" className="bg-purple-800">मूल्य घट्दो</option>
                <option value="newest" className="bg-purple-800">नयाँ पहिले</option>
                <option value="popular" className="bg-purple-800">लोकप्रिय पहिले</option>
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
                onClick={fetchCategoryProducts}
                className="bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-300 transition-colors"
              >
                पुन: प्रयास गर्नुहोस्
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white text-xl mb-4">यस प्रकारमा कुनै उत्पादन फेला परेन</div>
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

export default CategoryDetail;