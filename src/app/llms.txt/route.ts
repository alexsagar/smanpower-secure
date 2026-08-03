import { getContentRepository } from "@/repositories/content-resolver";
import { getSiteUrl } from "@/lib/seo/site-config";
import { COMPLIANCE, ZERO_FEE_STATEMENT, OFFICE } from "@/config/approved-content";

export const dynamic = "force-dynamic";

// Grouped public routes only. No admin/api/apply/preview/applicant URLs.
const SECTIONS: { heading: string; links: [string, string][] }[] = [
  {
    heading: "For Employers",
    links: [
      ["Employer services", "/employers"],
      ["Request a workforce", "/employers/request-workforce"],
      ["Industries", "/industries"],
      ["Training and facilities", "/training-facilities"],
    ],
  },
  {
    heading: "For Candidates",
    links: [
      ["Current demands", "/demands"],
      ["Ethical recruitment", "/ethical-recruitment"],
      ["Worker grievance", "/worker-grievance"],
    ],
  },
  {
    heading: "Trust and Information",
    links: [
      ["Trust centre", "/trust-centre"],
      ["About", "/about"],
      ["News", "/news"],
      ["Insights", "/insights"],
      ["Careers", "/careers"],
      ["Privacy policy", "/privacy-policy"],
      ["Terms of service", "/terms-of-service"],
      ["Contact", "/contact"],
    ],
  },
];

export async function GET() {
  const settings = await getContentRepository().getSiteSettings();
  const baseUrl = getSiteUrl() || settings.website || "https://smanpower.com";
  const absoluteUrl = (path: string) => new URL(path, baseUrl).toString();

  const contactRoute = absoluteUrl("/contact");

  const body = [
    `# ${settings.companyName}`,
    "",
    `> ${settings.tagline || "Responsible recruitment and workforce services from Nepal."}`,
    "",
    "Seven Seas Intercontinental is a Nepal-based international recruitment company that sources, screens, trade-tests, trains, and deploys Nepali workers for international employers, with worker-welfare support through deployment. Its recruitment practices are " +
      `${COMPLIANCE.rba} and ${COMPLIANCE.sedex}, and it operates ${COMPLIANCE.iso} quality management. ${ZERO_FEE_STATEMENT}`,
    "",
    ...SECTIONS.flatMap(({ heading, links }) => [
      `## ${heading}`,
      ...links.map(([label, path]) => `- [${label}](${absoluteUrl(path)})`),
      "",
    ]),
    "## Reference",
    `- Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    `- Office: ${OFFICE.city}, ${OFFICE.country}`,
    `- Contact: ${contactRoute}`,
  ]
    .join("\n")
    .trimEnd();

  return new Response(body + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
