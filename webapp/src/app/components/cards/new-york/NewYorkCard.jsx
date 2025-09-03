import { ChevronDown, EyeOff } from "react-feather";

export default function NewYorkCard() {
  const transactionData = [
    {
      type: "Monthly Income",
      amount: "+$3,250.00",
      description: "Salary",
    },
    {
      type: "Monthly Subscription",
      amount: "-$59.99",
      description: "Internet",
    },
    {
      type: "Weekly Shopping",
      amount: "-$85.50",
      description: "Groceries",
    },
    {
      type: "Rental Income",
      amount: "+$850.00",
      description: "Property #2",
    },
    {
      type: "Monthly Payment",
      amount: "-$1,200.00",
      description: "Rent",
    },
    {
      type: "Dividend Payment",
      amount: "+$412.33",
      description: "Stocks",
    },
  ];

  return (
    <div
      className={
        "border border-2 border-white/50 rounded-4xl mt-10 p-4 flex flex-col gap-4"
      }
    >
      <div
        className={
          "bg-white/10 backdrop-blur-sm border border-2 border-white/30 rounded-3xl p-2"
        }
      >
        <div className={"flex flex-row items-center gap-2 justify-between"}>
          <div
            className={
              "text-white font-swiss font-bold text-2xl border-b border-white flex flex-row items-center"
            }
          >
            Giro
            <ChevronDown />
          </div>
          <div className={"text-white font-swiss font-bold text-2xl"}>
            <EyeOff />
          </div>
        </div>
        <div
          className={"text-white font-swiss font-bold text-xl flex flex-col"}
        >
          Balance:
          <span className={"text-green-300 text-3xl"}>+$6530.54</span>
        </div>
      </div>
      <div
        className={
          "bg-white/10 backdrop-blur-sm border border-2 border-white/30 rounded-3xl p-4 flex flex-col"
        }
      >
        <span className={"text-white font-swiss font-bold text-xl"}>
          Transactions:
        </span>
        <div>
          {transactionData.map((data, index) => (
            <div
              className={
                "flex flex-row items-start justify-between gap-4 text-white font-swiss font-medium text-lg"
              }
            >
              <div className={"flex flex-col items-start gap-2"}>
                <span>{data.description}</span>
                <span>{data.type}</span>
              </div>
              <span>{data.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
