import FinancePreviewCard from "@/app/components/cards/FinancePreviewCard";

export default function LondonCard() {
  const transactions = [
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
    <FinancePreviewCard
      accountName="Youth"
      balance="+$430.72"
      backgroundImage="/london_card.png"
      transactions={transactions}
    />
  );
}
