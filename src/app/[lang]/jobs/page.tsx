import { redirect } from "next/navigation";

export default function JobsRedirectPage({ params }: { params: { lang: string } }) {
  const lang = params.lang || "en";
  redirect(`/${lang}/demands`);
}
