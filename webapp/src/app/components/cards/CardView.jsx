"use client";

import Image from "next/image";
import ShanghaiCard from "@/app/components/cards/shanghai/ShanghaiCard";
import LondonCard from "@/app/components/cards/london/LondonCard";
import NewYorkCard from "@/app/components/cards/new-york/NewYorkCard";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function CardView() {
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
    <div className={"h-full w-screen bg-white"}>
      <div className={"flex flex-col justify-center items-center mt-28 gap-4"}>
        <Image src={"/icon.svg"} width={100} height={100} alt="Icon" />
        <span className={"lg:text-5xl text-3xl font-swiss font-bold"}>
          Track everything. Everywhere.
        </span>
      </div>
      <div
        ref={cardsRef}
        className={"w-full flex flex-row gap-10 justify-center mt-10"}
      >
        <motion.div
          className={"hidden xl:block mt-12"}
          custom="left"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={outerCardVariants}
        >
          <LondonCard />
        </motion.div>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={centerCardVariants}
        >
          <NewYorkCard bg_visible={true} />
        </motion.div>
        <motion.div
          className={"hidden xl:block mt-12"}
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
