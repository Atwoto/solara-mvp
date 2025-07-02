'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat, type Message } from "ai/react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product as ProductType } from "@/types";

const createWelcomeMessage = (): Message => ({
    id: `welcome-${Date.now()}`,
    role: 'assistant',
    content: "Hello! I'm the Bills On Solar Assistant. I can help you find solar products, answer questions about solar energy, and even manage your cart or wishlist. How can I assist you today?",
});

const getProductDetails = async (productId: string): Promise<ProductType | null> => {
    try {
        const response = await fetch(`/api/product-details?id=${productId}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Failed to fetch product details for ${productId}:`, errorData.message || response.statusText);
            return null;
        }
        return await response.json();
    } catch (e: any) {
        console.error("Network error fetching product details:", e.message);
        return null;
    }
};

export const useChatbotLogic = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showNotification, setShowNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // --- THE FIX: Destructure `openCart` from the useCart hook ---
    const { cartItems, addToCart, removeFromCart, clearCart, openCart } = useCart();
    const { wishlistIds, addToWishlist, removeFromWishlist, clearWishlist } = useWishlist();

    const showNotificationMessage = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        setShowNotification({ message, type });
        setTimeout(() => setShowNotification(null), 4000);
    }, []);

    const handleActionClick = useCallback(async (actionType: string, productIdOrMarker: string) => {
        const normalizedActionType = actionType.replace(/_([a-z])/g, g => g[1].toUpperCase());
        const productSpecificActions = ['addToCart', 'addToWishlist', 'removeFromCart', 'removeFromWishlist'];
        
        if (productSpecificActions.includes(normalizedActionType)) {
            if (!productIdOrMarker || productIdOrMarker.toLowerCase() === 'undefined' || productIdOrMarker === 'NONE') {
                showNotificationMessage("Could not identify the product.", 'error');
                return;
            }
        }

        try {
            switch (normalizedActionType) {
                // --- THE FIX: Add a new case to handle the 'openCart' action ---
                case 'openCart':
                    openCart();
                    break;
                case 'addToCart': {
                    const product = await getProductDetails(productIdOrMarker);
                    if (!product) throw new Error(`Could not find product details.`);
                    await addToCart(product, 1);
                    showNotificationMessage(`"${product.name}" was added to your cart!`, 'success');
                    break;
                }
                case 'addToWishlist': {
                    await addToWishlist(productIdOrMarker);
                    const product = await getProductDetails(productIdOrMarker);
                    showNotificationMessage(`"${product?.name || 'Item'}" added to wishlist!`, 'success');
                    break;
                }
                case 'removeFromCart':
                    await removeFromCart(productIdOrMarker);
                    showNotificationMessage(`Item removed from cart.`, 'success');
                    break;
                case 'removeFromWishlist':
                    await removeFromWishlist(productIdOrMarker);
                    showNotificationMessage(`Item removed from wishlist.`, 'success');
                    break;
                case 'clearCart':
                    await clearCart();
                    showNotificationMessage('Cart has been cleared!', 'success');
                    break;
                case 'clearWishlist':
                    await clearWishlist();
                    showNotificationMessage('Wishlist has been cleared!', 'success');
                    break;
                default:
                    // This is a prefill action, which is handled by the input change
                    if (actionType === 'prefill') {
                        // We can just set the input value here, though it's handled in Chatbot.tsx
                    } else {
                        throw new Error(`Unknown action type: '${actionType}'`);
                    }
            }
        } catch (err: any) {
            console.error(`Error performing chatbot action '${actionType}':`, err.message);
            showNotificationMessage(err.message || "An error occurred.", 'error');
        }
    // --- THE FIX: Add `openCart` to the dependency array ---
    }, [addToCart, addToWishlist, clearCart, clearWishlist, removeFromCart, removeFromWishlist, showNotificationMessage, openCart]);

    const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } =
        useChat({
          api: "/api/chat",
          body: {
            cart: cartItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity })),
            wishlist: wishlistIds,
          },
          onFinish: (message) => {
            // --- THE FIX: Updated regex to handle actions with no second parameter (like openCart) ---
            const executeRegex = /EXECUTE_ACTION\[([^|]+)\|(.*?)\]/;
            const match = message.content.match(executeRegex);
            if (match) {
              const [, actionType, idOrMarker] = match;
              handleActionClick(actionType, idOrMarker);
            }
          },
          onError: (err) => {
            console.error("Chat error:", err);
            showNotificationMessage("Apologies, I couldn't send that. Please try again.", 'error');
          },
        });

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
            if (!messages.some(m => m.role !== 'system')) {
                if (!messages.some(m => m.id.startsWith('welcome-'))) {
                    setMessages([createWelcomeMessage()]);
                }
            }
        }
    }, [isOpen, messages, setMessages]);
    
    useEffect(() => {
        if (isOpen) { setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }
    }, [messages, isOpen]);

    return {
        isOpen, setIsOpen,
        showNotification,
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        error,
        handleActionClick,
        messagesEndRef,
        inputRef,
        chatContainerRef
    };
};
