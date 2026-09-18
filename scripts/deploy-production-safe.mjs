/**
 * scripts/deploy-production-safe.mjs
 *
 * Safe Production Deploy Wrapper (npm run deploy:production:safe)
 *
 * For supervised local or emergency production releases.
 * Orchestrates the full Phase 1B.2A-S5 production release pipeline:
 * 1. buildProductionCi: preflight, DB sanity, clean build isolation, truth manifest, OpenNext build, artifact truth verification, artifact certification.
 * 2. deployProductionCi: artifact certification validation, zero-rebuild integrity verification, deployment, post-deployment smoke tests, rollback audit.
 */

import { buildProductionCi } from "./build-production-ci.mjs";
import { deployProductionCi } from "./deploy-production-ci.mjs";

export async function deployProductionSafe(options = {}) {
  console.log("================================================================");
  console.log("🚀  SAFE SUPERVISED PRODUCTION RELEASE (Phase 1B.2A-S5)");
  console.log("================================================================\n");

  // Step 1: Execute Safe Production Build Pipeline
  console.log("--- PHASE 1: BUILD & CERTIFICATION ---");
  await buildProductionCi(options);

  // Step 2: Execute Certified Artifact Deployment & Health Gate
  console.log("\n--- PHASE 2: DEPLOYMENT & HEALTH GATE ---");
  await deployProductionCi(options);
}

// If invoked directly from CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/deploy-production-safe.mjs")) {
  deployProductionSafe()
    .catch((err) => {
      console.error("Unhandled deployment error:", err);
      process.exit(1);
    });
}
