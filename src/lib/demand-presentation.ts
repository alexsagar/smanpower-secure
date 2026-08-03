const SITE_NAME = "Seven Seas Intercontinental";

export type DemandApplicationStatus = "OPEN" | "CLOSED" | "NOT_YET_OPEN" | "DEADLINE_PASSED";

type ApplicationDemand = {
  status: string;
  isPublic?: boolean;
  enableApplication: boolean;
  applicationStartDate?: string | Date | null;
  applicationDeadline?: string | Date | null;
};

export function getDemandApplicationStatus(demand: ApplicationDemand, globallyEnabled: boolean, now = new Date()) {
  if (!globallyEnabled || demand.status !== "PUBLISHED" || demand.isPublic === false || !demand.enableApplication)
    return { applicationStatus: "CLOSED" as const, applicationStatusLabel: "Applications Closed", canApply: false };
  if (demand.applicationDeadline && new Date(demand.applicationDeadline) < now)
    return { applicationStatus: "DEADLINE_PASSED" as const, applicationStatusLabel: "Application Deadline Passed", canApply: false };
  if (demand.applicationStartDate && new Date(demand.applicationStartDate) > now)
    return { applicationStatus: "NOT_YET_OPEN" as const, applicationStatusLabel: "Applications Not Yet Open", canApply: false };
  return { applicationStatus: "OPEN" as const, applicationStatusLabel: "Applications Open", canApply: true };
}

export function toDateOnly(value: string | Date): string {
  return (typeof value === "string" ? value : value.toISOString()).slice(0, 10);
}

export function formatDemandDate(value: string | Date): string {
  const [year, month, day] = toDateOnly(value).split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, day)));
}

export function normalizeDemandVacancies(positions: Array<{ totalCount: number; maleCount?: number | null; femaleCount?: number | null }>) {
  const totalVacancies = positions.reduce((sum, position) => sum + position.totalCount, 0);
  if (!positions.length || !positions.every((position) => position.maleCount != null && position.femaleCount != null)) {
    return { totalVacancies };
  }
  return {
    totalVacancies,
    maleVacancies: positions.reduce((sum, position) => sum + position.maleCount!, 0),
    femaleVacancies: positions.reduce((sum, position) => sum + position.femaleCount!, 0),
  };
}

function trimAtWord(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).replace(/\s+\S*$/, "").trimEnd()}…`;
}

type SeoDemand = {
  title: string;
  companyName?: string | null;
  country?: string | null;
  totalVacancies?: number;
  maleVacancies?: number;
  femaleVacancies?: number;
  applicationDeadline?: string | Date | null;
  interviewDate?: string | Date | null;
};

export function generateDemandSeo(demand: SeoDemand): { title: string; description: string } {
  const location = demand.country && !demand.title.toLowerCase().includes(demand.country.toLowerCase()) ? ` in ${demand.country}` : "";
  const details: string[] = [];
  if (demand.totalVacancies != null) {
    const breakdown = demand.maleVacancies != null && demand.femaleVacancies != null
      ? `, including ${demand.maleVacancies} male and ${demand.femaleVacancies} female positions`
      : "";
    details.push(`${demand.totalVacancies} ${demand.totalVacancies === 1 ? "vacancy" : "vacancies"} available${breakdown}.`);
  }
  if (demand.applicationDeadline) details.push(`Apply before ${formatDemandDate(demand.applicationDeadline)}.`);
  if (demand.interviewDate) details.push(`Interview date: ${formatDemandDate(demand.interviewDate)}.`);
  return {
    title: trimAtWord(`${demand.title}${location} | ${SITE_NAME}`, 60),
    description: trimAtWord(`Apply for ${demand.title}${location}${demand.companyName ? ` with ${demand.companyName}` : ""}. ${details.join(" ")}`.trim(), 160),
  };
}
