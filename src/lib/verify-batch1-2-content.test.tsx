import { describe, expect, it } from "vitest";
import { categoryDefaults, trustContent, getContentBySlug } from "@/lib/content";
import {
  canonicalJsonStringify,
  computeObjectChecksum,
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

  describe("2. Deterministic Canonical JSON Serialization & Checksum Safety", () => {
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

  describe("3. Rollback Guard & Unexpected Mutation Safeguards", () => {
    it("simulates database identity check preventing cross-database rollback", () => {
      const snapshotDbHash = "389b7880bc32approvedhash";
      const differentDbHash = "otherdbhash0000000000";

      const matchesTargetDb = (snapshotHash: string, currentHash: string) => snapshotHash === currentHash;
      expect(matchesTargetDb(snapshotDbHash, differentDbHash)).toBe(false);
      expect(matchesTargetDb(snapshotDbHash, snapshotDbHash)).toBe(true);
    });

    it("detects when a block has unexpected edits made after the snapshot", () => {
      const originalPreSync = { title: "Old Title", body: "Old Body" };
      const expectedPostSync = { title: "New Title", body: "New Body" };
      const unexpectedAdminEdit = { title: "New Title", body: "ADMIN CHANGED PHONE NUMBER" };

      const restoreHash = computeObjectChecksum(originalPreSync);
      const cleanPostSyncHash = computeObjectChecksum(expectedPostSync);
      const currentDbHash = computeObjectChecksum(unexpectedAdminEdit);

      const isAlreadyRestored = currentDbHash === restoreHash;
      const isCleanPostSync = currentDbHash === cleanPostSyncHash;

      // When subsequent edits exist, it matches NEITHER state
      expect(isAlreadyRestored).toBe(false);
      expect(isCleanPostSync).toBe(false);

      // Rollback must abort to protect subsequent legitimate edits
      const shouldAbort = !isAlreadyRestored && !isCleanPostSync;
      expect(shouldAbort).toBe(true);
    });

    it("identifies clean post-sync state as safe to rollback", () => {
      const originalPreSync = { title: "Old Title" };
      const expectedPostSync = { title: "New Title" };

      const restoreHash = computeObjectChecksum(originalPreSync);
      const cleanPostSyncHash = computeObjectChecksum(expectedPostSync);
      const currentDbHash = cleanPostSyncHash; // Matches post-sync

      const isAlreadyRestored = currentDbHash === restoreHash;
      const isCleanPostSync = currentDbHash === cleanPostSyncHash;

      expect(isAlreadyRestored).toBe(false);
      expect(isCleanPostSync).toBe(true);
    });
  });

  describe("4. Live Grievance Page Content Isolation", () => {
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
