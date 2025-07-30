import { Grid, Heart, List, Search, Star } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

const categories = [
  { id: "cotton", name: "कपासका कपडाहरू", count: 45 },
  { id: "silk", name: "रेशम संग्रह", count: 32 },
  { id: "polyester", name: "पलिएस्टर मिश्रण", count: 28 },
  { id: "denim", name: "डेनिम र क्यानभास", count: 18 },
  { id: "wool", name: "ऊनी कपडाहरू", count: 22 },
  { id: "linen", name: "सन कपडाहरू", count: 15 }
];

const fabrics = [
  {
    id: 1,
    name: "प्रिमियम कपास",
    category: "cotton",
    price: 120,
    originalPrice: 150,
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 156,
    colors: ["सेतो", "नीलो", "रातो", "कालो"],
    material: "१००% शुद्ध कपास",
    width: "४५ इन्च",
    gsm: "१८० जीएसएम"
  },
  {
    id: 2,
    name: "लक्जरी रेशम",
    category: "silk",
    price: 450,
    originalPrice: 520,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 89,
    colors: ["सुनौलो", "चाँदी", "रातो", "गुलाबी"],
    material: "१००% प्राकृतिक रेशम",
    width: "४२ इन्च",
    gsm: "२२० जीएसएम"
  },
  {
    id: 3,
    name: "ड्यूरेबल पलिएस्टर",
    category: "polyester",
    price: 85,
    originalPrice: 100,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
    rating: 4.5,
    reviews: 234,
    colors: ["सबै रङहरू उपलब्ध"],
    material: "पलिएस्टर मिश्रण",
    width: "४८ इन्च",
    gsm: "१५० जीएसएम"
  },
  {
    id: 4,
    name: "हेभी डेनिम",
    category: "denim",
    price: 200,
    originalPrice: 240,
    image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 123,
    colors: ["नीलो", "कालो", "खैरो"],
    material: "१००% कपास डेनिम",
    width: "५८ इन्च",
    gsm: "३२० जीएसएम"
  }
];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [favorites, setFavorites] = useState<number[]>([]);

  const categoryFromUrl = searchParams.get("category") || "all";

  const filteredFabrics = fabrics.filter((fabric) => {
    const matchesSearch = fabric.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFromUrl === "all" || fabric.category === categoryFromUrl;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800">
      <Header />

      {/* Hero Section */}
      <section className="py-16 relative">
        <div className="container mx-auto text-center text-white">
          <h1 className="text-4xl font-bold mb-4">कपडा सूची</h1>
          <p className="text-lg mb-8">नेपालको सबैभन्दा ठूलो कपडा संग्रह</p>
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="कपडा खोज्नुहोस्..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 backdrop-blur-md text-white placeholder:text-white/70"
            />
            <Search className="absolute left-3 top-3 text-white/70" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 space-y-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-md">
            <h2 className="font-bold text-lg mb-4 text-white">प्रकारहरू</h2>
            <button
              onClick={() => setSearchParams({ category: "all" })}
              className={`block w-full text-left p-2 rounded ${
                categoryFromUrl === "all"
                  ? "bg-purple-600 text-white"
                  : "text-white hover:bg-white/10"
              }`}
            >
              सबै कपडाहरू ({fabrics.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSearchParams({ category: cat.id })}
                className={`block w-full text-left p-2 rounded ${
                  categoryFromUrl === cat.id
                    ? "bg-purple-600 text-white"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6 text-white">
            <h2 className="text-xl font-bold">
              {filteredFabrics.length} वस्तुहरू फेला परे
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded backdrop-blur-md ${
                  viewMode === "grid" ? "bg-purple-600 text-white" : "bg-white/20 text-white"
                }`}
              >
                <Grid />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded backdrop-blur-md ${
                  viewMode === "list" ? "bg-purple-600 text-white" : "bg-white/20 text-white"
                }`}
              >
                <List />
              </button>
            </div>
          </div>

          {/* Products */}
          <div
            className={`grid gap-6 ${
              viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            }`}
          >
            {filteredFabrics.map((fabric) => (
              <div
                key={fabric.id}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:shadow-lg transition p-4 text-white"
              >
                <div className="relative">
                  <img
                    src={fabric.image}
                    alt={fabric.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => toggleFavorite(fabric.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/20 backdrop-blur-md shadow-md"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.includes(fabric.id)
                          ? "fill-red-500 text-red-500"
                          : "text-white"
                      }`}
                    />
                  </button>
                  {fabric.originalPrice > fabric.price && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      -{Math.round((1 - fabric.price / fabric.originalPrice) * 100)}%
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="font-bold">{fabric.name}</h3>
                  <p className="text-sm text-white/80">{fabric.material}</p>
                  <div className="flex items-center mt-2">
                    <Star className="text-yellow-400 fill-yellow-400 h-4 w-4" />
                    <span className="ml-1 text-sm">{fabric.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-yellow-300 font-bold">
                      रु {fabric.price}
                    </span>
                    <Link
                      to={`/catalog/product/${fabric.id}`}
                      className="text-sm bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-300"
                    >
                      विवरण
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Catalog;
