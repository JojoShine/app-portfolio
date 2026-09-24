-- enrollment 模块：创建完整表结构、索引、外键，并写入数据库中文注释。

-- CreateTable
CREATE TABLE "enrollment_seasons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "year" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_windows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "season_id" UUID NOT NULL,
    "stage" VARCHAR(30) NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_schools" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "season_id" UUID NOT NULL,
    "stage" VARCHAR(30) NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "scope_summary" TEXT NOT NULL,
    "policy_title" VARCHAR(255) NOT NULL,
    "policy_version" VARCHAR(50) NOT NULL,
    "policy_content" JSONB NOT NULL DEFAULT '{}',
    "form_rules" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_contents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "season_id" UUID,
    "type" VARCHAR(40) NOT NULL,
    "stage" VARCHAR(30),
    "category" VARCHAR(30),
    "title" VARCHAR(255) NOT NULL,
    "summary" TEXT,
    "content" JSONB NOT NULL DEFAULT '{}',
    "image_url" VARCHAR(500),
    "target" VARCHAR(500),
    "starts_at" TIMESTAMPTZ(6),
    "ends_at" TIMESTAMPTZ(6),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_user_id" VARCHAR(255) NOT NULL,
    "season_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "stage" VARCHAR(30) NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "student_name_encrypted" TEXT NOT NULL,
    "student_name_hash" VARCHAR(64) NOT NULL,
    "student_id_encrypted" TEXT NOT NULL,
    "student_id_hash" VARCHAR(64) NOT NULL,
    "student_id_last_six_hash" VARCHAR(64) NOT NULL,
    "payload_encrypted" TEXT NOT NULL,
    "draft_version" INTEGER NOT NULL DEFAULT 1,
    "policy_version" VARCHAR(50),
    "policy_confirmed_at" TIMESTAMPTZ(6),
    "authorization_version" VARCHAR(50),
    "authorized_at" TIMESTAMPTZ(6),
    "declaration_version" VARCHAR(50),
    "truth_confirmed_at" TIMESTAMPTZ(6),
    "submitted_at" TIMESTAMPTZ(6),
    "submission_receipt" VARCHAR(32),
    "idempotency_key" VARCHAR(100),
    "review_message" TEXT,
    "returned_fields" JSONB NOT NULL DEFAULT '[]',
    "offline_arrangement" JSONB,
    "admitted_school_name" VARCHAR(160),
    "has_update" BOOLEAN NOT NULL DEFAULT false,
    "last_viewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_application_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "event" VARCHAR(40) NOT NULL,
    "snapshot_encrypted" TEXT NOT NULL,
    "created_by" VARCHAR(255) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_application_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_verifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "type" VARCHAR(40) NOT NULL,
    "source" VARCHAR(100) NOT NULL,
    "adapter_version" VARCHAR(40) NOT NULL,
    "queried_at" TIMESTAMPTZ(6) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "original_encrypted" TEXT,
    "declared_encrypted" TEXT,
    "manually_modified" BOOLEAN NOT NULL DEFAULT false,
    "modification_reason" TEXT,
    "failure_reason" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_materials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "item_code" VARCHAR(80) NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_publications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "season_id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ(6),
    "arrangement" JSONB,
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "application_id" UUID,
    "actor_id" VARCHAR(255) NOT NULL,
    "action" VARCHAR(80) NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "request_id" VARCHAR(80),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_profiles" (
    "user_id" VARCHAR(255) NOT NULL,
    "payload_encrypted" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "enrollment_department_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" VARCHAR(255) NOT NULL,
    "student_id_hash" VARCHAR(64) NOT NULL,
    "type" VARCHAR(40) NOT NULL,
    "source" VARCHAR(100) NOT NULL,
    "payload_encrypted" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_department_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_districts" (
    "id" VARCHAR(80) NOT NULL,
    "season_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "enrollment_districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollment_district_schools" (
    "district_id" VARCHAR(80) NOT NULL,
    "school_id" UUID NOT NULL,

    CONSTRAINT "enrollment_district_schools_pkey" PRIMARY KEY ("district_id","school_id")
);

-- CreateTable
CREATE TABLE "enrollment_property_degrees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "address" VARCHAR(500) NOT NULL,
    "certificate_hash" VARCHAR(64) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "year" INTEGER,
    "stage" VARCHAR(30),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "enrollment_property_degrees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_seasons_year_key" ON "enrollment_seasons"("year");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_windows_season_id_stage_category_key" ON "enrollment_windows"("season_id", "stage", "category");

-- CreateIndex
CREATE INDEX "idx_enrollment_schools_catalog" ON "enrollment_schools"("season_id", "stage", "category", "active", "sort");

-- CreateIndex
CREATE INDEX "idx_enrollment_contents_portal" ON "enrollment_contents"("season_id", "type", "active", "sort");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_applications_submission_receipt_key" ON "enrollment_applications"("submission_receipt");

-- CreateIndex
CREATE INDEX "idx_enrollment_applications_owner" ON "enrollment_applications"("owner_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_enrollment_applications_review" ON "enrollment_applications"("season_id", "stage", "status");

-- CreateIndex
CREATE INDEX "idx_enrollment_applications_public_query" ON "enrollment_applications"("season_id", "student_name_hash", "student_id_last_six_hash", "status");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_application_versions_application_id_version_key" ON "enrollment_application_versions"("application_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_verifications_application_id_type_key" ON "enrollment_verifications"("application_id", "type");

-- CreateIndex
CREATE INDEX "idx_enrollment_materials_application" ON "enrollment_materials"("application_id", "item_code", "sort");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_publications_season_id_type_key" ON "enrollment_publications"("season_id", "type");

-- CreateIndex
CREATE INDEX "idx_enrollment_audit_application" ON "enrollment_audit_logs"("application_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_department_records_user_id_student_id_hash_type_key" ON "enrollment_department_records"("user_id", "student_id_hash", "type");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_property_degrees_address_key" ON "enrollment_property_degrees"("address");

-- CreateIndex
CREATE UNIQUE INDEX "enrollment_property_degrees_certificate_hash_key" ON "enrollment_property_degrees"("certificate_hash");

-- AddForeignKey
ALTER TABLE "enrollment_windows" ADD CONSTRAINT "enrollment_windows_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "enrollment_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_schools" ADD CONSTRAINT "enrollment_schools_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "enrollment_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_contents" ADD CONSTRAINT "enrollment_contents_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "enrollment_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_applications" ADD CONSTRAINT "enrollment_applications_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "enrollment_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_applications" ADD CONSTRAINT "enrollment_applications_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "enrollment_schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_application_versions" ADD CONSTRAINT "enrollment_application_versions_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "enrollment_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_verifications" ADD CONSTRAINT "enrollment_verifications_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "enrollment_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_materials" ADD CONSTRAINT "enrollment_materials_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "enrollment_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_materials" ADD CONSTRAINT "enrollment_materials_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_publications" ADD CONSTRAINT "enrollment_publications_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "enrollment_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_audit_logs" ADD CONSTRAINT "enrollment_audit_logs_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "enrollment_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_districts" ADD CONSTRAINT "enrollment_districts_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "enrollment_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_district_schools" ADD CONSTRAINT "enrollment_district_schools_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "enrollment_districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_district_schools" ADD CONSTRAINT "enrollment_district_schools_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "enrollment_schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 本迁移仅维护当前模块的数据库中文注释，不修改表结构和业务数据。
DO $$
DECLARE
  table_row record;
  column_row record;
  column_label text;
BEGIN
  FOR table_row IN
    SELECT * FROM (VALUES
      ('enrollment_seasons', '招生年度'),
      ('enrollment_windows', '招生报名时间窗口'),
      ('enrollment_schools', '招生学校'),
      ('enrollment_contents', '招生门户内容'),
      ('enrollment_applications', '招生报名记录'),
      ('enrollment_application_versions', '报名历史版本'),
      ('enrollment_verifications', '部门数据核验记录'),
      ('enrollment_materials', '报名材料'),
      ('enrollment_publications', '招生结果发布配置'),
      ('enrollment_audit_logs', '招生审计日志'),
      ('enrollment_profiles', '招生用户资料'),
      ('enrollment_department_records', '部门共享数据'),
      ('enrollment_districts', '招生学区'),
      ('enrollment_district_schools', '学区学校关系'),
      ('enrollment_property_degrees', '房产学位核验目录')
    ) AS module_tables(table_name, table_label)
  LOOP
    EXECUTE format('COMMENT ON TABLE %I IS %L', table_row.table_name, table_row.table_label);
    FOR column_row IN
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = table_row.table_name
    LOOP
      column_label := CASE column_row.column_name
        WHEN 'id' THEN '唯一标识'
        WHEN 'user_id' THEN '用户标识'
        WHEN 'owner_user_id' THEN '所属用户标识'
        WHEN 'name' THEN '名称'
        WHEN 'title' THEN '标题'
        WHEN 'description' THEN '说明'
        WHEN 'summary' THEN '摘要'
        WHEN 'type' THEN '业务类型'
        WHEN 'status' THEN '业务状态'
        WHEN 'active' THEN '是否启用'
        WHEN 'sort' THEN '展示排序值'
        WHEN 'position' THEN '顺序位置'
        WHEN 'created_at' THEN '创建时间'
        WHEN 'updated_at' THEN '更新时间'
        WHEN 'started_at' THEN '开始时间'
        WHEN 'starts_at' THEN '开始时间'
        WHEN 'ends_at' THEN '结束时间'
        WHEN 'finished_at' THEN '完成时间'
        WHEN 'activity_id' THEN '所属活动标识'
        WHEN 'file_id' THEN '文件标识'
        WHEN 'object_key' THEN '对象存储键'
        WHEN 'mime_type' THEN '媒体类型'
        ELSE '业务字段（' || column_row.column_name || '）'
      END;
      EXECUTE format('COMMENT ON COLUMN %I.%I IS %L', table_row.table_name, column_row.column_name, table_row.table_label || '：' || column_label);
    END LOOP;
  END LOOP;
END $$;
