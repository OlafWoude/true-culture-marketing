"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { MediaItem } from "@/lib/admin/upload";

type Registry = {
  items: MediaItem[];
  get: (id: string | null | undefined) => MediaItem | null;
  upsert: (item: MediaItem) => void;
  remove: (id: string) => void;
};

const Ctx = createContext<Registry>({ items: [], get: () => null, upsert: () => {}, remove: () => {} });

export function MediaRegistryProvider({ initial, children }: { initial: MediaItem[]; children: ReactNode }) {
  const [items, setItems] = useState(initial);
  const upsert = useCallback((item: MediaItem) => {
    setItems((list) => [item, ...list.filter((m) => m.id !== item.id)]);
  }, []);
  const remove = useCallback((id: string) => setItems((list) => list.filter((m) => m.id !== id)), []);
  const value = useMemo<Registry>(() => {
    const map = new Map(items.map((m) => [m.id, m]));
    return { items, get: (id) => (id ? (map.get(id) ?? null) : null), upsert, remove };
  }, [items, upsert, remove]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMediaRegistry() {
  return useContext(Ctx);
}
