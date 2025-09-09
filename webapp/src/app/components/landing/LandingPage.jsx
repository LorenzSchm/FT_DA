"use client";

import NewYorkCard from "@/app/components/cards/new-york/NewYorkCard";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Dots from "@/app/components/animations/Dots";

export default function LandingPage() {
  const cardRef = useRef(null);
  const textRef = useRef(null);
  const isCardInView = useInView(cardRef, { once: true, amount: 0.3 });
  const isTextInView = useInView(textRef, { once: true, amount: 0.5 });

  const cardVariants = {
    hidden: {
      x: 100,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.6,
      },
    },
  };

  const textVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: (index) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.2,
      },
    }),
  };

  return (
    <div>
      <div className="mt-20 justify-center gap-36 flex flex-row">
        <div ref={textRef}>
          <motion.div
            initial="hidden"
            animate={isTextInView ? "visible" : "hidden"}
            variants={textVariants}
            custom={0}
          >
            <h1 className="font-swiss text-white font-bold text-6xl">
              Finance Simplified
            </h1>
          </motion.div>
          <motion.div
            initial="hidden"
            animate={isTextInView ? "visible" : "hidden"}
            variants={textVariants}
            custom={1}
          >
            <p className="text-white font-swiss font-medium">
              The Finance Tracker is a user-friendly mobile app that <br />{" "}
              helps you manage your finances efficiently. With our <br />{" "}
              platform, you can keep track of your income, expenses,
              <br /> and subscriptions.
            </p>
            <p className="text-white font-swiss font-bold mt-2 text-3xl">
              All in one convenient place.
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            animate={isTextInView ? "visible" : "hidden"}
            variants={textVariants}
            custom={2}
          >
            <button className="text-lg mt-2 font-bold text-white px-5 py-1 rounded-3xl bg-white/20 border-2 border-solid border-white/50 hover:cursor-pointer hover:border-white/70">
              Start Saving
            </button>
          </motion.div>
        </div>
        <motion.div
          ref={cardRef}
          className="hidden lg:block"
          initial="hidden"
          animate={isCardInView ? "visible" : "hidden"}
          variants={cardVariants}
        >
          <NewYorkCard />
        </motion.div>
      </div>
    </div>
  );
}
