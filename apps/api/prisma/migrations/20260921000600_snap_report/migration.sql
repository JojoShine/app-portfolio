-- snap-report 模块：创建完整表结构、索引、外键，并写入数据库中文注释。

-- CreateTable
CREATE TABLE "snap_reports" (
    "id" UUID NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "request_id" UUID NOT NULL,
    "content" JSONB NOT NULL,
    "analysis_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snap_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snap_report_photos" (
    "report_id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "snap_report_photos_pkey" PRIMARY KEY ("report_id","file_id")
);

-- CreateTable
CREATE TABLE "snap_analyses" (
    "id" UUID NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "file_ids" UUID[],
    "result" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snap_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "snap_reports_user_id_created_at_idx" ON "snap_reports"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "snap_reports_user_id_request_id_key" ON "snap_reports"("user_id", "request_id");

-- CreateIndex
CREATE INDEX "snap_analyses_user_id_created_at_idx" ON "snap_analyses"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "snap_report_photos" ADD CONSTRAINT "snap_report_photos_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "snap_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snap_report_photos" ADD CONSTRAINT "snap_report_photos_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 本迁移仅维护当前模块的数据库中文注释，不修改表结构和业务数据。
DO $$
DECLARE
  table_row record;
  column_row record;
  column_label text;
BEGIN
  FOR table_row IN
    SELECT * FROM (VALUES
      ('snap_reports', '市民随手拍上报'),
      ('snap_report_photos', '上报照片关系'),
      ('snap_analyses', '照片智能识别结果')
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
