import React from "react";
import Card from "../Card";

export default function ProCard() {
  const data = {
    title: "Pro",
    subtitle: "T.B.A.",
  };

  return <Card {...data} />;
}