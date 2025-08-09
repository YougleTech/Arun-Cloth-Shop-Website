import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import type { Category } from "../../types";

export default function CategoryEdit() {
  const { id } = useParams();
  const createMode = !id;
  const navigate = useNavigate();

  const { state } = useAuth();
  const { tokens, rehydrated, isAuthenticated } = state;
  const token = tokens?.access;

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Category> & { is_active?: boolean }>({
    name: "",
    description: "",
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    if (!rehydrated) return;

    if (!isAuthenticated || !token) {
      setLoading(false);
      setError("You are not authorized. Please log in.");
      return;
    }

    const load = async () => {
      try {
        if (id) {
          const res = await axios.get(`/api/admin/categories/${id}/`, { headers: authHeader });
          const c: Category = res.data;
          setForm({
            name: c.name || "",
            description: c.description || "",
            is_active: !!c.is_active,
          });
          setCurrentImage(c.image || null);
        } else {
          setForm({ name: "", description: "", is_active: true });
          setCurrentImage(null);
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load category.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, authHeader, isAuthenticated, token, rehydrated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, is_active: e.target.checked }));
  };
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!form.name || !form.name.trim()) {
        setSaving(false);
        return alert("Name is required.");
      }

      const fd = new FormData();
      fd.append("name", form.name.trim());
      if (form.description) fd.append("description", form.description.trim());
      if (typeof form.is_active === "boolean") fd.append("is_active", form.is_active ? "true" : "false");
      if (imageFile) fd.append("image", imageFile);

      if (id) {
        await axios.patch(`/api/admin/categories/${id}/`, fd, {
          headers: { ...authHeader, "Content-Type": "multipart/form-data" },
        });
        alert("✅ Category updated.");
      } else {
        await axios.post(`/api/admin/categories/`, fd, {
          headers: { ...authHeader, "Content-Type": "multipart/form-data" },
        });
        alert("✅ Category created.");
      }
      navigate("/admin/categories/manage");
    } catch (e: any) {
      console.error(e);
      let msg = "Save failed.";
      if (e?.response?.data) {
        try {
          msg = Object.entries(e.response.data as Record<string, string[]>)
            .map(([field, errs]) => `${field}: ${(errs || []).join(", ")}`)
            .join("\n");
        } catch {
          msg = e?.response?.data?.detail || msg;
        }
      }
      setError(msg);
      alert(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (!rehydrated || loading) {
    return <div className="text-center text-white py-10">📂 लोड हुँदैछ...</div>;
  }
  if (error) {
    return <div className="text-center text-red-300 py-10">{error}</div>;
  }

  return (
    <>
      <Header />
      <section className="min-h-screen px-4 py-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="max-w-xl mx-auto bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{id ? "✏️ Edit Category" : "➕ Add Category"}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Description</label>
              <textarea
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_active"
                type="checkbox"
                checked={!!form.is_active}
                onChange={handleToggle}
              />
              <label htmlFor="is_active" className="text-sm">Active</label>
            </div>

            <div>
              <label className="block text-sm mb-1">Image (optional)</label>
              <input type="file" accept="image/*" onChange={handleImage} />
              {currentImage && !imageFile && (
                <p className="text-sm mt-1">Current: {currentImage}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate("/admin/categories/manage")}
                className="px-4 py-2 rounded bg-white/20 border border-white/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
              >
                {saving ? "Saving..." : id ? "Save changes" : "Create category"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
