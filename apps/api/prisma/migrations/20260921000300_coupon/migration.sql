-- coupon 模块：创建完整表结构、索引、外键，并写入数据库中文注释。

-- CreateTable
CREATE TABLE "coupon_activities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "batches" JSONB NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "coupon_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_tickets" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "coupon_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT,
    "codeExpires" TIMESTAMPTZ(3),

    CONSTRAINT "coupon_wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_merchants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "hours" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT '营业中',
    "operatorId" TEXT NOT NULL,

    CONSTRAINT "coupon_merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_verifications" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupon_wallet_code_key" ON "coupon_wallet"("code");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_wallet_userId_ticketId_key" ON "coupon_wallet"("userId", "ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_verifications_couponId_key" ON "coupon_verifications"("couponId");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_verifications_requestId_key" ON "coupon_verifications"("requestId");

-- AddForeignKey
ALTER TABLE "coupon_tickets" ADD CONSTRAINT "coupon_tickets_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "coupon_activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_wallet" ADD CONSTRAINT "coupon_wallet_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "coupon_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_verifications" ADD CONSTRAINT "coupon_verifications_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon_wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_verifications" ADD CONSTRAINT "coupon_verifications_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "coupon_merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 本迁移仅维护当前模块的数据库中文注释，不修改表结构和业务数据。
DO $$
DECLARE
  table_row record;
  column_row record;
  column_label text;
BEGIN
  FOR table_row IN
    SELECT * FROM (VALUES
      ('coupon_activities', '消费券活动'),
      ('coupon_tickets', '消费券券种'),
      ('coupon_wallet', '用户消费券'),
      ('coupon_merchants', '消费券适用门店'),
      ('coupon_verifications', '消费券核销记录')
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
