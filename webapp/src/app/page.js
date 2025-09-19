"use client";

import CardView from "@/app/components/cards/CardView";
import LandingPage from "@/app/components/landing/LandingPage";
import InfiniteMarqueeView from "@/app/components/marquee/InfiniteMarqueeView";
import PlansCardsView from "@/app/components/plans/cards/PlansCardsView";
import TeamPage from "@/app/components/team/TeamPage";
import HeroBanner from "@/app/components/visuals/HeroBanner";

export default function Home() {

    const getAppButton = (
        <button
            className="text-white bg-black mt-4 p-3 rounded-2xl font-swiss font-bold hover:cursor-pointer hover:scale-105 hover:bg-black/90 shadow-2xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        >
            Get the App
        </button>
    )

    const contactButton = (
        <div className="flex flex-row gap-2"></div>
    )

    const planHighlights = [
        {
            name: "Personal",
            price: "Free",
            description: "Essential features for personal use.",
            features: [
                "Track unlimited transactions",
                "Connect up to 2 bank accounts",
                "Track unlimited subscriptions",
                "Gain valuable analytical insights",
            ],
            button: getAppButton
        },
        {
            name: "Pro",
            price: "$12/mo",
            description: "Automate analytics and share smart reports.",
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "Scalable solutions for large organizations.",
            features: [
                "Everything from Pro",
                "Connect unlimited bank accounts",
                "Priority Support",
            ],
            button: contactButton
        },
    ]
    return (
        <div className="bg-white overflow-hidden overflow-y-hidden">
            <section data-nav-theme="dark">
                <LandingPage/>
            </section>

            <section>
                <CardView/>
            </section>

            <section>
                <InfiniteMarqueeView/>
            </section>

            <section
                id={"plans"}
            >
                <HeroBanner
                    src="/london_small.jpg"
                    alt="London cityscape"
                    title="Plans that grow with you"
                    subtitle="From personal to pro—choose the features you need"
                    plans={planHighlights}
                />
            </section>


            <section>
                <TeamPage/>
            </section>
        </div>
    );
}
