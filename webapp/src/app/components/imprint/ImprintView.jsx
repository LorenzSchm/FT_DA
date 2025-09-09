"use client";

import NavBar from "@/app/components/navigation/NavBar";
import Dots from "@/app/components/animations/Dots";
import ImprintTextView from "@/app/components/imprint/text/ImprintTextView";
import Footer from "@/app/components/footer/Footer";

export default function ImprintView() {
  return (
    <div>
      <div
        style={{ backgroundImage: "/hongkong.jpg" }}
        className={"h-screen flex flex-col justify-between"}
      >
        <NavBar />
        <div className={"w-full flex items-center justify-center"}>
          <h1 className={"text-white text-5xl font-swiss font-bold"}>
            Imprint
          </h1>
        </div>
        <div className={"mb-2"}>
          <Dots />
        </div>
      </div>
      <div className={"h-screen mt-20"}>
        <ImprintTextView />
      </div>
      <Footer />
    </div>
  );
}
