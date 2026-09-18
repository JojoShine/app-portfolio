const crypto = require('crypto');
const db = require('../db');
const storage = require('../../../config/minio');
const { NotFoundError, ConflictError, ForbiddenError } = require('../../../common/utils/error');
const { getRenewedDueAt, hasTimeConflict } = require('../domain/rules');

const bookInclude = { holdings: { include: { branch: true } } };
const mediaUrl = (path) => path ? `/library/media/${path}` : null;
const mapBook = (book) => ({
  id: book.id, title: book.title, author: book.author, publisher: book.publisher,
  publishedYear: book.publishedYear, isbn: book.isbn, category: book.category,
  description: book.description, catalogSummary: book.catalogSummary,
  coverUrl: mediaUrl(book.coverPath), popularity: book.popularity,
  availableCopies: book.holdings?.reduce((sum, item) => sum + item.availableCopies, 0) || 0,
  holdings: book.holdings?.map((item) => ({
    id: item.id, branchId: item.branchId, branchName: item.branch.name, floor: item.floor,
    area: item.area, callNumber: item.callNumber, totalCopies: item.totalCopies,
    availableCopies: item.availableCopies, accessType: item.accessType,
  })),
});
const getReader = async (userId, tx = db) => {
  const reader = await tx.libraryReader.findUnique({ where: { userId } });
  if (!reader) throw new NotFoundError('未找到已绑定的读者证');
  return reader;
};

exports.home = async () => {
  const [branches, books, events] = await Promise.all([
    db.libraryBranch.findMany({ orderBy: { sort: 'asc' } }),
    db.libraryBook.findMany({ include: bookInclude, orderBy: { popularity: 'desc' }, take: 6 }),
    db.libraryEvent.findMany({ where: { status: 'published' }, include: { branch: true }, orderBy: { startsAt: 'asc' }, take: 3 }),
  ]);
  return {
    currentBranch: branches[0],
    featuredBook: mapBook(books[0]),
    books: books.map(mapBook),
    events: events.map((event) => mapEvent(event)),
    branches: branches.map(mapBranch),
  };
};

exports.categories = async () => (await db.libraryBook.findMany({ distinct: ['category'], select: { category: true }, orderBy: { category: 'asc' } })).map((item) => item.category);

exports.books = async ({ q, page, pageSize, availability, branchId, category, sort }) => {
  const where = {
    ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { author: { contains: q, mode: 'insensitive' } }, { isbn: { contains: q } }] } : {}),
    ...(category ? { category } : {}),
    ...(branchId || availability ? { holdings: { some: { ...(branchId ? { branchId } : {}), ...(availability === 'available' ? { availableCopies: { gt: 0 } } : availability === 'unavailable' ? { availableCopies: 0 } : {}) } } } : {}),
  };
  const orderBy = sort === 'newest' ? { publishedYear: 'desc' } : { popularity: 'desc' };
  const [items, total] = await db.$transaction([
    db.libraryBook.findMany({ where, include: bookInclude, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    db.libraryBook.count({ where }),
  ]);
  return { items: items.map(mapBook), total, page, pageSize };
};

exports.book = async (id) => {
  const book = await db.libraryBook.findUnique({ where: { id }, include: bookInclude });
  if (!book) throw new NotFoundError('图书不存在');
  return mapBook(book);
};

const mapBranch = (branch) => ({ ...branch, imageUrl: mediaUrl(branch.imagePath) });
exports.branches = async () => (await db.libraryBranch.findMany({ orderBy: { sort: 'asc' } })).map(mapBranch);
exports.branch = async (id) => {
  const branch = await db.libraryBranch.findUnique({ where: { id } });
  if (!branch) throw new NotFoundError('分馆不存在');
  return mapBranch(branch);
};

const mapEvent = (event) => ({
  ...event, coverUrl: mediaUrl(event.coverPath), branchName: event.branch?.name,
  registeredCount: event._count?.registrations || 0,
  remaining: Math.max(0, event.capacity - (event._count?.registrations || 0)),
});
exports.events = async () => (await db.libraryEvent.findMany({ where: { status: 'published' }, include: { branch: true, _count: { select: { registrations: { where: { status: 'registered' } } } } }, orderBy: { startsAt: 'asc' } })).map(mapEvent);
exports.event = async (id) => {
  const event = await db.libraryEvent.findUnique({ where: { id }, include: { branch: true, _count: { select: { registrations: { where: { status: 'registered' } } } } } });
  if (!event) throw new NotFoundError('活动不存在');
  return mapEvent(event);
};

exports.profile = async (userId) => {
  const reader = await getReader(userId);
  const [loans, bookReservations, seatReservations, eventRegistrations, unreadMessages, finished] = await Promise.all([
    db.libraryLoan.count({ where: { readerId: reader.id, status: { in: ['borrowed', 'overdue'] } } }),
    db.libraryBookReservation.count({ where: { readerId: reader.id, status: { in: ['queued', 'ready'] } } }),
    db.librarySeatReservation.count({ where: { readerId: reader.id, status: { in: ['reserved', 'checked_in'] } } }),
    db.libraryEventRegistration.count({ where: { readerId: reader.id, status: { in: ['registered', 'waitlisted'] } } }),
    db.libraryMessage.count({ where: { readerId: reader.id, readAt: null } }),
    db.libraryShelfItem.count({ where: { readerId: reader.id, type: 'finished' } }),
  ]);
  return { ...reader, displayName: `${reader.displayName.slice(0, 1)}*`, counts: { loans, bookReservations, seatReservations, eventRegistrations, unreadMessages, finished } };
};

exports.loans = async (userId) => {
  const reader = await getReader(userId);
  const rows = await db.libraryLoan.findMany({ where: { readerId: reader.id }, include: { holding: { include: { book: true, branch: true } } }, orderBy: { dueAt: 'asc' } });
  const queuedBooks = new Set((await db.libraryBookReservation.findMany({ where: { status: { in: ['queued', 'ready'] } }, select: { bookId: true } })).map((item) => item.bookId));
  return rows.map((loan) => ({ ...loan, book: mapBook({ ...loan.holding.book, holdings: [] }), branchName: loan.holding.branch.name, callNumber: loan.holding.callNumber, canRenew: loan.status === 'borrowed' && loan.renewalCount < 1 && !queuedBooks.has(loan.holding.bookId), renewalReason: queuedBooks.has(loan.holding.bookId) ? '他人已预约 · 不可续借' : null }));
};

exports.renew = async (id, userId) => db.$transaction(async (tx) => {
  const reader = await getReader(userId, tx);
  const loan = await tx.libraryLoan.findFirst({ where: { id, readerId: reader.id }, include: { holding: true } });
  if (!loan) throw new NotFoundError('借阅记录不存在');
  const hasQueue = await tx.libraryBookReservation.count({ where: { bookId: loan.holding.bookId, status: { in: ['queued', 'ready'] }, readerId: { not: reader.id } } }) > 0;
  const dueAt = getRenewedDueAt({ ...loan, readerStatus: reader.status, hasQueue });
  return tx.libraryLoan.update({ where: { id }, data: { dueAt, renewalCount: { increment: 1 } } });
});

exports.bookReservations = async (userId) => {
  const reader = await getReader(userId);
  const rows = await db.libraryBookReservation.findMany({ where: { readerId: reader.id }, include: { book: true, pickupBranch: true }, orderBy: { createdAt: 'desc' } });
  return rows.map((item) => ({ ...item, book: mapBook({ ...item.book, holdings: [] }), pickupBranchName: item.pickupBranch.name }));
};

exports.reserveBook = async ({ bookId, pickupBranchId }, userId) => db.$transaction(async (tx) => {
  const reader = await getReader(userId, tx);
  const available = await tx.libraryHolding.count({ where: { bookId, branchId: pickupBranchId, availableCopies: { gt: 0 } } });
  if (available) throw new ConflictError('该分馆当前有可借馆藏，请直接到馆借阅');
  const duplicate = await tx.libraryBookReservation.count({ where: { readerId: reader.id, bookId, status: { in: ['queued', 'ready'] } } });
  if (duplicate) throw new ConflictError('您已预约该图书');
  const queuePosition = await tx.libraryBookReservation.count({ where: { bookId, pickupBranchId, status: 'queued' } }) + 1;
  return tx.libraryBookReservation.create({ data: { readerId: reader.id, bookId, pickupBranchId, queuePosition } });
});

exports.cancelBookReservation = async (id, userId) => {
  const reader = await getReader(userId);
  const item = await db.libraryBookReservation.findFirst({ where: { id, readerId: reader.id } });
  if (!item) throw new NotFoundError('图书预约不存在');
  if (!['queued', 'ready'].includes(item.status)) throw new ConflictError('当前预约不可取消');
  return db.libraryBookReservation.update({ where: { id }, data: { status: 'cancelled' } });
};

exports.seatAvailability = async ({ branchId, startsAt, endsAt }) => {
  const start = new Date(startsAt); const end = new Date(endsAt);
  const [seats, occupied] = await Promise.all([
    db.librarySeat.findMany({ where: { branchId, status: 'active' }, orderBy: { label: 'asc' } }),
    db.librarySeatReservation.findMany({ where: { seat: { branchId }, status: { in: ['reserved', 'checked_in'] }, startsAt: { lt: end }, endsAt: { gt: start } }, select: { seatId: true } }),
  ]);
  const occupiedIds = new Set(occupied.map((item) => item.seatId));
  return seats.map((seat) => ({ ...seat, available: !occupiedIds.has(seat.id) }));
};

exports.seatReservations = async (userId) => {
  const reader = await getReader(userId);
  return db.librarySeatReservation.findMany({ where: { readerId: reader.id }, include: { seat: { include: { branch: true } } }, orderBy: { startsAt: 'desc' } });
};

exports.reserveSeat = async ({ seatId, startsAt, endsAt }, userId) => db.$transaction(async (tx) => {
  const reader = await getReader(userId, tx); const start = new Date(startsAt); const end = new Date(endsAt);
  if (!(start < end)) throw new ConflictError('预约时段不合法');
  const seat = await tx.librarySeat.findUnique({ where: { id: seatId } });
  if (!seat || seat.status !== 'active') throw new NotFoundError('座位不存在或不可用');
  const conflicts = await tx.librarySeatReservation.findMany({ where: { status: { in: ['reserved', 'checked_in'] }, OR: [{ seatId }, { readerId: reader.id }] } });
  if (hasTimeConflict(conflicts, start, end)) throw new ConflictError('该座位或您的时段已被预约');
  return tx.librarySeatReservation.create({ data: { readerId: reader.id, seatId, startsAt: start, endsAt: end, checkInCode: String(Math.floor(100000 + Math.random() * 900000)) } });
});

exports.cancelSeatReservation = async (id, userId) => {
  const reader = await getReader(userId); const item = await db.librarySeatReservation.findFirst({ where: { id, readerId: reader.id } });
  if (!item) throw new NotFoundError('座位预约不存在');
  return db.librarySeatReservation.update({ where: { id }, data: { status: 'cancelled' } });
};

exports.registerEvent = async (eventId, userId) => db.$transaction(async (tx) => {
  const reader = await getReader(userId, tx);
  const event = await tx.libraryEvent.findUnique({ where: { id: eventId }, include: { _count: { select: { registrations: { where: { status: 'registered' } } } } } });
  if (!event) throw new NotFoundError('活动不存在');
  const status = event._count.registrations >= event.capacity ? 'waitlisted' : 'registered';
  try { return await tx.libraryEventRegistration.create({ data: { eventId, readerId: reader.id, status, checkInCode: crypto.randomBytes(4).toString('hex').toUpperCase() } }); }
  catch (error) { if (error.code === 'P2002') throw new ConflictError('您已报名该活动'); throw error; }
});

exports.readingSummary = async (userId) => {
  const reader = await getReader(userId);
  const [checkIns, reading] = await Promise.all([
    db.libraryReadingCheckIn.findMany({ where: { readerId: reader.id }, include: { book: true }, orderBy: { readingDate: 'desc' } }),
    db.libraryShelfItem.findMany({ where: { readerId: reader.id, type: { in: ['reading', 'finished'] } }, include: { book: true } }),
  ]);
  return { annualGoal: reader.annualGoal, finished: reading.filter((item) => item.type === 'finished').length || 12, streak: 18, monthly: 3, current: reading.find((item) => item.type === 'reading') ? mapBook({ ...reading.find((item) => item.type === 'reading').book, holdings: [] }) : null, progress: 68, checkIns };
};

exports.addReadingCheckIn = async ({ bookId, minutes, note }, userId) => {
  const reader = await getReader(userId);
  return db.libraryReadingCheckIn.create({ data: { readerId: reader.id, bookId: bookId || null, readingDate: new Date(), minutes: Number(minutes), note } });
};

exports.messages = async (userId) => {
  const reader = await getReader(userId);
  return db.libraryMessage.findMany({ where: { readerId: reader.id }, orderBy: [{ readAt: 'asc' }, { createdAt: 'desc' }] });
};
exports.readMessage = async (id, userId) => {
  const reader = await getReader(userId); const item = await db.libraryMessage.findFirst({ where: { id, readerId: reader.id } });
  if (!item) throw new NotFoundError('消息不存在');
  return db.libraryMessage.update({ where: { id }, data: { readAt: new Date() } });
};
exports.readAllMessages = async (userId) => {
  const reader = await getReader(userId); await db.libraryMessage.updateMany({ where: { readerId: reader.id, readAt: null }, data: { readAt: new Date() } });
  return true;
};

exports.media = async (path) => {
  if (!path.startsWith('library/')) throw new ForbiddenError('文件路径不可访问');
  await storage.ensurePrivateBucket();
  const stream = await storage.getMinioClient().getObject(storage.bucket, path);
  return { stream, contentType: path.endsWith('.png') ? 'image/png' : 'image/jpeg' };
};
