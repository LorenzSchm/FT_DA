"use client";

import Image from "next/image";
import ShanghaiCard from "@/app/components/cards/shanghai/ShanghaiCard";
import LondonCard from "@/app/components/cards/london/LondonCard";
import NewYorkCard from "@/app/components/cards/new-york/NewYorkCard";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function CardView() {
  const cardsRef = useRef(null);
  const isInView = useInView(cardsRef, { once: false, amount: 0.5 }); // Trigger earlier for smoother start

  const outerCardVariants = {
    hidden: (direction) => ({
      x: direction === "left" ? -100 : 100,
      opacity: 0,
    }),
    visible: (direction) => ({
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80, // Reduced stiffness for less bounce
        damping: 20, // Increased damping for smoother settling
        duration: 1.2, // Slightly longer duration
        ease: [0.4, 0, 0.2, 1], // Custom easing for natural feel
        delay: direction === "left" ? 0.1 : 0.2, // Staggered delay
      },
    }),
  };

  const centerCardVariants = {
    hidden: {
      y: 60,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        ease: [0.4, 0, 0.2, 1],
        delay: 0.05,
      },
    },
  };

  return (
    <div className="h-screen w-screen bg-white">
      <div className="flex flex-col justify-center items-center mt-20 gap-4">
        <Image src="/icon.svg" width={100} height={100} alt="Icon" />
        <span className="lg:text-5xl text-3xl font-swiss font-bold text-black">
          Track Everything. Everywhere.
        </span>
      </div>
      <div
        ref={cardsRef}
        className="w-full flex flex-row gap-10 justify-center mt-10"
      >
        <motion.div
          className="hidden xl:block mt-12 transition-transform duration-300 hover:scale-102" // Reduced scale for subtlety
          custom="left"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={outerCardVariants}
        >
          <LondonCard />
        </motion.div>
        <motion.div
          className="transition-transform duration-300 hover:scale-102" // Matching hover scale
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={centerCardVariants}
        >
          <NewYorkCard bg_visible={true} />
        </motion.div>
        <motion.div
          className="hidden xl:block mt-12 transition-transform duration-300 hover:scale-102" // Matching hover scale
          custom="right"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={outerCardVariants}
        >
          <ShanghaiCard />
        </motion.div>
      </div>
    </div>
  );
}
