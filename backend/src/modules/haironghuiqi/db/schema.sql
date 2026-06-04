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

-- 产品状态枚举
CREATE TYPE product_status AS ENUM ('active', 'inactive');
COMMENT ON TYPE product_status IS '产品状态：active(活跃)、inactive(非活跃)';

-- ============================================
-- 创建 institutions 表（金融机构表）
-- ============================================
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category institution_category NOT NULL,
  address VARCHAR(500) NOT NULL,
  business_hours VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  logo VARCHAR(500),
  description TEXT,
  status institution_status DEFAULT 'active',
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE institutions IS '金融机构表';
COMMENT ON COLUMN institutions.id IS '机构ID（UUID）';
COMMENT ON COLUMN institutions.name IS '机构名称';
COMMENT ON COLUMN institutions.category IS '机构分类';
COMMENT ON COLUMN institutions.address IS '机构地址';
COMMENT ON COLUMN institutions.business_hours IS '营业时间';
COMMENT ON COLUMN institutions.phone IS '联系电话';
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
-- 创建 products 表（金融产品表）
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_loan_amount DECIMAL(15, 2),
  max_loan_term INTEGER,
  min_annual_rate DECIMAL(5, 2),
  application_conditions TEXT,
  processing_flow TEXT,
  required_documents TEXT,
  repayment_method VARCHAR(255),
  fee_description TEXT,
  risk_warning TEXT,
  product_features TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  keywords JSONB DEFAULT '[]'::jsonb,
  status product_status DEFAULT 'active',
  sort INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE products IS '金融产品表';
COMMENT ON COLUMN products.id IS '产品ID（UUID）';
COMMENT ON COLUMN products.institution_id IS '所属机构ID';
COMMENT ON COLUMN products.name IS '产品名称';
COMMENT ON COLUMN products.description IS '产品描述';
COMMENT ON COLUMN products.max_loan_amount IS '最高贷款额度（万元）';
COMMENT ON COLUMN products.max_loan_term IS '最长贷款期限（年）';
COMMENT ON COLUMN products.min_annual_rate IS '最低年化率（%）';
COMMENT ON COLUMN products.application_conditions IS '申请条件';
COMMENT ON COLUMN products.processing_flow IS '办理流程';
COMMENT ON COLUMN products.required_documents IS '所需材料';
COMMENT ON COLUMN products.repayment_method IS '还款方式';
COMMENT ON COLUMN products.fee_description IS '费用说明';
COMMENT ON COLUMN products.risk_warning IS '风险提示';
COMMENT ON COLUMN products.product_features IS '产品特点/优势';
COMMENT ON COLUMN products.tags IS '产品标签（数组）';
COMMENT ON COLUMN products.keywords IS '产品关键词（用于智能匹配，数组）';
COMMENT ON COLUMN products.status IS '产品状态';
COMMENT ON COLUMN products.sort IS '排序字段（升序）';
COMMENT ON COLUMN products.is_featured IS '是否为明星产品';
COMMENT ON COLUMN products.created_at IS '创建时间';
COMMENT ON COLUMN products.updated_at IS '更新时间';

-- ============================================
-- 申请表
-- ============================================

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_name VARCHAR(255),
  user_phone VARCHAR(20),
  user_id_card VARCHAR(18),
  user_work_unit VARCHAR(255),
  application_type VARCHAR(50) DEFAULT 'apply',
  status VARCHAR(50) DEFAULT 'pending',
  remark TEXT DEFAULT '',
  requirement_description TEXT DEFAULT '',
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE applications IS '申请表';
COMMENT ON COLUMN applications.id IS '申请ID（UUID）';
COMMENT ON COLUMN applications.user_id IS '用户ID';
COMMENT ON COLUMN applications.institution_id IS '机构ID';
COMMENT ON COLUMN applications.product_id IS '产品ID';
COMMENT ON COLUMN applications.user_name IS '用户姓名';
COMMENT ON COLUMN applications.user_phone IS '用户手机号';
COMMENT ON COLUMN applications.user_id_card IS '用户身份证号';
COMMENT ON COLUMN applications.user_work_unit IS '用户工作单位';
COMMENT ON COLUMN applications.application_type IS '申请类型（apply/consult）';
COMMENT ON COLUMN applications.status IS '申请状态（pending/submitted/approved/rejected）';
COMMENT ON COLUMN applications.remark IS '备注';
COMMENT ON COLUMN applications.sort IS '排序字段（升序）';
COMMENT ON COLUMN applications.created_at IS '创建时间';
COMMENT ON COLUMN applications.updated_at IS '更新时间';
COMMENT ON COLUMN applications.deleted_at IS '删除时间（逻辑删除）';
COMMENT ON COLUMN applications.requirement_description IS '需求说明';

-- ============================================
-- 创建 user_work_units 表（用户工作单位关联表）
-- ============================================

CREATE TABLE IF NOT EXISTS user_work_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  work_unit VARCHAR(255) NOT NULL,
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE user_work_units IS '用户工作单位关联表';
COMMENT ON COLUMN user_work_units.id IS '关联ID（UUID）';
COMMENT ON COLUMN user_work_units.user_id IS '用户ID';
COMMENT ON COLUMN user_work_units.work_unit IS '工作单位';
COMMENT ON COLUMN user_work_units.sort IS '排序字段（升序）';
COMMENT ON COLUMN user_work_units.created_at IS '创建时间';
COMMENT ON COLUMN user_work_units.updated_at IS '更新时间';
COMMENT ON COLUMN user_work_units.deleted_at IS '删除时间（逻辑删除）';

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

-- products 表索引
CREATE INDEX IF NOT EXISTS idx_products_institution_id ON products(institution_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort);

-- applications 表索引
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_institution_id ON applications(institution_id);
CREATE INDEX IF NOT EXISTS idx_applications_product_id ON applications(product_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- user_work_units 表索引
CREATE INDEX IF NOT EXISTS idx_user_work_units_user_id ON user_work_units(user_id);
