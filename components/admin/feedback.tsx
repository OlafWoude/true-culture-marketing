"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AdminButton } from "./ui";

type Toast = { id: number; tone: "success" | "error" | "info"; text: string };

const ToastContext = createContext<(tone: Toast["tone"], text: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((tone: Toast["tone"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 8000 : 4500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-24 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 md:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-1 ${
              t.tone === "error"
                ? "bg-red-600 text-white ring-red-700"
                : t.tone === "success"
                  ? "bg-[#050505] text-white ring-black"
                  : "bg-white text-zinc-900 ring-zinc-200"
            }`}
          >
            {t.tone === "success" && <span className="mr-2 text-[#fece00]">✓</span>}
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

type ConfirmOptions = { title: string; body?: ReactNode; confirmLabel?: string; danger?: boolean };
const ConfirmContext = createContext<(opts: ConfirmOptions) => Promise<boolean>>(async () => false);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(v: boolean) => void>(() => {});
  const dialogRef = useRef<HTMLDialogElement>(null);

  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (opts && !d.open) d.showModal();
    if (!opts && d.open) d.close();
  }, [opts]);

  const close = (value: boolean) => {
    resolver.current(value);
    setOpts(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault();
          close(false);
        }}
        className="m-auto w-[min(92vw,30rem)] rounded-2xl p-0 shadow-2xl backdrop:bg-black/50"
      >
        {opts && (
          <div className="p-6">
            <h2 className="text-lg font-bold text-zinc-900">{opts.title}</h2>
            {opts.body && <div className="mt-2 text-sm leading-relaxed text-zinc-600">{opts.body}</div>}
            <div className="mt-6 flex justify-end gap-2">
              <AdminButton onClick={() => close(false)}>Annuleren</AdminButton>
              <AdminButton variant={opts.danger ? "danger" : "dark"} onClick={() => close(true)} autoFocus>
                {opts.confirmLabel ?? "Bevestigen"}
              </AdminButton>
            </div>
          </div>
        )}
      </dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
