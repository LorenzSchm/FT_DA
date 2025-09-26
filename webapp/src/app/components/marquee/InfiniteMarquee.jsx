"use client";

import Image from "next/image";

export default function InfiniteMarquee() {
  const logos = [
    { src: "/logos/robinHood.png", alt: "RobinHood", text: "Investments" },
    { src: "/logos/mastercard.svg", alt: "Mastercard", text: "Savings" },
    { src: "/logos/revolut.svg", alt: "Revolut", text: "Bank Accounts" },
    { src: "/logos/hbo.svg", alt: "HBO", text: "Subscriptions" },
    { src: "/logos/netflix.svg", alt: "Netflix", text: "Subscriptions" },
    { src: "/logos/whoop.svg", alt: "Whoop", text: "Subscriptions" },
    {
      src: "/logos/bankOfAmerica.svg",
      alt: "Bank of America",
      text: "Bank Accounts",
    },
    {
      src: "/logos/tr.svg",
      alt: "Trade Republic",
      text: "Savings",
    },
  ];

  const track = [...logos, ...logos, ...logos];

  return (
    <div className="bg-white h-screen">
      <div className="flex bg-white flex-col justify-center items-center gap-4">
        <span className="lg:text-6xl text-5xl ml-10 font-swiss mt-28 self-start text-black font-bold">
          All in one app.
        </span>
      </div>

      <div className="overflow-hidden relative w-full bg-white mt-36 py-6">
        <div className="animate-marquee">
          {track.map((logo, index) => (
            <div
              key={`${logo.alt}-${index}`}
              className="mx-6 w-48 flex flex-col items-center flex-shrink-0"
            >
              <div className="text-black text-xl mb-2 font-extrabold text-center w-full">
                {logo.text}
              </div>
              <div className="h-44 flex items-center justify-center w-full">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  height={100}
                  width={100}
                  className="max-h-28 w-auto object-contain block"
                />
              </div>
              <div className="text-black text-xl mt-2 font-extrabold text-center w-full">
                {logo.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
