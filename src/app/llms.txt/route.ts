import { getContentRepository } from "@/repositories/content-resolver";
import { getSiteUrl } from "@/lib/seo/site-config";

export const dynamic = "force-dynamic";

const publicPaths = [
  ["About", "/about"],
  ["Employers", "/employers"],
  ["Open demands", "/demands"],
  ["Industries", "/industries"],
  ["Ethical recruitment", "/ethical-recruitment"],
  ["Training facilities", "/training-facilities"],
  ["Trust centre", "/trust-centre"],
  ["Success stories", "/success-stories"],
  ["Insights", "/insights"],
  ["Contact", "/contact"],
] as const;

export async function GET() {
  const settings = await getContentRepository().getSiteSettings();
  const baseUrl = getSiteUrl() || settings.website || "https://smanpower.com";
  const absoluteUrl = (path: string) => new URL(path, baseUrl).toString();
  const contact = [
    settings.address,
    settings.city,
    settings.country,
    settings.phoneDisplay || settings.phone,
    settings.emailDisplay || settings.email,
  ].filter(Boolean).join(" | ");

  const body = [
    `# ${settings.companyName}`,
    "",
    `> ${settings.tagline || "Recruitment and workforce services from Nepal."}`,
    "",
    "Seven Seas Intercontinental provides recruitment, candidate screening, skill assessment, training, and deployment support for international employers and Nepali workers. Use the linked public pages for current, detailed information.",
    "",
    "## Key public pages",
    ...publicPaths.map(([label, path]) => `- [${label}](${absoluteUrl(path)})`),
    "",
    "## Contact",
    contact,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
