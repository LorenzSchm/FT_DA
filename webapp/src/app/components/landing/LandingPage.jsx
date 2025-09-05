"use client";

import NewYorkCard from "@/app/components/cards/new-york/NewYorkCard";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function LandingPage() {
  const dotsRef = useRef(null);
  const cardRef = useRef(null);
  const textRef = useRef(null);
  const isDotsInView = useInView(dotsRef, { once: false, amount: 0.5 });
  const isCardInView = useInView(cardRef, { once: true, amount: 0.3 });
  const isTextInView = useInView(textRef, { once: true, amount: 0.5 });

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
            <h1 className="font-swiss text-white font-bold text-5xl">
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
            <button className="text-lg font-bold text-white px-5 py-1 rounded-3xl bg-white/20 border-2 border-solid border-white/50 hover:cursor-pointer hover:border-white/70">
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
      <div
        ref={dotsRef}
        className="flex flex-col gap-2 justify-center items-center lg:mt-10 sm:mt-72 md:mt-72"
      >
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className={`inline-block w-${2 + index} h-${2 + index} bg-white rounded-full mx-1`}
            custom={index}
            initial="hidden"
            animate={isDotsInView ? "visible" : "hidden"}
            whileHover="hover"
            variants={dotVariants}
          />
        ))}
      </div>
    </div>
  );
}