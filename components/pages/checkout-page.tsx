"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useCart } from "@/context/cart-context";
import CartSummary from "@/components/cart-summary";
import { ArrowLeft } from "lucide-react";
import { io } from "socket.io-client";

// ✅ Use environment variable for backend socket URL
const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:5001";
export const socket = io(SOCKET_SERVER_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

interface CheckoutPageProps {
  onOrderSubmit: (orderId: string) => void;
  onBack: () => void;
}

export default function CheckoutPage({ onOrderSubmit, onBack }: CheckoutPageProps) {
  const { items, getTotalPrice, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);

  // ✅ Register as a customer once connected
  useEffect(() => {
    if (socket && socket.connected) {
      socket.emit("registerRole", "customer");
    } else {
      socket.on("connect", () => {
        socket.emit("registerRole", "customer");
      });
    }

    return () => {
      socket.off("connect");
    };
  }, []);

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

    // ✅ Emit order safely
    if (socket && socket.connected) {
      socket.emit("newOrder", order);
      console.log("📦 Order sent:", order);
    } else {
      alert("Connection lost. Please refresh and try again.");
      return;
    }

    // ✅ Store order locally for page reload
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
            className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 max-sm:w-14 max-sm:h-14"
          >
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-2xl max-sm:w-10 max-sm:h-10 max-sm:text-xl">
              ✓
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold text-primary mb-2 max-sm:text-xl max-sm:mb-1">
            Request Sent!
          </h2>
          <p className="text-muted-foreground mb-4 max-sm:text-sm max-sm:mb-2">
            Waiting for shop owner to confirm...
          </p>
          <p className="text-sm text-muted-foreground max-sm:text-xs">
            Redirecting to order status...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-4 shadow-sm max-sm:px-3 max-sm:py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3 max-sm:gap-2">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-lg transition-colors max-sm:p-1.5"
          >
            <ArrowLeft className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
          </button>
          <h1 className="text-2xl font-bold text-primary max-sm:text-xl">
            Your Order
          </h1>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-2xl mx-auto px-4 py-8 max-sm:px-3 max-sm:py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <CartSummary />

          <div className="bg-card rounded-2xl p-6 mb-6 border border-border/50 max-sm:p-4 max-sm:mb-5">
            <div className="flex justify-between items-center">
              <span className="text-lg text-muted-foreground max-sm:text-base">
                Total Bill
              </span>
              <span className="text-3xl font-bold text-primary max-sm:text-2xl">
                ₹{getTotalPrice()}
              </span>
            </div>
          </div>

          <div className="space-y-3 max-sm:space-y-2.5">
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow active:scale-95 max-sm:py-3 max-sm:text-base"
            >
              Send Request to Shop
            </button>
            <button
              onClick={onBack}
              className="w-full bg-muted text-foreground py-3 rounded-2xl font-semibold transition-colors hover:bg-muted/80 active:scale-95 max-sm:py-2.5 max-sm:text-sm"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
