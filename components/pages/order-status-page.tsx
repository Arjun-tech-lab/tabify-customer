"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import StatusCard from "@/components/status-card"
import { ArrowLeft } from "lucide-react"

interface OrderStatusPageProps {
  orderId: string
  onBackToHome: () => void
}

type OrderStatus = "pending" | "accepted" | "paid"

export default function OrderStatusPage({ orderId, onBackToHome }: OrderStatusPageProps) {
  const [status, setStatus] = useState<OrderStatus>("pending")
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "later" | null>(null)

  useEffect(() => {
    // Simulate shop owner accepting order after 3 seconds
    const timer = setTimeout(() => {
      setStatus("accepted")
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const statuses = [
    {
      step: 1,
      title: "Pending confirmation",
      icon: "🕒",
      completed: status !== "pending",
    },
    {
      step: 2,
      title: "Accepted by Shop Owner",
      icon: "✅",
      completed: status === "accepted" || status === "paid",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={onBackToHome} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-primary">Order Status</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Order ID */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
          <p className="text-muted-foreground text-sm">Order ID</p>
          <p className="text-lg font-semibold text-primary">{orderId}</p>
        </motion.div>

        {/* Status Timeline */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.3 },
            },
          }}
          initial="hidden"
          animate="visible"
          className="space-y-4 mb-8"
        >
          {statuses.map((s) => (
            <StatusCard key={s.step} {...s} />
          ))}
        </motion.div>

        {/* Payment Options - Show when accepted */}
        {status === "accepted" && !paymentMethod && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 border border-border/50 mb-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Payment Method</h3>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod("upi")}
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-xl font-semibold transition-all hover:shadow-lg active:scale-95"
              >
                💳 Pay Now (UPI)
              </button>
              <button
                onClick={() => setPaymentMethod("later")}
                className="w-full bg-secondary text-secondary-foreground py-4 rounded-xl font-semibold transition-all hover:shadow-lg active:scale-95"
              >
                🤝 Pay Later
              </button>
            </div>
          </motion.div>
        )}

        {/* Payment Success */}
        {paymentMethod && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4"
            >
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white text-2xl">
                ✓
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold text-primary mb-2">
              {paymentMethod === "upi" ? "Payment Completed!" : "Order Confirmed"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {paymentMethod === "upi" ? "Thank you for your payment!" : "Pay when you collect your order"}
            </p>
            <button
              onClick={onBackToHome}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold transition-all hover:shadow-lg active:scale-95"
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
