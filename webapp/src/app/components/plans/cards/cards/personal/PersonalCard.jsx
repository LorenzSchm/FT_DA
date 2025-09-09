import React from "react";
import Card from "../Card";

export default function PersonalCard() {
  const data = {
    title: "Personal",
    subtitle: "Essential features for personal use",
    price: "Free (no credit card required)",
    features: [
      "Track <span className='font-bold'>unlimited</span> transactions",
      "<span className='font-bold'>Connect</span> up to <span className='font-bold'>2 bank accounts</span>",
      "Track <span className='font-bold'>unlimited</span> subscriptions",
      "<span className='font-bold'>Gain valuable</span> analytical <span className='font-bold'>insights</span>",
    ],
    buttonText: "Start for Free",
  };

  return <Card {...data} />;
}