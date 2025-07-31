import { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import OrderForm from "../components/OrderForm";

const bulkCategories = [
  {
    id: "cotton",
    name: "कपासका कपडाहरू",
    minQuantity: "५०० मिटर+",
    description: "होटल, अस्पताल र ठूला व्यवसायका लागि उत्तम",
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&h=200&fit=crop",
    features: ["१००% शुद्ध कपास", "धुन मिल्ने", "टिकाउ"]
  },
  {
    id: "polyester",
    name: "पलिएस्टर मिश्रण",
    minQuantity: "१००० मिटर+",
    description: "स्कूल र कार्यालयका लागि सबैभन्दा राम्रो विकल्प",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop",
    features: ["कम झुर्रुक्का", "चाँडो सुक्ने", "सस्तो"]
  },
  {
    id: "denim",
    name: "डेनिम र क्यानभास",
    minQuantity: "२०० मिटर+",
    description: "ज्याकेट र जिन्स उत्पादनका लागि",
    image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=300&h=200&fit=crop",
    features: ["हेभी ड्यूटी", "फ्यासन रेडी", "नयाँ डिजाइन"]
  }
];

const BulkOrder = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleOrderSubmit = (orderData: any) => {
    console.log("Bulk order submitted:", { ...orderData, category: selectedCategory });
    window.alert("✅ अर्डर सफलतापूर्वक पेश गरियो!\nहामी चाँडै तपाईंलाई सम्पर्क गर्नेछौं।");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fce7f3] via-[#e9d5ff] to-[#dbeafe] text-gray-800">
      <Header />

      {/* Hero */}
      <section className="text-center py-16 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">बल्क अर्डर</h1>
        <p className="text-lg opacity-90 mb-4">ठूलो मात्रामा कपडा खरिदका लागि विशेष मूल्य र सेवा</p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="bg-white/20 px-3 py-1 rounded">न्यूनतम ५०० मिटर</span>
          <span className="bg-white/20 px-3 py-1 rounded">३०% छुट</span>
          <span className="bg-white/20 px-3 py-1 rounded">फ्री डेलिभरी</span>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">बल्क अर्डरका लागि कपडाहरू</h2>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bulkCategories.map((category) => (
            <div
              key={category.id}
              className={`rounded-xl border p-4 shadow transition hover:shadow-lg cursor-pointer ${
                selectedCategory === category.id ? "ring-2 ring-purple-600 bg-purple-50" : "bg-white"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h3 className="text-xl font-bold">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{category.description}</p>
              <p className="text-sm text-purple-600 font-medium">न्यूनतम: {category.minQuantity}</p>
              <div className="mt-2 flex flex-wrap gap-1 text-xs">
                {category.features.map((f, i) => (
                  <span key={i} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Order Form */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">बल्क अर्डर फारम</h2>
          <OrderForm
            variant="bulk"
            productName={
              selectedCategory
                ? bulkCategories.find((c) => c.id === selectedCategory)?.name
                : "बल्क अर्डर"
            }
            onSubmit={handleOrderSubmit}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BulkOrder;
