"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/orders";

const PaymentStep = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
    //   const result = await createOrder();

    //   if (result.error) {
    //     setError(result.error);
    //     setIsLoading(false);
    //     return;
    //   }

    //   if (!result.sessionUrl) {
    //     setError("Failed to start checkout.");
    //     setIsLoading(false);
    //     return;
    //   }

    //   window.location.href = result.sessionUrl;
    } catch (err) {
      console.error("Checkout failed:", err);
      setError("Checkout failed. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleCheckout} className="w-full space-y-3">
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}{" "}
          {error.toLowerCase().includes("sign") ? (
            <Link href="/auth" className="font-semibold underline">
              Go to sign in
            </Link>
          ) : null}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Redirecting..." : "Checkout"}
      </Button>
    </form>
  );
};

export default PaymentStep;
