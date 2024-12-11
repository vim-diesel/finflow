"use client"; // Error boundaries must be Client Components

import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string, message: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);


  return (
    <div>
      <Heading level={2}>Something went wrong</Heading>
      <p>An error occurred on the page.</p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}
