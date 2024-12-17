"use client"

import { Input } from "@/components/input";
import { startTransition, useState, useTransition } from "react";
import { updateAssigned } from '@/actions/monthlyCategoryDetails';

export function UpdateAssignedInput(monthlyBudgetId: number, categoryId: number) {
  const [assigned, setAssigned] = useState(0);
  const [isPending, setIsPending] = useTransition();

  const handleSubmit = (e) => {
    startTransition(async () => {
      const error = await updateAssigned()
    }


  return (
    <form action={updateAssigned} method="post">

      <Input />
    </form>
  )
}