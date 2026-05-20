-- ============================================
-- 海融惠企模块 - 数据库初始化脚本
-- ============================================

-- ============================================
-- 创建 ENUM 类型
-- ============================================

-- 机构分类枚举
CREATE TYPE institution_category AS ENUM ('bank', 'insurance', 'securities', 'other');
COMMENT ON TYPE institution_category IS '机构分类：bank(银行)、insurance(保险)、securities(证券)、other(其他)';

-- 机构状态枚举
CREATE TYPE institution_status AS ENUM ('active', 'inactive');
COMMENT ON TYPE institution_status IS '机构状态：active(活跃)、inactive(非活跃)';

-- ============================================
-- 创建 institutions 表（金融机构表）
-- ============================================
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category institution_category NOT NULL,
  address VARCHAR(500) NOT NULL,
  business_hours VARCHAR(100) NOT NULL,
  logo VARCHAR(500),
  description TEXT,
  status institution_status DEFAULT 'active',
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE institutions IS '金融机构表';
COMMENT ON COLUMN institutions.id IS '机构ID（UUID）';
COMMENT ON COLUMN institutions.name IS '机构名称';
COMMENT ON COLUMN institutions.category IS '机构分类';
COMMENT ON COLUMN institutions.address IS '机构地址';
COMMENT ON COLUMN institutions.business_hours IS '营业时间';
COMMENT ON COLUMN institutions.logo IS '机构logo URL（minio）';
COMMENT ON COLUMN institutions.description IS '机构描述';
COMMENT ON COLUMN institutions.status IS '机构状态';
COMMENT ON COLUMN institutions.sort IS '排序字段（升序）';
COMMENT ON COLUMN institutions.created_at IS '创建时间';
COMMENT ON COLUMN institutions.updated_at IS '更新时间';

-- ============================================
-- 创建 policies 表（金融政策表）
-- ============================================
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  logo VARCHAR(500),
  link VARCHAR(500),
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE policies IS '金融政策表';
COMMENT ON COLUMN policies.id IS '政策ID（UUID）';
COMMENT ON COLUMN policies.title IS '政策标题';
COMMENT ON COLUMN policies.content IS '政策内容';
COMMENT ON COLUMN policies.logo IS '政策logo URL（minio）';
COMMENT ON COLUMN policies.link IS '政策链接';
COMMENT ON COLUMN policies.published_at IS '发布时间';
COMMENT ON COLUMN policies.sort IS '排序字段（升序）';
COMMENT ON COLUMN policies.created_at IS '创建时间';
COMMENT ON COLUMN policies.updated_at IS '更新时间';

-- ============================================
-- 创建索引
-- ============================================

-- institutions 表索引
CREATE INDEX IF NOT EXISTS idx_institutions_category ON institutions(category);
CREATE INDEX IF NOT EXISTS idx_institutions_status ON institutions(status);
CREATE INDEX IF NOT EXISTS idx_institutions_sort ON institutions(sort);
CREATE INDEX IF NOT EXISTS idx_institutions_name ON institutions(name);

-- policies 表索引
CREATE INDEX IF NOT EXISTS idx_policies_published_at ON policies(published_at);
CREATE INDEX IF NOT EXISTS idx_policies_sort ON policies(sort);
