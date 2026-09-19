/**
 * src/lib/seo/insight-linking.ts
 *
 * Injects high-value, contextual in-text internal links into editorial
 * insight articles. Resolves content silos and directs topical authority
 * to commercial landing pages, industry programs, and trust records.
 */

export function enrichInsightHtml(slug: string, htmlContent: string): string {
  if (!htmlContent) return "";

  if (slug === "choose-manpower-agency-in-nepal") {
    let enriched = htmlContent;

    // 1. Link to Trust Centre Licences
    enriched = enriched.replace(
      "ask for its current licence, registration documents and recruitment procedures.",
      'ask for its current <a href="/trust-centre/licences" class="text-brand-gold-dark hover:underline font-semibold">official licence and registration documents</a> and recruitment procedures.'
    );

    // 2. Link to Trust Centre Company Facts
    enriched = enriched.replace(
      "Do not rely only on marketing claims. Ask for evidence of the systems used during recruitment.",
      'Do not rely only on marketing claims. Verify documented <a href="/trust-centre/company-facts" class="text-brand-gold-dark hover:underline font-semibold">company facts and operational track record</a> before signing recruitment agreements.'
    );

    // 3. Link to Contact / Kathmandu Headquarters
    enriched = enriched.replace(
      "Seven Seas Intercontinental Services operates from Kathmandu and supports international recruitment",
      'Seven Seas Intercontinental Services operates from Kathmandu (<a href="/contact" class="text-brand-gold-dark hover:underline font-semibold">contact our Kathmandu headquarters</a>) and supports international recruitment'
    );

    // 4. Link to Ethical Recruitment
    enriched = enriched.replace(
      "assessment capacity and worker-protection systems.",
      'assessment capacity and <a href="/ethical-recruitment" class="text-brand-gold-dark hover:underline font-semibold">ethical worker-protection systems</a>.'
    );

    return enriched;
  }

  if (slug === "how-to-hire-nepali-workers") {
    let enriched = htmlContent;

    // 1. Link to Workforce Request Form
    enriched = enriched.replace(
      "Begin with a detailed workforce plan.",
      'Begin with a detailed workforce plan. Employers can <a href="/employers/request-workforce" class="text-brand-gold-dark hover:underline font-semibold">submit a workforce deployment request</a> detailing position specifications and project timelines.'
    );

    // 2. Link to Hospitality and Security Industries
    enriched = enriched.replace(
      "A welder may complete a welding task. A cook may prepare a selected dish. A housekeeper may demonstrate room preparation. A driver may complete a practical driving test.",
      'A welder may complete a welding task. Sourcing hospitality staff involves practical kitchen and service drills (see our <a href="/industries/hospitality-and-hotels" class="text-brand-gold-dark hover:underline font-semibold">Hospitality &amp; Hotel Staffing standards</a>). Sourcing protective personnel requires physical benchmarks and background verification (see our <a href="/industries/security-services" class="text-brand-gold-dark hover:underline font-semibold">Security Services Talent framework</a>).'
    );

    // 3. Link to Employer Process
    enriched = enriched.replace(
      "appoint an authorised recruitment agency, prepare the required documents and complete the approved selection and deployment process.",
      'appoint an authorised recruitment agency through a structured <a href="/employers" class="text-brand-gold-dark hover:underline font-semibold">employer recruitment process</a>, prepare the required bilateral documents and complete the approved selection and deployment process.'
    );

    return enriched;
  }

  return htmlContent;
}
