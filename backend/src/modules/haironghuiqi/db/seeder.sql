-- ============================================
-- 海融惠企模块 - 初始化数据脚本
-- ============================================

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

-- 插入政策数据
INSERT INTO policies (id, title, content, logo, link, published_at, sort, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440301', '关于进一步推进金融服务实体经济的指导意见', '为深入贯彻落实党中央、国务院关于金融服务实体经济的重要决策部署，进一步推进金融服务实体经济工作...', 'https://app-portfolio.minio.example.com/policy-logo.png', 'https://example.com/policy/1', NOW(), 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440302', '关于规范金融机构资产管理业务的指导意见', '为规范金融机构资产管理业务，防范金融风险，保护投资者合法权益，促进资产管理行业健康发展...', 'https://app-portfolio.minio.example.com/policy-logo.png', 'https://example.com/policy/2', NOW(), 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440303', '关于完善金融支持创新体系的意见', '为深入实施创新驱动发展战略，完善金融支持创新体系，促进科技创新和产业升级...', 'https://app-portfolio.minio.example.com/policy-logo.png', 'https://example.com/policy/3', NOW(), 3, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440304', '关于加强金融消费者权益保护的指导意见', '为加强金融消费者权益保护，维护金融市场秩序，促进金融业健康发展...', 'https://app-portfolio.minio.example.com/policy-logo.png', 'https://example.com/policy/4', NOW(), 4, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440305', '关于推进普惠金融发展的指导意见', '为推进普惠金融发展，提高金融服务覆盖面、可得性和满意度，促进经济社会发展...', 'https://app-portfolio.minio.example.com/policy-logo.png', 'https://example.com/policy/5', NOW(), 5, NOW(), NOW())
ON CONFLICT DO NOTHING;
