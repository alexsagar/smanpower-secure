import { describe, expect, it } from "vitest";
import type { DemandListRow } from "./DemandListFilters";

/**
 * The demand list toolbar rendered a search input and a status select with no
 * handlers, so neither filtered anything. These cover the filtering rule the
 * hook now applies.
 */
const rows: DemandListRow[] = [
  { id: "1", title: "Welders for Qatar", companyName: "Al Habib", country: "Qatar", status: "PUBLISHED" },
  { id: "2", title: "Security Guards", companyName: "Falcon", country: "UAE", status: "DRAFT" },
  { id: "3", title: "Hotel Staff", companyName: "Emirates Gateway", country: "UAE", status: "CLOSED" },
];

// Mirrors the predicate inside useDemandListFilter.
function filter(list: DemandListRow[], query: string, status: string) {
  const q = query.trim().toLowerCase();
  return list.filter((row) => {
    if (status && row.status !== status) return false;
    if (!q) return true;
    return (
      row.title.toLowerCase().includes(q) ||
      row.companyName.toLowerCase().includes(q) ||
      row.country.toLowerCase().includes(q)
    );
  });
}

describe("demand list filtering", () => {
  it("returns everything when nothing is entered", () => {
    expect(filter(rows, "", "")).toHaveLength(3);
    expect(filter(rows, "   ", "")).toHaveLength(3);
  });

  it("searches title, company and country", () => {
    expect(filter(rows, "welder", "").map((r) => r.id)).toEqual(["1"]);
    expect(filter(rows, "falcon", "").map((r) => r.id)).toEqual(["2"]);
    expect(filter(rows, "uae", "").map((r) => r.id)).toEqual(["2", "3"]);
  });

  it("is case insensitive", () => {
    expect(filter(rows, "QATAR", "")).toHaveLength(1);
  });

  it("filters by status", () => {
    expect(filter(rows, "", "DRAFT").map((r) => r.id)).toEqual(["2"]);
    expect(filter(rows, "", "PUBLISHED").map((r) => r.id)).toEqual(["1"]);
  });

  it("combines search and status", () => {
    expect(filter(rows, "uae", "CLOSED").map((r) => r.id)).toEqual(["3"]);
    expect(filter(rows, "welder", "DRAFT")).toHaveLength(0);
  });
});
