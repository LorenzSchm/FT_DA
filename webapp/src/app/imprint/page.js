import NavBar from "@/app/components/navigation/NavBar";
import ImprintView from "@/app/components/imprint/ImprintView";

export default function Page() {
  return (
    <div
    className="w-full h-screen bg-cover bg-no-repeat"
      style={{ backgroundImage: "url('/hongkong.jpg')" }}
    >
      <ImprintView />
    </div>
  );
}
