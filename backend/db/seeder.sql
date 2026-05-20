-- 插入初始用户数据
INSERT INTO users (id, username, email, phone, status)
VALUES ('550e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@example.com', '13800138000', 'active'),
       ('550e8400-e29b-41d4-a716-446655440002', 'user1', 'user1@example.com', '13800138001', 'active'),
       ('550e8400-e29b-41d4-a716-446655440003', 'user2', 'user2@example.com', '13800138002',
        'active') ON CONFLICT (username) DO NOTHING;

-- 插入初始文件数据（可选）
-- INSERT INTO files (id, filename, original_name, mime_type, size, path, file_type, uploaded_by, is_public) VALUES
--   ('650e8400-e29b-41d4-a716-446655440001', '1715596800000-a1b2c3d4.jpg', 'avatar.jpg', 'image/jpeg', 102400, 'image/1715596800000-a1b2c3d4.jpg', 'image', '550e8400-e29b-41d4-a716-446655440001', true)
-- ON CONFLICT (path) DO NOTHING;

-- 应用和分类初始化脚本

-- 插入分类数据
INSERT INTO categories (id, name, sort, created_at, updated_at)
VALUES ('550e8400-e29b-41d4-a716-446655440002', '金融服务', 1, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440003', '生活服务', 2, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440004', '教育服务', 3, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440005', '社保医疗', 4, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440006', '政务服务', 5, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440007', '其他', 6, NOW(), NOW()) ON CONFLICT DO NOTHING;

-- 插入应用数据
INSERT INTO apps (id, name, description, icon, path, status, category_id, is_scenario, sort, created_at, updated_at)
VALUES ('550e8400-e29b-41d4-a716-446655440101', '海融惠企', '金融服务聚合平台', 'Wallet', '/haironghuiqi', 'active',
        '550e8400-e29b-41d4-a716-446655440002', false, 1, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440102', '公厕查询', '查询附近公厕', 'MapPin', '/public_toilet', 'developing',
        '550e8400-e29b-41d4-a716-446655440003', false, 1, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440103', '慈善服务', '慈善服务平台', 'Heart', '/charity', 'developing',
        '550e8400-e29b-41d4-a716-446655440006', false, 1, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440104', '救助申请', '申请救助服务', 'Shield', '/relief', 'developing',
        '550e8400-e29b-41d4-a716-446655440006', false, 2, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440105', '献血服务', '献血预约服务', 'Droplet', '/blood_donation', 'developing',
        '550e8400-e29b-41d4-a716-446655440003', false, 2, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440106', '养老机构', '养老机构查询', 'Users', '/elderly_care', 'developing',
        '550e8400-e29b-41d4-a716-446655440003', false, 3, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440107', '气象查询', '天气预报查询', 'Cloud', '/weather', 'developing',
        '550e8400-e29b-41d4-a716-446655440003', false, 4, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440108', '退役军人', '退役军人服务', 'Briefcase', '/veteran', 'developing',
        '550e8400-e29b-41d4-a716-446655440006', false, 3, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440109', '婚姻登记预约', '婚姻登记预约', 'Smile', '/marriage_registration',
        'developing', '550e8400-e29b-41d4-a716-446655440006', false, 4, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440110', '殡仪服务', '殡仪服务查询', 'Flower', '/funeral_service', 'developing',
        '550e8400-e29b-41d4-a716-446655440006', false, 5, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440111', '随手拍', '随手拍举报', 'Camera', '/photo_report', 'developing',
        '550e8400-e29b-41d4-a716-446655440007', false, 1, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440112', '鉴定机构', '鉴定机构查询', 'Scale', '/appraisal', 'developing',
        '550e8400-e29b-41d4-a716-446655440007', false, 2, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440113', '法律援助', '法律援助服务', 'FileText', '/legal_aid', 'developing',
        '550e8400-e29b-41d4-a716-446655440006', false, 6, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440114', '公证机构', '公证机构查询', 'Building2', '/notary', 'developing',
        '550e8400-e29b-41d4-a716-446655440007', false, 3, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440115', '学区查询', '学区信息查询', 'BookOpen', '/school_district',
        'developing', '550e8400-e29b-41d4-a716-446655440004', false, 1, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440116', '入学报名', '入学报名服务', 'GraduationCap', '/enrollment',
        'developing', '550e8400-e29b-41d4-a716-446655440004', false, 2, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440117', '教育缴费', '教育费用缴费', 'DollarSign', '/education_payment',
        'developing', '550e8400-e29b-41d4-a716-446655440004', false, 3, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440118', '老年大学', '老年大学课程', 'Users', '/elderly_university',
        'developing', '550e8400-e29b-41d4-a716-446655440004', false, 4, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440119', '社保查询', '社保信息查询', 'Shield', '/social_security', 'developing',
        '550e8400-e29b-41d4-a716-446655440005', false, 1, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440120', '公积金查询', '公积金信息查询', 'Home', '/provident_fund', 'developing',
        '550e8400-e29b-41d4-a716-446655440005', false, 2, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440121', '生活缴费', '生活费用缴费', 'Zap', '/life_payment', 'developing',
        '550e8400-e29b-41d4-a716-446655440003', false, 5, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440122', '不动产查询', '不动产信息查询', 'Building2', '/property_query',
        'developing', '550e8400-e29b-41d4-a716-446655440005', false, 3, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440123', '话费缴费', '话费充值缴费', 'CreditCard', '/phone_bill', 'developing',
        '550e8400-e29b-41d4-a716-446655440003', false, 6, NOW(), NOW()),
       ('550e8400-e29b-41d4-a716-446655440124', '医保电子凭证', '医保电子凭证', 'Pill', '/medical_insurance',
        'developing', '550e8400-e29b-41d4-a716-446655440005', false, 4, NOW(), NOW()) ON CONFLICT DO NOTHING;
