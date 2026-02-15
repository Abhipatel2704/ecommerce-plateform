"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to checkout");
        router.push("/login");
        return;
    }

    setLoading(true);
    
    // Prepare payload for Go Backend
    const payload = {
        items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity
        }))
    };

    try {
        const res = await fetch("http://localhost:8080/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }

        alert("Order Placed Successfully! Inventory updated.");
        clearCart();
        router.push("/");
    } catch (err: any) {
        alert("Checkout Failed: " + err.message); // E.g., "Insufficient stock"
    } finally {
        setLoading(false);
    }
  };

  if (cart.length === 0) return <div className="p-10 text-center text-xl">Your cart is empty.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Your Cart</h1>
        
        {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b dark:border-gray-700 py-4">
                <div className="flex items-center gap-4">
                    {item.image_url && <img src={item.image_url} className="w-16 h-16 object-cover rounded" />}
                    <div>
                        <h3 className="font-bold dark:text-white">{item.name}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <p className="font-bold text-green-600">${(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:underline text-sm">Remove</button>
                </div>
            </div>
        ))}

        <div className="mt-8 flex flex-col items-end">
            <p className="text-2xl font-bold mb-4 dark:text-white">Total: ${total.toFixed(2)}</p>
            <button 
                onClick={handleCheckout}
                disabled={loading}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
            >
                {loading ? "Processing..." : "Place Order"}
            </button>
        </div>
      </div>
    </div>
  );
}