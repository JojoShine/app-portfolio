-- CreateTable
CREATE TABLE "library_branches" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "opening_hours" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "facilities" JSONB NOT NULL,
    "image_path" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_books" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "published_year" INTEGER NOT NULL,
    "isbn" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "catalog_summary" TEXT NOT NULL,
    "cover_path" TEXT,
    "local_topic" BOOLEAN NOT NULL DEFAULT false,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_holdings" (
    "id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "floor" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "call_number" TEXT NOT NULL,
    "total_copies" INTEGER NOT NULL,
    "available_copies" INTEGER NOT NULL,
    "access_type" TEXT NOT NULL DEFAULT 'lendable',

    CONSTRAINT "library_holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_readers" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "card_number" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "valid_until" DATE NOT NULL,
    "annual_goal" INTEGER NOT NULL DEFAULT 24,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_readers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_loans" (
    "id" UUID NOT NULL,
    "reader_id" UUID NOT NULL,
    "holding_id" UUID NOT NULL,
    "borrowed_at" TIMESTAMPTZ(3) NOT NULL,
    "due_at" TIMESTAMPTZ(3) NOT NULL,
    "returned_at" TIMESTAMPTZ(3),
    "renewal_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'borrowed',

    CONSTRAINT "library_loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_book_reservations" (
    "id" UUID NOT NULL,
    "reader_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "pickup_branch_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "queue_position" INTEGER,
    "ready_at" TIMESTAMPTZ(3),
    "expires_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_book_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_seats" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "floor" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'standard',
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "library_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_seat_reservations" (
    "id" UUID NOT NULL,
    "reader_id" UUID NOT NULL,
    "seat_id" UUID NOT NULL,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'reserved',
    "check_in_code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checked_in_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),

    CONSTRAINT "library_seat_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_events" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "registration_ends_at" TIMESTAMPTZ(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "age_group" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "cover_path" TEXT,
    "agenda" JSONB NOT NULL,
    "notice" TEXT NOT NULL,

    CONSTRAINT "library_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_event_registrations" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "reader_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "check_in_code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checked_in_at" TIMESTAMPTZ(3),

    CONSTRAINT "library_event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_shelf_items" (
    "id" UUID NOT NULL,
    "reader_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_shelf_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_reading_check_ins" (
    "id" UUID NOT NULL,
    "reader_id" UUID NOT NULL,
    "book_id" UUID,
    "reading_date" DATE NOT NULL,
    "minutes" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_reading_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_messages" (
    "id" UUID NOT NULL,
    "reader_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "read_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "library_books_isbn_key" ON "library_books"("isbn");

-- CreateIndex
CREATE INDEX "library_books_category_idx" ON "library_books"("category");

-- CreateIndex
CREATE INDEX "library_books_popularity_idx" ON "library_books"("popularity");

-- CreateIndex
CREATE UNIQUE INDEX "library_holdings_book_id_branch_id_call_number_key" ON "library_holdings"("book_id", "branch_id", "call_number");

-- CreateIndex
CREATE UNIQUE INDEX "library_readers_user_id_key" ON "library_readers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "library_readers_card_number_key" ON "library_readers"("card_number");

-- CreateIndex
CREATE INDEX "library_loans_reader_id_status_due_at_idx" ON "library_loans"("reader_id", "status", "due_at");

-- CreateIndex
CREATE INDEX "library_book_reservations_reader_id_status_idx" ON "library_book_reservations"("reader_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "library_seats_branch_id_label_key" ON "library_seats"("branch_id", "label");

-- CreateIndex
CREATE INDEX "library_seat_reservations_seat_id_starts_at_ends_at_idx" ON "library_seat_reservations"("seat_id", "starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "library_seat_reservations_reader_id_starts_at_ends_at_idx" ON "library_seat_reservations"("reader_id", "starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "library_events_starts_at_status_idx" ON "library_events"("starts_at", "status");

-- CreateIndex
CREATE UNIQUE INDEX "library_event_registrations_event_id_reader_id_key" ON "library_event_registrations"("event_id", "reader_id");

-- CreateIndex
CREATE UNIQUE INDEX "library_shelf_items_reader_id_book_id_type_key" ON "library_shelf_items"("reader_id", "book_id", "type");

-- CreateIndex
CREATE INDEX "library_reading_check_ins_reader_id_reading_date_idx" ON "library_reading_check_ins"("reader_id", "reading_date");

-- CreateIndex
CREATE INDEX "library_messages_reader_id_read_at_created_at_idx" ON "library_messages"("reader_id", "read_at", "created_at");

-- AddForeignKey
ALTER TABLE "library_holdings" ADD CONSTRAINT "library_holdings_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "library_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_holdings" ADD CONSTRAINT "library_holdings_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "library_branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_loans" ADD CONSTRAINT "library_loans_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "library_readers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_loans" ADD CONSTRAINT "library_loans_holding_id_fkey" FOREIGN KEY ("holding_id") REFERENCES "library_holdings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_book_reservations" ADD CONSTRAINT "library_book_reservations_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "library_readers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_book_reservations" ADD CONSTRAINT "library_book_reservations_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "library_books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_book_reservations" ADD CONSTRAINT "library_book_reservations_pickup_branch_id_fkey" FOREIGN KEY ("pickup_branch_id") REFERENCES "library_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_seats" ADD CONSTRAINT "library_seats_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "library_branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_seat_reservations" ADD CONSTRAINT "library_seat_reservations_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "library_readers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_seat_reservations" ADD CONSTRAINT "library_seat_reservations_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "library_seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_events" ADD CONSTRAINT "library_events_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "library_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_event_registrations" ADD CONSTRAINT "library_event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "library_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_event_registrations" ADD CONSTRAINT "library_event_registrations_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "library_readers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_shelf_items" ADD CONSTRAINT "library_shelf_items_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "library_readers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_shelf_items" ADD CONSTRAINT "library_shelf_items_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "library_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_reading_check_ins" ADD CONSTRAINT "library_reading_check_ins_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "library_readers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_reading_check_ins" ADD CONSTRAINT "library_reading_check_ins_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "library_books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_messages" ADD CONSTRAINT "library_messages_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "library_readers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
