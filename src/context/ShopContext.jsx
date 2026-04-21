import { createContext, useContext, useMemo, useState } from 'react';
import { products } from '../data/products';

export { products };

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
const [cartItems, setCartItems] = useState(() => {
  const saved = localStorage.getItem('cart_items');
  return saved ? JSON.parse(saved) : [];
});
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

const addToCart = (productData, quantity = 1, selectedColor, selectedSize, productVariantId) => {
  const product = { ...productData, quantity, selectedColor, selectedSize, productVariantId };
  
  setCartItems((prev) => {
    const existing = prev.find(
      (item) => item.productVariantId === product.productVariantId
    );

    let newCart;
    if (existing) {
      newCart = prev.map((item) =>
        item.productVariantId === product.productVariantId 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...prev, product];
    }

    localStorage.setItem('cart_items', JSON.stringify(newCart));
    return newCart;
  });
};

  const updateCartItemQuantity = (productVariantId, delta) => {
    setCartItems((prev) => {
      const newCart = prev.map((item) => 
        item.productVariantId === productVariantId 
          ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
          : item
      );
      localStorage.setItem('cart_items', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (productVariantId) => {
    setCartItems((prev) => {
      const newCart = prev.filter((item) => item.productVariantId !== productVariantId);
      localStorage.setItem('cart_items', JSON.stringify(newCart));
      return newCart;
    });
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  const addRecentlyViewed = (productId) => {
    setRecentlyViewed((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 6));
  };

  const wishlistProducts = useMemo(() => products.filter((item) => wishlist.includes(item.id)), [wishlist]);
  const recentlyViewedProducts = useMemo(
    () => recentlyViewed.map((id) => products.find((item) => item.id === id)).filter(Boolean),
    [recentlyViewed],
  );
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  return (
    <ShopContext.Provider
      value={{
        cartItems,
        wishlist,
        wishlistProducts,
        recentlyViewedProducts,
        cartTotal,
        searchKeyword,
        setSearchKeyword,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        toggleWishlist,
        addRecentlyViewed,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
