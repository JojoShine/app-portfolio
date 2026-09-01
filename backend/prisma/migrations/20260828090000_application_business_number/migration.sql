ALTER TABLE "enrollment_applications"
  ALTER COLUMN "submission_receipt" TYPE VARCHAR(32)
  USING "submission_receipt"::TEXT;

WITH numbered_applications AS (
  SELECT
    "id",
    'BM'
      || TO_CHAR("created_at" AT TIME ZONE 'Asia/Shanghai', 'YYYYMMDD')
      || LPAD(ROW_NUMBER() OVER (ORDER BY "created_at", "id")::TEXT, 10, '0') AS "business_number"
  FROM "enrollment_applications"
)
UPDATE "enrollment_applications" AS application
SET "submission_receipt" = numbered."business_number"
FROM numbered_applications AS numbered
WHERE application."id" = numbered."id";

COMMENT ON COLUMN "enrollment_applications"."submission_receipt" IS '报名业务编号，格式为BM+日期+数字流水';
