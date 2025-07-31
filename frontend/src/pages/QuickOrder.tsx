import { ArrowLeft, Clock, Phone, Zap } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import OrderForm from "../components/OrderForm";

const categoryData = {
  cotton: {
    name: "कपासका कपडाहरू",
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&h=400&fit=crop",
    description: "उत्कृष्ट गुणस्तरको कपास - उपलब्ध छ",
    benefits: ["१००% शुद्ध कपास", "धुन मिल्ने", "श्वासप्रश्वास मिल्ने"]
  },
  // Add the rest categories here...
};

const QuickOrder = () => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category") || "cotton";
  const category = categoryData[categoryId as keyof typeof categoryData];

  const handleOrderSubmit = (orderData: any) => {
    console.log("Quick order submitted:", { ...orderData, categoryId });
    window.alert("शीघ्र अर्डर सफलतापूर्वक पेश गरियो!");
  };

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold mb-4">श्रेणी फेला परेन</h1>
        <Link
          to="/catalog"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
        >
          कपडा सूचीमा फर्कनुहोस्
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20">
      <Header />

      {/* Hero */}
      <section className="py-16 bg-gradient-to-r from-pink-500 to-purple-600 text-white relative">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center container mx-auto px-4">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Zap className="h-10 w-10" />
            <h1 className="text-4xl font-bold">शीघ्र अर्डर</h1>
          </div>
          <p className="text-lg mb-6">{category.name} - छिटो र सजिलो अर्डर प्रक्रिया</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 border border-white px-4 py-2 rounded text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            फिर्ता जानुहोस्
          </Link>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Info Left Side */}
        <div className="space-y-6">
          {/* Category Card */}
          <div className="rounded-lg overflow-hidden shadow bg-white/20 backdrop-blur-md border border-white/10">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <span className="inline-block text-sm bg-purple-600 text-white px-3 py-1 rounded mb-2">
                शीघ्र अर्डर उपलब्ध
              </span>
              <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
              <p className="text-gray-200 mb-3">{category.description}</p>
              <h3 className="font-semibold mb-1">मुख्य विशेषताहरू:</h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-white">
                {category.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Benefits Card */}
          <div className="rounded-lg p-6 bg-white/20 backdrop-blur-md border border-white/10 text-white space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              शीघ्र अर्डरका फाइदाहरू
            </h3>

            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="font-medium">तत्काल प्रोसेसिङ</p>
                <p className="text-sm">२४ घण्टा भित्र सम्पर्क</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="font-medium">सिधा सम्पर्क</p>
                <p className="text-sm">व्यक्तिगत सेवा अधिकारी</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-yellow-400" />
              <div>
                <p className="font-medium">निःशुल्क नमूना</p>
                <p className="text-sm">निर्णय गर्न नमूना डेलिभरी</p>
              </div>
            </div>
          </div>

          {/* Contact Box */}
          <div className="rounded-lg p-6 bg-white/20 backdrop-blur-md border border-white/10 text-white text-center space-y-2">
            <h3 className="font-bold">तुरुन्तै सम्पर्क चाहिन्छ?</h3>
            <p className="text-sm">व्हाट्सएप वा फोनमा सिधै कुरा गर्नुहोस्</p>
            <a
              href="tel:+9779812345678"
              className="inline-block border border-white px-4 py-2 rounded hover:bg-white/20"
            >
              +९७७ ९८१२३४५६७८ मा कल गर्नुहोस्
            </a>
          </div>
        </div>

        {/* Form Right Side */}
        <div>
          <OrderForm
            variant="category"
            productName={category.name}
            onSubmit={handleOrderSubmit}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuickOrder;
