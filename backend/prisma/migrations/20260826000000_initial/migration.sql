CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "user_status" AS ENUM ('active', 'inactive', 'banned');
CREATE TYPE "file_type_enum" AS ENUM ('image', 'document', 'video', 'audio', 'other');
CREATE TYPE "app_status" AS ENUM ('active', 'developing', 'offline');

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "username" VARCHAR(50) NOT NULL,
  "email" VARCHAR(255) NOT NULL, "phone" VARCHAR(20), "avatar" VARCHAR(255),
  "status" "user_status" NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "files" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "filename" VARCHAR(255) NOT NULL,
  "original_name" VARCHAR(255) NOT NULL, "mime_type" VARCHAR(100) NOT NULL,
  "size" INTEGER NOT NULL, "path" VARCHAR(500) NOT NULL,
  "file_type" "file_type_enum" NOT NULL DEFAULT 'other', "uploaded_by" VARCHAR(255),
  "is_public" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "name" VARCHAR(100) NOT NULL,
  "sort" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "apps" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "name" VARCHAR(100) NOT NULL,
  "description" VARCHAR(500), "icon" VARCHAR(100), "path" VARCHAR(255) NOT NULL,
  "status" "app_status" NOT NULL DEFAULT 'developing', "category_id" UUID NOT NULL,
  "is_scenario" BOOLEAN NOT NULL DEFAULT false, "sort" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enrollment_seasons" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "year" INTEGER NOT NULL,
  "name" VARCHAR(100) NOT NULL, "active" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "enrollment_seasons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enrollment_windows" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "season_id" UUID NOT NULL,
  "stage" VARCHAR(30) NOT NULL, "category" VARCHAR(30) NOT NULL,
  "starts_at" TIMESTAMPTZ(6) NOT NULL, "ends_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "enrollment_windows_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "enrollment_windows_stage_check" CHECK (stage IN ('kindergarten', 'primary', 'middle')),
  CONSTRAINT "enrollment_windows_category_check" CHECK (category IN ('urban', 'non_urban', 'private')),
  CONSTRAINT "enrollment_windows_dates_check" CHECK (ends_at > starts_at)
);

CREATE TABLE "enrollment_schools" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "season_id" UUID NOT NULL,
  "stage" VARCHAR(30) NOT NULL, "category" VARCHAR(30) NOT NULL,
  "name" VARCHAR(160) NOT NULL, "address" VARCHAR(500) NOT NULL,
  "scope_summary" TEXT NOT NULL, "policy_title" VARCHAR(255) NOT NULL,
  "policy_version" VARCHAR(50) NOT NULL, "policy_content" JSONB NOT NULL DEFAULT '{}',
  "form_rules" JSONB NOT NULL DEFAULT '{}', "active" BOOLEAN NOT NULL DEFAULT true,
  "sort" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "enrollment_schools_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "enrollment_schools_stage_check" CHECK (stage IN ('kindergarten', 'primary', 'middle')),
  CONSTRAINT "enrollment_schools_category_check" CHECK (category IN ('urban', 'non_urban', 'private'))
);

CREATE TABLE "enrollment_contents" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "season_id" UUID,
  "type" VARCHAR(40) NOT NULL, "stage" VARCHAR(30), "category" VARCHAR(30),
  "title" VARCHAR(255) NOT NULL, "summary" TEXT, "content" JSONB NOT NULL DEFAULT '{}',
  "image_url" VARCHAR(500), "target" VARCHAR(500), "starts_at" TIMESTAMPTZ(6),
  "ends_at" TIMESTAMPTZ(6), "active" BOOLEAN NOT NULL DEFAULT true,
  "sort" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "enrollment_contents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enrollment_applications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "owner_user_id" VARCHAR(255) NOT NULL,
  "season_id" UUID NOT NULL, "school_id" UUID NOT NULL, "stage" VARCHAR(30) NOT NULL,
  "category" VARCHAR(30) NOT NULL, "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
  "student_name_encrypted" TEXT NOT NULL, "student_name_hash" VARCHAR(64) NOT NULL,
  "student_id_encrypted" TEXT NOT NULL, "student_id_hash" VARCHAR(64) NOT NULL,
  "student_id_last_six_hash" VARCHAR(64) NOT NULL, "payload_encrypted" TEXT NOT NULL,
  "draft_version" INTEGER NOT NULL DEFAULT 1, "policy_version" VARCHAR(50),
  "policy_confirmed_at" TIMESTAMPTZ(6), "authorization_version" VARCHAR(50),
  "authorized_at" TIMESTAMPTZ(6), "declaration_version" VARCHAR(50),
  "truth_confirmed_at" TIMESTAMPTZ(6), "submitted_at" TIMESTAMPTZ(6),
  "submission_receipt" UUID, "idempotency_key" VARCHAR(100), "review_message" TEXT,
  "returned_fields" JSONB NOT NULL DEFAULT '[]', "offline_arrangement" JSONB,
  "admitted_school_name" VARCHAR(160), "has_update" BOOLEAN NOT NULL DEFAULT false,
  "last_viewed_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "enrollment_applications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "enrollment_applications_stage_check" CHECK (stage IN ('kindergarten', 'primary', 'middle')),
  CONSTRAINT "enrollment_applications_category_check" CHECK (category IN ('urban', 'non_urban', 'private')),
  CONSTRAINT "enrollment_applications_status_check" CHECK (status IN ('draft', 'reviewing', 'returned', 'initial_approved', 'initial_rejected', 'admitted'))
);

CREATE TABLE "enrollment_application_versions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "application_id" UUID NOT NULL,
  "version" INTEGER NOT NULL, "event" VARCHAR(40) NOT NULL,
  "snapshot_encrypted" TEXT NOT NULL, "created_by" VARCHAR(255) NOT NULL,
  "note" TEXT, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "enrollment_application_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enrollment_verifications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "application_id" UUID NOT NULL,
  "type" VARCHAR(40) NOT NULL, "source" VARCHAR(100) NOT NULL,
  "adapter_version" VARCHAR(40) NOT NULL, "queried_at" TIMESTAMPTZ(6) NOT NULL,
  "status" VARCHAR(30) NOT NULL, "original_encrypted" TEXT, "declared_encrypted" TEXT,
  "manually_modified" BOOLEAN NOT NULL DEFAULT false, "modification_reason" TEXT,
  "failure_reason" VARCHAR(255),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "enrollment_verifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "enrollment_verifications_type_check" CHECK (type IN ('household', 'property', 'social_security', 'business_license', 'parents_no_property'))
);

CREATE TABLE "enrollment_materials" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "application_id" UUID NOT NULL,
  "file_id" UUID NOT NULL, "item_code" VARCHAR(80) NOT NULL,
  "sort" INTEGER NOT NULL DEFAULT 0, "deleted_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "enrollment_materials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enrollment_publications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "season_id" UUID NOT NULL,
  "type" VARCHAR(20) NOT NULL, "published" BOOLEAN NOT NULL DEFAULT false,
  "published_at" TIMESTAMPTZ(6), "arrangement" JSONB, "updated_by" VARCHAR(255),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "enrollment_publications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "enrollment_publications_type_check" CHECK (type IN ('initial', 'final'))
);

CREATE TABLE "enrollment_audit_logs" (
  "id" BIGSERIAL NOT NULL, "application_id" UUID, "actor_id" VARCHAR(255) NOT NULL,
  "action" VARCHAR(80) NOT NULL, "details" JSONB NOT NULL DEFAULT '{}',
  "request_id" VARCHAR(80), "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "enrollment_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "idx_users_status" ON "users"("status");
CREATE UNIQUE INDEX "files_path_key" ON "files"("path");
CREATE INDEX "idx_files_file_type" ON "files"("file_type");
CREATE INDEX "idx_files_uploaded_by" ON "files"("uploaded_by");
CREATE INDEX "idx_files_created_at" ON "files"("created_at");
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX "apps_path_key" ON "apps"("path");
CREATE INDEX "idx_apps_category_id" ON "apps"("category_id");
CREATE INDEX "idx_apps_status" ON "apps"("status");
CREATE INDEX "idx_apps_sort" ON "apps"("sort");
CREATE UNIQUE INDEX "enrollment_seasons_year_key" ON "enrollment_seasons"("year");
CREATE UNIQUE INDEX "enrollment_windows_season_id_stage_category_key" ON "enrollment_windows"("season_id", "stage", "category");
CREATE INDEX "idx_enrollment_schools_catalog" ON "enrollment_schools"("season_id", "stage", "category", "active", "sort");
CREATE INDEX "idx_enrollment_contents_portal" ON "enrollment_contents"("season_id", "type", "active", "sort");
CREATE UNIQUE INDEX "enrollment_applications_submission_receipt_key" ON "enrollment_applications"("submission_receipt");
CREATE INDEX "idx_enrollment_applications_owner" ON "enrollment_applications"("owner_user_id", "created_at" DESC);
CREATE INDEX "idx_enrollment_applications_review" ON "enrollment_applications"("season_id", "stage", "status");
CREATE INDEX "idx_enrollment_applications_public_query" ON "enrollment_applications"("season_id", "student_name_hash", "student_id_last_six_hash", "status");
CREATE UNIQUE INDEX "idx_enrollment_one_active_application" ON "enrollment_applications"("season_id", "stage", "student_id_hash") WHERE status IN ('draft', 'reviewing', 'returned', 'initial_approved', 'admitted');
CREATE UNIQUE INDEX "enrollment_application_versions_application_id_version_key" ON "enrollment_application_versions"("application_id", "version");
CREATE UNIQUE INDEX "enrollment_verifications_application_id_type_key" ON "enrollment_verifications"("application_id", "type");
CREATE INDEX "idx_enrollment_materials_application" ON "enrollment_materials"("application_id", "item_code", "sort");
CREATE UNIQUE INDEX "enrollment_publications_season_id_type_key" ON "enrollment_publications"("season_id", "type");
CREATE INDEX "idx_enrollment_audit_application" ON "enrollment_audit_logs"("application_id", "created_at" DESC);

ALTER TABLE "apps" ADD CONSTRAINT "apps_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollment_windows" ADD CONSTRAINT "enrollment_windows_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "enrollment_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollment_schools" ADD CONSTRAINT "enrollment_schools_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "enrollment_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollment_contents" ADD CONSTRAINT "enrollment_contents_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "enrollment_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollment_applications" ADD CONSTRAINT "enrollment_applications_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "enrollment_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "enrollment_applications" ADD CONSTRAINT "enrollment_applications_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "enrollment_schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "enrollment_application_versions" ADD CONSTRAINT "enrollment_application_versions_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "enrollment_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollment_verifications" ADD CONSTRAINT "enrollment_verifications_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "enrollment_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollment_materials" ADD CONSTRAINT "enrollment_materials_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "enrollment_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollment_materials" ADD CONSTRAINT "enrollment_materials_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "enrollment_publications" ADD CONSTRAINT "enrollment_publications_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "enrollment_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollment_audit_logs" ADD CONSTRAINT "enrollment_audit_logs_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "enrollment_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
