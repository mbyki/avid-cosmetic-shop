import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [toastMessage, setToastMessage] = useState("");

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setToastMessage("خرید در سبدته 🔥");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const incrementQty = (id) => {
    setCart(cart.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const decrementQty = (id) => {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem.quantity === 1) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item));
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // تابع جدید برای پاک کردن سبد بعد از ثبت سفارش
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, incrementQty, decrementQty, removeFromCart, clearCart, toastMessage }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);