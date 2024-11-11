"use client";
import { getDefaultBudget } from "@/app/actions";
import React from "react";

import { Budget } from "@/app/types";

// app/debug/page.tsx
export default function DebugPage() {
  const [budget, setBudget] = React.useState<Budget | Error | null>(null);

  React.useEffect(() => {
    async function fetchBudget() {
      const res = await getDefaultBudget();
      setBudget(res);
    }
    fetchBudget();
  }, []);

  return (
    <div>
      <h5>getDefaultBudget()</h5>
      <pre>
        {JSON.stringify(
          {
            result: budget,
            type: typeof budget,
            isError: budget instanceof Error,
            isNull: budget === null,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
