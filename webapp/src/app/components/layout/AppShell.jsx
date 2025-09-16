"use client";

import NavBar from "@/app/components/navigation/NavBar";
import Footer from "@/app/components/footer/Footer";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function AppShell({ children }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          className="flex-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
