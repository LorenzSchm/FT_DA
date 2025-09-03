import { ChevronDown, EyeOff } from "react-feather";

export default function NewYorkCard() {
  const transactionData = [
    {
      type: "Monthly Income",
      amount: "+$3,250.00",
      description: "Salary",
      colorCode: "text-green-300"
    },
    {
      type: "Monthly Subscription",
      amount: "-$59.99",
      description: "Internet",
      colorCode: "text-red-300"
    },
    {
      type: "Weekly Shopping",
      amount: "-$85.50",
      description: "Groceries",
      colorCode: "text-red-300"
    },
    {
      type: "Rental Income",
      amount: "+$850.00",
      description: "Property #2",
      colorCode: "text-green-300"
    },
    {
      type: "Monthly Payment",
      amount: "-$1,200.00",
      description: "Rent",
      colorCode: "text-red-300"
    },
    {
      type: "Dividend Payment",
      amount: "+$412.33",
      description: "Stocks",
      colorCode: "text-green-300"
    },
  ];

  return (
    <div
      className={
        "border border-2 border-white/50 rounded-[50px] p-5 flex flex-col gap-6"
      }
    >
      <div
        className={
          "bg-white/10 backdrop-blur-sm border border-2 border-white/30 rounded-4xl p-2 px-3 flex flex-col gap-2"
        }
      >
        <div className={"flex flex-row items-center justify-between"}>
          <div
            className={
              "text-white font-swiss font-bold text-2xl border-b border-white flex flex-row items-center"
            }
          >
            Giro
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
          <span className={"text-green-300 text-2xl"}>+$6530.54</span>
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
                <span className={"font-swiss font-bold text-lg"}>{data.description}</span>
                <span className={"font-swiss text-gray-300 text-sm"}>{data.type}</span>
              </div>
              <span className={data.colorCode+" font-bold text-lg"}>{data.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
