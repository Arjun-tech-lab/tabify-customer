"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

export default function OrderStatusPage({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState("pending");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();

  // ✅ Store orderId in localStorage (for refresh recovery)
  useEffect(() => {
    if (orderId) localStorage.setItem("orderId", String(orderId));
  }, [orderId]);

  // 🧩 1. Fetch latest order details from backend on mount (and reload)
  useEffect(() => {
    const existingOrderId = orderId || localStorage.getItem("orderId");
    if (!existingOrderId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/orders/${existingOrderId}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        console.log("📦 Loaded order from backend:", data);
        setStatus(data.status);
        setPaymentStatus(data.paymentStatus);
      } catch (err) {
        console.error("⚠️ Failed to fetch order:", err);
      }
    };

    fetchOrder();
  }, [orderId]);

  // 🔌 2. Setup socket listeners
  useEffect(() => {
    const socketInstance = io("http://localhost:5001", {
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      console.log("✅ Connected as customer:", socketInstance.id);
      socketInstance.emit("registerRole", "customer");

      // 🧠 If order already exists (after refresh), reconnect to it
      const existingOrderId = orderId || localStorage.getItem("orderId");
      if (existingOrderId) {
        socketInstance.emit("reconnectOrder", existingOrderId);
      }
    });

    socketInstance.on("orderUpdate", (updatedOrder: any) => {
      console.log("📢 Received update:", updatedOrder);
      const currentOrderId = orderId || localStorage.getItem("orderId");
      if (String(updatedOrder.id) === String(currentOrderId)) {
        setStatus(updatedOrder.status);
        setPaymentStatus(updatedOrder.paymentStatus);
      }
    });

    socketInstance.on("connect_error", (err) => {
      console.error("⚠️ Connection error:", err);
    });

    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, [orderId]);

  // 💳 3. Handle Payment
  const handlePayment = (method: "upi" | "later") => {
    if (!socket) return;
    const newPaymentStatus = method === "upi" ? "paid" : "unpaid";
    const currentOrderId = orderId || localStorage.getItem("orderId");

    socket.emit("updatePaymentStatus", {
      orderId: String(currentOrderId),
      paymentStatus: newPaymentStatus,
    });

    setPaymentStatus(newPaymentStatus);
    if (newPaymentStatus === "paid") {
      setStatus("paid");
    }

    // ✅ Reliable navigation fix
    if (method === "later") {
      console.log("➡️ Navigating to home...");
      window.location.href = "/"; // ✅ Works 100% in all cases
    }
  };

  // 🧾 4. UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-bold mb-4">🧾 Order #{orderId}</h1>
      <p className="text-lg mb-2 font-medium">Status: {status}</p>
      <p className="text-lg mb-4 font-medium">Payment: {paymentStatus}</p>

      {/* 👇 Show payment options only when owner accepts */}
      {status === "accepted" && paymentStatus === "unpaid" && (
        <div className="space-y-3 mt-4">
          <button
            onClick={() => handlePayment("upi")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md"
          >
            💳 Pay Now
          </button>
          <button
            onClick={() => handlePayment("later")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg shadow-md"
          >
            🤝 Pay Later
          </button>
        </div>
      )}

      {paymentStatus === "paid" && (
        <p className="text-green-600 font-semibold mt-6 text-lg">
          ✅ Payment Successful! Thank you.
        </p>
      )}
    </div>
  );
}
