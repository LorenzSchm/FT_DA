import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function TeamPage() {
  const members = [
    {
      name: "Loreine Maly",
      role: "Developer",
    },
    {
      name: "Lorenz Schmidt",
      role: "Product Owner & Lead Developer",
    },
    {
      name: "Philipp Seytter",
      role: "Developer",
    },
    {
      name: "Anne Mieke Vincken",
      role: "Scrum Master & Public Relations",
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
      className="min-h-screen flex flex-col items-center p-8 bg-white"
    >
      <motion.img
        src="/tealPhoto.png"
        alt="Team"
        className="w-full max-w-6xl object-cover rounded-lg mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-6xl">
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
            <span className="font-swiss font-bold text-lg text-black whitespace-nowrap">
              {member.name}
            </span>
            <span className="text-gray-600 whitespace-nowrap">{member.role}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
