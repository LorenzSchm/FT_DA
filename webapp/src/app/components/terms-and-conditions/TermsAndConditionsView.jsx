"use client";

import Dots from "@/app/components/animations/Dots";
import TermsAndConditionsTextView from "@/app/components/terms-and-conditions/text/TermsAndConditionsTextView";
import BackgroundImageLoader from "@/app/components/preloading/BackgroundImageLoader";

export default function TermsAndConditionsView() {
  return (
    <div className="flex flex-col">
      <BackgroundImageLoader imageUrl={"/franky.jpg"}>
        <section className="relative flex h-screen flex-col justify-between overflow-hidden px-4 pb-12 pt-20 text-white">
          <div className="relative flex flex-1 items-center justify-center text-center">
            <h1 className="text-4xl font-swiss font-bold drop-shadow lg:text-5xl">
              Terms and Conditions
            </h1>
          </div>
          <div className="relative flex justify-center">
            <Dots className="mt-0 lg:mt-0" />
          </div>
        </section>
      </BackgroundImageLoader>
      <section className=" bg-white/90 py-16">
        <TermsAndConditionsTextView />
      </section>
    </div>
  );
}
