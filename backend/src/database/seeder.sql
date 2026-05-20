-- 应用和分类初始化脚本

-- 插入分类数据
INSERT INTO categories (id, name, sort, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '全部', 0, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', '金融服务', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', '生活服务', 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', '教育服务', 3, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', '社保医疗', 4, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', '政务服务', 5, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', '其他', 6, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 插入应用数据
INSERT INTO apps (id, name, description, icon, path, status, category_id, sort, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440101', '海融惠企', '金融服务聚合平台', 'Wallet', '/haironghuiqi', 'active', '550e8400-e29b-41d4-a716-446655440002', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440102', '公厕查询', '查询附近公厕', 'MapPin', '/public_toilet', 'developing', '550e8400-e29b-41d4-a716-446655440003', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440103', '慈善服务', '慈善服务平台', 'Heart', '/charity', 'developing', '550e8400-e29b-41d4-a716-446655440006', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440104', '救助申请', '申请救助服务', 'Shield', '/relief', 'developing', '550e8400-e29b-41d4-a716-446655440006', 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440105', '献血服务', '献血预约服务', 'Droplet', '/blood_donation', 'developing', '550e8400-e29b-41d4-a716-446655440003', 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440106', '养老机构', '养老机构查询', 'Users', '/elderly_care', 'developing', '550e8400-e29b-41d4-a716-446655440003', 3, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440107', '气象查询', '天气预报查询', 'Cloud', '/weather', 'developing', '550e8400-e29b-41d4-a716-446655440003', 4, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440108', '退役军人', '退役军人服务', 'Briefcase', '/veteran', 'developing', '550e8400-e29b-41d4-a716-446655440006', 3, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440109', '婚姻登记预约', '婚姻登记预约', 'Smile', '/marriage_registration', 'developing', '550e8400-e29b-41d4-a716-446655440006', 4, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440110', '殡仪服务', '殡仪服务查询', 'Flower', '/funeral_service', 'developing', '550e8400-e29b-41d4-a716-446655440006', 5, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440111', '随手拍', '随手拍举报', 'Camera', '/photo_report', 'developing', '550e8400-e29b-41d4-a716-446655440007', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440112', '鉴定机构', '鉴定机构查询', 'Scale', '/appraisal', 'developing', '550e8400-e29b-41d4-a716-446655440007', 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440113', '法律援助', '法律援助服务', 'FileText', '/legal_aid', 'developing', '550e8400-e29b-41d4-a716-446655440006', 6, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440114', '公证机构', '公证机构查询', 'Building2', '/notary', 'developing', '550e8400-e29b-41d4-a716-446655440007', 3, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440115', '学区查询', '学区信息查询', 'BookOpen', '/school_district', 'developing', '550e8400-e29b-41d4-a716-446655440004', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440116', '入学报名', '入学报名服务', 'GraduationCap', '/enrollment', 'developing', '550e8400-e29b-41d4-a716-446655440004', 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440117', '教育缴费', '教育费用缴费', 'DollarSign', '/education_payment', 'developing', '550e8400-e29b-41d4-a716-446655440004', 3, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440118', '老年大学', '老年大学课程', 'Users', '/elderly_university', 'developing', '550e8400-e29b-41d4-a716-446655440004', 4, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440119', '社保查询', '社保信息查询', 'Shield', '/social_security', 'developing', '550e8400-e29b-41d4-a716-446655440005', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440120', '公积金查询', '公积金信息查询', 'Home', '/provident_fund', 'developing', '550e8400-e29b-41d4-a716-446655440005', 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440121', '生活缴费', '生活费用缴费', 'Zap', '/life_payment', 'developing', '550e8400-e29b-41d4-a716-446655440003', 5, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440122', '不动产查询', '不动产信息查询', 'Building2', '/property_query', 'developing', '550e8400-e29b-41d4-a716-446655440005', 3, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440123', '话费缴费', '话费充值缴费', 'CreditCard', '/phone_bill', 'developing', '550e8400-e29b-41d4-a716-446655440003', 6, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440124', '医保电子凭证', '医保电子凭证', 'Pill', '/medical_insurance', 'developing', '550e8400-e29b-41d4-a716-446655440005', 4, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 插入机构数据
INSERT INTO institutions (id, name, category, address, business_hours, logo, description, status, sort, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440201', '中国人民银行', 'bank', '北京市西城区金融街19号', '09:00-17:00', 'https://app-portfolio.minio.example.com/logo.png', '中国人民银行是中华人民共和国的中央银行', 'active', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440202', '中国工商银行', 'bank', '北京市东城区建国门内大街1号', '08:30-17:30', 'https://app-portfolio.minio.example.com/logo.png', '中国工商银行是中国最大的商业银行', 'active', 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440203', '中国农业银行', 'bank', '北京市朝阳区建国路93号', '09:00-17:00', 'https://app-portfolio.minio.example.com/logo.png', '中国农业银行是中国主要的农业金融服务提供商', 'active', 3, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440204', '中国银行', 'bank', '北京市西城区复兴门内大街1号', '09:00-17:00', 'https://app-portfolio.minio.example.com/logo.png', '中国银行是中国最古老的银行之一', 'active', 4, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440205', '中国建设银行', 'bank', '北京市西城区金融街25号', '08:30-17:30', 'https://app-portfolio.minio.example.com/logo.png', '中国建设银行是中国主要的基础设施投资银行', 'active', 5, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440206', '中国人寿保险', 'insurance', '北京市朝阳区建国路88号', '09:00-18:00', 'https://app-portfolio.minio.example.com/logo.png', '中国人寿保险是中国最大的保险公司', 'active', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440207', '中国平安保险', 'insurance', '北京市福田区福华一路1号', '09:00-18:00', 'https://app-portfolio.minio.example.com/logo.png', '中国平安保险是中国领先的保险集团', 'active', 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440208', '中国太平保险', 'insurance', '北京市西城区宣武门西大街甲97号', '09:00-17:30', 'https://app-portfolio.minio.example.com/logo.png', '中国太平保险是中国历史最悠久的保险公司', 'active', 3, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440209', '中国证券', 'securities', '北京市西城区金融街35号', '09:30-15:00', 'https://app-portfolio.minio.example.com/logo.png', '中国证券是中国主要的证券公司', 'active', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440210', '中信证券', 'securities', '北京市朝阳区建国路1号', '09:30-15:00', 'https://app-portfolio.minio.example.com/logo.png', '中信证券是中国领先的综合性证券公司', 'active', 2, NOW(), NOW())
ON CONFLICT DO NOTHING;
