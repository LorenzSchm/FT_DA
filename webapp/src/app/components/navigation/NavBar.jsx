"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);
  const aboutRef = useRef(null);
  const plansRef = useRef(null);
  const teamRef = useRef(null);
  const containerRef = useRef(null);
  const sliderRef = useRef(null);

  const navLinks = [
    { path: "/", ref: aboutRef, label: "About" },
    { path: "/plans", ref: plansRef, label: "Plans" },
    { path: "/team", ref: teamRef, label: "The Team" },
  ];

  const handleLinkClick = (path) => {
    setActiveTab(path);
  };

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);


  return (
    <div className="w-full bg-gradient-to-b from-[#B7B7B7] to-transparent flex flex-row justify-between items-center">
      <div className="p-4 flex flex-row items-center gap-2">
        <img src="/icon.svg" alt="logo" width={25} />
        <h1 className="text-white font-bold text-3xl">Finance Tracker</h1>
      </div>
      <div
        ref={containerRef}
        className="flex flex-row items-center gap-2 m-4 text-white font-bold bg-white/10 backdrop-blur-sm border border-2 border-white/40 rounded-3xl relative"
      >
        {navLinks.map((link) => (
          <Link
            key={link.path}
            ref={link.ref}
            href={link.path}
            className={`pl-3 pr-3 z-20 relative text-center transition-colors duration-300 ${
              activeTab === link.path ? "text-white bg-white/10 rounded-3xl z-10 border border-white/30" : "text-white/90"
            }`}
            onClick={() => handleLinkClick(link.path)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}