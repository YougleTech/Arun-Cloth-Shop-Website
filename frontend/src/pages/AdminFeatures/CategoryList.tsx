// src/pages/AdminFeatures/CategoryList.tsx
import axios from "axios";
import { Image as ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import type { Category } from "../../types";

const BASE_API_URL = "https://arun.yougletech.com/api/";
const BASE_MEDIA_URL = "https://arun.yougletech.com/";

// Make relative media paths absolute
const toAbsoluteUrl = (url?: string | null) => {
  if (!url) return null;
  // already absolute
  if (/^https?:\/\//i.test(url)) return url;
  // ensure no double slash when concatenating
  if (url.startsWith("/")) return `${BASE_MEDIA_URL}${url.slice(1)}`;
  return `${BASE_MEDIA_URL}${url}`;
};

export default function CategoryList() {
  const { state } = useAuth();
  const { tokens, rehydrated, isAuthenticated } = state;
  const token = tokens?.access;
  const navigate = useNavigate();

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const normalize = (data: any): Category[] => {
    if (Array.isArray(data)) return data;
    if (data?.results && Array.isArray(data.results)) return data.results;
    return [];
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_API_URL}admin/categories/`, {
        headers: authHeader,
      });
      setCategories(normalize(res.data));
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.status === 401
          ? "You are not authorized."
          : "क्याटेगरी ल्याउन असफल भयो।"
      );
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
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rehydrated, isAuthenticated, token]);

  const handleDelete = async (id: string) => {
    const ok = window.confirm("यो क्याटेगरी मेटाउने? यसले सम्वन्धित उत्पादनहरूमा असर पर्न सक्छ।");
    if (!ok) return;
    try {
      setDeletingId(id);
      await axios.delete(`${BASE_API_URL}admin/categories/${id}/`, {
        headers: authHeader,
      });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("मेटाउन असफल भयो।");
    } finally {
      setDeletingId(null);
    }
  };

  if (!rehydrated || loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white flex items-center justify-center">
        <div className="text-center">📂 क्याटेगरी लोड हुँदैछ...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white flex items-center justify-center">
        <div className="text-center text-red-200">{error}</div>
      </section>
    );
  }

  return (
    <>
      <Header />
      <section
  className="min-h-screen px-4 py-16 
             bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800 
             text-white"
>
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-10 flex items-center justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold">📂 क्याटेगरी सूची</h1>
              <p className="text-white/80 mt-2">Admin Panel – View & Manage Categories</p>
            </div>

            <button
              onClick={() => navigate("/admin/categories/add")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-300 text-black font-semibold hover:bg-yellow-200 transition"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="relative bg-white/10 border border-white/20 backdrop-blur-lg rounded-xl p-6 shadow-md hover:shadow-xl transition-transform hover:scale-105 overflow-hidden"
                >
                  {/* Image */}
                  <div className="w-full h-40 rounded-lg overflow-hidden mb-4 border border-white/20 bg-white/10 flex items-center justify-center">
                    {cat.image ? (
                      <img
                        src={toAbsoluteUrl(cat.image) || undefined}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-white/70 flex flex-col items-center justify-center">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-1">{cat.name}</h3>
                  <p className="text-sm text-white/70 line-clamp-2 mb-3">
                    {cat.description || "—"}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
                    <span className="bg-green-400/20 text-green-200 px-2 py-1 rounded-full">
                      {cat.products_count} products
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full ${
                        cat.is_active
                          ? "bg-emerald-400/20 text-emerald-200"
                          : "bg-red-400/20 text-red-200"
                      }`}
                    >
                      {cat.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/categories/edit/${cat.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-yellow-300 text-black font-semibold hover:bg-yellow-200 transition"
                    >
                      <Pencil className="h-4 w-4" />
                      सम्पादन
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletingId === cat.id}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400 transition disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === cat.id ? "Deleting..." : "मेटाउनुहोस्"}
                    </button>
                  </div>

                  <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/20" />
                </div>
              ))
            ) : (
              <p className="text-center text-white/80 col-span-full">No categories found.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
