import { describe, expect, it } from "vitest";
import { categoryDefaults, trustContent, getContentBySlug } from "@/lib/content";
import {
  canonicalJsonStringify,
  computeObjectChecksum,
  validateRollbackPlan,
  RollbackBlockItem,
} from "@/lib/cms-checksum";

describe("Batch 1.2 Trust Centre Accuracy & Safety Follow-Up", () => {
  describe("1. ISO Certificate Publication & Compliance Documents FAQ", () => {
    it("ensures categoryDefaults['trust-centre'] does NOT claim the ISO certificate is published", () => {
      const defaults = categoryDefaults["trust-centre"];
      expect(defaults).toBeDefined();

      const json = JSON.stringify(defaults);
      expect(json).not.toMatch(/ISO 9001:2015 certificate are published/i);
      expect(json).not.toMatch(/ISO 9001:2015 certificate is published/i);
      expect(json).not.toMatch(/ISO certificate is published/i);
    });

    it("verifies the exact approved FAQ response for compliance documents in Trust Centre", () => {
      const defaults = categoryDefaults["trust-centre"];
      const faq = defaults?.faqs?.find((f) =>
        f.q.toLowerCase().includes("review your compliance documents")
      );
      expect(faq).toBeDefined();
      expect(faq?.a).toBe(
        "Our foreign employment licence, authority certificate for sending trainee workers to Japan, and company incorporation certificate are available in our Trust Centre. Seven Seas also holds an ISO 9001:2015 certificate, which is not publicly posted."
      );
    });

    it("verifies the three public documents published on the Trust Centre licences page", () => {
      const licencesPage = trustContent.find((p) => p.slug === "licences");
      expect(licencesPage).toBeDefined();
      expect(licencesPage?.documents).toBeDefined();
      expect(licencesPage?.documents?.length).toBe(3);

      const titles = licencesPage?.documents?.map((d) => d.title) || [];
      expect(titles).toContain("License of Foreign Employment");
      expect(titles).toContain("Authority Certificate — Sending Trainee Workers to Japan");
      expect(titles).toContain("Certificate of Incorporation of Company");

      // Verify no ISO certificate PDF is listed in public documents
      const fileUrls = licencesPage?.documents?.map((d) => d.fileUrl.toLowerCase()) || [];
      expect(fileUrls.some((url) => url.includes("iso"))).toBe(false);
    });
  });

  describe("2. Approved Compliance Descriptions (RBA-compliant, Sedex-compliant, ISO 9001:2015)", () => {
    it("verifies trust-centre categoryDefaults contains approved RBA-compliant and Sedex-compliant descriptions", () => {
      const defaults = categoryDefaults["trust-centre"];
      expect(defaults).toBeDefined();
      const json = JSON.stringify(defaults);

      // Approved descriptions
      expect(json).toMatch(/RBA-compliant/i);
      expect(json).toMatch(/Sedex-compliant/i);
      expect(json).toMatch(/ISO 9001:2015/i);
      expect(json).toMatch(/RBA-aligned framework/i);

      // Forbidden claims
      expect(json).not.toMatch(/RBA member|Sedex member/i);
      expect(json).not.toMatch(/RBA certified|Sedex certified/i);
      expect(json).not.toMatch(/SMETA audited/i);
      expect(json).not.toMatch(/unannounced/i);
      expect(json).not.toMatch(/flawless/i);
      expect(json).not.toMatch(/zero infractions/i);
    });

    it("verifies certifications page content describes ISO 9001:2015, RBA-compliant, and Sedex-compliant practices accurately", () => {
      const page = trustContent.find((p) => p.slug === "certifications");
      expect(page).toBeDefined();
      const json = JSON.stringify(page);

      expect(json).toMatch(/ISO 9001:2015/i);
      expect(json).toMatch(/RBA-compliant/i);
      expect(json).toMatch(/Sedex-compliant/i);
      expect(json).toMatch(/RBA-Aligned Framework/i);

      expect(json).not.toMatch(/RBA member|Sedex member/i);
      expect(json).not.toMatch(/RBA certified|Sedex certified/i);
      expect(json).not.toMatch(/SMETA audited/i);
    });
  });

  describe("3. Deterministic Canonical JSON Serialization & Checksum Safety", () => {
    it("canonicalJsonStringify recursively sorts object keys at all nesting levels", () => {
      const unordered = {
        z: 1,
        a: {
          b: 2,
          a: 1,
        },
        m: [
          { y: "second", x: "first" },
          { d: 4, c: 3 },
        ],
      };

      const serialized = canonicalJsonStringify(unordered);
      expect(serialized).toBe(
        '{"a":{"a":1,"b":2},"m":[{"x":"first","y":"second"},{"c":3,"d":4}],"z":1}'
      );
    });

    it("ensures nested properties inside arrays of objects are preserved and factored into checksum", () => {
      const blockA = {
        title: "Same Title",
        features: [
          { title: "F1", desc: "Original Description" },
        ],
      };

      const blockB = {
        title: "Same Title",
        features: [
          { title: "F1", desc: "MODIFIED Description" },
        ],
      };

      const hashA = computeObjectChecksum(blockA);
      const hashB = computeObjectChecksum(blockB);

      // Must be different! The legacy JSON.stringify(obj, keys) failed this test.
      expect(hashA).not.toBe(hashB);
    });

    it("ensures deeply nested property alterations at any depth alter the checksum", () => {
      const base = {
        level1: {
          level2: {
            level3: {
              target: "original",
              fixed: 123,
            },
          },
        },
      };

      const changed = {
        level1: {
          level2: {
            level3: {
              target: "modified",
              fixed: 123,
            },
          },
        },
      };

      expect(computeObjectChecksum(base)).not.toBe(computeObjectChecksum(changed));
    });

    it("produces identical checksums for identical content regardless of key insertion order", () => {
      const obj1 = {
        title: "Test",
        process: [
          { title: "Step 1", desc: "Desc 1" },
        ],
        faqs: [
          { q: "Q1", a: "A1" },
        ],
      };

      const obj2 = {
        faqs: [
          { a: "A1", q: "Q1" },
        ],
        process: [
          { desc: "Desc 1", title: "Step 1" },
        ],
        title: "Test",
      };

      const hash1 = computeObjectChecksum(obj1);
      const hash2 = computeObjectChecksum(obj2);

      expect(hash1).toBe(hash2);
    });
  });

  describe("4. Rollback Guard & Selective Rollback Safeguards", () => {
    const mockExpectedPostSync = (slug: string, preSync: unknown) => {
      const pre = preSync as Record<string, unknown>;
      return { ...pre, synced: true };
    };

    it("rejects wrong-database rollback attempts with clear mismatch error", () => {
      const snapshotBlocks: RollbackBlockItem[] = [
        { blockId: "block-1", slug: "trust-centre/licences", content: { title: "Pre" } },
      ];
      const liveBlocks = new Map<string, unknown>([
        ["block-1", { title: "Pre", synced: true }],
      ]);

      const result = validateRollbackPlan({
        snapshotDbHash: "db-hash-production-primary",
        currentDbHash: "db-hash-staging-or-local",
        snapshotBlocks,
        liveBlocks,
        getExpectedPostSyncContent: mockExpectedPostSync,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Database identity mismatch");
      expect(result.actions).toHaveLength(0);
    });

    it("detects when a live block contains unexpected edits made after the snapshot and aborts", () => {
      const snapshotBlocks: RollbackBlockItem[] = [
        { blockId: "block-1", slug: "trust-centre/licences", content: { title: "Pre" } },
      ];
      // Live content was modified by an admin after the sync
      const liveBlocks = new Map<string, unknown>([
        ["block-1", { title: "Pre", synced: true, editedByAdmin: "new phone number" }],
      ]);

      const result = validateRollbackPlan({
        snapshotDbHash: "same-db-hash",
        currentDbHash: "same-db-hash",
        snapshotBlocks,
        liveBlocks,
        getExpectedPostSyncContent: mockExpectedPostSync,
        allowUnexpected: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("contains unexpected edits made after the snapshot");
      expect(result.error).toContain("--force-unmatched");
      expect(result.actions).toHaveLength(0);
    });

    it("permits overwrite of unexpected edits ONLY when allowUnexpected is explicitly true", () => {
      const snapshotBlocks: RollbackBlockItem[] = [
        { blockId: "block-1", slug: "trust-centre/licences", content: { title: "Pre" } },
      ];
      const liveBlocks = new Map<string, unknown>([
        ["block-1", { title: "Pre", synced: true, editedByAdmin: "new phone number" }],
      ]);

      const result = validateRollbackPlan({
        snapshotDbHash: "same-db-hash",
        currentDbHash: "same-db-hash",
        snapshotBlocks,
        liveBlocks,
        getExpectedPostSyncContent: mockExpectedPostSync,
        allowUnexpected: true, // explicit override
      });

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].status).toBe("OVERWRITE_FORCED");
    });

    it("identifies clean post-sync state as safe to rollback", () => {
      const snapshotBlocks: RollbackBlockItem[] = [
        { blockId: "block-1", slug: "trust-centre/licences", content: { title: "Pre" } },
      ];
      const liveBlocks = new Map<string, unknown>([
        ["block-1", { title: "Pre", synced: true }],
      ]);

      const result = validateRollbackPlan({
        snapshotDbHash: "same-db-hash",
        currentDbHash: "same-db-hash",
        snapshotBlocks,
        liveBlocks,
        getExpectedPostSyncContent: mockExpectedPostSync,
        allowUnexpected: false,
      });

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].status).toBe("CLEAN");
    });

    it("identifies already restored blocks and requires no database mutation", () => {
      const snapshotBlocks: RollbackBlockItem[] = [
        { blockId: "block-1", slug: "trust-centre/licences", content: { title: "Pre" } },
      ];
      const liveBlocks = new Map<string, unknown>([
        ["block-1", { title: "Pre" }], // Already matches target snapshot
      ]);

      const result = validateRollbackPlan({
        snapshotDbHash: "same-db-hash",
        currentDbHash: "same-db-hash",
        snapshotBlocks,
        liveBlocks,
        getExpectedPostSyncContent: mockExpectedPostSync,
        allowUnexpected: false,
      });

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(0);
      expect(result.alreadyRestoredCount).toBe(1);
    });
  });

  describe("5. Live Grievance Page Content Isolation", () => {
    it("ensures /trust-centre/grievance provides page-specific intake process and FAQs without generic audit bleed", () => {
      const page = getContentBySlug("trust-centre", "grievance");
      expect(page).toBeDefined();

      expect(page?.process?.length).toBe(4);
      expect(page?.process?.[0].title).toBe("Submission & Intake");
      expect(page?.process?.[1].title).toBe("24-Hour Acknowledgement");
      expect(page?.process?.[1].desc).toContain("acknowledged within 24 hours");

      // Verify no generic licensing/audit steps bled into grievance
      const processStr = JSON.stringify(page?.process);
      expect(processStr).not.toMatch(/Government Licensing/i);
      expect(processStr).not.toMatch(/Independent Audits/i);

      // Verify FAQs link to /worker-grievance
      expect(page?.faqs?.length).toBe(4);
      const faqsStr = JSON.stringify(page?.faqs);
      expect(faqsStr).toContain("/worker-grievance");
      expect(faqsStr).not.toMatch(/Is Seven Seas government licensed\?/i);
      expect(faqsStr).not.toMatch(/What certifications and standards do you hold\?/i);
    });
  });
});

