-- ============================================
-- 迁移脚本：为 products 表添加 keywords 字段
-- 执行日期：2026-06-04
-- ============================================

-- 添加 keywords 字段
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS keywords JSONB DEFAULT '[]'::jsonb;

-- 添加注释
COMMENT ON COLUMN products.keywords IS '产品关键词（用于智能匹配，数组）';

-- ============================================
-- 说明：
-- 1. 此脚本用于为现有数据库添加 keywords 字段
-- 2. 如果字段已存在，不会报错（IF NOT EXISTS）
-- 3. 默认值为空数组 []
-- ============================================
