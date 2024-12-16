"use client";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useState } from "react";

export function CategoryNameInput({ categoryName }: { categoryName: string }) {
  const [name, setName] = useState(categoryName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save the new category name
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="text"
        name="categoryName"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button type="submit">Save</Button>
    </form>
  );
}
