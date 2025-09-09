"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function NavBar() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);
  const containerRef = useRef(null);

  const navLinks = useMemo(
    () => [
      { path: "/", label: "About" },
      { path: "/plans", label: "Plans" },
      { path: "/team", label: "The Team" },
    ],
    [],
  );

  const itemRefs = useRef([]);
  itemRefs.current = navLinks.map((_, i) => itemRefs.current[i] ?? null);

  useEffect(() => setActiveTab(pathname), [pathname]);

  const [slider, setSlider] = useState({ left: 0, width: 0 });
  useLayoutEffect(() => {
    const idx = navLinks.findIndex((l) => l.path === activeTab);
    const el = itemRefs.current[idx];
    const parent = containerRef.current;
    if (!el || !parent) return;

    const parentRect = parent.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setSlider({ left: rect.left - parentRect.left, width: rect.width });
  }, [activeTab, navLinks]);

  const handleLinkClick = (path) => setActiveTab(path);

  return (
    <div className="w-full flex flex-row justify-between items-center px-4 py-3">
      <div className="flex flex-row items-center gap-2">
        <img
          src="/icon.svg"
          alt="logo"
          width={24}
          className="filter drop-shadow-md"
        />
        <h1 className="text-white text-xl font-extrabold tracking-tight">
          Finance Tracker
        </h1>
      </div>

      <div
        ref={containerRef}
        className="relative flex flex-row items-center gap-2 "
      >
        <motion.div
          className="absolute bottom-0 border-b-2 border-white"
          animate={{ left: slider.left, width: slider.width }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 18,
            mass: 0.2,
          }}
          style={{ willChange: "left, width" }}
        />

        {navLinks.map((link, index) => (
          <div key={link.path} ref={(el) => (itemRefs.current[index] = el)}>
            <Link
              href={link.path}
              onClick={() => handleLinkClick(link.path)}
              className={`relative z-20 inline-flex h-2 items-center justify-center px-3 lg:text-lg sm:text-sm font-bold transition-colors duration-300 ${
                activeTab === link.path
                  ? "text-white drop-shadow-md"
                  : "text-white/70 hover:text-white/90"
              }`}
            >
              {link.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
