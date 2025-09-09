import PrivacyPolicyView from "@/app/components/privacy-policy/PrivacyPolicyView";

export default function Page() {
  return (
    <div
    className="w-full h-screen bg-cover bg-no-repeat"
      style={{ backgroundImage: "url('/franky.jpg')" }}
    >
      <PrivacyPolicyView />
    </div>
  );
}
