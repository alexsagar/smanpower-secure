import { Badge } from "@/components/ui/shared";
import { getAdminIntelligenceDashboard } from "@/services/workforce-intelligence.service";
import { formatDate, formatEnum } from "@/lib/utils";
import {
  BarChart3,
  Database,
  Download,
  FileSpreadsheet,
  Globe2,
  ShieldCheck,
  TrendingUp,
  Users2,
} from "lucide-react";

function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: number;
  subtext: string;
  icon: typeof BarChart3;
}) {
  return (
    <div className="border border-brand-charcoal/10 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-muted">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-brand-black">
            {value.toLocaleString("en-US")}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center border border-brand-charcoal/10 bg-brand-off-white">
          <Icon className="h-4 w-4 text-brand-gold" />
        </div>
      </div>
      <p className="mt-3 text-sm text-brand-muted">{subtext}</p>
    </div>
  );
}

export default async function AdminIntelligencePage() {
  const dashboard = await getAdminIntelligenceDashboard();
  const trendMax = Math.max(
    1,
    ...dashboard.recentApplicationTrend.map((point) => point.value)
  );

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <div className="flex flex-col gap-6 border-b border-brand-charcoal/10 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold">
            <BarChart3 className="h-3 w-3" /> Module // Intelligence
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-black md:text-4xl">
            Workforce Intelligence
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-brand-muted md:text-base">
            Read-only operational intelligence from live recruitment, demand, and
            dataset records. Candidate-level information is intentionally excluded.
          </p>
        </div>
        <button
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 border border-brand-charcoal/10 bg-brand-off-white px-5 py-3 text-sm font-semibold uppercase tracking-widest text-brand-black/50"
          title="Export remains deferred until a dedicated permission and audit flow is implemented."
        >
          <Download className="h-4 w-4 text-brand-gold/50" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Applications"
          value={dashboard.summary.totalApplications}
          subtext="Total demand applications recorded"
          icon={Users2}
        />
        <MetricCard
          label="Active Demands"
          value={dashboard.summary.activeDemands}
          subtext={`${dashboard.summary.closedDemands.toLocaleString("en-US")} closed or archived demands`}
          icon={TrendingUp}
        />
        <MetricCard
          label="Open Vacancies"
          value={dashboard.summary.openVacancies}
          subtext={`${dashboard.summary.publishedJobs.toLocaleString("en-US")} published jobs currently visible`}
          icon={ShieldCheck}
        />
        <MetricCard
          label="Datasets"
          value={dashboard.summary.totalDatasets}
          subtext={`${dashboard.summary.totalMetrics.toLocaleString("en-US")} stored metrics across ${dashboard.summary.publicDatasets.toLocaleString("en-US")} public datasets`}
          icon={Database}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="border border-brand-black bg-brand-black p-8 xl:col-span-2">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Demand Application Trend</h2>
              <p className="mt-1 text-xs uppercase tracking-widest text-brand-white/40">
                Rolling twelve-week submission volume
              </p>
            </div>
            <div className="flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-brand-gold">
              <TrendingUp className="h-3 w-3" />
              {dashboard.summary.totalApplications.toLocaleString("en-US")} total
            </div>
          </div>
          <div className="flex h-56 items-end gap-3 border-b border-white/10 pt-8">
            {dashboard.recentApplicationTrend.map((point) => (
              <div key={point.label} className="flex flex-1 flex-col justify-end">
                <div
                  className="w-full bg-brand-gold/25 transition-colors hover:bg-brand-gold"
                  style={{
                    height: `${Math.max(6, (point.value / trendMax) * 100)}%`,
                  }}
                  title={`${point.label}: ${point.value} applications`}
                />
                <div className="mt-3 text-center font-mono text-[10px] text-brand-white/30">
                  {point.label.slice(5)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-brand-charcoal/10 bg-white p-8">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-brand-black">
            Application Status Mix
          </h2>
          <div className="space-y-4">
            {dashboard.applicationStatuses.length > 0 ? (
              dashboard.applicationStatuses.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs font-semibold">
                    <span className="text-brand-black">{formatEnum(row.label)}</span>
                    <span className="font-mono text-brand-muted">{row.value}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden bg-brand-off-white">
                    <div
                      className="h-full bg-brand-charcoal"
                      style={{
                        width: `${Math.max(
                          6,
                          (row.value /
                            Math.max(
                              1,
                              ...dashboard.applicationStatuses.map((entry) => entry.value)
                            )) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-brand-muted">
                No application status data is available yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="border border-brand-charcoal/10 bg-white">
          <div className="border-b border-brand-charcoal/5 bg-brand-off-white px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">
              Document Verification Status
            </h2>
          </div>
          <div className="p-6">
            {dashboard.documentStatuses.length > 0 ? (
              <div className="space-y-3">
                {dashboard.documentStatuses.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border border-brand-charcoal/10 px-4 py-3"
                  >
                    <span className="text-sm text-brand-charcoal">
                      {formatEnum(row.label)}
                    </span>
                    <Badge variant="outline">{row.value}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brand-muted">
                No candidate document statuses are available yet.
              </p>
            )}
          </div>
        </div>

        <div className="border border-brand-charcoal/10 bg-white">
          <div className="border-b border-brand-charcoal/5 bg-brand-off-white px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">
              Metric Categories
            </h2>
          </div>
          <div className="p-6">
            {dashboard.metricCategories.length > 0 ? (
              <div className="space-y-3">
                {dashboard.metricCategories.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border border-brand-charcoal/10 px-4 py-3"
                  >
                    <span className="text-sm text-brand-charcoal">
                      {formatEnum(row.label)}
                    </span>
                    <Badge variant="gold">{row.value}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brand-muted">
                No workforce metric categories have been published yet.
              </p>
            )}
          </div>
        </div>

        <div className="border border-brand-charcoal/10 bg-white">
          <div className="border-b border-brand-charcoal/5 bg-brand-off-white px-6 py-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">
                Country Breakdown
              </h2>
              <Badge variant="outline">Min {dashboard.countryBreakdown.threshold}</Badge>
            </div>
          </div>
          <div className="p-6">
            {dashboard.countryBreakdown.rows.length > 0 ? (
              <div className="space-y-3">
                {dashboard.countryBreakdown.rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border border-brand-charcoal/10 px-4 py-3"
                  >
                    <span className="flex items-center gap-2 text-sm text-brand-charcoal">
                      <Globe2 className="h-4 w-4 text-brand-gold/70" />
                      {row.label}
                    </span>
                    <Badge variant="outline">{row.value}</Badge>
                  </div>
                ))}
                {dashboard.countryBreakdown.withheldCount > 0 ? (
                  <p className="text-xs text-brand-muted">
                    {dashboard.countryBreakdown.withheldCount} applications withheld because
                    their cohort size fell below the privacy threshold.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-brand-muted">
                No country cohort meets the minimum display threshold yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden border border-brand-charcoal/10 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-brand-charcoal/5 bg-brand-off-white px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-black">
              Intelligence Datasets
            </h2>
            <p className="mt-1 text-xs text-brand-muted">
              Dataset inventory only. Authoring remains deferred in this phase.
            </p>
          </div>
          <span className="font-mono text-xs text-brand-muted">
            {dashboard.datasets.length} datasets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-brand-charcoal/5 text-xs font-semibold uppercase tracking-wider text-brand-muted">
                <th className="p-6 font-medium">Dataset</th>
                <th className="p-6 font-medium">Source</th>
                <th className="p-6 font-medium">Metrics</th>
                <th className="p-6 font-medium">Sample Size</th>
                <th className="p-6 font-medium">Visibility</th>
                <th className="p-6 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5">
              {dashboard.datasets.length > 0 ? (
                dashboard.datasets.map((dataset) => (
                  <tr key={dataset.id} className="transition-colors hover:bg-brand-gold/5">
                    <td className="p-6 align-top">
                      <div className="flex items-center gap-2 font-semibold text-brand-black">
                        <FileSpreadsheet className="h-4 w-4 text-brand-gold/60" />
                        {dataset.name}
                      </div>
                      <div className="mt-1 max-w-sm text-xs text-brand-muted">
                        {dataset.description || "No dataset description provided."}
                      </div>
                      {dataset.methodology ? (
                        <div className="mt-2 text-xs text-brand-muted">
                          Methodology: {dataset.methodology}
                        </div>
                      ) : null}
                    </td>
                    <td className="p-6 text-sm text-brand-charcoal">
                      {dataset.dataSource || "Internal systems"}
                    </td>
                    <td className="p-6">
                      <Badge variant="outline">{dataset.metricsCount}</Badge>
                    </td>
                    <td className="p-6 text-sm text-brand-charcoal">
                      {dataset.sampleSize ? dataset.sampleSize.toLocaleString("en-US") : "Not recorded"}
                    </td>
                    <td className="p-6">
                      <Badge variant={dataset.isPublic ? "gold" : "default"}>
                        {dataset.isPublic ? "Public API" : "Internal Only"}
                      </Badge>
                    </td>
                    <td className="p-6 text-xs text-brand-muted">
                      {dataset.lastUpdated ? formatDate(dataset.lastUpdated) : "Not recorded"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-brand-muted">
                    No intelligence datasets have been compiled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
