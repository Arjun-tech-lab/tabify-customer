"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ItemCard from "@/components/item-card";
import CartBar from "@/components/cart-bar";
import { useCart } from "@/context/cart-context";

interface Item {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

const ITEMS: Item[] = [
  // 🧷 Cigarette Sub-items
  { id: 1, name: "Classic Milds", price: 20, category: "Cigarettes", image: "https://cdn.dotpe.in/longtail/store-items/8273030/8HTEsHRw.webp" },
  { id: 2, name: "Gold Flake Kings", price: 25, category: "Cigarettes", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5_-1jJ2lA4Ht-rzbWrqx2KdfCs3uE7WBrMQ&s" },
  { id: 3, name: "Marlboro Red", price: 30, category: "Cigarettes", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIjr3yt2ZvMIjrHk1pdKO7o3TXIAhPCqUNLA&s" },
  { id: 4, name: "Navy Cut", price: 22, category: "Cigarettes", image: "https://cdn.dotpe.in/longtail/store-items/8273030/V3QGlohR.webp" },
  { id: 5, name: "Classic Ice Burst", price: 28, category: "Cigarettes", image: "https://cdn.dotpe.in/longtail/store-items/8273030/9vbQUH07.webp" },

  // 🧷 Other items
  { id: 6, name: "Tea", price: 10, category: "Others", image: "https://www.sharmispassions.com/wp-content/uploads/2012/12/cardamom-tea3.jpg" },
  { id: 7, name: "Cold Drink", price: 25, category: "Others", image: "https://static.wixstatic.com/media/8f1abd_80bf432a005041b59c2a7fa1960ce71e~mv2.jpeg/v1/fill/w_8499,h_3727,al_c,q_90/8f1abd_80bf432a005041b59c2a7fa1960ce71e~mv2.jpeg" },
  { id: 8, name: "Chips", price: 15, category: "Others", image: "https://www.quickpantry.in/cdn/shop/products/lay-s-chile-limon-potato-chips-32-g-quick-pantry.jpg?v=1710539171" },
  { id: 9, name: "Chewing Gum", price: 5, category: "Others", image: "https://www.kroger.com/product/images/large/front/0002200000172" },
  { id: 10, name: "Water Bottle", price: 10, category: "Others", image: "https://i0.wp.com/sipnjoy.in/wp-content/uploads/2022/01/R76HHCoZE1j6B8U7cymd.jpg?fit=360%2C380&ssl=1" },
];

interface HomePageProps {
  onCheckout: () => void;
}

export default function HomePage({ onCheckout }: HomePageProps) {
  const { getTotalItems } = useCart();
  const [viewingCategory, setViewingCategory] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const cigaretteItems = ITEMS.filter((item) => item.category === "Cigarettes");
  const otherItems = ITEMS.filter((item) => item.category === "Others");

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-gradient-to-b from-primary/10 to-transparent px-4 py-6 shadow-sm"
      >
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-2">☕ Tabify</h1>
          <p className="text-muted-foreground text-sm">
            {viewingCategory
              ? `Select your preferred ${viewingCategory}`
              : "Welcome! Order your favorite items during rush hours"}
          </p>
        </div>
      </motion.header>

      {/* Category View */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {!viewingCategory ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4"
          >
            {/* Cigarettes card */}
            <motion.div key="cigarettes" variants={itemVariants}>
              <div className="border rounded-2xl p-3 sm:p-4 shadow-sm bg-card hover:shadow-md transition flex flex-col justify-between h-full">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/bb/Cigarette_DS.jpg"
                  alt="Cigarettes"
                  className="rounded-xl mb-2 sm:mb-3 w-full h-32 sm:h-40 object-cover"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-primary mb-1">🚬 Cigarettes</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                    View and choose from all types
                  </p>
                </div>
                <button
                  onClick={() => setViewingCategory("Cigarettes")}
                  className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-primary/90 transition"
                >
                  View All Types
                </button>
              </div>
            </motion.div>

            {/* Other items */}
            {otherItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <ItemCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // 🧾 Cigarette Subview
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4"
          >
            <div className="col-span-2 mb-4 flex items-center justify-between">
              <button
                onClick={() => setViewingCategory(null)}
                className="text-primary font-semibold hover:underline"
              >
                ← Back to Menu
              </button>
              <h2 className="text-lg font-semibold text-primary">Cigarettes</h2>
            </div>

            {cigaretteItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <ItemCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Sticky Cart Bar */}
      {getTotalItems() > 0 && <CartBar totalItems={getTotalItems()} onCheckout={onCheckout} />}
    </div>
  );
}
