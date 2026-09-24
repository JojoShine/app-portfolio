-- green-points 模块：创建完整表结构、索引、外键，并写入数据库中文注释。

-- CreateTable
CREATE TABLE "green_points_products" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "price" INTEGER NOT NULL,
    "original" INTEGER,
    "stock" INTEGER NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 2,
    "spec" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "site" VARCHAR(160),
    "address" VARCHAR(300),
    "hours" VARCHAR(120),
    "image_asset_id" VARCHAR(60) NOT NULL,
    "activity_id" VARCHAR(50),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "green_points_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "green_points_coupons" (
    "id" VARCHAR(50) NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "amount" INTEGER NOT NULL,
    "minimum" INTEGER NOT NULL,
    "days" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "green_points_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "green_points_activities" (
    "id" VARCHAR(50) NOT NULL,
    "type" VARCHAR(40) NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6) NOT NULL,
    "bonus" INTEGER NOT NULL DEFAULT 0,
    "product_ids" JSONB NOT NULL DEFAULT '[]',
    "image_asset_id" VARCHAR(60) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "green_points_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "green_points_assets" (
    "id" VARCHAR(60) NOT NULL,
    "object_key" VARCHAR(500) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "green_points_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "green_points_accounts" (
    "user_id" VARCHAR(255) NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "state" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "green_points_accounts_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "green_points_configs" (
    "id" VARCHAR(50) NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "green_points_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "green_points_products_active_sort_idx" ON "green_points_products"("active", "sort");

-- CreateIndex
CREATE UNIQUE INDEX "green_points_assets_object_key_key" ON "green_points_assets"("object_key");

-- 本迁移仅维护当前模块的数据库中文注释，不修改表结构和业务数据。
DO $$
DECLARE
  table_row record;
  column_row record;
  column_label text;
BEGIN
  FOR table_row IN
    SELECT * FROM (VALUES
      ('green_points_products', '积分商城商品'),
      ('green_points_coupons', '积分商城抵扣券'),
      ('green_points_activities', '积分商城活动'),
      ('green_points_assets', '积分商城资源'),
      ('green_points_accounts', '用户积分账户'),
      ('green_points_configs', '积分商城配置')
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
