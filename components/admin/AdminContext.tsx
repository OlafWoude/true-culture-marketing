"use client";

import { createContext, useContext, type ReactNode } from "react";

export type PageOption = { id: string; title: string; slug: string; status: string };

type AdminData = { pages: PageOption[]; storage: "blob" | "local" | "unavailable" };

const Ctx = createContext<AdminData>({ pages: [], storage: "unavailable" });

export function AdminDataProvider({ value, children }: { value: AdminData; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminData() {
  return useContext(Ctx);
}
