const ids = {
  branchMain: '770e8400-e29b-41d4-a716-446655440001',
  branchSouth: '770e8400-e29b-41d4-a716-446655440002',
  reader: '770e8400-e29b-41d4-a716-446655440010',
  bookHuman: '770e8400-e29b-41d4-a716-446655440101',
  bookChangan: '770e8400-e29b-41d4-a716-446655440102',
  bookDitan: '770e8400-e29b-41d4-a716-446655440103',
  holdingHuman: '770e8400-e29b-41d4-a716-446655440201',
  holdingChangan: '770e8400-e29b-41d4-a716-446655440202',
  holdingDitan: '770e8400-e29b-41d4-a716-446655440203',
  holdingHumanSouth: '770e8400-e29b-41d4-a716-446655440204',
  holdingChanganSouth: '770e8400-e29b-41d4-a716-446655440205',
  eventReading: '770e8400-e29b-41d4-a716-446655440301',
  eventFamily: '770e8400-e29b-41d4-a716-446655440302',
  eventLocal: '770e8400-e29b-41d4-a716-446655440303',
};

const upsert = (model, id, data) => model.upsert({ where: { id }, update: data, create: { id, ...data } });

async function seedLibrary(prisma) {
  await upsert(prisma.libraryBranch, ids.branchMain, {
    name: '海安市图书馆', address: '海安市中坝南路示例地址', phone: '0513-00000000',
    openingHours: '09:00–20:30', status: 'open', sort: 1,
    facilities: ['自助借还', '无障碍席', '饮水', '母婴室'], imagePath: 'library/branch-interior.png',
  });
  await upsert(prisma.libraryBranch, ids.branchSouth, {
    name: '城南图书分馆', address: '海安市城南示例地址', phone: '0513-00000001',
    openingHours: '09:30–19:00', status: 'open', sort: 2,
    facilities: ['少儿阅读', '自习空间'], imagePath: 'library/branch-interior.png',
  });

  const books = [
    [ids.bookHuman, '人间草木', '汪曾祺', '中国现代文学', '9787000000001', '在草木虫鱼与寻常日子里，发现生活温柔的底色。', 'book-human-world.png', 98],
    [ids.bookChangan, '长安的荔枝', '马伯庸', '历史小说', '9787000000002', '一骑红尘妃子笑，无人知是荔枝来。', 'book-changan.png', 96],
    [ids.bookDitan, '我与地坛', '史铁生', '中国文学', '9787000000003', '在寂静的地坛里，与自己和生命相遇。', 'book-ditan.png', 95],
  ];
  for (const [id, title, author, category, isbn, description, cover, popularity] of books) {
    await upsert(prisma.libraryBook, id, {
      title, author, publisher: '人民文学出版社', publishedYear: 2026, isbn, category,
      description, catalogSummary: '编辑推荐 · 内容简介 · 作者小传', coverPath: `library/${cover}`,
      localTopic: false, popularity,
    });
  }

  const holdings = [
    [ids.holdingHuman, ids.bookHuman, ids.branchMain, '二楼', '文学区', 'I267/3812', 5, 3],
    [ids.holdingChangan, ids.bookChangan, ids.branchMain, '二楼', '文学区', 'I247.5/5242', 3, 2],
    [ids.holdingDitan, ids.bookDitan, ids.branchMain, '三楼', '人文社科区', 'I267/4420', 2, 0],
    [ids.holdingHumanSouth, ids.bookHuman, ids.branchSouth, '一楼', '综合阅览区', 'I267/3812', 2, 0],
    [ids.holdingChanganSouth, ids.bookChangan, ids.branchSouth, '一楼', '综合阅览区', 'I247.5/5242', 1, 0],
  ];
  for (const [id, bookId, branchId, floor, area, callNumber, totalCopies, availableCopies] of holdings) {
    await upsert(prisma.libraryHolding, id, { bookId, branchId, floor, area, callNumber, totalCopies, availableCopies, accessType: 'lendable' });
  }

  await upsert(prisma.libraryReader, ids.reader, {
    userId: 'test-parent-001', cardNumber: 'HA20260186', displayName: '王芳', status: 'active',
    validUntil: new Date('2027-12-31T00:00:00.000Z'), annualGoal: 24,
  });

  await upsert(prisma.libraryLoan, '770e8400-e29b-41d4-a716-446655440401', {
    readerId: ids.reader, holdingId: ids.holdingChangan, borrowedAt: new Date('2026-08-21T02:00:00.000Z'),
    dueAt: new Date('2026-09-20T10:00:00.000Z'), renewalCount: 0, status: 'borrowed',
  });
  await upsert(prisma.libraryLoan, '770e8400-e29b-41d4-a716-446655440402', {
    readerId: ids.reader, holdingId: ids.holdingDitan, borrowedAt: new Date('2026-08-20T02:00:00.000Z'),
    dueAt: new Date('2026-09-28T10:00:00.000Z'), renewalCount: 0, status: 'borrowed',
  });

  await upsert(prisma.libraryBookReservation, '770e8400-e29b-41d4-a716-446655440501', {
    readerId: ids.reader, bookId: ids.bookHuman, pickupBranchId: ids.branchMain, status: 'ready',
    queuePosition: null, readyAt: new Date('2026-09-17T02:00:00.000Z'), expiresAt: new Date('2026-09-20T10:00:00.000Z'),
  });
  await upsert(prisma.libraryBookReservation, '770e8400-e29b-41d4-a716-446655440502', {
    readerId: ids.reader, bookId: ids.bookDitan, pickupBranchId: ids.branchMain, status: 'queued', queuePosition: 3,
  });
  await upsert(prisma.libraryBookReservation, '770e8400-e29b-41d4-a716-446655440503', {
    readerId: ids.reader, bookId: ids.bookChangan, pickupBranchId: ids.branchMain, status: 'cancelled', queuePosition: null,
  });

  const seats = [
    ['770e8400-e29b-41d4-a716-446655441001', 'A-1', 'standard'], ['770e8400-e29b-41d4-a716-446655441002', 'A-2', 'standard'],
    ['770e8400-e29b-41d4-a716-446655441003', 'A-3', 'standard'], ['770e8400-e29b-41d4-a716-446655441004', 'A-4', 'standard'],
    ['770e8400-e29b-41d4-a716-446655441005', 'A-5', 'standard'], ['770e8400-e29b-41d4-a716-446655441006', 'A-6', 'standard'],
    ['770e8400-e29b-41d4-a716-446655441007', 'B-7', 'standard'], ['770e8400-e29b-41d4-a716-446655441008', 'B-8', 'standard'],
    ['770e8400-e29b-41d4-a716-446655441009', 'B-9', 'standard'], ['770e8400-e29b-41d4-a716-446655441010', 'B-10', 'standard'],
    ['770e8400-e29b-41d4-a716-446655441011', 'B-11', 'standard'], ['770e8400-e29b-41d4-a716-446655441012', 'B-12', 'powered'],
    ['770e8400-e29b-41d4-a716-446655441013', 'C-1', 'standard'], ['770e8400-e29b-41d4-a716-446655441014', 'C-2', 'accessible'],
    ['770e8400-e29b-41d4-a716-446655441015', 'C-3', 'standard'], ['770e8400-e29b-41d4-a716-446655441016', 'C-4', 'standard'],
    ['770e8400-e29b-41d4-a716-446655441017', 'C-5', 'standard'], ['770e8400-e29b-41d4-a716-446655441018', 'C-6', 'powered'],
  ];
  for (const [id, label, type] of seats) await upsert(prisma.librarySeat, id, { branchId: ids.branchMain, floor: '二楼', area: '静阅区', label, type, status: 'active' });
  await upsert(prisma.librarySeatReservation, '770e8400-e29b-41d4-a716-446655441101', {
    readerId: ids.reader, seatId: '770e8400-e29b-41d4-a716-446655441002',
    startsAt: new Date('2026-09-18T06:00:00.000Z'), endsAt: new Date('2026-09-18T09:00:00.000Z'),
    status: 'reserved', checkInCode: '831627',
  });

  const events = [
    [ids.eventReading, '共读《我与地坛》', '在文字里，遇见生活的深度与温柔。', '读书会', '2026-09-26T06:00:00.000Z', '16岁以上'],
    [ids.eventFamily, '周末绘本时间', '和孩子一起，打开更大的世界。', '亲子阅读', '2026-10-02T02:00:00.000Z', '4–10岁亲子家庭'],
    [ids.eventLocal, '地方文献里的海安', '从地方记忆中，遇见家乡的故事。', '地方文献', '2026-10-09T06:00:00.000Z', '全年龄'],
  ];
  for (const [id, title, summary, category, startsAt, ageGroup] of events) {
    const start = new Date(startsAt);
    await upsert(prisma.libraryEvent, id, {
      branchId: ids.branchMain, title, summary, description: summary, category, startsAt: start,
      endsAt: new Date(start.getTime() + 2 * 3600000), registrationEndsAt: new Date(start.getTime() - 3600000),
      capacity: 30, ageGroup, status: 'published', coverPath: 'library/reading-circle.png',
      agenda: ['共读分享', '主题交流', '自由讨论', '活动总结'], notice: '请按时到场，保持安静阅读。',
    });
  }
  await upsert(prisma.libraryEventRegistration, '770e8400-e29b-41d4-a716-446655441201', {
    eventId: ids.eventFamily, readerId: ids.reader, status: 'registered', checkInCode: 'EV260902',
  });

  await upsert(prisma.libraryShelfItem, '770e8400-e29b-41d4-a716-446655441301', { readerId: ids.reader, bookId: ids.bookHuman, type: 'reading' });
  const checkIns = [[17, 30], [18, 42], [19, 28], [20, 35]];
  for (const [day, minutes] of checkIns) {
    await upsert(prisma.libraryReadingCheckIn, `770e8400-e29b-41d4-a716-4466554414${day}`, {
      readerId: ids.reader, bookId: ids.bookHuman, readingDate: new Date(`2026-09-${day}T00:00:00.000Z`), minutes,
      note: '在平凡日子里，读见生活温柔的底色。',
    });
  }

  const messages = [
    ['01', 'reservation', '预约图书已到馆', '《人间值得》已到海安市图书馆，请在9月20日18:00前取书。', 'high', null],
    ['02', 'loan', '3天后到期', '您借阅的《长安的荔枝》将于3天后到期，请及时归还。', 'high', null],
    ['03', 'seat', '座位签到提醒', '您已预约二楼静阅区座位，请在开始后15分钟内完成签到。', 'normal', new Date('2026-09-16T08:00:00.000Z')],
    ['04', 'event', '活动开始提醒', '您报名的阅读活动即将开始，期待您的参与。', 'normal', new Date('2026-09-16T08:00:00.000Z')],
  ];
  for (const [suffix, type, title, content, priority, readAt] of messages) {
    await upsert(prisma.libraryMessage, `770e8400-e29b-41d4-a716-4466554415${suffix}`, {
      readerId: ids.reader, type, title, content, priority, readAt,
    });
  }
}

module.exports = { seedLibrary };
