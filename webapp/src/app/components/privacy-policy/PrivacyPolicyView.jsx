"use client";

import NavBar from "@/app/components/navigation/NavBar";
import Dots from "@/app/components/animations/Dots";
import ImprintTextView from "@/app/components/imprint/text/ImprintTextView";
import Footer from "@/app/components/footer/Footer";
import PrivacyPolicyTextView from "@/app/components/privacy-policy/text/PrivacyPolicyTextView";

export default function PrivacyPolicyView() {
  return (
    <div>
      <div
        style={{ backgroundImage: "/hongkong.jpg" }}
        className={"h-screen flex flex-col justify-between"}
      >
        <NavBar />
        <div className={"w-full flex items-center justify-center"}>
          <h1 className={"text-white text-5xl font-swiss font-bold"}>
            Privacy Policy
          </h1>
        </div>
        <div className={"mb-2"}>
          <Dots />
        </div>
      </div>
      <div className={"h-fit mt-20"}>
        <PrivacyPolicyTextView />
      </div>
      <Footer />
    </div>
  );
}
