import axios from "axios";
import { Image as ImageIcon, Link as LinkIcon, Loader2, MoveVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image: string; // absolute URL from API
  is_active?: boolean;
  sort_order: number;
};

const LIST_URL = "/api/admin/hero-slides/";
const PUBLIC_URL = "/api/hero-slides/";

export default function HeroSlides() {
  const { state: authState } = useAuth();
  const token = authState.tokens?.access;

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const [items, setItems] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Slide | null>(null);

  const [form, setForm] = useState<any>({
    title: "",
    subtitle: "",
    button_text: "",
    button_link: "",
    sort_order: 0,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(LIST_URL, { headers: authHeader });
      const data: Slide[] = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
      setItems(data);
    } catch (e: any) {
      console.error(e);
      setError("Failed to load slides.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      subtitle: "",
      button_text: "",
      button_link: "",
      sort_order: (items.at(-1)?.sort_order ?? -1) + 1,
      is_active: true,
    });
    setImageFile(null);
    setPreview(null);
    setShowForm(true);
  };

  const openEdit = (s: Slide) => {
    setEditing(s);
    setForm({
      title: s.title || "",
      subtitle: s.subtitle || "",
      button_text: s.button_text || "",
      button_link: s.button_link || "",
      sort_order: s.sort_order ?? 0,
      is_active: (s as any).is_active ?? true,
    });
    setImageFile(null);
    setPreview(s.image || null);
    setShowForm(true);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const f = e.target.files[0];
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev: any) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title ?? "");
      fd.append("subtitle", form.subtitle ?? "");
      fd.append("button_text", form.button_text ?? "");
      fd.append("button_link", form.button_link ?? "");
      fd.append("sort_order", String(parseInt(form.sort_order || 0, 10)));
      fd.append("is_active", form.is_active ? "true" : "false");
      if (imageFile) fd.append("image", imageFile);

      if (editing) {
        await axios.patch(`${LIST_URL}${editing.id}/`, fd, {
          headers: { ...authHeader, "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(LIST_URL, fd, {
          headers: { ...authHeader, "Content-Type": "multipart/form-data" },
        });
      }
      await load();
      setShowForm(false);
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.detail ||
        (e?.response?.data &&
          Object.entries(e.response.data)
            .map(([k, v]: any) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("\n")) ||
        "Save failed.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (s: Slide) => {
    const ok = confirm("Delete this slide? This cannot be undone.");
    if (!ok) return;
    try {
      await axios.delete(`${LIST_URL}${s.id}/`, { headers: authHeader });
      setItems((prev) => prev.filter((x) => x.id !== s.id));
    } catch (e) {
      console.error(e);
      alert("Delete failed.");
    }
  };

  return (
    <>
      <Header />
      <section className="min-h-screen px-4 py-16 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🎞️ Hero Slides</h1>
              <p className="text-white/80 mt-1">Upload, order, and manage homepage slider images.</p>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-300 text-black font-semibold hover:bg-yellow-200"
            >
              <Plus className="w-4 h-4" /> New Slide
            </button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-white/90">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading…
            </div>
          ) : error ? (
            <div className="text-red-200">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-white/80">No slides yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((s) => (
                <div key={s.id} className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-lg shadow">
                  <div className="w-full h-40 rounded-lg overflow-hidden mb-4 border border-white/20 bg-white/10 flex items-center justify-center">
                    {s.image ? (
                      <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-white/70 flex flex-col items-center justify-center">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="font-semibold">{s.title || "—"}</div>
                    <div className="text-sm text-white/80">{s.subtitle || "—"}</div>
                  </div>

                  <div className="text-xs text-white/70 flex items-center gap-2 mb-3">
                    <MoveVertical className="w-4 h-4" /> Order: {s.sort_order}
                    {s.button_link && (
                      <span className="inline-flex items-center gap-1">
                        <LinkIcon className="w-4 h-4" /> {s.button_text || "Link"}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-yellow-300 text-black font-semibold hover:bg-yellow-200"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => removeItem(s)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white/10 border border-white/20 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{editing ? "Edit Slide" : "New Slide"}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Title</label>
                  <input name="title" value={form.title} onChange={handleChange} className="w-full p-2 rounded bg-white text-gray-900" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Subtitle</label>
                  <textarea name="subtitle" value={form.subtitle} onChange={handleChange} className="w-full p-2 rounded bg-white text-gray-900" />
                </div>

                <div>
                  <label className="block text-sm mb-1">Button text</label>
                  <input name="button_text" value={form.button_text} onChange={handleChange} className="w-full p-2 rounded bg-white text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Button link</label>
                  <input name="button_link" value={form.button_link} onChange={handleChange} className="w-full p-2 rounded bg-white text-gray-900" />
                </div>

                <div>
                  <label className="block text-sm mb-1">Sort order</label>
                  <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} className="w-full p-2 rounded bg-white text-gray-900" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="is_active" checked={!!form.is_active} onChange={handleChange} />
                  <label className="text-sm">Active</label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Image {editing ? "(leave empty to keep)" : "(required)"}</label>
                  <input type="file" accept="image/*" onChange={onFile} {...(editing ? {} : { required: true })} />
                  {preview && (
                    <img src={preview} alt="preview" className="mt-2 w-36 h-24 object-cover rounded border border-white/30" />
                  )}
                </div>

                <div className="md:col-span-2 mt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded bg-white/20 border border-white/30">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-yellow-300 text-black font-semibold hover:bg-yellow-200">
                    {saving ? "Saving..." : editing ? "Save changes" : "Create slide"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
