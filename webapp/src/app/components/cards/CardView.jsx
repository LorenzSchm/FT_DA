import Image from "next/image";

export default function CardView() {
    const cards = [
        {},
        {},
        {},
    ]
  return (
      <div className={"h-screen w-screen bg-white"}>
          <div className={"flex flex-col justify-center items-center mt-28 gap-4"}>
              <Image src={"/icon.svg"} width={100} height={100}/>
              <span className={"text-5xl font-swiss font-bold"}>Track everything. Everywhere.</span>
          </div>
          <div>

          </div>
      </div>
  );
}
