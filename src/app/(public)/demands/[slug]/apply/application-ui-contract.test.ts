import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
const form = readFileSync(new URL("./DemandApplyForm.tsx", import.meta.url), "utf8");

describe("demand application UI", () => {
  it("offsets the page with the shared fixed-header height", () => {
    expect(page).toContain("pt-[calc(var(--site-header-height)+env(safe-area-inset-top))]");
  });

  it("uses one visible, interactive control style for text, date, select, and textarea fields", () => {
    expect(form).toContain("const FORM_CONTROL_CLASS");
    expect(form).toContain("border-brand-charcoal/30");
    expect(form).toContain("hover:border-brand-charcoal/50");
    expect(form).toContain("focus-visible:ring-2");
    expect(form).toContain("disabled:bg-brand-stone");
    expect(form.match(/FORM_CONTROL_CLASS/g)?.length).toBeGreaterThanOrEqual(11);
  });

  it("associates native validation errors with invalid controls", () => {
    expect(form).toContain('"aria-invalid"');
    expect(form).toContain('"aria-describedby"');
    expect(form).toContain("validationMessage");
    expect(form).toContain('role="alert"');
  });

  it("preserves accessible file controls and strengthens their drop zones", () => {
    expect(form).toContain('aria-describedby="cvFile-hint"');
    expect(form).toContain('aria-describedby="certFile-hint"');
    expect(form).toContain("focus-within:border-brand-gold");
    expect(form).toContain("FILE_INPUT_CLASS");
  });
});
