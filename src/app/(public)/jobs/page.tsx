import { permanentRedirect } from "next/navigation";

export default function JobsRedirectPage() {
  permanentRedirect("/demands");
}
