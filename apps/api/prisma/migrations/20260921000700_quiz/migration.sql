-- quiz 模块：创建完整表结构、索引、外键，并写入数据库中文注释。

-- CreateTable
CREATE TABLE "quiz_assets" (
    "id" VARCHAR(60) NOT NULL,
    "object_key" VARCHAR(500) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_activities" (
    "id" VARCHAR(50) NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "minutes" INTEGER NOT NULL,
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6) NOT NULL,
    "image_asset_id" VARCHAR(60) NOT NULL,
    "thumbnail_asset_id" VARCHAR(60) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" VARCHAR(80) NOT NULL,
    "activity_id" VARCHAR(50) NOT NULL,
    "position" INTEGER NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "title" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correct" INTEGER[],
    "explanation" TEXT NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" UUID NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "activity_id" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMPTZ(6) NOT NULL,
    "finished_at" TIMESTAMPTZ(6),
    "reason" VARCHAR(20),
    "current_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "question_id" VARCHAR(80) NOT NULL,
    "position" INTEGER NOT NULL,
    "choices" INTEGER[],
    "correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_ranking_entries" (
    "id" VARCHAR(80) NOT NULL,
    "activity_id" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(80) NOT NULL,
    "score" INTEGER NOT NULL,
    "seconds" INTEGER NOT NULL,
    "avatar_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quiz_ranking_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_assets_object_key_key" ON "quiz_assets"("object_key");

-- CreateIndex
CREATE INDEX "quiz_activities_active_sort_idx" ON "quiz_activities"("active", "sort");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_questions_activity_id_position_key" ON "quiz_questions"("activity_id", "position");

-- CreateIndex
CREATE INDEX "quiz_attempts_activity_id_status_idx" ON "quiz_attempts"("activity_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_attempts_user_id_activity_id_key" ON "quiz_attempts"("user_id", "activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_answers_attempt_id_position_key" ON "quiz_answers"("attempt_id", "position");

-- CreateIndex
CREATE INDEX "quiz_ranking_entries_activity_id_score_seconds_idx" ON "quiz_ranking_entries"("activity_id", "score", "seconds");

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "quiz_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "quiz_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_ranking_entries" ADD CONSTRAINT "quiz_ranking_entries_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "quiz_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 本迁移仅维护当前模块的数据库中文注释，不修改表结构和业务数据。
DO $$
DECLARE
  table_row record;
  column_row record;
  column_label text;
BEGIN
  FOR table_row IN
    SELECT * FROM (VALUES
      ('quiz_assets', '答题应用资源'),
      ('quiz_activities', '答题活动'),
      ('quiz_questions', '答题题目'),
      ('quiz_attempts', '用户答题过程'),
      ('quiz_answers', '用户作答记录'),
      ('quiz_ranking_entries', '答题排行榜展示记录')
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
