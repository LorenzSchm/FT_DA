import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function TeamPage() {
  const members = [
    {
      name: "Loreine Maly",
      role: "Developer",
      focus: "Mobile experience",
    },
    {
      name: "Lorenz Schmidt",
      role: "Product Owner & Lead Developer",
      focus: "Product and full-stack",
    },
    {
      name: "Philipp Seytter",
      role: "Developer",
      focus: "Backend systems",
    },
    {
      name: "Anne Mieke Vincken",
      role: "Scrum Master & Public Relations",
      focus: "Delivery and communication",
    },
  ];

  const cardVariants = {
    hidden: (index) => ({
      opacity: 0,
      y: 24,
    }),
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: "easeOut",
      },
    },
  };

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={containerRef}
      className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="space-y-6"
        >
          <span className="font-swiss text-sm font-bold uppercase text-black/50">
            The Team
          </span>
          <div className="space-y-4">
            <h2 className="font-swiss text-4xl font-bold leading-tight text-black lg:text-6xl">
              Built by a focused product team
            </h2>
            <p className="max-w-xl font-swiss text-lg leading-8 text-black/65">
              We combine product, engineering, delivery, and communication into
              one compact team building Finance Tracker end to end.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <p className="font-swiss text-3xl font-bold text-black">4</p>
              <p className="font-swiss text-sm font-bold uppercase text-black/45">
                Members
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <p className="font-swiss text-3xl font-bold text-black">1</p>
              <p className="font-swiss text-sm font-bold uppercase text-black/45">
                Shared product
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
          className="grid gap-4"
        >
          <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] bg-black shadow-2xl shadow-black/15">
            <Image
              src="/tealPhoto.png"
              alt="Finance Tracker team"
              fill
              sizes="(max-width: 1024px) 100vw, 720px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-swiss text-xs font-bold uppercase text-white/60">
                  Collaboration
                </p>
                <p className="font-swiss text-2xl font-bold text-white">
                  Product, design, and engineering together
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {members.map((member, index) => (
              <motion.div
                key={member.name}
                className="group rounded-2xl border border-black/10 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-black/20 hover:shadow-lg"
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                custom={index}
              >
                <div className="flex items-start gap-3">
                  <span className="min-w-0">
                    <span className="block font-swiss text-lg font-bold text-black">
                      {member.name}
                    </span>
                    <span className="block font-swiss text-sm font-bold text-black/50">
                      {member.role}
                    </span>
                    <span className="mt-3 block rounded-full bg-black/[0.04] px-3 py-1 font-swiss text-xs font-bold uppercase text-black/50">
                      {member.focus}
                    </span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
