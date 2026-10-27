import type { Metadata } from "next";
import { CollectionListPage } from "@/components/admin/CollectionPages";

export const metadata: Metadata = { title: "Vacatures" };

export default function Page() {
  return <CollectionListPage type="service" />;
}
