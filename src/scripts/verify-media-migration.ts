import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const REQUIRED_MIGRATION = "20260715064834_add_authoritative_media_placements";
const ALLOWED_DATABASES = new Set(["smanpower_qa", "smanpower_staging"]);
const REQUIRED_INDEXES = [
  "CmsContentBlock_videoId_idx",
  "CmsContentBlock_posterImageId_idx",
  "CmsContentBlock_mobileImageId_idx",
  "CmsHeroSection_posterImageId_idx",
  "CmsHeroSection_mobileImageId_idx",
  "MediaAsset_resourceType_idx",
] as const;
const REQUIRED_FOREIGN_KEYS = [
  "CmsHeroSection_posterImageId_fkey",
  "CmsHeroSection_mobileImageId_fkey",
  "CmsContentBlock_videoId_fkey",
  "CmsContentBlock_posterImageId_fkey",
  "CmsContentBlock_mobileImageId_fkey",
] as const;
const REQUIRED_COLUMNS = [
  ["MediaAsset", "resourceType"],
  ["CmsHeroSection", "posterImageId"],
  ["CmsHeroSection", "mobileImageId"],
  ["CmsContentBlock", "videoId"],
  ["CmsContentBlock", "posterImageId"],
  ["CmsContentBlock", "mobileImageId"],
] as const;

function getTargetDetails() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const parsed = new URL(dbUrl);
  const host = parsed.hostname;
  const database = parsed.pathname.replace(/^\//, "");
  const appEnv = (process.env.APP_ENV || "").toLowerCase();

  if (appEnv === "production") {
    throw new Error("Refusing to run against APP_ENV=production.");
  }

  if (!ALLOWED_DATABASES.has(database)) {
    throw new Error(`Refusing to run against unsupported database "${database}".`);
  }

  if (database === "smanpower_staging" && appEnv !== "staging") {
    throw new Error("smanpower_staging requires APP_ENV=staging.");
  }

  if (database === "smanpower_qa" && host !== "localhost" && host !== "127.0.0.1") {
    throw new Error("smanpower_qa verification must run against localhost.");
  }

  return {
    host,
    database,
    appEnv: appEnv || "unknown",
  };
}

async function main() {
  const target = getTargetDetails();

  const migrationRows = await prisma.$queryRaw<Array<{
    migration_name: string;
    finished_at: Date | null;
    rolled_back_at: Date | null;
  }>>`
    SELECT migration_name, finished_at, rolled_back_at
    FROM "_prisma_migrations"
    WHERE migration_name = ${REQUIRED_MIGRATION}
  `;

  if (
    migrationRows.length !== 1 ||
    !migrationRows[0].finished_at ||
    migrationRows[0].rolled_back_at
  ) {
    throw new Error(`Required migration ${REQUIRED_MIGRATION} is missing or incomplete.`);
  }

  const [mediaRows, nullResourceTypeRows, heroRows, blockRows] = await Promise.all([
    prisma.mediaAsset.count(),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM "MediaAsset"
      WHERE "resourceType" IS NULL
    `,
    prisma.cmsHeroSection.count(),
    prisma.cmsContentBlock.count(),
  ]);

  const nullResourceTypes = Number(nullResourceTypeRows[0]?.count || 0);

  if (nullResourceTypes !== 0) {
    throw new Error(`Found ${nullResourceTypes} MediaAsset rows with null resourceType.`);
  }

  const columns = await prisma.$queryRaw<Array<{ table_name: string; column_name: string }>>`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (
        (table_name = 'MediaAsset' AND column_name = 'resourceType')
        OR (table_name = 'CmsHeroSection' AND column_name IN ('posterImageId', 'mobileImageId'))
        OR (table_name = 'CmsContentBlock' AND column_name IN ('videoId', 'posterImageId', 'mobileImageId'))
      )
  `;

  for (const [tableName, columnName] of REQUIRED_COLUMNS) {
    const present = columns.some(
      (column) => column.table_name === tableName && column.column_name === columnName
    );
    if (!present) {
      throw new Error(`Missing expected column ${tableName}.${columnName}.`);
    }
  }

  const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname IN (${Prisma.join(REQUIRED_INDEXES)})
  `;

  for (const indexName of REQUIRED_INDEXES) {
    if (!indexes.some((index) => index.indexname === indexName)) {
      throw new Error(`Missing expected index ${indexName}.`);
    }
  }

  const foreignKeys = await prisma.$queryRaw<Array<{ constraint_name: string }>>`
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name IN (${Prisma.join(REQUIRED_FOREIGN_KEYS)})
  `;

  for (const constraintName of REQUIRED_FOREIGN_KEYS) {
    if (!foreignKeys.some((constraint) => constraint.constraint_name === constraintName)) {
      throw new Error(`Missing expected foreign key ${constraintName}.`);
    }
  }

  console.log(
    JSON.stringify(
      {
        target,
        migration: REQUIRED_MIGRATION,
        mediaRows,
        nullResourceTypes,
        heroRows,
        blockRows,
        indexesVerified: REQUIRED_INDEXES.length,
        foreignKeysVerified: REQUIRED_FOREIGN_KEYS.length,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Media migration verification failed."
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
