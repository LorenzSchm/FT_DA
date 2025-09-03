import NavBar from "@/app/components/navigation/NavBar";
import {ChevronDown, EyeOff} from "react-feather";
import NewYorkCard from "@/app/components/cards/new-york/NewYorkCard";

export default function Home() {
  return (
    <div
      className="w-full h-screen bg-cover bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/Updated_ny.jpg')" }}
    >
      <div>
        <NavBar />
      </div>
      <div className="mt-32 ml-32">
        <div>
          <h1 className="font-swiss text-white font-bold text-5xl">Finance Simplified</h1>
        </div>
        <div>
          <p className="text-white font-swiss font-medium">
            The Finance Tracker is a user-friendly mobile app that <br /> helps you
            manage your finances efficiently.
            With our <br />  platform, you can keep track of your income, expenses,<br /> and
            subscriptions.
          </p>
            <p className={"text-white font-swiss font-bold mt-2 text-3xl"}>
                All in one convenient place.
            </p>
        </div>
          <div className={"mt-6"}>
              <button
                  className="text-lg font-bold text-white px-5 py-1 rounded-3xl bg-white/10 backdrop-blur-sm border-2 border-solid border-white/50 hover:cursor-pointer hover:border-white/70"
                >
                  Start Saving
                </button>
          </div>
      </div>
        <div>
            <NewYorkCard />
        </div>
        <div className={"flex flex-col gap-2 justify-center items-center mt-72"}>
            <span className="inline-block w-2 h-2 bg-white rounded-full mx-1 transition-all duration-300 hover:w-5 hover:h-5" />
            <span className="inline-block w-3 h-3 bg-white rounded-full mx-1 transition-all duration-300 hover:w-5 hover:h-5" />
            <span className="inline-block w-4 h-4 bg-white rounded-full mx-1 transition-all duration-300 hover:w-5 hover:h-5" />
        </div>
    </div>
  );
}
