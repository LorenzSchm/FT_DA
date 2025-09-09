import React from "react";
import Card from "../Card";

export default function EnterpriseCard() {
  const data = {
    title: "Enterprise",
    subtitle: "Scalable solutions for large organizations",
    price: "Custom",
    features: [
      "<span className='font-bold'>Everything from Pro</span>",
      "<span className='font-bold'>Connect unlimited bank accounts</span>",
      "<span className='font-bold'>Priority support</span>",
    ],
    buttonText: "Contact us",
  };

  return <Card {...data} />;
}