import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function TeamPage() {
  const members = [
    {
      name: "Lorenz Schmidt",
      role: "Product Owner & Lead Developer",
    },
    {
      name: "Anne Mieke Vincken",
      role: "Scrum Master & Public Relations",
    },
    {
      name: "Philipp Seytter",
      role: "Developer",
    },
    {
      name: "Loreine Maly",
      role: "Developer",
    },
  ];

  const cardVariants = {
    hidden: (index) => ({
      opacity: 0,
      x: index % 2 === 0 ? -100 : 100,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.2 }); // Trigger when 20% of container is visible, no 'once' option

  return (
    <div
      ref={containerRef}
      id="team"
      className="min-h-screen grid grid-cols-1 sm:grid-cols-2 gap-4 p-8 bg-white"
    >
      {members.map((member, index) => (
        <motion.div
          key={index}
          className="flex flex-col gap-2 justify-center items-center p-6 bg-white rounded-lg shadow-md hover:cursor-pointer transition-transform duration-300"
          variants={cardVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          whileHover="hover"
          custom={index}
        >
          <span className="font-swiss font-bold text-lg text-black">
            {member.name}
          </span>
          <span className="text-gray-600 ">{member.role}</span>
        </motion.div>
      ))}
    </div>
  );
}
