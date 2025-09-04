import {ChevronDown, EyeOff} from "react-feather";

export default function LondonCard() {
    const transactionData = [
    {
      type: "Monthly Income",
      amount: "+$100.00",
      description: "Pocket Money",
      colorCode: "text-green-300",
    },
    {
      type: "Monthly Subscription",
      amount: "-$24.99",
      description: "Open AI",
      colorCode: "text-red-300",
    },
    {
      type: "Shopping",
      amount: "-$85.50",
      description: "Foot Locker",
      colorCode: "text-red-300",
    },
    {
      type: "Monthly Income",
      amount: "+$500.00",
      description: "Salary",
      colorCode: "text-green-300",
    },
    {
      type: "Shopping",
      amount: "-$120.00",
      description: "H&M",
      colorCode: "text-red-300",
    },
    {
      type: "Birthday Present",
      amount: "+$400.00",
      description: "Karen Smith",
      colorCode: "text-green-300",
    },
  ];

  return (
    <div
      className={
        "w-[350px] rounded-[50px] p-5 flex flex-col gap-6"
      }
      style={{
        backgroundImage: "url('/london_card.png')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div
        className={
          "bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-4xl p-2 px-3 flex flex-col gap-2"
        }
      >
        <div className={"flex flex-row items-center justify-between"}>
          <div
            className={
              "text-white font-swiss font-bold text-2xl border-b border-white flex flex-row items-center"
            }
          >
            Youth
            <ChevronDown size={20} />
          </div>
          <div className={"text-white font-swiss font-bold text-lg"}>
            <EyeOff size={18} />
          </div>
        </div>
        <div
          className={"text-white font-swiss font-bold text-xl flex flex-col"}
        >
          Balance:
          <span className={"text-green-300 text-2xl"}>+$430.72</span>
        </div>
      </div>
      <div
        className={
          "bg-white/10 backdrop-blur-sm border border-2 border-white/30 rounded-4xl p-4 flex flex-col"
        }
      >
        <span className={"text-white font-swiss font-bold text-xl"}>
          Transactions:
        </span>
        <div>
          {transactionData.map((data, index) => (
            <div
              className={
                "flex flex-row items-start justify-between gap-4 text-white font-swiss font-medium"
              }
            >
              <div className={"flex flex-col items-start"}>
                <span className={"font-swiss font-bold text-lg"}>
                  {data.description}
                </span>
                <span className={"font-swiss text-gray-300 text-sm"}>
                  {data.type}
                </span>
              </div>
              <span className={data.colorCode + " font-bold text-lg"}>
                {data.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}