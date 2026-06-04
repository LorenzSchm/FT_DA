import FinancePreviewCard from "@/app/components/cards/FinancePreviewCard";

export default function ShanghaiCard() {
  const transactions = [
    {
      type: "Monthly Income",
      amount: "+$2,050.00",
      description: "Salary",
      colorCode: "text-green-300",
    },
    {
      type: "Monthly Subscription",
      amount: "-$14.99",
      description: "Netflix",
      colorCode: "text-red-300",
    },
    {
      type: "Dividend Payment",
      amount: "-+$210.54",
      description: "Stocks",
      colorCode: "text-green-300",
    },
    {
      type: "Freelance Income",
      amount: "+$850.00",
      description: "Max Weber",
      colorCode: "text-green-300",
    },
    {
      type: "Shopping",
      amount: "-$349.99",
      description: "Mr Porter",
      colorCode: "text-red-300",
    },
    {
      type: "Monthly Payment",
      amount: "-$950.00",
      description: "Rent",
      colorCode: "text-red-300",
    },
  ];

  return (
    <FinancePreviewCard
      accountName="Giro"
      balance="+$3049.09"
      backgroundImage="/shanghai_card.png"
      transactions={transactions}
    />
  );
}
