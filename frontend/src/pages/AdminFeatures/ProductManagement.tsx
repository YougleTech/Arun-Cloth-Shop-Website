import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const ProductManagement = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <section
  className="min-h-[93vh] px-4 py-16 
             bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800 
             text-white flex flex-col items-center justify-center"
>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-10 shadow-2xl max-w-3xl w-full text-center space-y-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-white to-pink-100">
            उत्पादन व्यवस्थापन पृष्ठ
          </h1>
          <p className="text-white/80">
            यहाँबाट तपाईं उत्पादन र श्रेणीहरू व्यवस्थापन गर्न सक्नुहुन्छ।
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={() => navigate("/admin/products/manage")}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/30 font-semibold transition"
            >
              🧵 Manage Products
            </button>
            <button
              onClick={() => navigate("/admin/categories/manage")}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/30 font-semibold transition"
            >
              🗂️ Manage Categories
            </button>
          </div>

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="inline-flex items-center gap-2 mt-6 px-5 py-2 text-sm border border-white/30 bg-white/10 text-white hover:bg-white/20 rounded-full transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin ड्यासबोर्ड फर्कनुहोस्
          </button>
        </div>
      </section>
    </>
  );
};

export default ProductManagement;
