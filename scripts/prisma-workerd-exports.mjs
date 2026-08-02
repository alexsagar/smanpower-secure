// Make the generated Prisma client resolve to its WASM runtime on workerd.
//
// `prisma generate` writes node_modules/.prisma/client/package.json with export
// maps that list "node" BEFORE "workerd":
//
//   "#main-entry-point": { "require": { "node": "./index.js", "workerd": "./wasm.js", ... } }
//
// Conditional exports resolve in declaration order, so the `node` condition wins
// and the bundler pulls runtime/library.js — the Node-API native engine. That
// engine compiles code from strings, which workerd forbids, so every SSR route
// throws "Code generation from strings disallowed for this context".
//
// OpenNext already passes esbuild `conditions: ["workerd"]`, but that is not
// enough on its own: esbuild builds the server with platform "node", so the
// `node` condition is also active and, being listed first, wins. Reordering the
// keys so workerd/worker come first is what actually makes the condition bite.
//
// This runs after `prisma generate` (which rewrites the file every build, so a
// patch-package style patch would not survive).
//
// ponytail: key reordering, ~20 lines. Delete this and the build step the moment
// we move to Prisma 6.6+ `prisma-client` generator with runtime = "workerd",
// which emits a workerd-correct client directly.

import { readFile, writeFile } from "node:fs/promises";

const PKG = new URL(
  "../node_modules/.prisma/client/package.json",
  import.meta.url,
);
const PREFERRED = ["workerd", "worker", "edge-light"];

/** Rebuild a conditions object with the workerd-ish keys hoisted above "node". */
function hoist(conditions) {
  if (!conditions || typeof conditions !== "object") return conditions;
  const keys = Object.keys(conditions);
  if (!keys.includes("node") || !PREFERRED.some((k) => keys.includes(k))) {
    return conditions;
  }
  const hoisted = PREFERRED.filter((k) => keys.includes(k));
  return Object.fromEntries(
    [...hoisted, ...keys.filter((k) => !hoisted.includes(k))].map((k) => [
      k,
      conditions[k],
    ]),
  );
}

const pkg = JSON.parse(await readFile(PKG, "utf8"));

for (const entry of [pkg.exports?.["."], pkg.imports?.["#main-entry-point"]]) {
  if (!entry) continue;
  for (const kind of ["require", "import"]) {
    if (entry[kind]) entry[kind] = hoist(entry[kind]);
  }
}

await writeFile(PKG, `${JSON.stringify(pkg, null, 2)}\n`);
console.log("prisma: hoisted workerd export conditions above node");
