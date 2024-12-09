import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { MonthlyBudget } from "@/types/types";
import { isPlainAppError, PlainAppError } from "@/errors";
import { format, parseISO } from "date-fns";

const printDate = (date: string) => {
  return format(parseISO(date), "MMMM yyyy");
};

export default function MonthlyBudgetDisplay({ monthlyBudget }: { monthlyBudget: MonthlyBudget | PlainAppError }) {
  return (
    <section className="mb-8">
    <h2 className="mb-4 text-2xl font-bold">Current Monthly Budget</h2>
    {!isPlainAppError(monthlyBudget) && (
      <DescriptionList>
        <DescriptionTerm>Month</DescriptionTerm>
        <DescriptionDetails>
          {printDate(monthlyBudget.month)}
        </DescriptionDetails>
        <DescriptionTerm>Available</DescriptionTerm>
        <DescriptionDetails>{monthlyBudget.available}</DescriptionDetails>
      </DescriptionList>
    )}
  </section>
  );
}
