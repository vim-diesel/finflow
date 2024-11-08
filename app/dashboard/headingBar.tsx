import { Heading } from "../../components/heading";

import { MonthlyBudget } from "../types";

export default function HeadingBar({
  monthlyBudget,
}: {
  monthlyBudget: MonthlyBudget | null;
}) {

  // The parent server component should not be passing null, but we check 
  // just in case.
  if (!monthlyBudget) {
    return <Heading level={2}>Monthly budget not found</Heading>;
  }
  console.log(monthlyBudget);


  return (
    <div className="w-full border-b border-gray-400 md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <Heading
          level={2}
          className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
        >
          Nov 2024
        </Heading>
      </div>
      <Heading level={3} className="font-medium text-gray-500">
        ${monthlyBudget?.available} available
      </Heading>
    </div>
  );
}
