const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/config/database');

const moduleTables = [
  'users', 'files', 'categories', 'apps',
  'enrollment_seasons', 'enrollment_windows', 'enrollment_schools', 'enrollment_contents',
  'enrollment_applications', 'enrollment_application_versions', 'enrollment_verifications',
  'enrollment_materials', 'enrollment_publications', 'enrollment_audit_logs', 'enrollment_profiles',
  'enrollment_department_records', 'enrollment_districts', 'enrollment_district_schools', 'enrollment_property_degrees',
  'coupon_activities', 'coupon_tickets', 'coupon_wallet', 'coupon_merchants', 'coupon_verifications',
  'library_branches', 'library_books', 'library_holdings', 'library_readers', 'library_loans',
  'library_book_reservations', 'library_seats', 'library_seat_reservations', 'library_events',
  'library_event_registrations', 'library_shelf_items', 'library_reading_check_ins', 'library_messages',
  'green_points_products', 'green_points_coupons', 'green_points_activities', 'green_points_assets',
  'green_points_accounts', 'green_points_configs',
  'snap_reports', 'snap_report_photos', 'snap_analyses',
  'quiz_assets', 'quiz_activities', 'quiz_questions', 'quiz_attempts', 'quiz_answers', 'quiz_ranking_entries',
];

test('各业务模块的数据库表和字段均提供中文注释', async () => {
  const rows = await db.$queryRaw`
    SELECT c.relname AS "tableName", obj_description(c.oid, 'pg_class') AS "tableComment",
           a.attname AS "columnName", col_description(c.oid, a.attnum) AS "columnComment"
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_attribute a ON a.attrelid = c.oid
    WHERE n.nspname = 'public' AND c.relkind = 'r'
      AND c.relname = ANY(${moduleTables}::text[])
      AND a.attnum > 0 AND NOT a.attisdropped
    ORDER BY c.relname, a.attnum
  `;
  assert.equal(new Set(rows.map((row) => row.tableName)).size, moduleTables.length);
  const missing = rows.filter((row) => !/\p{Script=Han}/u.test(row.tableComment || '') || !/\p{Script=Han}/u.test(row.columnComment || ''));
  assert.deepEqual(missing, [], `缺少中文注释：${missing.map((row) => `${row.tableName}.${row.columnName}`).join(', ')}`);
});
