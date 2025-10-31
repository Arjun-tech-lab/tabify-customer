"use client"

import { motion } from "framer-motion"
import ItemCard from "@/components/item-card"
import CartBar from "@/components/cart-bar"
import { useCart } from "@/context/cart-context"

const ITEMS = [
  { id: 1, name: "Cigarette", price: 20 },
  { id: 2, name: "Tea", price: 10 },
  { id: 3, name: "Cold Drink", price: 25 },
  { id: 4, name: "Chips", price: 15 },
  { id: 5, name: "Chewing Gum", price: 5 },
  { id: 6, name: "Water Bottle", price: 10 },
]

interface HomePageProps {
  onCheckout: () => void
}

export default function HomePage({ onCheckout }: HomePageProps) {
  const { getTotalItems } = useCart()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-gradient-to-b from-primary/10 to-transparent px-4 py-6 shadow-sm"
      >
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-2">☕ Tabify</h1>
          <p className="text-muted-foreground text-sm">Welcome! Order your favorite items during rush hours</p>
        </div>
      </motion.div>

      {/* Menu Grid */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {ITEMS.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <ItemCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Sticky Cart Bar */}
      {getTotalItems() > 0 && <CartBar totalItems={getTotalItems()} onCheckout={onCheckout} />}
    </div>
  )
}
