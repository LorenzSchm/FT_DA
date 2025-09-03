import NavBar from "@/app/components/navigation/NavBar";

export default function PlansPage() {
  return (
    <div
      className="w-full h-screen bg-cover bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/london.jpg')" }}
    >
      <NavBar />
    </div>
  );
}
