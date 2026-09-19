import { describe, it, expect } from "vitest";
import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  BASELINE,
  TARGET,
  transformHomeStats,
  transformAboutStats,
  validateHomeBaseline,
  validateAboutBaseline,
  verifyBackupIntegrity,
} from "../../scripts/update-production-cms-statistics.mjs";

describe("CMS Statistics Update Script Logic", () => {
  const validMockHomeBlock = {
    id: "block-home-stats",
    blockKey: "home-statistics",
    blockType: "statistics",
    content: {
      stats: [
        { id: "stat-1", label: "Global Expertise", order: 1, value: "19", suffix: "+", description: "Years Experience" },
        { id: "stat-2", label: "Trusted Network", order: 2, value: "350", suffix: "+", description: "Employer Partners" },
        { id: "stat-3", label: "Talent Placed", order: 3, value: "150k", suffix: "+", description: "Candidates Deployed" },
        { id: "stat-4", label: "Industry Focus", order: 4, value: "8", description: "Recruitment Sectors" },
        { id: "stat-5", label: "Infrastructure", order: 5, value: "3", description: "Training Facilities" },
        { id: "stat-6", label: "Compliance", order: 6, value: "100", suffix: "%", description: "RBA Committed" },
      ],
    },
  };

  const validMockAboutBlock = {
    id: "block_about_2",
    blockKey: "stats",
    blockType: "stats_grid",
    content: {
      stats: [
        { label: "Years Experience", value: "15+" },
        { label: "Global Partners", value: "50+" },
        { label: "Workers Deployed", value: "10k+" },
        { label: "Provinces Covered", value: "7" },
      ],
    },
  };

  it("validates current production baseline correctly", () => {
    const homeVal = validateHomeBaseline(validMockHomeBlock);
    expect(homeVal.alreadyUpToDate).toBe(false);

    const aboutVal = validateAboutBaseline(validMockAboutBlock);
    expect(aboutVal.alreadyUpToDate).toBe(false);
  });

  it("transforms homepage stats to approved values while preserving ordering and unrelated stats", () => {
    const transformed = transformHomeStats(validMockHomeBlock.content);

    // stat-1
    const s1 = transformed.stats.find((s: any) => s.id === "stat-1");
    expect(s1.value).toBe("2010");
    expect(s1.suffix).toBe("");
    expect(s1.description).toBe("Since 2010");
    expect(s1.label).toBe("Global Operations");
    expect(s1.order).toBe(1);

    // stat-6
    const s6 = transformed.stats.find((s: any) => s.id === "stat-6");
    expect(s6.value).toBe("RBA");
    expect(s6.suffix).toBe("");
    expect(s6.description).toBe("Aligned Framework");
    expect(s6.label).toBe("Ethical Standard");
    expect(s6.order).toBe(6);

    // Untouched stats preserved
    const s2 = transformed.stats.find((s: any) => s.id === "stat-2");
    expect(s2.value).toBe("350");
    expect(s2.suffix).toBe("+");
    const s3 = transformed.stats.find((s: any) => s.id === "stat-3");
    expect(s3.value).toBe("150k");
  });

  it("transforms about page stats to approved values", () => {
    const transformed = transformAboutStats(validMockAboutBlock.content);

    expect(transformed.stats[0]).toEqual({ label: "Established", value: "Since 2010" });
    expect(transformed.stats[1]).toEqual({ label: "Employer Partners", value: "350+" });
    expect(transformed.stats[2]).toEqual({ label: "Workers Deployed", value: "150,000+" });
    expect(transformed.stats[3]).toEqual({ label: "Provinces Covered", value: "7" });
  });

  it("detects when blocks are already updated (idempotency)", () => {
    const updatedHome = {
      ...validMockHomeBlock,
      content: transformHomeStats(validMockHomeBlock.content),
    };
    const homeVal = validateHomeBaseline(updatedHome);
    expect(homeVal.alreadyUpToDate).toBe(true);

    const updatedAbout = {
      ...validMockAboutBlock,
      content: transformAboutStats(validMockAboutBlock.content),
    };
    const aboutVal = validateAboutBaseline(updatedAbout);
    expect(aboutVal.alreadyUpToDate).toBe(true);
  });

  it("rejects blocks with unexpected deviations from baseline", () => {
    const corruptedHome = {
      ...validMockHomeBlock,
      content: {
        stats: [{ id: "stat-1", value: "999", suffix: "+", description: "Unknown" }],
      },
    };
    expect(() => validateHomeBaseline(corruptedHome)).toThrow();

    const corruptedAbout = {
      ...validMockAboutBlock,
      content: {
        stats: [{ label: "Unexpected", value: "random" }],
      },
    };
    expect(() => validateAboutBaseline(corruptedAbout)).toThrow();
  });

  describe("Backup Integrity and Secure Read-Back Verification", () => {
    const tempBackupPath = resolve(process.cwd(), "tests/scripts/temp-test-backup.json");

    it("successfully verifies valid backup file and computes SHA-256 checksum", () => {
      const validBackupData = {
        timestamp: new Date().toISOString(),
        dbFingerprint: "test-db-hash",
        homeBlock: {
          id: BASELINE.home.id,
          content: validMockHomeBlock.content,
        },
        aboutBlock: {
          id: BASELINE.about.id,
          content: validMockAboutBlock.content,
        },
      };

      writeFileSync(tempBackupPath, JSON.stringify(validBackupData, null, 2), "utf8");

      try {
        const result = verifyBackupIntegrity(tempBackupPath);
        expect(result.valid).toBe(true);
        expect(result.checksum).toMatch(/^[a-f0-9]{64}$/);
        expect(result.affectedBlocks).toEqual([BASELINE.home.id, BASELINE.about.id]);

        // Passing matching expected checksum passes
        expect(verifyBackupIntegrity(tempBackupPath, result.checksum).valid).toBe(true);

        // Passing wrong checksum throws error
        expect(() => verifyBackupIntegrity(tempBackupPath, "wrong-checksum-12345")).toThrow(
          /checksum mismatch/i
        );
      } finally {
        if (existsSync(tempBackupPath)) {
          unlinkSync(tempBackupPath);
        }
      }
    });

    it("aborts when backup file is missing or corrupted", () => {
      expect(() => verifyBackupIntegrity("non-existent-backup-path.json")).toThrow(
        /not found/i
      );

      writeFileSync(tempBackupPath, "INVALID_JSON_CONTENT", "utf8");
      try {
        expect(() => verifyBackupIntegrity(tempBackupPath)).toThrow(/corrupted or invalid JSON/i);
      } finally {
        if (existsSync(tempBackupPath)) {
          unlinkSync(tempBackupPath);
        }
      }
    });

    it("aborts when backup contains mismatched block IDs or incomplete blocks", () => {
      const incompleteBackup = {
        timestamp: new Date().toISOString(),
        homeBlock: { id: "wrong-id", content: { stats: [] } },
        aboutBlock: { id: BASELINE.about.id, content: { stats: [] } },
      };

      writeFileSync(tempBackupPath, JSON.stringify(incompleteBackup, null, 2), "utf8");
      try {
        expect(() => verifyBackupIntegrity(tempBackupPath)).toThrow(/block ID mismatch/i);
      } finally {
        if (existsSync(tempBackupPath)) {
          unlinkSync(tempBackupPath);
        }
      }
    });
  });
});
