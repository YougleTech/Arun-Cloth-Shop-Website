import React, { createContext, useContext, useState } from "react";

export interface CartItem {
  id: number;
  name: string;
  quantity: number;
  image: string;
  category: string;
  gsm: string;
  width: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (id: number, change: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  totalQuantity: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const notify = (message: string) => {
    window.alert(message);
  };

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        notify(`${item.name} को मात्रा बढाइयो`);
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        notify(`${item.name} कार्टमा थपियो`);
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: number, change: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prev) => {
      const item = prev.find((cartItem) => cartItem.id === id);
      if (item) {
        notify(`${item.name} कार्टबाट हटाइयो`);
      }
      return prev.filter((cartItem) => cartItem.id !== id);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    notify("सबै आइटमहरू कार्टबाट हटाइयो");
  };

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        totalQuantity,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
