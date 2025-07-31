import { Minus, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import OrderForm from "../components/OrderForm";
import { useCart } from "../contexts/CartContext";

const Cart = () => {
  const { cartItems, updateQuantity, removeItem, totalQuantity, clearCart } = useCart();
  const [showOrderForm, setShowOrderForm] = useState(false);

  const handleOrderSubmit = (orderData: any) => {
    console.log("Cart order submitted:", { ...orderData, cartItems });
    setShowOrderForm(false);
    clearCart();
    window.alert("अर्डर सफलतापूर्वक पेश गरियो!");
  };

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
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-md">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-300 mt-1">{item.gsm} • {item.width}</p>
                        <p className="text-sm text-green-400 mt-1">उपलब्ध</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 rounded border text-white hover:bg-white/10"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 rounded border text-white hover:bg-white/10"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">{item.quantity} मिटर</p>
                        <p className="text-xs text-gray-300">मात्रा</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white/10 border border-white/20 backdrop-blur rounded-lg p-6 shadow space-y-4">
                <div className="flex justify-between">
                  <span>कुल मात्रा:</span>
                  <span className="font-semibold">{totalQuantity} मिटर</span>
                </div>
                <div className="flex justify-between">
                  <span>कुल आइटम:</span>
                  <span className="font-semibold">{cartItems.length} प्रकार</span>
                </div>
                <div className="border-t border-white/20 pt-4 flex justify-between font-bold">
                  <span>अर्डर स्थिति:</span>
                  <span className="text-green-400">तयार</span>
                </div>
                <p className="text-xs text-gray-300">
                  * मूल्य अर्डर पुष्टिपछि निर्धारण गरिनेछ।
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
