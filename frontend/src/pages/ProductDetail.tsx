import {
    ChevronLeft,
    ChevronRight,
    Heart,
    Minus,
    Phone,
    Plus,
    RotateCcw,
    Share2,
    Shield,
    ShoppingCart,
    Star,
    Truck,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

const productData = {
  1: {
    id: 1,
    name: "प्रिमियम कपास",
    category: "cotton",
    price: 120,
    originalPrice: 150,
    images: [
      "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=600&fit=crop",
    ],
    rating: 4.8,
    reviews: 156,
    colors: ["सेतो", "नीलो", "रातो", "कालो", "हरियो", "पहेंलो"],
    material: "१००% शुद्ध कपास",
    width: "४५ इन्च",
    gsm: "१८० जीएसएम",
    description:
      "यो उच्च गुणस्तरको कपासको कपडा दैनिक पहिरनका लागि उत्तम छ। यसको नरम बनावट र टिकाउपनले यसलाई शर्ट, पोशाक र अन्य वस्त्रहरूका लागि आदर्श बनाउँछ।",
    features: [
      "१००% प्राकृतिक कपास फाइबर",
      "सास फेर्न मिल्ने र आरामदायक",
      "धुन सजिलो र टिकाउ",
      "रङ नझर्ने गुणस्तर",
      "OEKO-TEX Standard 100 प्रमाणित",
    ],
    careInstructions: [
      "मध्यम तापमानमा धुनुहोस्",
      "ब्लीच प्रयोग नगर्नुहोस्",
      "कम तापमा इस्त्री गर्नुहोस्",
      "ड्राई क्लिनिङ सिफारिस गरिएको",
    ],
    availability: "स्टकमा उपलब्ध",
    minimumOrder: "१० मिटर",
    shippingTime: "२-३ दिन",
  },
};

const ProductDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const product = productData[Number(id) as keyof typeof productData];
  if (!product) return <div className="text-center mt-20 text-white">उत्पादन फेला परेन</div>;

  const nextImage = () =>
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  const prevImage = () =>
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );

  const totalPrice = quantity * product.price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6 text-white/80">
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/" className="hover:text-yellow-300">मुख्य पृष्ठ</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-yellow-300">कपडा सूची</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-12 text-white">
        {/* Image Gallery */}
        <div>
          <div className="relative rounded-lg overflow-hidden bg-white/10 backdrop-blur-md border border-white/20">
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full"
            >
              <ChevronRight />
            </button>
            {product.originalPrice > product.price && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}% छुट
              </span>
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`overflow-hidden rounded-lg ${
                  currentImageIndex === idx
                    ? "ring-2 ring-yellow-300 scale-105"
                    : "hover:scale-105"
                }`}
              >
                <img src={img} className="w-full h-20 object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex gap-2">
              <button
                className={`p-2 rounded-full bg-white/20 hover:bg-white/30 ${
                  isFavorite ? "text-red-500" : "text-white"
                }`}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart />
              </button>
              <button className="p-2 rounded-full bg-white/20 hover:bg-white/30">
                <Share2 />
              </button>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <Star className="text-yellow-400 fill-yellow-400" />
            <span>{product.rating}</span>
            <span className="text-sm text-white/70">
              ({product.reviews} समीक्षाहरू)
            </span>
            <span className="ml-4 bg-green-500/20 text-green-300 px-2 py-1 rounded text-sm">
              {product.availability}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-yellow-300">
              रु {product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="line-through text-white/70">
                रु {product.originalPrice}
              </span>
            )}
            <span className="text-sm text-white/70">प्रति मिटर</span>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg text-sm">
            <div>सामग्री: <strong>{product.material}</strong></div>
            <div>चौडाई: <strong>{product.width}</strong></div>
            <div>जीएसएम: <strong>{product.gsm}</strong></div>
            <div>न्यूनतम अर्डर: <strong>{product.minimumOrder}</strong></div>
          </div>

          {/* Colors */}
          <div>
            <p className="font-medium mb-2">रङ छान्नुहोस्:</p>
            <div className="flex gap-2 flex-wrap">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-1 rounded border ${
                    selectedColor === color
                      ? "bg-yellow-300 text-black"
                      : "bg-white/10 backdrop-blur-md hover:bg-white/20"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="font-medium mb-2">परिमाण (मिटरमा):</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3"
                >
                  <Minus />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-20 text-center bg-transparent outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3"
                >
                  <Plus />
                </button>
              </div>
              <span className="text-xl font-bold text-yellow-300">
                कुल: रु {totalPrice}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 bg-yellow-300 text-black px-4 py-3 rounded hover:bg-yellow-200 flex items-center justify-center gap-2">
              <ShoppingCart /> कार्टमा थप्नुहोस्
            </button>
            <button className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded hover:bg-white/20">
              अब अर्डर गर्नुहोस्
            </button>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4 text-sm mt-4">
            <div className="flex items-center gap-2">
              <Truck className="text-yellow-300" /> निःशुल्क डेलिभरी
            </div>
            <div className="flex items-center gap-2">
              <Shield className="text-yellow-300" /> गुणस्तर ग्यारेन्टी
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="text-yellow-300" /> ७ दिन फिर्ता
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg flex items-center gap-3">
            <Phone className="text-yellow-300" />
            <div>
              <p className="font-medium">थोक अर्डरका लागि सम्पर्क गर्नुहोस्:</p>
              <p className="text-yellow-300 font-bold">+९७७-९८०१२३४५६७</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-4 mt-12 text-white">
        <div className="flex border-b border-white/20">
          {["description", "features", "care", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center py-2 ${
                activeTab === tab
                  ? "border-b-2 border-yellow-300 font-bold"
                  : "text-white/70"
              }`}
            >
              {tab === "description"
                ? "विवरण"
                : tab === "features"
                ? "विशेषताहरू"
                : tab === "care"
                ? "हेरचाह"
                : "समीक्षाहरू"}
            </button>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-lg mt-4">
          {activeTab === "description" && <p>{product.description}</p>}
          {activeTab === "features" && (
            <ul className="space-y-2">
              {product.features.map((f, idx) => (
                <li key={idx}>• {f}</li>
              ))}
            </ul>
          )}
          {activeTab === "care" && (
            <ul className="space-y-2">
              {product.careInstructions.map((c, idx) => (
                <li key={idx}>• {c}</li>
              ))}
            </ul>
          )}
          {activeTab === "reviews" && (
            <p className="text-white/70">ग्राहक समीक्षाहरू यहाँ आउनेछन्...</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
