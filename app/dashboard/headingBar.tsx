import { Database, Tables } from "@/database.types";
import { Heading } from "../../components/heading";

type monthlyBudget = Tables<"monthly_budgets">;

export default function HeadingBar({
  monthlyBudget,
}: {
  monthlyBudget: monthlyBudget | null;
}) {
  const monthDate = new Date(`${monthlyBudget?.month}T00:00:00Z`);

  // Use Intl.DateTimeFormat with timeZone option set to UTC
  const month = new Intl.DateTimeFormat("default", {
    month: "long",
    timeZone: "UTC",
  }).format(monthDate);

  return (
    <div className="w-full border-b border-gray-400 md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <Heading
          level={2}
          className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
        >
          {month} 2024
        </Heading>
      </div>
      <Heading level={3} className="font-medium text-gray-500">
        ${monthlyBudget?.available} available
      </Heading>
    </div>
  );
}
