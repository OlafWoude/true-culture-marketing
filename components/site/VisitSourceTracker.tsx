"use client";

import { useEffect } from "react";
import { rememberVisitSource } from "@/lib/visit-source";

export default function VisitSourceTracker() {
  useEffect(() => {
    rememberVisitSource();
  }, []);
  return null;
}
