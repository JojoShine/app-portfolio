-- ============================================
-- 数据库初始化脚本
-- ============================================

-- ============================================
-- 创建 ENUM 类型
-- ============================================

-- 用户状态枚举
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');
COMMENT ON TYPE user_status IS '用户状态：active(活跃)、inactive(非活跃)、banned(禁用)';

-- 文件类型枚举
CREATE TYPE file_type_enum AS ENUM ('image', 'document', 'video', 'audio', 'other');
COMMENT ON TYPE file_type_enum IS '文件类型：image(图片)、document(文档)、video(视频)、audio(音频)、other(其他)';

-- 应用状态枚举
CREATE TYPE app_status AS ENUM ('active', 'developing', 'offline');
COMMENT ON TYPE app_status IS '应用状态：active(可用)、developing(开发中)、offline(下线)';

-- ============================================
-- 创建 users 表（用户表）
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  avatar VARCHAR(255),
  status user_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.id IS '用户ID（UUID）';
COMMENT ON COLUMN users.username IS '用户名（唯一）';
COMMENT ON COLUMN users.email IS '邮箱（唯一）';
COMMENT ON COLUMN users.phone IS '电话号码';
COMMENT ON COLUMN users.avatar IS '头像URL';
COMMENT ON COLUMN users.status IS '用户状态';
COMMENT ON COLUMN users.created_at IS '创建时间';
COMMENT ON COLUMN users.updated_at IS '更新时间';

-- ============================================
-- 创建 files 表（文件表）
-- ============================================
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  path VARCHAR(500) NOT NULL UNIQUE,
  file_type file_type_enum DEFAULT 'other',
  uploaded_by UUID,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE files IS '文件表';
COMMENT ON COLUMN files.id IS '文件ID（UUID）';
COMMENT ON COLUMN files.filename IS '存储的文件名';
COMMENT ON COLUMN files.original_name IS '原始文件名';
COMMENT ON COLUMN files.mime_type IS '文件MIME类型';
COMMENT ON COLUMN files.size IS '文件大小（字节）';
COMMENT ON COLUMN files.path IS '文件存储路径（唯一）';
COMMENT ON COLUMN files.file_type IS '文件类型';
COMMENT ON COLUMN files.uploaded_by IS '上传者ID';
COMMENT ON COLUMN files.is_public IS '是否公开';
COMMENT ON COLUMN files.created_at IS '创建时间';
COMMENT ON COLUMN files.updated_at IS '更新时间';

-- ============================================
-- 创建 categories 表（应用分类表）
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE categories IS '应用分类表';
COMMENT ON COLUMN categories.id IS '分类ID（UUID）';
COMMENT ON COLUMN categories.name IS '分类名称（唯一）';
COMMENT ON COLUMN categories.sort IS '排序字段（升序）';
COMMENT ON COLUMN categories.created_at IS '创建时间';
COMMENT ON COLUMN categories.updated_at IS '更新时间';

-- ============================================
-- 创建 apps 表（应用表）
-- ============================================
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  icon VARCHAR(100),
  path VARCHAR(255) NOT NULL,
  status app_status DEFAULT 'developing',
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_scenario BOOLEAN DEFAULT FALSE,
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE apps IS '应用表';
COMMENT ON COLUMN apps.id IS '应用ID（UUID）';
COMMENT ON COLUMN apps.name IS '应用名称';
COMMENT ON COLUMN apps.description IS '应用描述';
COMMENT ON COLUMN apps.icon IS '应用图标名称（lucide-react icon）';
COMMENT ON COLUMN apps.path IS '应用路由路径';
COMMENT ON COLUMN apps.status IS '应用状态';
COMMENT ON COLUMN apps.category_id IS '所属分类ID（外键）';
COMMENT ON COLUMN apps.is_scenario IS '是否为场景化应用（聚合多个应用服务）';
COMMENT ON COLUMN apps.sort IS '排序字段（升序）';
COMMENT ON COLUMN apps.created_at IS '创建时间';
COMMENT ON COLUMN apps.updated_at IS '更新时间';

-- ============================================
-- 创建索引
-- ============================================

-- users 表索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- files 表索引
CREATE INDEX IF NOT EXISTS idx_files_file_type ON files(file_type);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);

-- categories 表索引
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- apps 表索引
CREATE INDEX IF NOT EXISTS idx_apps_category_id ON apps(category_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_sort ON apps(sort);