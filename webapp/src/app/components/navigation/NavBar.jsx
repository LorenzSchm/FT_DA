export default function NavBar() {
    return (
        <div className="w-full bg-gradient-to-b from-[#B7B7B7] to-transparent flex flex-row justify-between items-center">
            <div className={"p-4 flex flex-row items-center  gap-2"}>
                <img src="/icon.svg" alt="logo" width={25}/>
                <h1 className={"text-white font-bold text-3xl"}>Finance Tracker</h1>
            </div>
            <div className="flex flex-row items-center h-fit pl-3 pr-3 gap-6 m-4 text-white font-bold bg-white/5 backdrop-blur-md border border-white/30 rounded-3xl">
                <div>
                    About
                </div>
                <div>
                    Plans
                </div>
                <div>
                    The Team
                </div>
            </div>
        </div>
    )
}