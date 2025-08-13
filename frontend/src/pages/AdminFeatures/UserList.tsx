import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  User2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";

type AdminUser = {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_staff: boolean;
  created_at?: string;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// ✅ Match UserDashboard route base
const API_ORIGIN = import.meta.env.VITE_BACKEND_URL || "https://arun.yougletech.com/";
const API_BASE = `${API_ORIGIN}api/accounts/`;
const LIST_URL = `${API_BASE}admin/users/`;
const DETAIL_URL = (id: string) => `${API_BASE}admin/users/${id}/`;

export default function UserList() {
  const { state: authState } = useAuth();
  const token = authState.tokens?.access;

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  // list state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // pagination/search state
  const [search, setSearch] = useState("");
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  // modal/form state
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const [form, setForm] = useState<any>({
    email: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    is_active: true,
    is_staff: false,
  });

  // normalize API (supports paginated & non-paginated lists)
  const normalize = (data: any): AdminUser[] => {
    if (Array.isArray(data)) {
      setCount(data.length);
      setNextUrl(null);
      setPrevUrl(null);
      return data;
    }
    if (data && Array.isArray((data as Paginated<AdminUser>).results)) {
      const p = data as Paginated<AdminUser>;
      setCount(p.count ?? null);
      setNextUrl(p.next);
      setPrevUrl(p.previous);
      return p.results;
    }
    setCount(null);
    setNextUrl(null);
    setPrevUrl(null);
    return [];
  };

  const buildListRequest = (urlOverride?: string) => {
    const url = urlOverride ?? LIST_URL;
    const config: any = { headers: authHeader };
    if (!urlOverride) {
      config.params = {};
      if (search.trim()) config.params.search = search.trim();
    }
    return axios.get(url, config);
  };

  const loadUsers = async (urlOverride?: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await buildListRequest(urlOverride);
      setUsers(normalize(res.data));
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.status === 401
          ? "Unauthorized. Please sign in again."
          : "Failed to fetch users.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      email: "",
      username: "",
      password: "",
      first_name: "",
      last_name: "",
      is_active: true,
      is_staff: false,
    });
    setShowForm(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditing(u);
    setForm({
      email: u.email,
      username: u.username,
      password: "",
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      is_active: u.is_active,
      is_staff: u.is_staff,
    });
    setShowForm(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const payload: any = {
          email: form.email,
          username: form.username,
          first_name: form.first_name || "",
          last_name: form.last_name || "",
          is_active: !!form.is_active,
          is_staff: !!form.is_staff,
        };
        if (form.password && form.password.trim().length >= 6) {
          payload.password = form.password;
        }
        await axios.patch(DETAIL_URL(editing.id), payload, {
          headers: { ...authHeader, "Content-Type": "application/json" },
        });
      } else {
        const payload: any = {
          email: form.email,
          username: form.username,
          password: form.password,
          first_name: form.first_name || "",
          last_name: form.last_name || "",
          is_active: !!form.is_active,
          is_staff: !!form.is_staff,
        };
        await axios.post(LIST_URL, payload, {
          headers: { ...authHeader, "Content-Type": "application/json" },
        });
      }
      await loadUsers();
      setShowForm(false);
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.detail ||
        (e?.response?.data &&
          Object.entries(e.response.data)
            .map(([k, v]: any) =>
              `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
            )
            .join("\n")) ||
        "Save failed.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (u: AdminUser) => {
    const ok = confirm(`Delete user "${u.username}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await axios.delete(DETAIL_URL(u.id), { headers: authHeader });
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      if (count !== null) setCount((c) => (c !== null ? Math.max(0, c - 1) : c));
    } catch (e) {
      console.error(e);
      alert("Delete failed.");
    }
  };

  return (
    <>
      <Header />
      <section
  className="min-h-screen px-4 py-16 
             bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800 
             text-white"
>
        <div className="max-w-6xl mx-auto">
          {/* Title row */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">👥 प्रयोगकर्ता व्यवस्थापन</h1>
              <p className="text-white/80 mt-1">Create, edit, or remove users.</p>
            </div>
            <div className="flex items-center gap-2">
              <form onSubmit={onSearch} className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                  <Search className="w-4 h-4 text-white/80" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search email / username"
                    className="bg-transparent outline-none text-white placeholder:text-white/60"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30"
                >
                  Search
                </button>
              </form>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-300 text-black font-semibold hover:bg-yellow-200"
              >
                <Plus className="w-4 h-4" /> नयाँ प्रयोगकर्ता
              </button>
            </div>
          </div>
          {/* List */}
          {loading ? (
            <div className="flex items-center gap-2 text-white/90">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading users…
            </div>
          ) : error ? (
            <div className="text-red-200">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-white/80">No users found.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-lg shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-lg flex items-center gap-2">
                        <User2 className="w-5 h-5 text-yellow-200" />
                        {u.username}
                      </div>
                      {u.is_staff && (
                        <span className="inline-flex items-center gap-1 text-xs bg-emerald-400/20 text-emerald-200 px-2 py-1 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> Staff
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white/80 space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {u.email}
                      </div>
                      <div>Status: {u.is_active ? "Active" : "Inactive"}</div>
                      {u.created_at && (
                        <div>
                          Joined: {new Date(u.created_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-yellow-300 text-black font-semibold hover:bg-yellow-200"
                      >
                        <Pencil className="w-4 h-4" /> सम्पादन
                      </button>
                      <button
                        onClick={() => removeUser(u)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400"
                      >
                        <Trash2 className="w-4 h-4" /> हटाउनुहोस्
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {(nextUrl || prevUrl) && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-white/80">
                    {typeof count === "number" ? `Total: ${count}` : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={!prevUrl}
                      onClick={() => prevUrl && loadUsers(prevUrl)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>
                    <button
                      disabled={!nextUrl}
                      onClick={() => nextUrl && loadUsers(nextUrl)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 disabled:opacity-50"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {/* Drawer / Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white/10 border border-white/20 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {editing ? "प्रयोगकर्ता सम्पादन" : "नयाँ प्रयोगकर्ता"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={submit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Email</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white text-gray-900"
                    type="email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Username</label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Password {editing ? "(leave blank to keep)" : "(required)"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white text-gray-900"
                    {...(editing ? {} : { required: true, minLength: 6 })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">First name</label>
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Last name</label>
                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white text-gray-900"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={!!form.is_active}
                    onChange={handleChange}
                  />
                  <label className="text-sm">Active</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_staff"
                    checked={!!form.is_staff}
                    onChange={handleChange}
                  />
                  <label className="text-sm">Staff</label>
                </div>
                <div className="md:col-span-2 mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded bg-white/20 border border-white/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded bg-yellow-300 text-black font-semibold hover:bg-yellow-200"
                  >
                    {saving
                      ? "Saving..."
                      : editing
                      ? "Save changes"
                      : "Create user"}
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
