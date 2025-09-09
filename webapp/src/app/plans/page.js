"use client";

import NavBar from "@/app/components/navigation/NavBar";
import Footer from "@/app/components/footer/Footer";
import PlansLanding from "@/app/components/plans/PlansLanding";
import PlansCardsView from "@/app/components/plans/cards/PlansCardsView";
import Dots from "@/app/components/animations/Dots";

export default function PlansPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Background image section */}
      <div
        className="w-full h-screen bg-cover bg-no-repeat flex flex-col justify-between relative"
        style={{ backgroundImage: "url('/london.jpg')" }}
      >
        <NavBar />
        <PlansLanding />
        <Dots />
      </div>

      {/* PlansCardsView section */}
      <div className="bg-white">
        <PlansCardsView />
      </div>

      {/* Footer section */}
      <div className="bg-white">
        <Footer />
      </div>
    </div>
  );
}
