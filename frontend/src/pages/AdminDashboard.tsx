import {
    ArrowLeft,
    BarChart2,
    BookOpenCheck,
    FileText,
    Package,
    Settings,
    UserCog,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";

const AdminDashboard = () => {
  const { state: authState } = useAuth();
  const user = authState.user;
  const navigate = useNavigate();

  useEffect(() => {
    if (!authState.isAuthenticated || !user?.is_staff) {
      navigate("/login");
    }
  }, [authState.isAuthenticated, user, navigate]);

  if (!user) return null;

  const adminCards = [
    {
      icon: <UserCog className="w-6 h-6" />,
      title: "प्रयोगकर्ता व्यवस्थापन",
      desc: "प्रयोगकर्ताहरू हेर्नुहोस्, सम्पादन गर्नुहोस् वा हटाउनुहोस्।",
      gradient: "from-pink-500 to-yellow-400",
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "उत्पादनहरू व्यवस्थापन",
      desc: "उत्पादनहरू थप्नुहोस्, अपडेट गर्नुहोस् वा हटाउनुहोस्।",
      gradient: "from-indigo-500 to-purple-500",
      link: "/admin/products", // ✅ click leads to /admin/products
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "अर्डरहरू",
      desc: "सबै अर्डरहरूको स्थिति अनुगमन गर्नुहोस्।",
      gradient: "from-green-400 to-blue-500",
    },
    {
      icon: <BarChart2 className="w-6 h-6" />,
      title: "एनालिटिक्स",
      desc: "बिक्री, प्रयोगकर्ता गतिविधि र ट्रेन्डहरू हेर्नुहोस्।",
      gradient: "from-yellow-400 to-pink-500",
    },
    {
      icon: <BookOpenCheck className="w-6 h-6" />,
      title: "कन्टेन्ट व्यवस्थापन",
      desc: "ब्लग, FAQs, र अन्य सामग्रीहरू सम्पादन गर्नुहोस्।",
      gradient: "from-pink-400 to-indigo-500",
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "सेटिङ्स",
      desc: "साइट सेटिङ्स र अनुमतिहरू समायोजन गर्नुहोस्।",
      gradient: "from-red-400 to-yellow-500",
    },
  ];

  return (
    <>
      <Header />

      <section className="relative min-h-[845px] px-4 py-16 flex flex-col items-center justify-center bg-gradient-to-br from-[#f43f5e] via-[#d946ef] to-[#6366f1] text-white overflow-hidden">
        {/* Background Circles */}
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-pink-300 rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-yellow-300 rounded-full blur-[120px] opacity-20 animate-pulse" />

        {/* Admin Box */}
        <div className="relative z-10 max-w-6xl mx-auto bg-white/10 border border-white/30 backdrop-blur-lg rounded-3xl p-10 shadow-2xl">
          {/* Heading */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-white to-pink-100">
              नमस्ते, एडमिन {user.full_name || user.username}
            </h1>
            <p className="text-white/80 mt-2">
              प्रशासनिक कार्यहरू यहाँबाट व्यवस्थापन गर्नुहोस्।
            </p>
          </div>

          {/* Admin Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {adminCards.map((item, index) => (
              <div
                key={index}
                onClick={() => item.link && navigate(item.link)}
                className="relative group bg-white/10 border border-white/20 backdrop-blur-lg rounded-xl p-6 shadow-lg hover:scale-105 transition-transform cursor-pointer overflow-hidden"
              >
                {/* Gradient Glow Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-tr ${item.gradient} opacity-20 blur-2xl rounded-xl group-hover:opacity-30 transition-all`}
                />
                <div className="relative z-10 text-white space-y-2">
                  <div className="text-yellow-300">{item.icon}</div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-white/80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Back Button */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              प्रयोगकर्ता ड्यासबोर्ड फर्कनुहोस्
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;
