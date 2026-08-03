import Link from "next/link";

/**
 * Visible candidate/demand guidance (AEO). Factual, process-oriented content —
 * no fabricated documents, dates, or promises of selection. Document
 * requirements and dates are demand-specific and shown on each demand page, so
 * they are intentionally not hardcoded here.
 */
const APPLICATION_STEPS = [
  "Review the current demand and its details.",
  "Confirm your eligibility and the required documents shown on the demand.",
  "Complete the official application form for that demand.",
  "Submit accurate documents.",
  "Attend screening, interview, or trade testing where required.",
  "Follow the official instructions provided by Seven Seas.",
];

const STATUS_MEANINGS: [string, string][] = [
  ["Open", "Applications are being accepted for this demand."],
  ["Closed", "The demand is closed and applications are no longer accepted."],
  ["Expired", "The application deadline has passed; applications are no longer accepted."],
  ["Applications disabled", "Applications are not available for this demand at this time."],
];

export function DemandGuidance() {
  return (
    <section aria-labelledby="demand-guidance-heading" className="mt-16 border-t border-brand-charcoal/10 pt-12">
      <h2 id="demand-guidance-heading" className="text-2xl font-semibold font-serif text-brand-black mb-6">
        Understanding Demands & How to Apply
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-brand-black mb-2">Demand Lot Number</h3>
          <p className="text-brand-charcoal/80 leading-relaxed">
            The demand lot number is the identifying reference assigned to a specific demand (a recruitment
            requirement). Quote it whenever you contact us about a position.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-brand-black mb-2">Readvertisement</h3>
          <p className="text-brand-charcoal/80 leading-relaxed">
            A demand may be published again with updated dates, vacancies, interview information, or application
            availability. A readvertised demand links back to the original, and the original links to the current one.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-brand-black mb-2">Application Status</h3>
          <ul className="text-brand-charcoal/80 leading-relaxed space-y-1">
            {STATUS_MEANINGS.map(([label, meaning]) => (
              <li key={label}>
                <span className="font-semibold text-brand-black">{label}:</span> {meaning}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-brand-black mb-2">Interview Date & Deadline</h3>
          <p className="text-brand-charcoal/80 leading-relaxed">
            The interview date and application deadline are specific to each demand. Always check the current
            demand page for the dates and required documents that apply to that position.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold text-brand-black mb-2">How to Apply</h3>
        <ol className="list-decimal list-inside text-brand-charcoal/80 leading-relaxed space-y-1">
          {APPLICATION_STEPS.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <p className="text-brand-charcoal/60 text-sm mt-3">
          Applying does not guarantee selection or employment.{" "}
          <Link href="/ethical-recruitment" className="text-brand-gold font-semibold hover:underline">
            Learn about our ethical recruitment practices
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
