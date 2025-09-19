"use client";

import Image from "next/image";
import {motion, useInView} from "framer-motion";
import {useMemo, useRef} from "react";
import {Accordion, AccordionItem} from "@heroui/accordion";
import {CheckIcon} from "lucide-react";
import {CheckCircle} from "react-feather";

export default function HeroBanner({src, alt, title, subtitle, plans = []}) {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, {amount: 0.4, once: false});
    const planItems = useMemo(() => plans.filter(Boolean), [plans]);
    const imageSrc = src ?? "/london_small.jpg";
    const imageAlt = alt ?? "London skyline";

    const headingVariants = {
        hidden: {y: 24, opacity: 0},
        visible: {y: 0, opacity: 1, transition: {duration: 0.55, ease: "easeOut", delay: 0.05}}
    };

    const imageVariants = {
        hidden: {x: 32, opacity: 0},
        visible: {x: 0, opacity: 1, transition: {duration: 0.7, ease: "easeOut", delay: 0.15}}
    };

    const overlayVariants = {
        hidden: {opacity: 0, y: 28},
        visible: {opacity: 1, y: 0, transition: {duration: 0.55, ease: "easeOut", delay: 0.35}}
    };

    const planItemVariants = {
        hidden: {opacity: 0, y: 14},
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {duration: 0.4, ease: "easeOut", delay: 0.5 + i * 0.09}
        })
    };

    const itemClasses = {
        base: "group rounded-3xl bg-white p-4 transition-colors duration-300 hover:cursor-pointer",
        heading: "flex w-full items-center gap-3 py-3 hover:cursor-pointer",
        trigger: "flex flex-1 items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50 rounded-xl px-2 py-1 transition-colors data-[hover=true]:bg-white/10",
        title: "font-swiss text-base text-3xl font-semibold tracking-tight text-black transition-colors",
        subtitle: "text-md font-medium text-black/60 tracking-wide",
        indicator: "group-data-[open=true]:rotate-90 transition-transform duration-300",
        content: "md:text-base leading-relaxed text-black/90 [&_p]:mt-2 pb-6",
    }

    return (
        <motion.section
            ref={containerRef}
            className="overflow-hidden relative"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
        >
            <div
                className="mx-auto flex min-h-[26rem] w-full max-w-6xl flex-col gap-10 px-6 py-16 md:px-12 lg:flex-row lg:items-stretch lg:gap-14 lg:py-24">
                {/* Heading column (kept outside the picture) */}
                {title && (
                    <motion.div className="flex-1 flex flex-col" variants={headingVariants}>
                        <h2 className="font-swiss text-4xl font-semibold leading-tight text-black md:text-6xl self-start">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-black/85 md:text-lg drop-shadow">
                                {subtitle}
                            </p>
                        )}
                    </motion.div>
                )}

                <motion.div className="relative flex-1" variants={imageVariants}>
                    <div className="absolute inset-0 -translate-x-6 blur-3xl sm:-translate-x-10"/>
                    <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-black/40 group">
                        <Image
                            src={imageSrc}
                            alt={imageAlt}
                            width={720}
                            height={900}
                            priority={false}
                            className="h-full w-full object-cover transition-transform duration-[2500ms] ease-[cubic-bezier(.19,1,.22,1)] group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"/>

                        {(subtitle || planItems.length > 0) && (
                            <motion.div
                                variants={overlayVariants}
                                className="w-full pointer-events-none absolute inset-0 flex flex-col justify-start p-8 py-10 gap-5"
                            >
                                {planItems.length > 0 && (
                                    <motion.ul className="pointer-events-auto grid gap-4 hover:cursor-pointer"
                                               initial={false}
                                               animate="visible">
                                        <Accordion variant={"light"} itemClasses={itemClasses} hideIndicator showDivider={false}
                                                   className={"hover:cursor-pointer space-y-3"}>
                                            {planItems.map((plan, index) => (
                                                <AccordionItem
                                                    key={index}
                                                    subtitle={plan.description}
                                                    title={plan.name ?? plan.title}
                                                    className={"shadow-sm shadow-black/30 hover:shadow-md hover:shadow-black/40 transition-shadow"}
                                                >
                                                    <div className="text-black">
                                                        {plan.features ? (
                                                            plan.features.map((feature, i) => (
                                                                <p key={i} className={"text-xl flex flex-row items-center gap-2"}> <CheckCircle className={"text-green-500"}/> {feature}</p>
                                                            ))
                                                        ) : (
                                                            plan.description
                                                        )}
                                                        {
                                                            plan.button
                                                        }
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
