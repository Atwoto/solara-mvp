// src/components/CartSidebar.tsx
'use client';

import { useCart } from '@/context/CartContext';
import NextImage from 'next/image';
import { XMarkIcon, ShoppingBagIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const CartSidebar = () => {
  const { 
    cartItems, 
    removeFromCart, 
    clearCart, 
    updateItemQuantity, 
    getCartTotal,
    isCartOpen,
    closeCart
  } = useCart(); 
  
  const subtotal = getCartTotal();

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  // *** FIX #1: Removed the 'transition' properties from the variants. ***
  const sidebarVariants = {
    hidden: { x: '100%' },
    visible: { x: '0%' },
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        // Backdrop
        <motion.div
          key="cart-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-[990] bg-black bg-opacity-60 backdrop-blur-sm"
          onClick={closeCart} 
        >
          {/* Sidebar Panel */}
          <motion.div
            key="cart-sidebar"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            // *** FIX #2: Added the 'transition' prop directly to the component. ***
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm sm:max-w-md bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            aria-modal="true"
            role="dialog"
          >
            {/* Header with Close Button */}
            <div className="border-b border-gray-200 p-5 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-graphite flex items-center">
                  <ShoppingBagIcon className="h-6 w-6 mr-2.5 text-solar-flare-start"/>
                  Your Cart
                </h2>
                <button 
                  onClick={closeCart}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                  type="button"
                >
                  ✕ Close
                </button>
              </div>
              <div className="mt-3 text-center">
                <button 
                  onClick={closeCart}
                  className="px-6 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-full shadow-lg transition-all duration-200"
                  type="button"
                >
                  ✕ Close Cart
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-gray-100 scrollbar-thumb-rounded-full">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 pt-10">
                  <ShoppingBagIcon className="h-20 w-20 text-gray-300 mb-6" />
                  <p className="text-lg font-medium text-graphite mb-2">Your cart is empty.</p>
                  <p className="text-sm text-gray-600 mb-8">Looks like you haven't added anything yet!</p>
                  <Link 
                      href="/products"
                      onClick={closeCart}
                      className="px-6 py-2.5 bg-gradient-to-r from-solar-flare-start to-solar-flare-end text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm shadow-md"
                    >
                      Browse Products
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 -mt-5">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex items-start sm:items-center py-5">
                      <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-md overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                        {/* *** FIX #3: Changed item.imageUrl to item.image_url for consistency. *** */}
                        {item.image_url ? (
                          <NextImage 
                            src={item.image_url} 
                            alt={item.name} 
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 640px) 20vw, 10vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                        )}
                      </div>
                      <div className="ml-4 flex-grow">
                        <Link href={`/products/${item.id}`} onClick={closeCart} className="text-sm font-medium text-graphite hover:text-solar-flare-start transition-colors line-clamp-2">
                            {item.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">Ksh {item.price.toLocaleString()} / unit</p>
                        <div className="flex items-center mt-2.5">
                          <button 
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 border rounded-l-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon className="h-4 w-4"/>
                          </button>
                          <span className="px-3 py-1 border-t border-b text-sm font-medium text-gray-700 min-w-[40px] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 border rounded-r-md text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <PlusIcon className="h-4 w-4"/>
                          </button>
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="ml-auto text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Remove item"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <TrashIcon className="h-5 w-5"/>
                          </button>
                        </div>
                      </div>
                      <p className="ml-4 font-semibold text-sm text-graphite whitespace-nowrap self-center sm:self-auto pt-8 sm:pt-0">
                        Ksh {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cartItems.length > 0 && (
                <div className="border-t border-gray-200 p-5 bg-gray-50 sticky bottom-0 shadow-inner-top">
                    <div className="flex justify-between font-semibold text-md text-graphite mb-1.5">
                    <span>Subtotal</span>
                    <span>Ksh {subtotal.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-5">Shipping and taxes calculated at checkout.</p>
                    
                    <Link
                      href="/checkout"
                      onClick={closeCart}
                      className="block w-full text-center bg-gradient-to-r from-solar-flare-start to-solar-flare-end py-3.5 text-base font-semibold text-white rounded-lg shadow-md hover:shadow-lg hover:opacity-95 transition-all duration-200 ease-in-out transform hover:scale-[1.01] active:scale-95"
                    >
                        Proceed to Checkout
                    </Link>
                    <button 
                        onClick={() => { 
                            if (window.confirm("Are you sure you want to clear your cart?")) {
                                clearCart(); 
                            }
                        }}
                        className="mt-3 w-full text-center py-3 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                        Clear Cart
                    </button>
                </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;