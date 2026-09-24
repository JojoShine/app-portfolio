-- system 模块：创建完整表结构、索引、外键，并写入数据库中文注释。

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('active', 'inactive', 'banned');

-- CreateEnum
CREATE TYPE "file_type_enum" AS ENUM ('image', 'document', 'video', 'audio', 'other');

-- CreateEnum
CREATE TYPE "app_status" AS ENUM ('active', 'developing', 'offline');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "avatar" VARCHAR(255),
    "status" "user_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "filename" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "file_type" "file_type_enum" NOT NULL DEFAULT 'other',
    "uploaded_by" VARCHAR(255),
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "icon" VARCHAR(100),
    "path" VARCHAR(255) NOT NULL,
    "status" "app_status" NOT NULL DEFAULT 'developing',
    "category_id" UUID NOT NULL,
    "is_scenario" BOOLEAN NOT NULL DEFAULT false,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_status" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "files_path_key" ON "files"("path");

-- CreateIndex
CREATE INDEX "idx_files_file_type" ON "files"("file_type");

-- CreateIndex
CREATE INDEX "idx_files_uploaded_by" ON "files"("uploaded_by");

-- CreateIndex
CREATE INDEX "idx_files_created_at" ON "files"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "apps_path_key" ON "apps"("path");

-- CreateIndex
CREATE INDEX "idx_apps_category_id" ON "apps"("category_id");

-- CreateIndex
CREATE INDEX "idx_apps_status" ON "apps"("status");

-- CreateIndex
CREATE INDEX "idx_apps_sort" ON "apps"("sort");

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 本迁移仅维护当前模块的数据库中文注释，不修改表结构和业务数据。
DO $$
DECLARE
  table_row record;
  column_row record;
  column_label text;
BEGIN
  FOR table_row IN
    SELECT * FROM (VALUES
      ('users', '平台用户'),
      ('files', '文件资源元数据'),
      ('categories', '应用目录分类'),
      ('apps', '应用目录')
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
