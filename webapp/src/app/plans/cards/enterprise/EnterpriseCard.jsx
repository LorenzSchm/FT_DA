import { CheckCircle } from "react-feather";
import React from "react";

export default function EnterpriseCard() {
  const data = {
    title: "Enterprise",
    subtitle: "Scalable solutions for large organizations",
  };

  return (
    <div className="w-[350px] h-[530px] border-2 border-gray-200 rounded-[50px] px-6 pt-3 pb-8 flex flex-col justify-between">
      <div className="flex flex-col mt-6 gap-5">
        <div className="font-bold text-3xl">{data.title}</div>
        <div className="text-black font-bold text-lg">{data.subtitle}</div>

        <div className="text-gray-500 text-lg">
          <span className="font-bold">Custom</span>
        </div>

        <div className="flex text-base flex-col gap-3">
          <div className="flex items-start">
            <span className="text-green-500 h-3.5 mr-2">
              <CheckCircle />
            </span>
            <span className="text-gray-800">
              <span className="font-bold">Everything from Pro</span>
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 h-3.5 mr-2">
              <CheckCircle />
            </span>
            <span className="text-gray-800">
              <span className="font-bold">Connect unlimited bank accounts</span>
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 h-3.5 mr-2">
              <CheckCircle />
            </span>
            <span className="text-gray-800">
              <span className="font-bold">Priority support</span>
            </span>
          </div>
        </div>
      </div>

      <button className="bg-black text-white font-semibold w-64 self-center text-base py-3 px-6 rounded-full mb-6">
        Contact us
      </button>
    </div>
  );
}
