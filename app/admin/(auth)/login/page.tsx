import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/AuthForms";
import ConfigMissing from "@/components/admin/ConfigMissing";
import { Notice } from "@/components/admin/ui";
import { getCurrentUser } from "@/lib/auth/session";
import { hasAnyUser } from "@/lib/auth/users";
import { isDbConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Inloggen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function LoginPage({ searchParams }: Props) {
  if (!isDbConfigured()) return <ConfigMissing />;
  if (!(await hasAnyUser())) redirect("/admin/setup");
  if (await getCurrentUser()) redirect("/admin");
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/admin";
  const notice = params.uitgelogd ? (
    <Notice tone="success">Je bent uitgelogd.</Notice>
  ) : params.gewijzigd ? (
    <Notice tone="success">Je wachtwoord is gewijzigd. Log in met je nieuwe wachtwoord.</Notice>
  ) : params.verlopen ? (
    <Notice tone="warning">Je sessie is verlopen. Log opnieuw in.</Notice>
  ) : null;
  return <LoginForm next={next} notice={notice} />;
}
