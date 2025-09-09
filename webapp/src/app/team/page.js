"use client";

import NavBar from "@/app/components/navigation/NavBar";
import { useRef } from "react";
import { useInView } from "framer-motion";
import Dots from "@/app/components/animations/Dots";
import Footer from "@/app/components/footer/Footer";
import TeamPage from "@/app/components/team/TeamPage";

export default function Page() {

  return (
    <div>
      <div
        className="w-full h-screen bg-cover bg-no-repeat overflow-hidden"
        style={{ backgroundImage: "url('/shanghai.jpg')" }}
      >
        <NavBar />
        <div
          className={
            "mt-60 text-5xl lg:text-6xl font-swiss font-bold text-white flex items-center justify-center"
          }
        >
          The Finance Tracker Team
        </div>
          <div className={"lg:mt-72 mt-72"}>
              <Dots />
          </div>
      </div>
        <div>
            <TeamPage />
        </div>
        <div>
            <Footer />
        </div>
    </div>
  );
}
