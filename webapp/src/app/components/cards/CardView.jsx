import Image from "next/image";
import ShanghaiCard from "@/app/components/cards/shanghai/ShanghaiCard";
import LondonCard from "@/app/components/cards/london/LondonCard";
import NewYorkCard from "@/app/components/cards/new-york/NewYorkCard";

export default function CardView() {
  const cards = [{}, {}, {}];
  return (
    <div className={"h-full w-screen bg-white"}>
      <div className={"flex flex-col justify-center items-center mt-28 gap-4"}>
        <Image src={"/icon.svg"} width={100} height={100} />
        <span className={"lg:text-5xl text-3xl font-swiss font-bold"}>
          Track everything. Everywhere.
        </span>
      </div>
      <div className={"w-full flex flex-row gap-10 justify-center mt-10"}>
        <div className={"hidden xl:block mt-12"}>
          <LondonCard />
        </div>
        <div>
          <NewYorkCard bg_visible={true} />
        </div>
        <div className={"hidden xl:block mt-12"}>
          <ShanghaiCard />
        </div>
      </div>
    </div>
  );
}
