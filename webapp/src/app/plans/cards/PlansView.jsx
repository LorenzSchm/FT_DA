"use client"
import PersonalCard from "@/app/plans/cards/personal/PersonalCard";
import EnterpriseCard from "@/app/plans/cards/enterprise/EnterpriseCard";
import ProCard from "@/app/plans/cards/pro/ProCard";
export default function PlansView() {
    return (
        <div className={"flex flex-col justify-center items-center"}>
        <div className={"text-6xl text-black font-swiss font-black"}>
                Choose your plan
        </div>
        <div className={"flex justify-center items-center h-screen w-screen bg-white"}>
            <div>
                <ProCard />
            </div>
            <div>
               <PersonalCard />
            </div>
            <div>
               <EnterpriseCard />
            </div>
        </div>
        </div>
    );
}