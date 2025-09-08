"use client";

import NavBar from "@/app/components/navigation/NavBar";
import { useRef } from "react";
import { useInView } from "framer-motion";

export default function Page() {
  const dotsRef = useRef(null);
  const isDotsInView = useInView(dotsRef, { once: false, amount: 0.5 });

  const dotVariants = {
    hidden: {
      scale: 1,
      opacity: 0,
    },
    visible: (index) => ({
      scale: [1, 1.2, 1],
      opacity: 1,
      transition: {
        scale: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 1.5,
          delay: index * 0.2,
          ease: "easeInOut",
        },
        opacity: {
          duration: 0.5,
        },
      },
    }),
    hover: {
      scale: 1.25,
      width: 20,
      height: 20,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div>
      <div
        className="w-full h-screen bg-cover bg-no-repeat overflow-hidden"
        style={{ backgroundImage: "url('/shanghai.jpg')" }}
      >
        <NavBar />
        <div
          className={
            "mt-60 text-5xl lg:text-6xl font-swiss font-bold text-white flex items-center justify-center"
          }
        >
          The Finance Tracker Team
        </div>
      </div>
    </div>
  );
}
