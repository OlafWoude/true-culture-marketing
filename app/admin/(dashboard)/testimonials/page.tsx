import type { Metadata } from "next";
import { CollectionListPage } from "@/components/admin/CollectionPages";

export const metadata: Metadata = { title: "Testimonials" };

export default function Page() {
  return <CollectionListPage type="testimonial" />;
}
