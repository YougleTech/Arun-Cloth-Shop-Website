import axios from "axios";
import { Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import type { Category } from "../../types";

const CategoryList = () => {
  const { state: authState } = useAuth();
  const token = authState.tokens?.access;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Normalize API response (supports both array and paginated)
  const normalize = (data: any): Category[] => {
    if (Array.isArray(data)) return data;
    if (data?.results && Array.isArray(data.results)) return data.results;
    return [];
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`/api/categories/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setCategories(normalize(res.data));
    } catch (err) {
      console.error(err);
      setError("क्याटेगरि ल्याउन असफल भयो।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDelete = async (id: string) => {
    const ok = confirm("यो क्याटेगरी मेटाउने? यसले सम्वन्धित उत्पादनहरूमा असर पर्न सक्छ।");
    if (!ok) return;
    try {
      await axios.delete(`/api/categories/${id}/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("मेटाउन असफल भयो।");
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white flex items-center justify-center">
        <div className="text-center text-white">📂 क्याटेगरि लोड हुँदैछ...</div>
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
      <section className="min-h-screen px-4 py-16 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold">📂 क्याटेगरी सूची</h1>
            <p className="text-white/80 mt-2">Admin Panel – View & Manage Categories</p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="relative bg-white/10 border border-white/20 backdrop-blur-lg rounded-xl p-6 shadow-md hover:shadow-xl transition-transform hover:scale-105 overflow-hidden"
              >
                {/* Image */}
                <div className="w-full h-40 rounded-lg overflow-hidden mb-4 border border-white/20 bg-white/10 flex items-center justify-center">
                  {cat.image ? (
                    <img
                      src={cat.image}
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
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-yellow-300 text-black font-semibold hover:bg-yellow-200 transition"
                    // TODO: open edit category modal/page
                  >
                    <Pencil className="h-4 w-4" />
                    सम्पादन
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    मेटाउनुहोस्
                  </button>
                </div>

                {/* Glass border pulse */}
                <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default CategoryList;
