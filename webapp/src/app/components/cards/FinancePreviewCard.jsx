import { ChevronDown, EyeOff } from "react-feather";

export default function FinancePreviewCard({
  accountName,
  balance,
  backgroundImage,
  showBackground = true,
  transactions,
}) {
  return (
    <div
      className={`w-[350px] rounded-[50px] p-5 flex flex-col gap-6 ${showBackground ? "" : "border-2 border-white/50"}`}
      style={
        showBackground
          ? {
              backgroundImage: `url('${backgroundImage}')`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }
          : {
              backgroundColor: "rgb(255,255,255,0.001)",
            }
      }
    >
      <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-4xl p-2 px-3 flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between">
          <div className="text-white font-swiss font-bold text-2xl border-b border-white flex flex-row items-center">
            {accountName}
            <ChevronDown size={20} />
          </div>
          <div className="text-white font-swiss font-bold text-lg">
            <EyeOff size={18} />
          </div>
        </div>
        <div className="text-white font-swiss font-bold text-xl flex flex-col">
          Balance:
          <span className="text-green-300 text-2xl">{balance}</span>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-4xl p-4 flex flex-col">
        <span className="text-white font-swiss font-bold text-xl">
          Transactions:
        </span>
        <div>
          {transactions.map((data, index) => (
            <div
              key={`${data.description}-${index}`}
              className="flex flex-row items-start justify-between gap-4 text-white font-swiss font-medium"
            >
              <div className="flex flex-col items-start">
                <span className="font-swiss font-bold text-lg">
                  {data.description}
                </span>
                <span className="font-swiss text-gray-300 text-sm">
                  {data.type}
                </span>
              </div>
              <span className={`${data.colorCode} font-bold text-lg`}>
                {data.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
