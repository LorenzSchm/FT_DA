import React from "react";
import { CheckCircle } from "react-feather";

export default function ProCard() {
  const data = {
    title: "TBA",
  };

  return (
    <div className="w-[350px] h-[530px] border-2 border-gray-200 rounded-[50px] px-6 pt-3 pb-8 flex flex-col justify-between">
      <div className="flex flex-col mt-6 gap-5">
        <div className="font-bold text-3xl">{data.title}</div>
      </div>
    </div>
  );
}
