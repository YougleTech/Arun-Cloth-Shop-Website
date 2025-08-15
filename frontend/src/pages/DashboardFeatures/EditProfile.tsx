import { ArrowLeft, Save, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const EditProfile = () => {
  const { state: authState, actions } = useAuth();
  const navigate = useNavigate();
  const user = authState.user;

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    display_name: "",
    phone: "",
    company_name: "",
    business_type: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    preferred_language: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
    if (!user) return;
    setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        display_name: user.display_name || "",
        phone: user.phone ? String(user.phone) : "",
        company_name: user.company_name || "",
        business_type: user.business_type || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        preferred_language: user.preferred_language || "",
    });

    if (user.profile_image) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://arun.yougletech.com/";
        setImagePreview(`${backendUrl}${user.profile_image}`);
    }
    }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (profileImageFile) {
        data.append("profile_image", profileImageFile);
      }

      // @ts-ignore: We allow FormData in updateUser manually here
      await actions.updateUser(data);
      setMessage("✅ प्रोफाइल सफलतापूर्वक अपडेट भयो!");
    } catch (error) {
      setMessage("❌ प्रोफाइल अपडेट गर्न असफल भयो।");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <section className="min-h-screen px-4 py-10 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-2xl">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">📝 प्रोफाइल सम्पादन गर्नुहोस्</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-white hover:text-yellow-300 inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> पछाडि जानुहोस्
          </button>
        </div>

        {/* Profile Image Upload */}
        <div className="flex items-center gap-4 mb-6">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-lg"
            />
          )}
          <div>
            <button
              type="button"
              onClick={handleImageUploadClick}
              className="inline-flex items-center px-4 py-2 bg-yellow-300 text-black font-medium rounded-full hover:bg-yellow-200"
            >
              <Upload className="h-4 w-4 mr-2" /> प्रोफाइल फोटो परिवर्तन गर्नुहोस्
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              hidden
            />
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm font-semibold capitalize text-white/80">
                {key.replace(/_/g, " ")}
              </label>
              <input
                type="text"
                name={key}
                value={value}
                onChange={handleChange}
                className="px-4 py-2 rounded bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
          ))}

          <div className="md:col-span-2 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center items-center gap-2 px-6 py-3 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition"
            >
              <Save className="h-5 w-5" />
              {loading ? "सेभ हुँदैछ..." : "परिवर्तनहरू सेभ गर्नुहोस्"}
            </button>
          </div>

          {message && (
            <div className="md:col-span-2 mt-4 text-center text-sm text-white">{message}</div>
          )}
        </form>
      </div>
    </section>
  );
};

export default EditProfile;
