import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

interface CartIconProps {
  className?: string;
  showCount?: boolean;
}

const CartIcon: React.FC<CartIconProps> = ({ className = '', showCount = true }) => {
  const { state: cartState } = useCart();
  const { state: authState } = useAuth();

  const itemCount = cartState.cart?.total_items || 0;

  if (!authState.isAuthenticated) {
    return (
      <Link to="/login" className={`relative ${className}`}>
        <ShoppingCart className="w-6 h-6 text-white hover:text-yellow-300 transition-colors" />
      </Link>
    );
  }

  return (
    <Link to="/cart" className={`relative ${className}`}>
      <ShoppingCart className="w-6 h-6 text-white hover:text-yellow-300 transition-colors" />
      
      {showCount && itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      
      {cartState.loading.cart && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-pulse" />
      )}
    </Link>
  );
};

export default CartIcon;