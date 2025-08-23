import NavBar from "@/app/components/navigation/NavBar";

export default function Home() {
  return (
    <div
      className="w-full h-screen bg-cover bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/Updated_ny.jpg')" }}
    >
      <div>
        <NavBar />
      </div>
    </div>
  );
}
