"use client";

import NewYorkCard from "@/app/components/cards/new-york/NewYorkCard";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import * as url from "node:url";

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
    <div
      id="about"
      className={"h-screen w-screen bg-white bg-cover"}
      style={{ backgroundImage: "url(/Updated_ny.jpg)" }}
    >
      <div className="  gap-36 flex flex-row justify-center items-center h-full w-full">
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
            <button
              className="text-lg mt-2 font-bold bg-white backdrop-blur-lg text-black px-5 py-2 rounded-3xl
                        hover:cursor-pointer hover:text-black/90 transition-transform duration-200 ease-out transform
                        hover:scale-105
                        focus:scale-90
                        "
            >
              Get the App
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
