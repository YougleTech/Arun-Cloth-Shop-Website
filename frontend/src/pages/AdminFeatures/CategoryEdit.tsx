// src/pages/AdminFeatures/CategoryEdit.tsx
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import type { Category } from "../../types";

const BASE_API_URL = "https://arun.yougletech.com/api/";
const BASE_MEDIA_URL = "https://arun.yougletech.com/";

// helper to fix relative paths
const toAbsoluteUrl = (url?: string | null) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${BASE_MEDIA_URL}${url.slice(1)}`;
  return `${BASE_MEDIA_URL}${url}`;
};

export default function CategoryEdit() {
  const { id } = useParams();
  const createMode = !id;
  const navigate = useNavigate();

  const { state: authState } = useAuth();
  const token = authState.tokens?.access;

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<{ name: string; description: string; is_active: boolean }>({
    name: "",
    description: "",
    is_active: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const load = async () => {
      try {
        if (!createMode) {
          const res = await axios.get(`${BASE_API_URL}admin/categories/${id}/`, {
            headers: authHeader,
          });
          const c: Category = res.data;
          setForm({
            name: c.name || "",
            description: c.description || "",
            is_active: !!c.is_active,
          });
          setCurrentImage(c.image ? toAbsoluteUrl(c.image) : null);
        }
      } catch (e) {
        console.error(e);
        setError("क्याटेगरी लोड हुन सकेन।");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, createMode, authHeader]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!form.name.trim()) {
        setSaving(false);
        return alert("कृपया क्याटेगरीको नाम लेख्नुहोस्।");
      }

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description || "");
      fd.append("is_active", form.is_active ? "true" : "false");

      if (imageFile) {
        fd.append("image", imageFile);
      }

      if (createMode) {
        await axios.post(`${BASE_API_URL}admin/categories/`, fd, {
          headers: { ...authHeader, "Content-Type": "multipart/form-data" },
        });
        alert("✅ क्याटेगरी सिर्जना भयो।");
      } else {
        await axios.patch(`${BASE_API_URL}admin/categories/${id}/`, fd, {
          headers: { ...authHeader, "Content-Type": "multipart/form-data" },
        });
        alert("✅ क्याटेगरी अपडेट भयो।");
      }

      navigate("/admin/categories/manage");
    } catch (e: any) {
      console.error(e);
      let msg = "सेभ गर्न सकेन। कृपया फाँटहरू जाँच गर्नुहोस्।";
      if (e?.response?.data) {
        try {
          msg = Object.entries(e.response.data as Record<string, string[]>)
            .map(([f, errs]) => `${f}: ${(errs || []).join(", ")}`)
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

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white flex items-center justify-center">
        <div>📂 लोड हुँदैछ...</div>
      </section>
    );
  }

  return (
    <>
      <Header />
      <section className="min-h-screen px-4 py-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="max-w-xl mx-auto bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {createMode ? "➕ क्याटेगरी थप्नुहोस्" : "✏️ क्याटेगरी सम्पादन"}
            </h1>
            {error && <p className="mt-2 text-sm text-yellow-200 whitespace-pre-line">{error}</p>}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm mb-1">नाम</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">विवरण</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_active"
                type="checkbox"
                name="is_active"
                checked={!!form.is_active}
                onChange={handleChange}
              />
              <label htmlFor="is_active" className="text-sm">Active</label>
            </div>

            <div>
              <label className="block text-sm mb-1">तस्बिर (optional)</label>
              <input type="file" accept="image/*" onChange={handleImage} />
              <div className="mt-2 flex items-center gap-3">
                {previewUrl || currentImage ? (
                  <img
                    src={previewUrl || currentImage || undefined}
                    alt="Preview"
                    className="h-16 w-24 object-cover rounded border border-white/30 bg-white/10"
                  />
                ) : (
                  <span className="text-xs text-white/70">No image selected</span>
                )}
                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                      setImageFile(null);
                    }}
                    className="px-2 py-1 rounded bg-white/20 border border-white/30 text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
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
                {saving ? "Saving..." : createMode ? "Create" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
