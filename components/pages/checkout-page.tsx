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

export default function CheckoutPage({
  onOrderSubmit,
  onBack,
}: CheckoutPageProps) {
  const { items, getTotalPrice, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);

  // ✅ Register as a customer once connected
  useEffect(() => {
    if (socket.connected) {
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

  // ✅ Submit order
  const handleSubmit = async () => {
    if (items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // ✅ ALWAYS use sessionKey (single source of truth)
    const sessionKey = localStorage.getItem("tabifySessionKey");
    if (!sessionKey) {
      alert("Session expired. Please refresh the page.");
      return;
    }

    setSubmitted(true);

    const total = getTotalPrice();

    // Socket display order (owner live view only)
    const order = {
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      timestamp: new Date().toISOString(),
      status: "requested",
      paymentStatus: "unpaid",
      customerSocketId: socket.id,
    };

    let mongoOrderId = "";

    // ✅ SAVE ORDER TO DB FIRST
    try {
      const response = await fetch(
        `${SOCKET_SERVER_URL}/api/orders/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionKey,
            items: order.items,
            totalAmount: total,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save order");
      }

      console.log("✅ Order saved to MongoDB:", data.order);

      // ✅ USE MONGO _id AS THE ONLY ORDER ID
      mongoOrderId = data.order._id;

      // ✅ EMIT SOCKET ONLY AFTER DB SUCCESS
      if (socket.connected) {
        socket.emit("newOrder", {
          ...order,
          id: mongoOrderId,
        });
        console.log("📦 Order sent via socket:", mongoOrderId);
      }
    } catch (error) {
      console.error("❌ Error saving order:", error);
      alert("Failed to place order. Please try again.");
      setSubmitted(false);
      return;
    }

    // ✅ Save Mongo orderId locally
    localStorage.setItem("orderId", mongoOrderId);

    // Continue to order status
    setTimeout(() => {
      onOrderSubmit(mongoOrderId);
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
          <h2 className="text-2xl font-bold text-primary mb-2">
            Request Sent!
          </h2>
          <p className="text-muted-foreground mb-4">
            Waiting for shop owner to confirm...
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to order status...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-primary">
            Your Order
          </h1>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <CartSummary />

          <div className="bg-card rounded-2xl p-6 mb-6 border border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-lg text-muted-foreground">
                Total Bill
              </span>
              <span className="text-3xl font-bold text-primary">
                ₹{getTotalPrice()}
              </span>
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
