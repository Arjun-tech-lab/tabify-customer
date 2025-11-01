"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import CartSummary from "@/components/cart-summary";
import { ArrowLeft } from "lucide-react";
import { socket } from "@/utils/socket";

interface CheckoutPageProps {
  onOrderSubmit: (orderId: string) => void;
  onBack: () => void;
}

export default function CheckoutPage({ onOrderSubmit, onBack }: CheckoutPageProps) {
  const { items, getTotalPrice, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (items.length === 0) return alert("Your cart is empty!");

    setSubmitted(true);
    const orderId = `TL${Date.now()}`;
    const total = getTotalPrice();

    const order = {
      id: orderId,
      user: "Ravi Kumar",
      total,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      timestamp: new Date().toISOString(),
      status: "pending",
      paymentStatus: "unpaid",
      customerSocketId: socket.id,
    };

    console.log("📦 Sending order:", order);
    socket.emit("newOrder", order);

    // ✅ Save orderId for reload recovery
    localStorage.setItem("orderId", orderId);

    setTimeout(() => {
      onOrderSubmit(orderId);
      clearCart();
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
          >
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-2xl">
              ✓
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold text-primary mb-2">Request Sent!</h2>
          <p className="text-muted-foreground mb-4">Waiting for shop owner to confirm...</p>
          <p className="text-sm text-muted-foreground">Redirecting to order status...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-primary">Your Order</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <CartSummary />

          <div className="bg-card rounded-2xl p-6 mb-6 border border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-lg text-muted-foreground">Total Bill</span>
              <span className="text-3xl font-bold text-primary">₹{getTotalPrice()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow active:scale-95"
            >
              Send Request to Shop
            </button>
            <button
              onClick={onBack}
              className="w-full bg-muted text-foreground py-3 rounded-2xl font-semibold transition-colors hover:bg-muted/80 active:scale-95"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
