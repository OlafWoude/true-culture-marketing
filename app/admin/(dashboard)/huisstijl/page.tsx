import type { Metadata } from "next";
import SingletonPage from "@/components/admin/SingletonPage";

export const metadata: Metadata = { title: "Huisstijl" };

export default function Page() {
  return <SingletonPage type="theme" />;
}
