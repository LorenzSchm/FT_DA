"use client";

import Dots from "@/app/components/animations/Dots";
import PrivacyPolicyTextView from "@/app/components/privacy-policy/text/PrivacyPolicyTextView";
import BackgroundImageLoader from "@/app/components/preloading/BackgroundImageLoader";

export default function PrivacyPolicyView() {
    return (
        <div className="flex flex-col">
            <BackgroundImageLoader imageUrl={"/franky.jpg"}>
                <section
                    className="relative flex h-screen flex-col justify-between overflow-hidden px-4 pb-12 pt-20 text-white">
                    <div className="relative flex flex-1 items-center justify-center text-center">
                        <h1 className="text-4xl font-swiss font-bold drop-shadow lg:text-5xl">
                            Privacy Policy
                        </h1>
                    </div>
                    <div className="relative flex justify-center">
                        <Dots className="mt-0 lg:mt-0"/>
                    </div>
                </section>
            </BackgroundImageLoader>
            <section className=" bg-white/90 py-16">
                <PrivacyPolicyTextView/>
            </section>
        </div>
    );
}
