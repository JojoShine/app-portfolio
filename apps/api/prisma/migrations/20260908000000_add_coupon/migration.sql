-- CreateTable
CREATE TABLE "coupon_activities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "batches" JSONB NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "coupon_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_tickets" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "coupon_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT,
    "codeExpires" TIMESTAMPTZ(3),

    CONSTRAINT "coupon_wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_merchants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "hours" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT '营业中',
    "operatorId" TEXT NOT NULL,

    CONSTRAINT "coupon_merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_verifications" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupon_wallet_code_key" ON "coupon_wallet"("code");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_wallet_userId_ticketId_key" ON "coupon_wallet"("userId", "ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_verifications_couponId_key" ON "coupon_verifications"("couponId");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_verifications_requestId_key" ON "coupon_verifications"("requestId");

-- AddForeignKey
ALTER TABLE "coupon_tickets" ADD CONSTRAINT "coupon_tickets_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "coupon_activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_wallet" ADD CONSTRAINT "coupon_wallet_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "coupon_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_verifications" ADD CONSTRAINT "coupon_verifications_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon_wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_verifications" ADD CONSTRAINT "coupon_verifications_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "coupon_merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 消费券字段中文说明
COMMENT ON COLUMN "coupon_activities"."id" IS '唯一编号';
COMMENT ON COLUMN "coupon_activities"."name" IS '名称';
COMMENT ON COLUMN "coupon_activities"."category" IS '适用行业';
COMMENT ON COLUMN "coupon_activities"."region" IS '适用区域';
COMMENT ON COLUMN "coupon_activities"."subtitle" IS '活动副标题';
COMMENT ON COLUMN "coupon_activities"."status" IS '业务状态';
COMMENT ON COLUMN "coupon_activities"."batches" IS '批次展示信息';
COMMENT ON COLUMN "coupon_activities"."startsAt" IS '开放领取时间';
COMMENT ON COLUMN "coupon_activities"."endsAt" IS '领取截止时间';
COMMENT ON COLUMN "coupon_tickets"."id" IS '唯一编号';
COMMENT ON COLUMN "coupon_tickets"."activityId" IS '所属活动编号';
COMMENT ON COLUMN "coupon_tickets"."name" IS '名称';
COMMENT ON COLUMN "coupon_tickets"."value" IS '券面优惠数值，仅展示不参与结算';
COMMENT ON COLUMN "coupon_tickets"."unit" IS '券面单位';
COMMENT ON COLUMN "coupon_tickets"."rule" IS '券面使用条件';
COMMENT ON COLUMN "coupon_tickets"."type" IS '券型名称';
COMMENT ON COLUMN "coupon_tickets"."days" IS '领取后有效天数';
COMMENT ON COLUMN "coupon_tickets"."remaining" IS '可领取剩余库存';
COMMENT ON COLUMN "coupon_wallet"."id" IS '唯一编号';
COMMENT ON COLUMN "coupon_wallet"."userId" IS '持券用户账号编号';
COMMENT ON COLUMN "coupon_wallet"."ticketId" IS '券种编号';
COMMENT ON COLUMN "coupon_wallet"."status" IS '业务状态';
COMMENT ON COLUMN "coupon_wallet"."expiresAt" IS '消费券有效期截止时间';
COMMENT ON COLUMN "coupon_wallet"."createdAt" IS '创建时间';
COMMENT ON COLUMN "coupon_wallet"."code" IS '动态八位数字凭证';
COMMENT ON COLUMN "coupon_wallet"."codeExpires" IS '动态凭证失效时间';
COMMENT ON COLUMN "coupon_merchants"."id" IS '唯一编号';
COMMENT ON COLUMN "coupon_merchants"."name" IS '名称';
COMMENT ON COLUMN "coupon_merchants"."category" IS '适用行业';
COMMENT ON COLUMN "coupon_merchants"."region" IS '适用区域';
COMMENT ON COLUMN "coupon_merchants"."address" IS '门店地址';
COMMENT ON COLUMN "coupon_merchants"."hours" IS '营业时间说明';
COMMENT ON COLUMN "coupon_merchants"."phone" IS '门店联系电话';
COMMENT ON COLUMN "coupon_merchants"."status" IS '业务状态';
COMMENT ON COLUMN "coupon_merchants"."operatorId" IS '授权核销操作员账号编号';
COMMENT ON COLUMN "coupon_verifications"."id" IS '唯一编号';
COMMENT ON COLUMN "coupon_verifications"."couponId" IS '已核销的消费券编号';
COMMENT ON COLUMN "coupon_verifications"."storeId" IS '核销门店编号';
COMMENT ON COLUMN "coupon_verifications"."requestId" IS '核销幂等请求编号';
COMMENT ON COLUMN "coupon_verifications"."code" IS '动态八位数字凭证';
COMMENT ON COLUMN "coupon_verifications"."operatorId" IS '授权核销操作员账号编号';
COMMENT ON COLUMN "coupon_verifications"."createdAt" IS '创建时间';

COMMENT ON TABLE "coupon_activities" IS '消费券活动';
COMMENT ON TABLE "coupon_tickets" IS '消费券券种与库存';
COMMENT ON TABLE "coupon_wallet" IS '用户消费券与动态凭证';
COMMENT ON TABLE "coupon_merchants" IS '适用门店与授权操作员';
COMMENT ON TABLE "coupon_verifications" IS '不可撤销核销流水';
