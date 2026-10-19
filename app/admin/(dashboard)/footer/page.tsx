import type { Metadata } from "next";
import SingletonPage from "@/components/admin/SingletonPage";

export const metadata: Metadata = { title: "Footer" };

export default function Page() {
  return <SingletonPage type="footer" />;
}
