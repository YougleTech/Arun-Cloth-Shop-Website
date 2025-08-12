import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2 as Building,
  Mail,
  Map,
  MapPin,
  Phone,
  Settings,
  ShieldCheck,
  User,
  UserCircle
} from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";

const UserDashboard = () => {
  const { state: authState, actions } = useAuth();
  const navigate = useNavigate();
  const user = authState.user;

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://arun.yougletech.com/";

  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/login");
    }
  }, [authState.isAuthenticated, navigate]);

  if (!user) return null;

  const profileImageUrl = user.profile_image
    ? `${backendUrl}${user.profile_image}`
    : "https://via.placeholder.com/100x100.png?text=User";

  return (
    <>
      <Header />

      <section className="relative min-h-[600px] px-4 py-16 flex flex-col items-center justify-center bg-gradient-to-br from-[#f43f5e] via-[#d946ef] to-[#6366f1] text-white overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-yellow-400 rounded-full blur-[120px] opacity-30 animate-pulse" />
        <div className="absolute bottom-[-120px] right-[-100px] w-[300px] h-[300px] bg-blue-500 rounded-full blur-[120px] opacity-20 animate-pulse" />

        {/* Profile Box */}
        <div className="relative z-10 w-full max-w-5xl px-8 py-12 rounded-3xl border border-white/30 bg-white/10 backdrop-blur-lg shadow-2xl mb-10">
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            {user.profile_image ? (
              <img
                src={profileImageUrl}
                alt={user.full_name || user.display_name || "प्रोफाइल फोटो"}
                className="w-40 h-40 rounded-full object-cover border-2 border-yellow-300"
              />
            ) : (
              <UserCircle className="w-40 h-40 text-yellow-300 drop-shadow-md" />
            )}

            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-white to-pink-100">
              नमस्ते, {user.full_name || user.username}
            </h1>
            <p className="text-white/90 text-sm sm:text-base">
              तपाईंको प्रोफाइल जानकारी तल हेर्नुहोस् र आवश्यक परे परिवर्तन गर्नुहोस्।
            </p>
          </div>

{/* User Info */}
<div className="grid gap-4 sm:grid-cols-2 text-white/90 text-base mb-10">

  {/* Email */}
  <div className="flex items-center gap-2">
    <Mail className="w-5 h-5" />
    {user.email}
  </div>

  {/* Role */}
  <div className="flex items-center gap-2">
    <ShieldCheck className="w-5 h-5" />
    भूमिका: {user.is_staff ? "स्टाफ" : "ग्राहक"}
  </div>

  {/* First Name */}
  <div className="flex items-center gap-2">
    <User className="w-5 h-5" />
    पहिलो नाम: {user.first_name || "N/A"}
  </div>

  {/* Last Name */}
  <div className="flex items-center gap-2">
    <User className="w-5 h-5" />
    थर: {user.last_name || "N/A"}
  </div>

  {/* Display Name */}
  <div className="flex items-center gap-2">
    <User className="w-5 h-5" />
    प्रदर्शन नाम: {user.display_name || "N/A"}
  </div>

  {/* Phone */}
  <div className="flex items-center gap-2">
    <Phone className="w-5 h-5" />
    फोन: {user.phone || "N/A"}
  </div>

  {/* Company Name */}
  <div className="flex items-center gap-2">
    <Building className="w-5 h-5" />
    कम्पनी: {user.company_name || "N/A"}
  </div>

  {/* Business Type */}
  <div className="flex items-center gap-2">
    <Briefcase className="w-5 h-5" />
    व्यवसाय प्रकार: {user.business_type || "N/A"}
  </div>

  {/* Address */}
  <div className="flex items-center gap-2">
    <MapPin className="w-5 h-5" />
    ठेगाना: {user.address || "N/A"}
  </div>

  {/* City */}
  <div className="flex items-center gap-2">
    <Map className="w-5 h-5" />
    शहर: {user.city || "N/A"}
  </div>

  {/* State */}
  <div className="flex items-center gap-2">
    <Map className="w-5 h-5" />
    प्रदेश: {user.state || "N/A"}
  </div>

  {/* Pincode */}
  <div className="flex items-center gap-2">
    <Map className="w-5 h-5" />
    पिनकोड: {user.pincode || "N/A"}
  </div>

  {/* Preferred Language */}
  <div className="flex items-center gap-2">
    <Settings className="w-5 h-5" />
    भाषा: {user.preferred_language?.toUpperCase() || "N/A"}
  </div>

  {/* Email Verified */}
  <div className="flex items-center gap-2">
    <BadgeCheck className="w-5 h-5" />
    इमेल प्रमाणित: {user.email_verified ? "हो" : "होइन"}
  </div>

</div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-pink-600 hover:bg-pink-100 text-base font-semibold shadow-lg"
          >
            प्रोफाइल सम्पादन गर्नुहोस् <Settings className="h-4 w-4" />
          </Link>
          <Link
            to="/change-password"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 bg-white/20 text-white hover:bg-white/30 backdrop-blur shadow-lg text-base font-semibold"
          >
            पासवर्ड परिवर्तन गर्नुहोस् <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

        {/* Action Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl px-4 pb-16">
        {/* Define card config */}
        {[
            {
            to: "/orders",
            title: "🧾 अर्डरहरू",
            desc: "तपाईंका अघिल्ला अर्डरहरू हेर्नुहोस्।",
            gradient: "from-pink-500 to-yellow-400",
            },
            {
            to: "/wishlist",
            title: "❤️ मनपर्ने",
            desc: "सेभ गरेका वस्तुहरू हेर्नुहोस्।",
            gradient: "from-purple-500 to-indigo-500",
            },
            {
            to: "/account-settings",
            title: "⚙️ सेटिङ",
            desc: "प्रोफाइल सेटिङहरू समायोजन गर्नुहोस्।",
            gradient: "from-green-400 to-blue-500",
            },
            {
            to: "/support",
            title: "💬 सहायता",
            desc: "हामीलाई सम्पर्क गर्नुहोस्।",
            gradient: "from-yellow-400 to-pink-500",
            },
            ...(user.is_staff
            ? [
                {
                    to: "/admin/dashboard",
                    title: "🛠️ एडमिन ड्यासबोर्ड",
                    desc: "एडमिन ड्यासबोर्डमा जानुहोस्।",
                    gradient: "from-red-400 to-purple-500",
                },
                ]
            : []),
        ].map((item, idx) => (
            <Link
            to={item.to}
            key={idx}
            className="relative group bg-white/10 border border-white/20 backdrop-blur-lg rounded-xl p-6 shadow-lg hover:scale-105 transition-transform overflow-hidden"
            >
            {/* Gradient background glow */}
            <div
                className={`absolute inset-0 bg-gradient-to-tr ${item.gradient} opacity-20 blur-2xl rounded-xl group-hover:opacity-30 transition-all`}
            />
            <div className="relative z-10">
                <h3 className="text-lg font-semibold mb-1 text-white">{item.title}</h3>
                <p className="text-sm text-white/80">{item.desc}</p>
            </div>
            </Link>
        ))}

        {/* Logout Button */}
        <button
            onClick={actions.logout}
            className="relative group bg-red-500/80 border border-white/20 backdrop-blur-lg rounded-xl p-6 text-white shadow-lg hover:scale-105 transition-transform text-left w-full"
        >
            <div className="absolute inset-0 bg-red-500 opacity-20 blur-2xl rounded-xl group-hover:opacity-30 transition-all" />
            <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-1">🚪 लग आउट</h3>
            <p className="text-sm text-white/90">सत्र समाप्त गर्नुहोस्।</p>
            </div>
        </button>
        </div>
      </section>
    </>
  );
};

export default UserDashboard;
