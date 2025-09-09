import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function Dots() {
  const dotsRef = useRef(null);
  const isDotsInView = useInView(dotsRef, { once: false, amount: 0.1 });

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
        }
    ),
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
    <div
      ref={dotsRef}
      className="flex flex-col gap-2 justify-center items-center mt-80 lg:mt-10"
    >
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className={`inline-block ${
            index === 0 ? "w-2 h-2" : index === 1 ? "w-3 h-3" : "w-4 h-4"
          } bg-white rounded-full mx-1`}
          custom={index}
          initial="hidden"
          animate={isDotsInView ? "visible" : "hidden"}
          whileHover="hover"
          whileTap="hover"
          variants={dotVariants}
        />
      ))}
    </div>
  );
}