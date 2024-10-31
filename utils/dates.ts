export interface DateRange {
  firstDayOfMonthUTC: Date;
  firstDayOfNextMonthUTC: Date;
}

// Return This month's and Next Month's Start date. 
export function firstDaysOfMonth() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfNextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1,
  );

  // Ensure the dates are in UTC
  const firstDayOfMonthUTC = new Date(
    Date.UTC(
      firstDayOfMonth.getFullYear(),
      firstDayOfMonth.getMonth(),
      firstDayOfMonth.getDate(),
    ),
  );
  const firstDayOfNextMonthUTC = new Date(
    Date.UTC(
      firstDayOfNextMonth.getFullYear(),
      firstDayOfNextMonth.getMonth(),
      firstDayOfNextMonth.getDate(),
    ),
  );

  return {firstDayOfMonthUTC, firstDayOfNextMonthUTC}
}