'use strict';

async function seedSnapReport(prisma) {
  const id = '880e8400-e29b-41d4-a716-446655440001';
  await prisma.snapReport.upsert({ where: { id }, update: {}, create: {
    id, userId: 'demo-snap-report', requestId: '880e8400-e29b-41d4-a716-446655440002',
    content: {
      object: '演示公共座椅', category: '设施损坏', severity: '轻微',
      description: '【虚构演示】座椅表面轻微破损，仅用于展示记录列表和详情，不代表真实市民上报。',
      address: '虚构演示街区', detail: '演示公园入口', reason: '人工录入的演示内容',
      locationConfirmed: true,
    },
  } });
  // 无已验证的上传文件时不伪造照片关系，也不伪造 AI 识别结果。
}

module.exports = { seedSnapReport };
