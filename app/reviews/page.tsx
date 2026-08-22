import type { Metadata } from "next";
import ReviewsClient from "@/components/ReviewsClient";

export const metadata: Metadata = {
  title: "Reviews — TrialFind",
  description:
    "What patients, caregivers and clinicians say about searching for a clinical trial with TrialFind — including the mixed reviews.",
};

export default function ReviewsPage() {
  return <ReviewsClient />;
}
