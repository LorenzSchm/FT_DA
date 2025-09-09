"use client";

import NavBar from "@/app/components/navigation/NavBar";
import { ChevronDown, EyeOff } from "react-feather";
import NewYorkCard from "@/app/components/cards/new-york/NewYorkCard";
import CardView from "@/app/components/cards/CardView";
import Footer from "@/app/components/footer/Footer";
import LandingPage from "@/app/components/landing/LandingPage";
import InfiniteMarqueeView from "@/app/components/marquee/InfiniteMarqueeView";
import Dots from "@/app/components/animations/Dots";

export default function Home() {
  return (
    <div>
      <div
        className="w-full h-screen bg-cover bg-no-repeat overflow-hidden flex flex-col justify-between"
        style={{ backgroundImage: "url('/Updated_ny.jpg')" }}
      >
        <div>
          <NavBar />
        </div>
        <div>
          <LandingPage />
        </div>
        <div className={"mb-2"}>
          <Dots />
        </div>
      </div>
      <div>
        <CardView />
      </div>
      <div>
        <InfiniteMarqueeView />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}
