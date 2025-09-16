import PrivacyPolicyView from "@/app/components/privacy-policy/PrivacyPolicyView";
import BackgroundImageLoader from "@/app/components/preloading/BackgroundImageLoader";

export default function Page() {
  return (
    <BackgroundImageLoader
      imageUrl={"/franky.jpg"}
    >
      <PrivacyPolicyView />
    </BackgroundImageLoader>
  );
}
