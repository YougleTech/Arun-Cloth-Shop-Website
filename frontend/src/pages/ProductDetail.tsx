import { Heart, Minus, Plus, ShoppingCart, Star, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { apiService } from "../services/api";
import type { ProductDetail as ProductDetailType, ProductReview } from "../types";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { state: cartState, actions: cartActions } = useCart();
  const { state: authState } = useAuth();
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [preferredColors, setPreferredColors] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [productData, reviewsData] = await Promise.all([
          apiService.getProduct(slug),
          apiService.getProductReviews(slug).catch(() => []) // Reviews are optional
        ]);
        
        setProduct(productData);
        setReviews(reviewsData);
      } catch (err) {
        setError("उत्पादनको विवरण लोड गर्न सकिएन। पछि प्रयास गर्नुहोस्।");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug]);

  // Initialize quantity with minimum order quantity when product loads
  useEffect(() => {
    if (product) {
      setQuantity(product.minimum_order_quantity);
    }
  }, [product]);

  // Handle quantity changes
  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    
    const newQuantity = quantity + delta;
    const minQuantity = product.minimum_order_quantity;
    const maxQuantity = product.stock_quantity;
    
    if (newQuantity >= minQuantity && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product || !authState.isAuthenticated) {
      if (!authState.isAuthenticated) {
        alert("कार्टमा थप्न पहिले लगइन गर्नुहोस्।");
      }
      return;
    }

    try {
      await cartActions.addToCart(
        product.id,
        quantity,
        preferredColors,
        specialInstructions
      );
      setAddToCartSuccess(true);
      setTimeout(() => setAddToCartSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("कार्टमा थप्न सकिएन। पछि प्रयास गर्नुहोस्।");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800">
        <Header />
        <LoadingSpinner fullScreen text="उत्पादनको विवरण लोड हुँदै..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-white text-xl mb-4">{error || "उत्पादन फेला परेन"}</div>
          <Link
            to="/catalog"
            className="bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-300 transition-colors"
          >
            सूचीमा फर्किनुहोस्
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const getPriceDisplay = () => {
    const price = parseFloat(product.price_per_meter);
    const wholesalePrice = parseFloat(product.wholesale_price);
    const hasDiscount = wholesalePrice < price;
    
    return {
      currentPrice: wholesalePrice,
      originalPrice: hasDiscount ? price : null,
      discount: hasDiscount ? Math.round(((price - wholesalePrice) / price) * 100) : 0
    };
  };

  const priceInfo = getPriceDisplay();
  const totalPrice = priceInfo.currentPrice * quantity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-white/80 mb-6">
          <Link to="/" className="hover:text-white">होम</Link>
          <span>›</span>
          <Link to="/catalog" className="hover:text-white">सूची</Link>
          <span>›</span>
          <Link to={`/catalog/category/${product.category.id}`} className="hover:text-white">
            {product.category.name}
          </Link>
          <span>›</span>
          <span className="text-yellow-300">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImageIndex]?.image || "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&h=400&fit=crop"}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/20 backdrop-blur-md shadow-md hover:bg-white/30 transition-all"
              >
                <Heart
                  className={`h-6 w-6 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-white hover:text-red-300"
                  }`}
                />
              </button>
              {priceInfo.discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded font-semibold">
                  -{priceInfo.discount}% छुट
                </span>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-yellow-300"
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <img
                      src={image.image}
                      alt={image.alt_text}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="text-white space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-white/80 text-lg">{product.category.name}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= product.average_rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-white/80">
                ({product.reviews_count} समीक्षाहरू)
              </span>
            </div>
            {/* Price - visible only to staff */}
            {authState.user?.is_staff ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-yellow-300">
                    रु {priceInfo.currentPrice}
                  </span>
                  {priceInfo.originalPrice && (
                    <span className="text-xl line-through text-white/60">
                      रु {priceInfo.originalPrice}
                    </span>
                  )}
                  <span className="text-white/80">प्रति मिटर</span>
                </div>
                <div className="text-sm text-white/70">
                  न्यूनतम अर्डर: {product.minimum_order_quantity} मिटर
                </div>
              </div>
            ) : (
              <div className="text-white/70 text-sm italic">
                मूल्य विवरण जान्नको लागि कृपया कोट अनुरोध गर्नुहोस्।
              </div>
            )}

            {/* Product Specifications */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
              <div>
                <span className="text-white/70 text-sm">सामग्री:</span>
                <div className="font-semibold">
                  {product.material === 'cotton' ? 'कपास' :
                   product.material === 'silk' ? 'रेशम' :
                   product.material === 'wool' ? 'ऊन' :
                   product.material === 'polyester' ? 'पलिएस्टर' :
                   product.material === 'khadi' ? 'खादी' :
                   product.material}
                </div>
              </div>
              <div>
                <span className="text-white/70 text-sm">GSM:</span>
                <div className="font-semibold">{product.gsm}</div>
              </div>
              <div>
                <span className="text-white/70 text-sm">चौडाई:</span>
                <div className="font-semibold">{product.width}</div>
              </div>
              <div>
                <span className="text-white/70 text-sm">स्टक:</span>
                <div className="font-semibold">
                  {product.stock_quantity} मिटर
                </div>
              </div>
            </div>

            {/* Colors */}
            <div>
              <span className="text-white/70 text-sm block mb-2">उपलब्ध रङहरू:</span>
              <div className="flex flex-wrap gap-2">
                {product.available_colors_list.map((color, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-sm"
                  >
                    {color.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Colors Input */}
            <div>
              <label className="text-white/70 text-sm block mb-2">
                मनपर्ने रङहरू (वैकल्पिक):
              </label>
              <input
                type="text"
                value={preferredColors}
                onChange={(e) => setPreferredColors(e.target.value)}
                placeholder="जस्तै: नीलो, रातो, हरियो"
                className="w-full p-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/50 focus:border-yellow-300 focus:outline-none"
              />
            </div>

            {/* Special Instructions */}
            <div>
              <label className="text-white/70 text-sm block mb-2">
                विशेष निर्देशन (वैकल्पिक):
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="कुनै विशेष आवश्यकता वा निर्देशन..."
                rows={3}
                className="w-full p-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/50 focus:border-yellow-300 focus:outline-none resize-none"
              />
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div>
                <span className="text-white/70 text-sm block mb-2">मात्रा (मिटरमा):</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= product.minimum_order_quantity}
                    className="p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xl font-semibold w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock_quantity}
                    className="p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {authState.user?.is_staff ? (
              <div className="text-2xl font-bold text-yellow-300">
                कुल मूल्य: रु {totalPrice.toFixed(2)}
              </div>
              ) : (
                <a
                  href={`https://wa.me/447810373066?text=${encodeURIComponent(
                    `नमस्कार ,\n\n` +
                    `म ${authState.user?.full_name || 'ग्राहक'} (${authState.user?.email || 'इमेल छैन'}) हुँ ।\n` +
                    `मेरो फोन नम्बर: ${authState.user?.phone || 'नै दिएको छैन'}\n\n` +
                    `म तलको उत्पादनको मूल्य कोट माग्न चाहन्छु:\n\n` +
                    `उत्पादनको नाम: ${product.name}\n` +
                    `मात्रा: ${quantity} मिटर\n` +
                    `रङ रुचि: ${preferredColors || 'रहेको छैन'}\n` +
                    `विशेष निर्देशन: ${specialInstructions || 'रहेको छैन'}\n\n` +
                    `उत्पादन लिंक: ${window.location.href}\n\n` +
                    `कृपया मलाई मूल्य र उपलब्धता जानकारी पठाउनुहोस्।\nधन्यवाद। `
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-green-500 hover:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                📩 मूल्य कोट माग्नुहोस् WhatsApp बाट
              </a>
            )}


              {/* Success Message */}
              {addToCartSuccess && (
                <div className="p-3 bg-green-500/20 border border-green-400 text-green-300 rounded-lg">
                  ✅ कार्टमा सफलतापूर्वक थपियो!
                </div>
              )}

              {/* Error Messages */}
              {cartState.error.addItem && (
                <div className="p-3 bg-red-500/20 border border-red-400 text-red-300 rounded-lg">
                  {cartState.error.addItem}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.is_in_stock || cartState.loading.addItem}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cartState.loading.addItem ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      थप्दै...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      कार्टमा थप्नुहोस्
                    </>
                  )}
                </button>
                <Link
                  to={`/quick-order?product=${product.slug}&quantity=${quantity}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold py-3 px-6 rounded-lg transition-all text-center"
                >
                  <Truck className="h-5 w-5" />
                  तुरुन्त अर्डर
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden">
          <div className="flex border-b border-white/20">
            {[
              { key: "description", label: "विवरण" },
              { key: "specifications", label: "विशेषताहरू" },
              { key: "care", label: "हेरचाह" },
              { key: "reviews", label: "समीक्षाहरू" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 font-semibold transition-all ${
                  activeTab === tab.key
                    ? "text-yellow-300 border-b-2 border-yellow-300"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 text-white">
            {activeTab === "description" && (
              <div className="space-y-4">
                <p className="text-lg leading-relaxed">{product.description}</p>
                {product.usage && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">प्रयोग:</h3>
                    <p className="text-white/80">
                      {product.usage === 'shirt' ? 'शर्ट' :
                       product.usage === 'trouser' ? 'ट्राउजर' :
                       product.usage === 'dress' ? 'पोशाक' :
                       product.usage === 'saree' ? 'साडी' :
                       product.usage === 'ethnic_wear' ? 'जातीय पोशाक' :
                       product.usage}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">सामग्री:</span>
                    <span className="font-semibold">{product.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">GSM:</span>
                    <span className="font-semibold">{product.gsm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">चौडाई:</span>
                    <span className="font-semibold">{product.width}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">मुख्य रङ:</span>
                    <span className="font-semibold">{product.primary_color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">न्यूनतम अर्डर:</span>
                    <span className="font-semibold">{product.minimum_order_quantity} मिटर</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">स्टक:</span>
                    <span className="font-semibold">{product.stock_quantity} मिटर</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "care" && (
              <div>
                <p className="text-lg leading-relaxed">
                  {product.care_instructions || "हेरचाहका निर्देशनहरू उपलब्ध छैन।"}
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-white/20 pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{review.customer_name}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-white/80">{review.review_text}</p>
                      <div className="text-xs text-white/60 mt-2">
                        {new Date(review.created_at).toLocaleDateString('ne-NP')}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/70">अहिलेसम्म कुनै समीक्षा छैन।</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;