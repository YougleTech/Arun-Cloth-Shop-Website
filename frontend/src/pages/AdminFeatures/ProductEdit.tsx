// src/pages/AdminFeatures/ProductEdit.tsx
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import type { Category, ProductDetail } from "../../types";

const BASE_API_URL = "https://arun.yougletech.com/api/";

const MATERIALS = [
  "cotton","silk","wool","polyester","linen","rayon","chiffon","georgette","crepe",
  "denim","lycra","net","satin","velvet","khadi","other",
];

const USAGES = [
  "shirt","trouser","suit","dress","curtain","bedsheet","saree","salwar","lehenga",
  "ethnic_wear","casual_wear","formal_wear","home_decor","other",
];

const TAGS = ["", "new", "hot", "sale", "premium", "bestseller"]; // "" => None

export default function ProductEdit() {
  const { id } = useParams();
  const createMode = !id;
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const token = authState.tokens?.access;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<any>({});
  const [mainImage, setMainImage] = useState<File | null>(null);

  // Preview image states
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch categories
        const cRes = await axios.get(`${BASE_API_URL}admin/categories/`, { headers: authHeader });
        setCategories(cRes.data.results ?? cRes.data);

        if (id) {
          // Fetch product details
          const pRes = await axios.get(`${BASE_API_URL}admin/products/${id}/`, { headers: authHeader });
          const p: ProductDetail = pRes.data;
          setProduct(p);
          setCurrentImage(p.main_image || null);

          setForm({
            name: p.name ?? "",
            slug: p.slug ?? "",
            short_description: p.short_description ?? "",
            description: p.description ?? "",
            category: p.category?.id ?? "",
            material: p.material ?? "",
            gsm: p.gsm ?? "",
            width: p.width ?? "",
            primary_color: p.primary_color ?? "",
            colors_available: p.colors_available ?? "",
            usage: p.usage ?? "",
            care_instructions: p.care_instructions ?? "",
            price_per_meter: p.price_per_meter ?? "",
            wholesale_price: p.wholesale_price ?? "",
            minimum_order_quantity: p.minimum_order_quantity ?? 1,
            stock_quantity: p.stock_quantity ?? 0,
            is_available: p.is_available ?? true,
            is_featured: p.is_featured ?? false,
            tags: p.tags ?? "",
            meta_title: p.meta_title ?? "",
            meta_description: p.meta_description ?? "",
          });
        } else {
          // Defaults for create
          setForm({
            name: "",
            slug: "",
            short_description: "",
            description: "",
            category: "",
            material: "",
            gsm: "",
            width: "",
            primary_color: "",
            colors_available: "",
            usage: "",
            care_instructions: "",
            price_per_meter: "",
            wholesale_price: "",
            minimum_order_quantity: 1,
            stock_quantity: 0,
            is_available: true,
            is_featured: false,
            tags: "",
            meta_title: "",
            meta_description: "",
          });
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, authHeader]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;

    if (name === "name" && (!form.slug || form.slug.trim() === "")) {
      const auto = value.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setForm((prev: any) => ({ ...prev, name: value, slug: auto }));
      return;
    }

    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainImage(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const validateRequired = () => {
    const errs: string[] = [];
    if (!form.name?.trim()) errs.push("name is required");
    if (!form.slug?.trim()) errs.push("slug is required");
    if (!form.category?.trim()) errs.push("category is required");
    if (!MATERIALS.includes(form.material)) errs.push("material is required (valid choice)");
    if (!form.gsm || isNaN(parseInt(form.gsm, 10))) errs.push("gsm must be a number");
    if (!form.width?.trim()) errs.push("width is required");
    if (!form.colors_available?.trim()) errs.push("colors_available is required");
    if (!form.primary_color?.trim()) errs.push("primary_color is required");
    if (!USAGES.includes(form.usage)) errs.push("usage is required (valid choice)");
    if (errs.length) {
      setError(errs.join("\n"));
      alert(`❌ Please fix:\n${errs.map(e => `• ${e}`).join("\n")}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!validateRequired()) {
        setSaving(false);
        return;
      }

      const payload = new FormData();
      const appendIfValid = (key: string, value: any) => {
        if (value === "" || value === undefined || value === null) return;
        payload.append(key, value);
      };

      Object.entries(form).forEach(([key, value]) => {
        appendIfValid(key, value);
      });

      if (mainImage) {
        payload.append("main_image", mainImage);
      } else if (createMode) {
        payload.append("main_image", "");
      }

      if (id) {
        await axios.patch(`${BASE_API_URL}admin/products/${id}/`, payload, {
          headers: { ...authHeader, "Content-Type": "multipart/form-data" },
        });
        alert("✅ Product updated successfully.");
      } else {
        await axios.post(`${BASE_API_URL}admin/products/`, payload, {
          headers: { ...authHeader, "Content-Type": "multipart/form-data" },
        });
        alert("✅ Product created successfully.");
      }

      navigate("/admin/products/manage");
    } catch (e: any) {
      console.error(e);
      let msg = "Save failed.";
      if (e?.response?.data) {
        try {
          msg = Object.entries(e.response.data as Record<string, string[]>)
            .map(([field, errors]) => `${field}: ${(errors || []).join(", ")}`)
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

  if (loading) return <div className="text-center text-white py-10">📦 लोड हुँदैछ...</div>;
  if (!createMode && !product) return null;

  return (
    <>
      <Header />
      <section className="min-h-screen px-4 py-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl p-6 overflow-visible">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {createMode ? "➕ Add Product" : `✏️ Edit: ${product?.name ?? ""}`}
            </h1>
            {!createMode && <p className="text-white/80">ID: {id}</p>}
            {error && !saving && (
              <p className="mt-2 text-sm text-yellow-200 whitespace-pre-line">{error}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-visible">
            {/* Basic */}
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Slug</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Short description</label>
              <input
                name="short_description"
                value={form.short_description}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            {/* Category */}
            <div className="relative z-50">
              <label className="block text-sm mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300 relative z-50"
              >
                <option value="">-- Select --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Specs */}
            <div className="relative z-50">
              <label className="block text-sm mb-1">Material</label>
              <select
                name="material"
                value={form.material}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300 relative z-50"
              >
                <option value="">-- Select --</option>
                {MATERIALS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">GSM</label>
              <input
                name="gsm"
                type="number"
                value={form.gsm}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Width (inches)</label>
              <input
                name="width"
                value={form.width}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Primary color</label>
              <input
                name="primary_color"
                value={form.primary_color}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Colors available (comma-separated)</label>
              <textarea
                name="colors_available"
                value={form.colors_available}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            <div className="relative z-50">
              <label className="block text-sm mb-1">Usage</label>
              <select
                name="usage"
                value={form.usage}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300 relative z-50"
              >
                <option value="">-- Select --</option>
                {USAGES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Care instructions</label>
              <textarea
                name="care_instructions"
                value={form.care_instructions}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            {/* Pricing & stock */}
            <div>
              <label className="block text-sm mb-1">Price per meter (optional)</label>
              <input
                name="price_per_meter"
                type="number"
                step="0.01"
                value={form.price_per_meter}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Wholesale price (optional)</label>
              <input
                name="wholesale_price"
                type="number"
                step="0.01"
                value={form.wholesale_price}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Minimum order quantity</label>
              <input
                name="minimum_order_quantity"
                type="number"
                value={form.minimum_order_quantity}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Stock quantity</label>
              <input
                name="stock_quantity"
                type="number"
                value={form.stock_quantity}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            {/* Image */}
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Main Image (optional)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />

              {/* small preview */}
              <div className="mt-2 flex items-center gap-3">
                {(previewUrl || currentImage) ? (
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
                      setMainImage(null);
                    }}
                    className="px-2 py-1 rounded bg-white/20 border border-white/30 text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* show current url text if editing and no new file */}
              {product?.main_image && !previewUrl && (
                <p className="text-xs mt-1 opacity-80 break-all">
                  Current: {product.main_image}
                </p>
              )}
            </div>

            {/* Flags & tags */}
            <div className="flex items-center gap-2">
              <input
                id="is_available"
                type="checkbox"
                name="is_available"
                checked={!!form.is_available}
                onChange={handleChange}
              />
              <label htmlFor="is_available" className="text-sm">
                Is available
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_featured"
                type="checkbox"
                name="is_featured"
                checked={!!form.is_featured}
                onChange={handleChange}
              />
              <label htmlFor="is_featured" className="text-sm">
                Is featured
              </label>
            </div>

            <div className="relative z-50">
              <label className="block text-sm mb-1">Tags</label>
              <select
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300 relative z-50"
              >
                {TAGS.map((t) => (
                  <option key={t || "none"} value={t}>
                    {t || "None"}
                  </option>
                ))}
              </select>
            </div>

            {/* SEO */}
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Meta title</label>
              <input
                name="meta_title"
                value={form.meta_title}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Meta description</label>
              <textarea
                name="meta_description"
                value={form.meta_description}
                onChange={handleChange}
                className="w-full p-2 rounded bg-white text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            {/* Actions */}
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/products/manage")}
                className="px-4 py-2 rounded bg-white/20 border border-white/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
              >
                {saving ? "Saving..." : createMode ? "Create product" : "Save changes"}
              </button>
            </div>
          </form>

          <p className="text-sm text-white/70 mt-4">
            Note: Product images are managed separately. We can add an Images manager later.
          </p>
        </div>
      </section>
    </>
  );
}
