import { CheckCircle } from "react-feather";
import { motion, useReducedMotion } from "framer-motion";
import React from "react";

export default function Card({
  title,
  subtitle,
  price,
  features = [],
  buttonText,
}) {
  const reduceMotion = useReducedMotion();

  const cardVariants = {
    initial: {
      scale: 1,
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.08)",
    },
    hover: reduceMotion
      ? { scale: 1 }
      : {
          scale: 1.04,
          boxShadow: "0px 10px 18px rgba(0, 0, 0, 0.18)",
          transition: { duration: 0.25, ease: "easeOut" },
        },
    tap: reduceMotion
      ? { scale: 1 }
      : {
          scale: 0.98,
          transition: { duration: 0.12, ease: "easeOut" },
        },
  };

  const buttonVariants = {
    initial: { backgroundColor: "#000000" },
    hover: {
      backgroundColor: "rgba(0,0,0,0.8)",
      transition: { duration: 0.2 },
    },
    tap: { scale: reduceMotion ? 1 : 0.98 },
  };

  return (
    <motion.div
      role="region"
      aria-label={`${title} plan`}
      className="
        w-full
        w-sm
        sm:max-w-md
        lg:w-[350px] lg:max-w-none
        rounded-3xl border border-gray-200
        bg-white
        px-5 py-6
        sm:px-6 sm:py-7
        lg:px-6 lg:py-8
        flex flex-col
        shadow-sm
        focus-within:ring-2 focus-within:ring-black/10
      "
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
    >
      <div className="flex flex-col gap-4 sm:gap-5">
        <h3 className="font-bold text-2xl sm:text-3xl leading-tight">
          {title}
        </h3>

        {subtitle && (
          <p className="text-gray-800 font-semibold text-base sm:text-lg leading-snug">
            {subtitle}
          </p>
        )}

        {price && (
          <div className="text-gray-600 text-base sm:text-lg">
            <span className="font-bold">{price}</span>
          </div>
        )}

        {features.length > 0 && (
          <ul className="mt-1 grid gap-3">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start">
                <CheckCircle
                  className="shrink-0 mt-0.5 mr-2"
                  size={18}
                  color="#22c55e"
                />
                <span
                  className="text-sm sm:text-base text-black"
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {buttonText && (
        <motion.button
          type="button"
          className="
            mt-6
            w-full
            sm:w-full
            lg:w-64
            self-center
            bg-black text-white font-semibold
            text-sm sm:text-base
            py-3 px-6 rounded-full
            outline-none
            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black
          "
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          {buttonText}
        </motion.button>
      )}
    </motion.div>
  );
}
