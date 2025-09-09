import Dots from "@/app/components/animations/Dots";

export default function PlansLanding() {
  return (
    <div className={"w-full flex flex-col items-center justify-between"}>
      <div className={"lg:text-6xl md:text-5xl text-4xl text-white font-swiss font-black"}>
        The Finance Tracker Plans
      </div>
        <div className={"lg:mt-72"}>
            <Dots />
        </div>
    </div>
  );
}
