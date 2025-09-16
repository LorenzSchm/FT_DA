import ImprintView from "@/app/components/imprint/ImprintView";
import BackgroundImageLoader from "@/app/components/preloading/BackgroundImageLoader";

export default function Page() {
  return (
    <BackgroundImageLoader imageUrl={"/hongkong.jpg"}>
      <ImprintView />
    </BackgroundImageLoader>
  );
}
