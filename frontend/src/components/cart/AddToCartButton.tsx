import { Loader2, Minus, Plus, ShoppingCart } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import type { Product } from '../../types';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  showQuantitySelector?: boolean;
  initialQuantity?: number;
  onAddSuccess?: () => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  className = '',
  showQuantitySelector = true,
  initialQuantity,
  onAddSuccess
}) => {
  const { state: cartState, actions } = useCart();
  const { state: authState } = useAuth();
  const [quantity, setQuantity] = useState(initialQuantity || product.minimum_order_quantity);
  const [preferredColors, setPreferredColors] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showDetailsForm, setShowDetailsForm] = useState(false);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= product.minimum_order_quantity && newQuantity <= product.stock_quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!authState.isAuthenticated) {
      // Redirect to login or show login modal
      return;
    }

    try {
      await actions.addToCart(product.id, quantity, preferredColors, specialInstructions);
      
      if (onAddSuccess) {
        onAddSuccess();
      }
      
      // Reset form
      setPreferredColors('');
      setSpecialInstructions('');
      setShowDetailsForm(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (!product.is_in_stock) {
    return (
      <button
        disabled
        className={`flex items-center justify-center gap-2 bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed ${className}`}
      >
        स्टकमा छैन
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {showQuantitySelector && (
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">मात्रा:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= product.minimum_order_quantity}
              className="p-1 bg-white/20 rounded hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <span className="text-white font-semibold w-12 text-center">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= product.stock_quantity}
              className="p-1 bg-white/20 rounded hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
          <span className="text-white/70 text-sm">मिटर</span>
        </div>
      )}

      {showDetailsForm && (
        <div className="space-y-3 p-4 bg-white/10 backdrop-blur rounded-lg">
          <div>
            <label className="block text-white/80 text-sm mb-1">
              पसन्दीदा रङहरू (वैकल्पिक):
            </label>
            <input
              type="text"
              value={preferredColors}
              onChange={(e) => setPreferredColors(e.target.value)}
              placeholder="नीलो, रातो, सेतो..."
              className="w-full bg-white/20 border border-white/30 rounded px-3 py-2 text-white placeholder:text-white/50"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">
              विशेष निर्देशन (वैकल्पिक):
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="कुनै विशेष आवश्यकताहरू..."
              rows={2}
              className="w-full bg-white/20 border border-white/30 rounded px-3 py-2 text-white placeholder:text-white/50 resize-none"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {!showDetailsForm && (
          <button
            onClick={() => setShowDetailsForm(true)}
            className="text-yellow-300 hover:text-yellow-200 text-sm underline"
          >
            विकल्पहरू थप्नुहोस्
          </button>
        )}

        <button
          onClick={handleAddToCart}
          disabled={cartState.loading.addItem || !authState.isAuthenticated}
          className={`flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/50 text-black font-semibold px-6 py-3 rounded transition-colors ${className}`}
        >
          {cartState.loading.addItem ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              थप्दै...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              कार्टमा थप्नुहोस्
            </>
          )}
        </button>
      </div>

      {cartState.error.addItem && (
        <div className="text-red-400 text-sm">{cartState.error.addItem}</div>
      )}

      <div className="text-white/70 text-xs">
        न्यूनतम अर्डर: {product.minimum_order_quantity} मिटर • 
        स्टक: {product.stock_quantity} मिटर
      </div>
    </div>
  );
};

export default AddToCartButton;