import NavBar from "@/app/components/navigation/NavBar";
import Landing from "@/app/plans/Landing";
import PlansView from "@/app/plans/cards/PlansView";
import Footer from "@/app/components/footer/Footer";
export default function PlansPage() {
  return (
    <div
      className="w-full h-screen bg-cover bg-no-repeat"
      style={{ backgroundImage: "url('/london.jpg')" }}
    >
      <div>
        <NavBar />
      </div>
      <div className={"flex justify-center items-center h-screen w-screen"}>
        <Landing />
      </div>
      <div>
        <PlansView />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}
