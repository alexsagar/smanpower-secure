-- Correct legacy media rows that were classified as DOCUMENT because mimeType was null.
-- This runs after 20260715064834_add_authoritative_media_placements.
UPDATE "MediaAsset"
SET "resourceType" = CASE
  WHEN (
    "fileUrl" ILIKE '%/video/upload/%'
    OR "duration" IS NOT NULL
    OR LOWER("fileName") ~ '\.(mp4|webm|mov|m4v|avi|mkv)$'
  )
    THEN 'VIDEO'::"MediaResourceType"
  WHEN (
    "fileUrl" ILIKE '%/image/upload/%'
    OR "width" IS NOT NULL
    OR "height" IS NOT NULL
    OR LOWER("fileName") ~ '\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|tif|tiff)$'
  )
    THEN 'IMAGE'::"MediaResourceType"
  ELSE "resourceType"
END
WHERE "resourceType" = 'DOCUMENT'::"MediaResourceType"
  AND (
    "fileUrl" ILIKE '%/video/upload/%'
    OR "duration" IS NOT NULL
    OR LOWER("fileName") ~ '\.(mp4|webm|mov|m4v|avi|mkv)$'
    OR "fileUrl" ILIKE '%/image/upload/%'
    OR "width" IS NOT NULL
    OR "height" IS NOT NULL
    OR LOWER("fileName") ~ '\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|tif|tiff)$'
  );
