import {
    ArrowRight,
    BadgeCheck,
    Mail,
    Settings,
    ShieldCheck,
    UserCircle,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header"; // ✅ Import your navbar
import { useAuth } from "../contexts/AuthContext";

const UserDashboard = () => {
  const { state: authState, actions } = useAuth();
  const navigate = useNavigate();
  const user = authState.user;

  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/login");
    }
  }, [authState.isAuthenticated, navigate]);

  if (!user) return null;

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
            <UserCircle className="w-16 h-16 text-yellow-300" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-white to-pink-100">
              नमस्ते, {user.full_name || user.username}
            </h1>
            <p className="text-white/90 text-sm sm:text-base">
              तपाईंको प्रोफाइल जानकारी तल हेर्नुहोस् र आवश्यक परे परिवर्तन गर्नुहोस्।
            </p>
          </div>

          {/* User Info */}
          <div className="grid gap-4 sm:grid-cols-2 text-white/90 text-base mb-10">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" /> {user.email}
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              भूमिका: {user.is_staff ? "स्टाफ" : "ग्राहक"}
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5" />
              इमेल प्रमाणित: {user.email_verified ? "हो" : "होइन"}
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              भाषा: {user.preferred_language?.toUpperCase() || "N/A"}
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
          {/* Orders */}
          <Link
            to="/orders"
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-white shadow-lg hover:scale-105 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">🧾 अर्डरहरू</h3>
            <p className="text-sm text-white/80">तपाईंका अघिल्ला अर्डरहरू हेर्नुहोस्।</p>
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-white shadow-lg hover:scale-105 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">❤️ मनपर्ने</h3>
            <p className="text-sm text-white/80">सेभ गरेका वस्तुहरू हेर्नुहोस्।</p>
          </Link>

          {/* Settings */}
          <Link
            to="/account-settings"
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-white shadow-lg hover:scale-105 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">⚙️ सेटिङ</h3>
            <p className="text-sm text-white/80">प्रोफाइल सेटिङहरू समायोजन गर्नुहोस्।</p>
          </Link>

          {/* Support */}
          <Link
            to="/support"
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-white shadow-lg hover:scale-105 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">💬 सहायता</h3>
            <p className="text-sm text-white/80">हामीलाई सम्पर्क गर्नुहोस्।</p>
          </Link>

          {/* Admin Dashboard */}
          {user.is_staff && (
            <Link
              to="/admin/dashboard"
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-white shadow-lg hover:scale-105 transition-all"
            >
              <h3 className="text-lg font-semibold mb-2">🛠️ एडमिन ड्यासबोर्ड</h3>
              <p className="text-sm text-white/80">एडमिन ड्यासबोर्डमा जानुहोस्।</p>
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={actions.logout}
            className="bg-red-500/80 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-white shadow-lg hover:scale-105 transition-all w-full text-left"
          >
            <h3 className="text-lg font-semibold mb-2">🚪 लग आउट</h3>
            <p className="text-sm text-white/90">सत्र समाप्त गर्नुहोस्।</p>
          </button>
        </div>
      </section>
    </>
  );
};

export default UserDashboard;
