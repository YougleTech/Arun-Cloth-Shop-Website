// src/pages/AdminFeatures/ProductList.tsx
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import type { Product } from "../../types";

const BASE_API_URL = "https://arun.yougletech.com/api/";
const BASE_MEDIA_URL = "https://arun.yougletech.com/";

export default function ProductList() {
  const { state } = useAuth();
  const { tokens, rehydrated, isAuthenticated } = state;
  const token = tokens?.access;

  const navigate = useNavigate();

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_API_URL}admin/products/`, {
        headers: authHeader,
      });

      const data = res.data;
      let items: Product[] = [];

      if (Array.isArray(data)) {
        items = data;
      } else if (Array.isArray(data.results)) {
        items = data.results;
      }

      setProducts(items);
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401) {
        setError("You are not authorized. Please log in again.");
      } else {
        setError("Failed to fetch products.");
      }
      setProducts([]); // ✅ Prevents `.map` crash
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rehydrated) return;

    if (!isAuthenticated || !token) {
      setLoading(false);
      setError("You are not authorized. Please log in.");
      return;
    }

    setLoading(true);
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rehydrated, isAuthenticated, token]);

  const handleDelete = async (productId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;
    try {
      setDeletingId(productId);
      await axios.delete(`${BASE_API_URL}admin/products/${productId}/`, {
        headers: authHeader,
      });
      setProducts((prev) => prev.filter((p) => String(p.id) !== productId));
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete the product.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!rehydrated || loading) {
    return <div className="text-center text-white py-10">📦 लोड हुँदैछ...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-300 py-10">
        {error}{" "}
        {!isAuthenticated && (
          <button
            onClick={() => navigate("/login")}
            className="ml-2 underline text-white"
          >
            Login
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <Header />
      <section className="min-h-screen px-4 py-16 pt-28 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold">🧵 उत्पादनहरू सूची</h1>
            <p className="text-white/80 mt-2">
              Admin Panel – View & Manage All Products
            </p>

            <button
              onClick={() => navigate("/admin/products/add")}
              className="mt-4 px-4 py-2 rounded-lg bg-yellow-300 text-black font-semibold hover:bg-yellow-200 transition"
            >
              ➕ Add Product
            </button>
          </div>

          {Array.isArray(products) && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-xl p-6 shadow-md hover:shadow-xl transition-transform hover:scale-105"
                >
                  <img
                    src={
                      product.main_image
                        ? `${BASE_MEDIA_URL}${product.main_image}`
                        : "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop"
                    }
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />

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
                    {(product.available_colors_list || []).slice(0, 3).join(", ")}
                    {product.available_colors_list &&
                    product.available_colors_list.length > 3
                      ? "..."
                      : ""}
                  </div>

                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className="text-white/80">
                      स्टक: {product.stock_quantity}m
                    </span>
                    <span className="text-white/80">
                      💵 {product.price_per_meter ? `${product.price_per_meter}/m` : "Hidden"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-yellow-300 text-black font-semibold hover:bg-yellow-200 transition"
                    >
                      <Pencil className="h-4 w-4" />
                      सम्पादन
                    </button>
                    <button
                      onClick={() => handleDelete(String(product.id))}
                      disabled={deletingId === String(product.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400 transition disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === String(product.id) ? "Deleting..." : "हटाउनुहोस्"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-white/70 mt-10">No products found.</p>
          )}
        </div>
      </section>
    </>
  );
}
