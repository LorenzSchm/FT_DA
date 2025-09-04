import Image from "next/image";
import ShanghaiCard from "@/app/components/cards/shanghai/ShanghaiCard";
import LondonCard from "@/app/components/cards/london/LondonCard";
import NewYorkCard from "@/app/components/cards/new-york/NewYorkCard";

export default function CardView() {
    const cards = [{}, {}, {}];
    return (
        <div className={"h-full w-screen bg-white"}>
            <div className={"flex flex-col justify-center items-center mt-28 gap-4"}>
                <Image src={"/icon.svg"} width={100} height={100}/>
                <span className={"text-5xl font-swiss font-bold"}>
                  Track everything. Everywhere.
                </span>
            </div>
            <div>
                <LondonCard/>
            </div>
            <div>
                <NewYorkCard bg_visible={true}/>
            </div>
            <div>
                <ShanghaiCard/>
            </div>
        </div>
    );
}
