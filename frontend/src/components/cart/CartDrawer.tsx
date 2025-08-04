import React from 'react';
import { X, Minus, Plus, Trash2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import LoadingSpinner from '../LoadingSpinner';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { state, actions } = useCart();

  const handleQuantityChange = async (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      try {
        await actions.updateCartItem(itemId, newQuantity);
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await actions.removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleSaveForLater = async (itemId: string) => {
    try {
      await actions.saveForLater(itemId);
    } catch (error) {
      console.error('Error saving for later:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Drawer */}
        <section className="absolute right-0 top-0 h-full w-full max-w-md">
          <div className="flex h-full flex-col bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <h2 className="text-lg font-semibold text-white">
                कार्ट ({state.cart?.total_items || 0} वस्तुहरू)
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {state.loading.cart ? (
                <LoadingSpinner text="कार्ट लोड हुँदै..." />
              ) : state.cart && state.cart.items.length > 0 ? (
                <div className="space-y-4">
                  {state.cart.items.map((item) => (
                    <div key={item.id} className="bg-white/10 backdrop-blur rounded-lg p-4">
                      <div className="flex gap-3">
                        <img
                          src={item.product.main_image || "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=100&h=100&fit=crop"}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-sm">
                            {item.product.name}
                          </h3>
                          <p className="text-white/70 text-xs">
                            {item.product.category_name} • {item.product.material}
                          </p>
                          
                          {item.preferred_colors && (
                            <p className="text-white/60 text-xs mt-1">
                              रङहरू: {item.preferred_colors}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                disabled={item.quantity <= 1}
                                className="p-1 bg-white/20 rounded hover:bg-white/30 disabled:opacity-50"
                              >
                                <Minus className="w-3 h-3 text-white" />
                              </button>
                              <span className="text-white text-sm w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                className="p-1 bg-white/20 rounded hover:bg-white/30"
                              >
                                <Plus className="w-3 h-3 text-white" />
                              </button>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-yellow-300 font-semibold text-sm">
                                रु {item.total_price}
                              </div>
                              <div className="text-white/60 text-xs">
                                @रु {item.unit_price}/मिटर
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleSaveForLater(item.id)}
                              className="flex items-center gap-1 text-white/60 hover:text-white text-xs"
                            >
                              <Heart className="w-3 h-3" />
                              पछिका लागि सेभ
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                              हटाउनुहोस्
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-white/70 mb-4">कार्ट खाली छ</div>
                  <Link
                    to="/catalog"
                    onClick={onClose}
                    className="text-yellow-300 hover:text-yellow-200 underline"
                  >
                    किनमेल सुरु गर्नुहोस्
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            {state.cart && state.cart.items.length > 0 && (
              <div className="p-4 border-t border-white/20">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white font-semibold">कुल:</span>
                  <span className="text-yellow-300 font-bold text-lg">
                    रु {state.cart.total_amount}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Link
                    to="/cart"
                    onClick={onClose}
                    className="block w-full text-center bg-white/20 hover:bg-white/30 text-white py-3 rounded transition-colors"
                  >
                    कार्ट हेर्नुहोस्
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="block w-full text-center bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 rounded transition-colors"
                  >
                    चेकआउट गर्नुहोस्
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CartDrawer;