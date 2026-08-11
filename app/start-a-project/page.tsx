"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { InquiryFlow } from "@/components/inquiry/InquiryFlow";
import { categoryToInterestLabel } from "@/lib/inquiry-flow";
import type { InquiryState } from "@/lib/inquiry-flow";
import type { ProjectCategory } from "@/data/projects";

const VALID_CATEGORIES: ProjectCategory[] = ["ai", "web", "prototype", "open-source"];

function StartAProjectContent() {
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get("interest");
  const initialInterest =
    rawCategory && (VALID_CATEGORIES as string[]).includes(rawCategory)
      ? categoryToInterestLabel(rawCategory as ProjectCategory)
      : undefined;

  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(state: InquiryState) {
    setError(null);
    const res = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    if (!res.ok) {
      setError("Something went wrong sending that — try the email link below instead.");
      return;
    }
    const body = await res.json();
    setReference(body.reference as string);
  }

  if (reference) {
    return (
      <div className="max-w-md space-y-2 py-12 font-mono text-sm">
        <p>SENT — reference {reference}</p>
        <p className="text-[--color-text-dim]">I&apos;ll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <div>
      {error && <p className="max-w-md pt-8 text-sm text-red-400">{error}</p>}
      <InquiryFlow onSubmit={handleSubmit} initialInterest={initialInterest} />
    </div>
  );
}

export default function StartAProjectPage() {
  return (
    <Suspense fallback={null}>
      <StartAProjectContent />
    </Suspense>
  );
}
