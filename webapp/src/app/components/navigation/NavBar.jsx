"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function NavBar({ onLaw = false }) {
  const navLinks = useMemo(
    () => [
      { href: "/#about", label: "About" },
      { href: "/#plans", label: "Plans" },
      { href: "/#team", label: "The Team" },
    ],
    [],
  );

  const [activeTab, setActiveTab] = useState(navLinks[0]?.href ?? "/#about");
  const [onDark, setOnDark] = useState(false);
  const navRef = useRef(null);
  const containerRef = useRef(null);
  const [slider, setSlider] = useState({ translateX: 0, width: 0 });

  const itemRefs = useRef([]);
  itemRefs.current = navLinks.map((_, i) => itemRefs.current[i] ?? null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (onLaw) {
      setActiveTab(navLinks[0]?.href ?? "/#about");
      return;
    }

    const { hash } = window.location;
    if (hash) {
      const target = `/${hash}`;
      const matched = navLinks.find((link) => link.href === target);
      if (matched) {
        setActiveTab(matched.href);
        return;
      }
    }

    setActiveTab(navLinks[0]?.href ?? "/#about");
  }, [onLaw, navLinks]);

  useLayoutEffect(() => {
    const updateSlider = () => {
      const idx = navLinks.findIndex((l) => l.href === activeTab);
      const el = itemRefs.current[idx];
      const parent = containerRef.current;
      if (!el || !parent) return;
      const parentRect = parent.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setSlider({ translateX: rect.left - parentRect.left, width: rect.width });
    };

    updateSlider();
    const onResize = () => updateSlider();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeTab, navLinks]);

  useEffect(() => {
    const updateThemeUnderNav = () => {
      const navEl = navRef.current;
      if (!navEl) return;
      const navRect = navEl.getBoundingClientRect();
      const x = Math.round(window.innerWidth / 2);
      const y = Math.round(navRect.top + navRect.height / 2);
      const stack = document.elementsFromPoint(x, y) || [];
      const themed = stack.find((el) => el.dataset && el.dataset.navTheme);
      setOnDark(themed ? themed.dataset.navTheme === "dark" : false);
    };

    updateThemeUnderNav();
    const onScroll = () => updateThemeUnderNav();
    const onResize = () => updateThemeUnderNav();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const getIdFromHref = (href) => {
    const hashIndex = href.lastIndexOf("#");
    return hashIndex >= 0 ? href.slice(hashIndex + 1) : href;
  };

  const handleLinkClick = (e, href) => {
    if (onLaw) {
      e.preventDefault();
      setActiveTab(href);
      window.location.assign(href);
      return;
    }

    const id = getIdFromHref(href);
    const el = document.getElementById(id);

    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveTab(href);
      history.replaceState(null, "", href);
    }
  };

  const navBgClass = onDark
    ? "bg-transparent"
    : "bg-white/90 backdrop-blur-sm border-b border-black/5";
  const textActiveClass = onDark ? "text-white drop-shadow" : "text-black";
  const textIdleClass = onDark
    ? "text-white/90 hover:text-white/90"
    : "text-black/60 hover:text-black";
  const sliderBorderClass = onDark ? "border-white" : "border-black";

  return (
    <div
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 w-full flex flex-row justify-between items-center px-4 py-3 ${navBgClass}`}
    >
      <a
        href={"/"}
        className="flex flex-row items-center gap-2 hover:cursor-pointer"
      >
        <img src="/icon.svg" alt="logo" width={24} />
        <h1
          className={`${onDark ? "text-white" : "text-black"} lg:text-xl text-sm font-extrabold tracking-tight `}
        >
          Finance Tracker
        </h1>
      </a>

      <div
        ref={containerRef}
        className="relative flex flex-row items-center gap-2"
      >
        <motion.div
          className={`absolute bottom-0 border-b-2 ${sliderBorderClass}`}
          animate={{ x: slider.translateX, width: slider.width }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            mass: 0.5,
          }}
          style={{ willChange: "transform, width" }}
        />

        {navLinks.map((link, index) => (
          <div key={link.href} ref={(el) => (itemRefs.current[index] = el)}>
            <a
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className={`relative z-20 inline-flex h-2 items-center justify-center px-2 text-sm sm:text-sm lg:text-lg font-bold transition-colors duration-300 ${
                activeTab === link.href ? textActiveClass : textIdleClass
              }`}
            >
              {link.label}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
