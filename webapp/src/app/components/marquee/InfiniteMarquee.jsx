"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function InfiniteMarquee() {
  const logos = [
    { src: "/logos/robinHood.png", alt: "RobinHood", text: "Investments" },
    { src: "/logos/mastercard.svg", alt: "Mastercard", text: "Savings" },
    { src: "/logos/revolut.svg", alt: "Revolut", text: "Bank Accounts" },
    { src: "/logos/hbo.svg", alt: "HBO", text: "Subscriptions" },
    { src: "/logos/netflix.svg", alt: "Netflix", text: "Subscriptions" },
    { src: "/logos/whoop.svg", alt: "Whoop", text: "Subscriptions" },
    {
      src: "/logos/bankOfAmerica.svg",
      alt: "Bank of America",
      text: "Bank Accounts",
    },
    {
      src: "/logos/tr.svg",
      alt: "Trade Republic",
      text: "Savings",
    },
  ];

  const logoWidth = 192;
  const totalWidth = logos.length * logoWidth;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="bg-white h-screen">
      <div className="flex bg-white flex-col justify-center items-center gap-4">
        <span className="lg:text-6xl text-5xl ml-10 font-swiss mt-28 self-start text-black font-bold">
          Everything, in one place.
        </span>
      </div>
      <div className="overflow-hidden relative w-full bg-white mt-36 py-6">
        <motion.div
          className="flex flex-nowrap whitespace-nowrap cursor-pointer"
          animate={{
            x: [0, -totalWidth],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: isHovered ? 90 : 20,
              ease: "linear",
            },
          }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          {logos.concat(logos, logos).map((logo, index) => (
            <div
              key={index}
              className="mx-2 w-48 flex flex-col items-center flex-shrink-0"
            >
              <div className="text-black text-xl mb-2 font-extrabold text-center w-full">
                {logo.text}
              </div>
              <div className="h-44 flex items-center justify-center w-full">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  height={100}
                  width={100}
                  className="max-h-28 w-auto object-contain block"
                />
              </div>
              <div className="text-black text-xl mt-2 font-extrabold text-center w-full">
                {logo.text}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
