"use client";

import Dots from "@/app/components/animations/Dots";
import ImprintTextView from "@/app/components/imprint/text/ImprintTextView";
import BackgroundImageLoader from "@/app/components/preloading/BackgroundImageLoader";

export default function ImprintView() {
  return (
    <div className="flex flex-col min-h-screen">
      <BackgroundImageLoader imageUrl={"/hongkong.jpg"}>
        <section className="relative flex h-screen flex-col justify-between overflow-hidden px-4 pb-12 pt-20 text-white">
          <div className="relative flex flex-1 items-center justify-center text-center">
            <h1 className="text-4xl font-swiss font-bold drop-shadow lg:text-5xl">
              Imprint
            </h1>
          </div>
          <div className="relative flex justify-center">
            <Dots className="mt-0 lg:mt-0" />
          </div>
        </section>
      </BackgroundImageLoader>
      <section className=" py-16">
        <ImprintTextView />
      </section>
    </div>
  );
}
