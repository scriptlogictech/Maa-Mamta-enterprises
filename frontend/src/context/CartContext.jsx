import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('campaCola_cart') || '[]'));

  useEffect(() => {
    localStorage.setItem('campaCola_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        toast.success('Quantity updated');
        return prev.map((i) => i._id === product._id ? { ...i, quantity: i.quantity + qty } : i);
      }
      toast.success(`${product.name} added to cart`);
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i._id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) return removeItem(id);
    setItems((prev) => prev.map((i) => i._id === id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const gstAmount = items.reduce((sum, i) => sum + (i.price * i.quantity * (i.gstPercent || 18)) / 100, 0);
  const total = subtotal + gstAmount;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, subtotal, gstAmount, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
