"use client";

import Dots from "@/app/components/animations/Dots";
import ImprintTextView from "@/app/components/imprint/text/ImprintTextView";

export default function ImprintView() {
  return (
    <div>
      <div className={"h-screen flex flex-col justify-between"}>
        <div className={"w-full h-full flex items-center justify-center"}>
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
    </div>
  );
}
