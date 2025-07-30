import { Grid, Heart, List, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

const categoryData = {
  cotton: {
    name: "कपासका कपडाहरू",
    description: "नेपालका उत्कृष्ट मिलहरूबाट ल्याइएको १००% शुद्ध कपासका कपडाहरूको व्यापक संग्रह",
    hero: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=1200&h=400&fit=crop",
    totalProducts: 45,
    priceRange: "रु ८०-३००",
    fabrics: [
      {
        id: 1,
        name: "प्रिमियम कपास",
        price: 120,
        originalPrice: 150,
        image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop",
        rating: 4.8,
        reviews: 156,
        colors: ["सेतो", "नीलो", "रातो", "कालो"],
        gsm: "१८० जीएसएम",
        width: "४५ इन्च"
      },
      {
        id: 7,
        name: "कम्फर्ट कपास",
        price: 95,
        originalPrice: 110,
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=300&fit=crop",
        rating: 4.6,
        reviews: 89,
        colors: ["सेतो", "हल्का नीलो", "गुलाबी"],
        gsm: "१६० जीएसएम",
        width: "४४ इन्च"
      }
    ]
  },
  silk: {
    name: "रेशम संग्रह",
    description: "लक्जरी र परम्परागत रेशमी कपडाहरूको अनुपम संग्रह जुन विशेष अवसरहरूका लागि उत्तम छ",
    hero: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=400&fit=crop",
    totalProducts: 32,
    priceRange: "रु ३००-८००",
    fabrics: [
      {
        id: 2,
        name: "लक्जरी रेशम",
        price: 450,
        originalPrice: 520,
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
        rating: 4.9,
        reviews: 89,
        colors: ["सुनौलो", "चाँदी", "रातो", "गुलाबी"],
        gsm: "२२० जीएसएम",
        width: "४२ इन्च"
      }
    ]
  }
};

const CategoryDetail = () => {
  const { categoryId } = useParams();
  const [viewMode, setViewMode] = useState("grid");
  const [favorites, setFavorites] = useState<number[]>([]);

  const category = categoryData[categoryId as keyof typeof categoryData];

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">श्रेणी फेला परेन</h1>
          <Link
            to="/catalog"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            कपडा सूचीमा फर्कनुहोस्
          </Link>
        </div>
      </div>
    );
  }

  const toggleFavorite = (fabricId: number) => {
    setFavorites((prev) =>
      prev.includes(fabricId)
        ? prev.filter((id) => id !== fabricId)
        : [...prev, fabricId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50">
      <Header />

      {/* Hero Section */}
      <section className="relative h-80 overflow-hidden">
        <img
          src={category.hero}
          alt={category.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 text-white">
            <nav className="flex items-center gap-2 text-sm mb-4 opacity-90">
              <Link to="/" className="hover:text-purple-300">मुख्य पृष्ठ</Link>
              <span>/</span>
              <Link to="/catalog" className="hover:text-purple-300">कपडा सूची</Link>
              <span>/</span>
              <span>{category.name}</span>
            </nav>
            <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
            <p className="text-lg mb-4">{category.description}</p>
            <div className="flex gap-4">
              <span className="bg-white/20 px-3 py-1 rounded text-sm">
                {category.totalProducts} वस्तुहरू
              </span>
              <span className="bg-white/20 px-3 py-1 rounded text-sm">
                मूल्य: {category.priceRange}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold">{category.fabrics.length} वस्तुहरू फेला परे</h2>
            <p className="text-gray-600">{category.name}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${viewMode === "grid" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
            >
              <Grid />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${viewMode === "list" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
            >
              <List />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {category.fabrics.map((fabric) => (
            <div
              key={fabric.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-4"
            >
              <div className="relative">
                <img
                  src={fabric.image}
                  alt={fabric.name}
                  className="w-full h-48 object-cover rounded"
                />
                <button
                  onClick={() => toggleFavorite(fabric.id)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white shadow"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favorites.includes(fabric.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-500"
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
                <p className="text-sm text-gray-600">{fabric.gsm} • {fabric.width}</p>
                <div className="flex items-center mt-2">
                  <Star className="text-yellow-400 fill-yellow-400 h-4 w-4" />
                  <span className="ml-1 text-sm">{fabric.rating}</span>
                  <span className="ml-1 text-xs text-gray-500">({fabric.reviews})</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-purple-600 font-bold">रु {fabric.price}</span>
                  <Link
                    to={`/catalog/product/${fabric.id}`}
                    className="bg-purple-600 text-white text-sm px-3 py-1 rounded hover:bg-purple-700"
                  >
                    विवरण
                  </Link>
                  <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                    <ShoppingCart className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CategoryDetail;
