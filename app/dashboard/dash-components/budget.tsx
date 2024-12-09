import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { Budget } from "@/types/types";
import { isPlainAppError, PlainAppError } from "@/errors";

export default function BudgetDisplay({ budget }: { budget: Budget | PlainAppError }) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-2xl font-bold">Budget</h2>
      {!isPlainAppError(budget) && (
        <DescriptionList>
          <DescriptionTerm>Budget Name</DescriptionTerm>
          <DescriptionDetails>{budget.name}</DescriptionDetails>
        </DescriptionList>
      )}
    </section>
  );
}
