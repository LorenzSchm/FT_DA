import FinancePreviewCard from "@/app/components/cards/FinancePreviewCard";

export default function NewYorkCard({ bg_visible = false }) {
  const transactions = [
    {
      type: "Monthly Income",
      amount: "+$3,250.00",
      description: "Salary",
      colorCode: "text-green-300",
    },
    {
      type: "Monthly Subscription",
      amount: "-$59.99",
      description: "Internet",
      colorCode: "text-red-300",
    },
    {
      type: "Weekly Shopping",
      amount: "-$85.50",
      description: "Groceries",
      colorCode: "text-red-300",
    },
    {
      type: "Rental Income",
      amount: "+$850.00",
      description: "Property #2",
      colorCode: "text-green-300",
    },
    {
      type: "Monthly Payment",
      amount: "-$1,200.00",
      description: "Rent",
      colorCode: "text-red-300",
    },
    {
      type: "Dividend Payment",
      amount: "+$412.33",
      description: "Stocks",
      colorCode: "text-green-300",
    },
  ];

  return (
    <FinancePreviewCard
      accountName="Giro"
      balance="+$6530.54"
      backgroundImage="/ny_card.png"
      showBackground={bg_visible}
      transactions={transactions}
    />
  );
}
