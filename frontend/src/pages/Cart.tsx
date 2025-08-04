import { Heart, Minus, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import OrderForm from "../components/OrderForm";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

const Cart = () => {
  const { state, actions } = useCart();
  const { state: authState } = useAuth();
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Load cart when component mounts
  useEffect(() => {
    if (authState.isAuthenticated) {
      actions.loadCart();
      actions.loadCartSummary();
    }
  }, [authState.isAuthenticated]);

  const handleOrderSubmit = (orderData: any) => {
    console.log("Cart order submitted:", { ...orderData, cart: state.cart });
    setShowOrderForm(false);
    actions.clearCart();
    window.alert("अर्डर सफलतापूर्वक पेश गरियो!");
  };

  // Show loading state
  if (state.loading.cart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">कार्ट लोड हुँदैछ...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if user is authenticated
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <Package className="h-24 w-24 mx-auto text-gray-400 mb-6" />
          <h2 className="text-3xl font-bold mb-4">कार्ट हेर्नका लागि लगइन गर्नुहोस्</h2>
          <p className="text-gray-500 mb-8">तपाईंको कार्ट हेर्न र अर्डर गर्न पहिले लगइन गर्नुहोस्</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-yellow-400 text-black rounded-full font-semibold hover:scale-105 transition"
          >
            होम पेजमा जानुहोस्
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // ✅ Fix: Prevent cart from rendering before it’s ready
  if (authState.isAuthenticated && !state.cart && !state.loading.cart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">कार्ट तयार पारिँदैछ...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const cartItems = state.cart?.items || [];
  const totalItems = state.cart?.total_items || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-pink-500 to-purple-600 text-white relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShoppingCart className="h-12 w-12" />
            <h1 className="text-5xl font-bold">तपाईंको कार्ट</h1>
          </div>
          <p className="text-xl opacity-90">छानिएका कपडाहरू र अर्डर प्रक्रिया</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-24 w-24 mx-auto text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold mb-4">तपाईंको कार्ट खाली छ</h2>
            <p className="text-gray-500 mb-8">कपडाहरू ब्राउज गरेर मनपर्ने थप्नुहोस्</p>
            <Link
              to="/catalog"
              className="inline-block px-6 py-3 bg-yellow-400 text-black rounded-full font-semibold hover:scale-105 transition"
            >
              कपडा सूची हेर्नुहोस्
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/10 border border-white/20 backdrop-blur rounded-lg p-6 shadow">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <ShoppingCart className="h-5 w-5" />
                  कार्ट आइटमहरू ({cartItems.length})
                </h2>
                
                {/* Error Messages */}
                {state.error.cart && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {state.error.cart}
                  </div>
                )}
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-md">
                      <img
                        src={item.product.main_image || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-gray-300 mt-1">
                          {item.product.material} • {item.product.gsm} GSM • {item.product.primary_color}
                        </p>
                        <p className="text-sm text-gray-300 mt-1">
                          {item.product.category_name}
                        </p>
                        <p className="text-sm text-green-400 mt-1">
                          स्टकमा: {item.product.stock_quantity} मिटर
                        </p>
                        {item.preferred_colors && (
                          <p className="text-xs text-blue-300 mt-1">
                            मनपर्ने रंग: {item.preferred_colors}
                          </p>
                        )}
                        {item.special_instructions && (
                          <p className="text-xs text-yellow-300 mt-1">
                            विशेष निर्देशन: {item.special_instructions}
                          </p>
                        )}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => actions.updateCartItem(item.id, item.quantity - 1)}
                          disabled={state.loading.updateItem || item.quantity <= 1}
                          className="p-1 rounded border text-white hover:bg-white/10 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => actions.updateCartItem(item.id, item.quantity + 1)}
                          disabled={state.loading.updateItem}
                          className="p-1 rounded border text-white hover:bg-white/10 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Price and Actions */}
                      <div className="text-center min-w-[80px]">
                        <p className="font-bold">{item.quantity} मिटर</p>
                        <p className="text-xs text-gray-300">मात्रा</p>
                        <p className="text-sm text-green-400 font-medium">
                          रु. {item.total_price}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => actions.saveForLater(item.id)}
                          disabled={state.loading.removeItem}
                          className="p-1 text-blue-400 hover:text-blue-600 disabled:opacity-50"
                          title="पछिका लागि सेभ गर्नुहोस्"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => actions.removeFromCart(item.id)}
                          disabled={state.loading.removeItem}
                          className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white/10 border border-white/20 backdrop-blur rounded-lg p-6 shadow space-y-4">
                <div className="flex justify-between">
                  <span>कुल आइटम:</span>
                  <span className="font-semibold">{totalItems} मिटर</span>
                </div>
                <div className="flex justify-between">
                  <span>कुल प्रकार:</span>
                  <span className="font-semibold">{cartItems.length} प्रकार</span>
                </div>
                {state.cart && (
                  <>
                    <div className="flex justify-between">
                      <span>कुल रकम:</span>
                      <span className="font-semibold text-green-400">रु. {state.cart.total_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>होलसेल रकम:</span>
                      <span className="font-semibold text-blue-400">रु. {state.cart.total_wholesale_amount}</span>
                    </div>
                  </>
                )}
                <div className="border-t border-white/20 pt-4 flex justify-between font-bold">
                  <span>अर्डर स्थिति:</span>
                  <span className="text-green-400">तयार</span>
                </div>
                <p className="text-xs text-gray-300">
                  * होलसेल मूल्य न्यूनतम अर्डर मात्रा पुगेपछि लागू हुन्छ।
                </p>
              </div>
            </div>

            {/* Order Form Panel */}
            <div className="space-y-6">
              {!showOrderForm ? (
                <div className="bg-white/10 border border-white/20 backdrop-blur rounded-lg p-6 shadow space-y-4 text-center">
                  <h3 className="text-xl font-bold">अर्डर पूरा गर्नुहोस्</h3>
                  <p className="text-gray-300">तपाईंको कार्ट तयार छ, अर्डर विवरण पेश गर्नुहोस्।</p>
                  <button
                    onClick={() => setShowOrderForm(true)}
                    className="w-full px-4 py-3 bg-yellow-400 text-black rounded font-semibold hover:scale-105 transition"
                  >
                    अर्डर फारम खोल्नुहोस्
                  </button>
                  <Link
                    to="/catalog"
                    className="w-full block text-center px-4 py-3 border border-white/30 text-white rounded hover:bg-white/10 transition"
                  >
                    थप कपडा थप्नुहोस्
                  </Link>
                  <button
                    onClick={() => actions.clearCart()}
                    className="w-full px-4 py-3 border border-red-400 text-red-400 rounded hover:bg-red-400/10 transition"
                  >
                    कार्ट खाली गर्नुहोस्
                  </button>
                </div>
              ) : (
                <OrderForm
                  variant="cart"
                  productName={`${cartItems.length} प्रकारका कपडाहरू`}
                  onSubmit={handleOrderSubmit}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
