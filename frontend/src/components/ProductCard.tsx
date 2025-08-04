import { Heart, ShoppingCart, Star } from "lucide-react";
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
  showAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = "grid",
  showAddToCart = true
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { actions: cartActions } = useCart();
  const { state: authState } = useAuth();

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authState.isAuthenticated) {
      alert("कार्टमा थप्न पहिले लगइन गर्नुहोस्।");
      return;
    }

    setIsAddingToCart(true);
    try {
      await cartActions.addToCart(product.id, product.minimum_order_quantity);
      alert("कार्टमा सफलतापूर्वक थपियो!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("कार्टमा थप्न सकिएन। पछि प्रयास गर्नुहोस्।");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getPriceDisplay = () => {
    const price = parseFloat(product.price_per_meter);
    const wholesalePrice = parseFloat(product.wholesale_price);
    const hasDiscount = wholesalePrice < price;

    return {
      currentPrice: price,
      originalPrice: hasDiscount ? price : null,
      discount: hasDiscount ? Math.round(((price - wholesalePrice) / price) * 100) : 0
    };
  };

  const priceInfo = getPriceDisplay();

  const whatsappLink = `https://wa.me/447810373066?text=${encodeURIComponent(
    `नमस्कार, मलाई निम्न उत्पादनको मूल्य जानकारी चाहियो:\n\n` +
    `उत्पादन: ${product.name}\n` +
    `मिनिमम अर्डर: ${product.minimum_order_quantity} मिटर\n` +
    `रङहरू: ${product.available_colors_list.join(', ') || 'N/A'}\n\n` +
    `कृपया थप जानकारी दिनुहोस्।`
  )}`;

  const cardContent = (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:shadow-lg transition-all duration-300 text-white ${viewMode === 'list' ? 'flex gap-4' : ''}`}>
      <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
        <img
          src={product.main_image || "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop"}
          alt={product.name}
          className={`object-cover rounded-lg ${viewMode === 'list' ? 'w-full h-32' : 'w-full h-48'}`}
        />

        <button
          onClick={toggleFavorite}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/20 backdrop-blur-md shadow-md hover:bg-white/30 transition-all"
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-white hover:text-red-300"}`} />
        </button>

        {priceInfo.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            -{priceInfo.discount}%
          </span>
        )}

        {product.tags && (
          <span className="absolute bottom-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-semibold">
            {product.tags === 'hot' ? 'हट' :
              product.tags === 'new' ? 'नयाँ' :
                product.tags === 'premium' ? 'प्रिमियम' :
                  product.tags === 'bestseller' ? 'बेस्टसेलर' :
                    product.tags === 'sale' ? 'सेल' : product.tags}
          </span>
        )}

        {!product.is_in_stock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <span className="text-white font-semibold">स्टकमा छैन</span>
          </div>
        )}
      </div>

      <div className={`p-4 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
        <div>
          <h3 className="font-bold text-lg group-hover:text-yellow-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-white/80 mb-2">{product.category_name}</p>

          {product.short_description && (
            <p className="text-sm text-white/70 mb-3 line-clamp-2">
              {product.short_description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 text-xs mb-3">
            <span className="bg-white/20 px-2 py-1 rounded">
              {product.material === 'cotton' ? 'कपास' :
                product.material === 'silk' ? 'रेशम' :
                  product.material === 'wool' ? 'ऊन' :
                    product.material === 'polyester' ? 'पलिएस्टर' :
                      product.material === 'linen' ? 'सन' :
                        product.material === 'khadi' ? 'खादी' :
                          product.material}
            </span>
            <span className="bg-white/20 px-2 py-1 rounded">
              {product.gsm} GSM
            </span>
            <span className="bg-white/20 px-2 py-1 rounded">
              {product.available_colors_list.length} रङहरू
            </span>
          </div>

          <div className="flex items-center mb-3">
            <Star className="text-yellow-400 fill-yellow-400 h-4 w-4" />
            <span className="ml-1 text-sm">4.5</span>
            <span className="ml-2 text-xs text-white/70">(स्कोर)</span>
          </div>
        </div>

        <div className="space-y-3">
          {/* Price section - visible only for staff */}
          {authState.user?.is_staff ? (
            <div className="flex items-center gap-2">
              <span className="text-yellow-300 font-bold text-lg">
                रु {priceInfo.currentPrice}
              </span>
              {priceInfo.originalPrice && (
                <span className="line-through text-white/70 text-sm">
                  रु {priceInfo.originalPrice}
                </span>
              )}
              <span className="text-xs text-white/70">प्रति मिटर</span>
            </div>
          ) : (
            <div className="text-sm text-white/80 italic">मूल्य जानकारीको लागि सम्पर्क गर्नुहोस्।</div>
          )}

          {/* Minimum order */}
          <div className="text-xs text-white/70">
            न्यूनतम अर्डर: {product.minimum_order_quantity} मिटर
          </div>

          {/* Actions */}
          <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-row' : 'flex-col sm:flex-row'}`}>
            <Link
              to={`/catalog/product/${product.slug}`}
              className="flex-1 text-center bg-yellow-400 text-black px-3 py-2 rounded hover:bg-yellow-300 transition-colors text-sm font-semibold"
            >
              विवरण हेर्नुहोस्
            </Link>

            {showAddToCart && product.is_in_stock && authState.user?.is_staff && (
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="flex-1 flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-2 rounded transition-colors text-sm disabled:opacity-50"
              >
                {isAddingToCart ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    कार्टमा थप्नुहोस्
                  </>
                )}
              </button>
            )}

            {/* Price Quote Button */}
            {!authState.user?.is_staff && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors text-sm font-semibold"
              >
                मूल्य जानकारी लिनुहोस्
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="group">
      {cardContent}
    </div>
  );
};

export default ProductCard;
