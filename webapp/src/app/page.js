"use client";

import CardView from "@/app/components/cards/CardView";
import LandingPage from "@/app/components/landing/LandingPage";
import InfiniteMarqueeView from "@/app/components/marquee/InfiniteMarqueeView";
import PlansCardsView from "@/app/components/plans/cards/PlansCardsView";
import TeamPage from "@/app/components/team/TeamPage";
import HeroBanner from "@/app/components/visuals/HeroBanner";

export default function Home() {
  return (
    <div className="bg-white overflow-hidden overflow-y-hidden">
      <section data-nav-theme="dark">
        <LandingPage />
      </section>

      <section>
        <CardView />
      </section>

      {/* Visual banner: Shanghai */}
      <HeroBanner
        src="/shanghai.jpg"
        alt="Shanghai skyline"
        title="Connect what matters"
        subtitle="Banks, cards, and services—all in one app"
      />

      <section>
        <InfiniteMarqueeView />
      </section>

      {/* Visual banner: London */}
      <HeroBanner
        src="/london.jpg"
        alt="London cityscape"
        title="Plans that grow with you"
        subtitle="From personal to pro—choose the features you need"
      />

      <section>
        <PlansCardsView />
      </section>

      <section>
        <TeamPage />
      </section>
    </div>
  );
}
