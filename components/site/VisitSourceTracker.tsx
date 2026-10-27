import { visitSourceScript } from "@/lib/visit-source";

export default function VisitSourceTracker() {
  return <script dangerouslySetInnerHTML={{ __html: visitSourceScript }} />;
}
