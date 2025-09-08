"use client";
import PersonalCard from "@/app/plans/cards/personal/PersonalCard";
import EnterpriseCard from "@/app/plans/cards/enterprise/EnterpriseCard";
import ProCard from "@/app/plans/cards/pro/ProCard";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function PlansView() {
  const cardsRef = useRef(null);
  const isInView = useInView(cardsRef, { once: false, amount: 0.3 });

  const outerCardVariants = {
    hidden: (direction) => ({
      x: direction === "left" ? -100 : 100,
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.8,
      },
    },
  };

  const centerCardVariants = {
    hidden: {
      y: 100,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 1,
      },
    },
  };

  return (
    <div className="flex flex-col xl:h-screen justify-center items-center">
      <motion.div
        className="text-4xl md:text-6xl text-black font-swiss font-black mb-10"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={centerCardVariants}
      >
        Choose your plan
      </motion.div>
      <div
        ref={cardsRef}
        className="flex flex-col xl:flex-row justify-center items-center gap-10 xl:gap-20 w-full px-4"
      >
        <motion.div
          className="mt-6"
          custom="left"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={outerCardVariants}
        >
          <ProCard />
        </motion.div>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={centerCardVariants}
        >
          <PersonalCard />
        </motion.div>
        <motion.div
          className="mt-6"
          custom="right"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={outerCardVariants}
        >
          <EnterpriseCard />
        </motion.div>
      </div>
    </div>
  );
}
