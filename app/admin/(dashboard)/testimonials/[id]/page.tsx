import type { Metadata } from "next";
import { CollectionEditPage } from "@/components/admin/CollectionPages";

export const metadata: Metadata = { title: "Testimonials bewerken" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CollectionEditPage type="testimonial" id={id} />;
}
