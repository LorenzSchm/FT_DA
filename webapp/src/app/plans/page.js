"use client"

import NavBar from "@/app/components/navigation/NavBar";
import Footer from "@/app/components/footer/Footer";
import PlansLanding from "@/app/components/plans/PlansLanding";
import PlansCardsView from "@/app/components/plans/cards/PlansCardsView";

export default function PlansPage() {
    return (
        <div
            className="w-full h-screen bg-cover bg-no-repeat"
            style={{backgroundImage: "url('/london.jpg')"}}
        >
            <div className={"h-full"}>
                <div>
                    <NavBar/>
                </div>
                <div className={"mt-64"}>
                    <PlansLanding/>
                </div>
            </div>
            <div>
                <PlansCardsView />
            </div>
            <div>
                <Footer/>
            </div>
        </div>
    );
}
