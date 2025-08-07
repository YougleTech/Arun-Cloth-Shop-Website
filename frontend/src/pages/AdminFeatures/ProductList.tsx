import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import type { Product } from "../../types";
const BASE_MEDIA_URL = "http://127.0.0.1:8001/"

const ProductList = () => {
  const { state: authState } = useAuth();
  const token = authState.tokens?.access;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`/api/products/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(res.data.results || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  if (loading) {
    return (
      <div className="text-center text-white py-10">📦 लोड हुँदैछ...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-300 py-10">{error}</div>
    );
  }

  return (
    <section className="min-h-screen px-4 py-16 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold">🧵 उत्पादनहरू सूची</h1>
          <p className="text-white/80 mt-2">Admin Panel – View & Manage All Products</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-xl p-6 shadow-md hover:shadow-xl transition-transform hover:scale-105"
            >
              {/* Product Image */}
              <img
                src={product.main_image ? `${BASE_MEDIA_URL}${product.main_image}` : "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop"}
                alt={product.name}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />

              {/* Product Info */}
              <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
              <p className="text-sm text-white/70 mb-2">{product.short_description}</p>

              <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                <span className="bg-green-400/20 text-green-300 px-2 py-1 rounded-full">
                  {product.category_name}
                </span>
                {product.tags && (
                  <span className="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full">
                    {product.tags}
                  </span>
                )}
                {product.is_featured && (
                  <span className="bg-pink-400/20 text-pink-300 px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>

              <div className="text-sm mb-2">
                <strong>रंगहरू:</strong>{" "}
                {product.available_colors_list.slice(0, 3).join(", ")}...
              </div>

              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-white/80">
                  स्टक: {product.stock_quantity}m
                </span>
                <span className="text-white/80">
                  💵 {product.price_per_meter ? `${product.price_per_meter}/m` : "Hidden"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center gap-2">
                <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-yellow-300 text-black font-semibold hover:bg-yellow-200 transition">
                  <Pencil className="h-4 w-4" />
                  सम्पादन
                </button>
                <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400 transition">
                  <Trash2 className="h-4 w-4" />
                  हटाउनुहोस्
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductList;
