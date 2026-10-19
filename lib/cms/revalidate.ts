import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { CMS_TAG } from "./repo";

/** Makes newly published content visible on the public site right away. */
export function revalidatePublicSite() {
  revalidateTag(CMS_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}
