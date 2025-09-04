"use client";

export default function InfiniteMarquee() {

const logos = [
    { src: "/logos/robinHood.svg", alt: "RobinHood", text:"Subscriptions" },
    { src: "/logos/mastercard.svg", alt: "Mastercard", text:"Savings" },
    { src: "/logos/revolut.svg", alt: "Revolut", text:"Bank Accounts" },
    { src: "/logos/hbo.svg", alt: "HBO", text:"Investments" },
    { src: "/logos/netflix.svg", alt: "Netflix", text:"Subscriptions" },
    { src: "/logos/whoop.svg", alt: "Whoop", text:"Savings" },
    { src: "/logos/bankOfAmerica.svg", alt: "Bank of America", text:"Bank Accounts" },
];
  return (
      <div className={"bg-white h-screen"}>
      <div className={"flex bg-white flex-col justify-center items-center mt-28 gap-4"}>
        <span className={"text-5xl ml-22  font-swiss mt-36 self-start text-black font-extrabold"}>
         Everything, in one place.
        </span>
      </div>
    <div className="overflow-hidden relative w-full bg-white mt-36 py-6">
      <div className="flex flex-nowrap animate-marquee whitespace-nowrap">
        {logos.concat(logos, logos).map((logo, index) => (
          <div key={index} className="mx-2 w-48 flex flex-col items-center">
            <div className="text-black text-xl mb-2 font-extrabold text-center w-full">
              {logo.text}
            </div>
            <div className="h-44 flex items-center justify-center w-full">
              <img
                src={logo.src}
                alt={logo.alt}
                className={
                  ["HBO", "Mastercard", "Netflix", "Bank of America", "RobinHood"].includes(logo.alt)
                    ? "max-h-28 w-auto object-contain block"
                    : "max-h-full w-auto object-contain block"
                }
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
