import type { Metadata } from "next";
import { ReviewScreen } from "@/components/drill/review-screen";

export const metadata: Metadata = {
  title: "Review · Opening Edge",
};

export default function ReviewPage() {
  return <ReviewScreen />;
}
