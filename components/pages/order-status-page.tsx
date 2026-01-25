"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function OrderStatusPage({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<
    "requested" | "accepted" | "completed"
  >("requested");

  const [paymentStatus, setPaymentStatus] = useState<
    "paid" | "unpaid"
  >("unpaid");

  const socketRef = useRef<Socket | null>(null);

  const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URL ||
    "http://localhost:5001";

  // ✅ Persist orderId for refresh
  useEffect(() => {
    if (orderId) {
      localStorage.setItem("orderId", orderId);
    }
  }, [orderId]);

  // 🔌 Socket connection (SOURCE OF TRUTH)
  useEffect(() => {
    const currentOrderId =
      orderId || localStorage.getItem("orderId");

    if (!currentOrderId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("registerRole", "customer");
    });

    socket.on("orderUpdate", (updatedOrder: any) => {
      // ✅ CRITICAL FIX: use _id
      if (
        String(updatedOrder._id) === String(currentOrderId)
      ) {
        setStatus(updatedOrder.status);
        setPaymentStatus(updatedOrder.paymentStatus);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, SOCKET_URL]);

  // 💳 Handle payment
  const handlePayment = (method: "upi" | "later") => {
    const currentOrderId =
      orderId || localStorage.getItem("orderId");

    if (!socketRef.current || !currentOrderId) return;

    const newPaymentStatus =
      method === "upi" ? "paid" : "unpaid";

    socketRef.current.emit("updatePaymentStatus", {
      orderId: currentOrderId,
      paymentStatus: newPaymentStatus,
    });

    if (method === "later") {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-bold mb-4">
        🧾 Order #{orderId}
      </h1>

      <p className="text-lg mb-2 font-medium">
        Status: {status}
      </p>
      <p className="text-lg mb-4 font-medium">
        Payment: {paymentStatus}
      </p>

      {status === "requested" && (
        <p className="text-yellow-600 font-medium mt-4">
          ⏳ Waiting for shop owner to accept your order
        </p>
      )}

      {status === "accepted" &&
        paymentStatus === "unpaid" && (
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
