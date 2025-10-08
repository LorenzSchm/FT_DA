"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useMemo, useRef } from "react";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { CheckCircle } from "react-feather";

export default function HeroBanner({ src, alt, title, subtitle, plans = [] }) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.4, once: false });
  const planItems = useMemo(() => plans.filter(Boolean), [plans]);
  const imageSrc = src ?? "/london_small.jpg";
  const imageAlt = alt ?? "London skyline";

  const headingVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.55, ease: "easeOut", delay: 0.05 },
    },
  };

  const imageVariants = {
    hidden: { x: 32, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut", delay: 0.15 },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut", delay: 0.35 },
    },
  };

  const itemClasses = {
    base: "group rounded-3xl bg-white p-2 md:p-4 lg:p-4 transition-colors duration-300 hover:cursor-pointer",
    heading: "flex w-full items-center gap-3 py-2 hover:cursor-pointer",
    trigger:
      "flex flex-1 items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50 rounded-xl px-2 py-1 transition-colors data-[hover=true]:bg-white/10 hover:cursor-pointer",
    title:
      "font-swiss text-base text-xl md:text-3xl lg:text-3xl font-semibold tracking-tight text-black transition-colors",
    subtitle: "text-sm lg:text-md font-medium text-black/60 tracking-wide",
    indicator:
      "group-data-[open=true]:rotate-90 transition-transform duration-300",
    content: "md:text-base text-sm leading-relaxed text-black/90 [&_p]:mt-1 overflow-visible",
  };

  return (
    <motion.section
      ref={containerRef}
      className="relative overflow-hidden"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-10 px-6 py-16 md:px-12 lg:flex-row lg:items-stretch lg:gap-14 lg:py-24">
        {title && (
          <motion.div
            className="flex-1 flex flex-col"
            variants={headingVariants}
          >
            <h2 className="font-swiss text-4xl font-semibold leading-tight text-black md:text-6xl self-start">
              {title}
            </h2>
            {subtitle && (
              <p className="text-black/85 md:text-lg drop-shadow">{subtitle}</p>
            )}
          </motion.div>
        )}

        <motion.div className="relative flex-1 min-h-[400px] md:min-h-[700px] lg:min-h-[700px]" variants={imageVariants}>
          <div className="relative h-[600px] rounded-4xl shadow-2xl shadow-black/40">
            <Image src={imageSrc} alt={imageAlt} fill priority className="object-cover rounded-4xl" />

            <div className="absolute inset-0 rounded-4xl bg-gradient-to-t from-black/70 via-black/30 to-transparent hover:cursor-pointer" />

            {(subtitle || planItems.length > 0) && (
              <motion.div
                variants={overlayVariants}
                className="w-full pointer-events-none absolute inset-0 flex flex-col justify-start p-2 py-4 gap-5 overflow-y-hidden"
              >
                {planItems.length > 0 && (
                  <motion.ul
                    className="pointer-events-auto grid gap-4 hover:cursor-pointer"
                    initial={false}
                    animate="visible"
                  >
                    <Accordion
                      variant={"light"}
                      itemClasses={itemClasses}
                      hideIndicator
                      showDivider={false}
                      className={"hover:cursor-pointer space-y-3"}
                    >
                      {planItems.map((plan, index) => (
                        <AccordionItem
                          key={index}
                          subtitle={plan.description}
                          title={plan.name ?? plan.title}
                          className={
                            "shadow-sm shadow-black/30 hover:shadow-md hover:shadow-black/40 transition-shadow"
                          }
                        >
                          <div className="text-black">
                            {plan.features
                              ? plan.features.map((feature, i) => (
                                  <p
                                    key={i}
                                    className={
                                      "text-sm md:text-xl lg:text-xl flex flex-row items-center gap-2"
                                    }
                                  >
                                    <CheckCircle
                                      className={"text-green-500 w-4 h-4"}
                                    />
                                    {feature}
                                  </p>
                                ))
                              : plan.description}
                            {plan.button}
                          </div>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </motion.ul>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}