import React from "react";
import { CheckCircle } from "react-feather";

export default function PersonalCard() {
  const data = {
    title: "Personal",
    subtitle: "Essential features for personal use",
  };

  return (
    <div className="w-[350px] h-[530px] border-2 border-gray-200 rounded-[50px] px-6 pt-3 pb-8 flex flex-col justify-between">
      <div className="flex flex-col mt-6 gap-5">
        <div className="font-bold text-3xl">{data.title}</div>
        <div className="text-black font-bold text-lg">{data.subtitle}</div>

        <div className="text-gray-500 text-lg">
          <span className="font-bold">Free</span> (no credit card required)
        </div>

        <div className="flex text-base flex-col gap-3">
          <div className="flex items-start">
            <span className="text-green-500 h-3.5 mr-2">
              <CheckCircle />
            </span>
            <span className="text-gray-800">
              Track <span className="font-bold">unlimited</span> transactions
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 h-3.5 mr-2">
              <CheckCircle />
            </span>
            <span className="text-gray-800">
              <span className="font-bold">Connect</span> up to{" "}
              <span className="font-bold">2 bank accounts</span>
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 h-3.5 mr-2">
              <CheckCircle />
            </span>
            <span className="text-gray-800">
              Track <span className="font-bold">unlimited</span> subscriptions
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 h-3.5 mr-2">
              <CheckCircle />
            </span>
            <span className="text-gray-800">
              <span className="font-bold">Gain valuable</span> analytical{" "}
              <span className="font-bold">insights</span>
            </span>
          </div>
        </div>
      </div>

      <button className="bg-black text-white font-semibold w-64 self-center text-base py-3 px-6 rounded-full mb-6">
        Start for Free
      </button>
    </div>
  );
}
