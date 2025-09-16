"use client";

import Dots from "@/app/components/animations/Dots";
import PrivacyPolicyTextView from "@/app/components/privacy-policy/text/PrivacyPolicyTextView";

export default function PrivacyPolicyView() {
  return (
    <div>
      <div className={"h-screen flex flex-col justify-between"}>
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
    </div>
  );
}
