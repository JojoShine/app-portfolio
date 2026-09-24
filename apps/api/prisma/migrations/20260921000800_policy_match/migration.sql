-- CreateTable
CREATE TABLE "policy_match_profiles" (
    "id" UUID NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "subjectType" VARCHAR(20) NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_match_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_definitions" (
    "id" VARCHAR(80) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "subjectType" VARCHAR(20) NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "benefit" VARCHAR(100) NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "channel" VARCHAR(20) NOT NULL,
    "endsAt" TIMESTAMPTZ(6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "materials" JSONB NOT NULL,
    "externalUrl" VARCHAR(500),

    CONSTRAINT "policy_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_favorites" (
    "userId" VARCHAR(255) NOT NULL,
    "policyId" VARCHAR(80) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_favorites_pkey" PRIMARY KEY ("userId","policyId")
);

-- CreateTable
CREATE TABLE "policy_match_snapshots" (
    "id" UUID NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "subjectType" VARCHAR(20) NOT NULL,
    "profile" JSONB NOT NULL,
    "results" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_match_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_applications" (
    "id" UUID NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "subjectType" VARCHAR(20) NOT NULL,
    "policyId" VARCHAR(80) NOT NULL,
    "status" VARCHAR(40) NOT NULL DEFAULT 'draft',
    "policyVersion" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "prepared" JSONB NOT NULL DEFAULT '[]',
    "receipt" VARCHAR(80),
    "submissionKey" VARCHAR(100),
    "events" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_application_materials" (
    "applicationId" UUID NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "fileId" UUID NOT NULL,

    CONSTRAINT "policy_application_materials_pkey" PRIMARY KEY ("applicationId","code")
);

-- CreateIndex
CREATE UNIQUE INDEX "policy_match_profiles_userId_subjectType_key" ON "policy_match_profiles"("userId", "subjectType");

-- CreateIndex
CREATE INDEX "policy_match_snapshots_userId_subjectType_createdAt_idx" ON "policy_match_snapshots"("userId", "subjectType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "policy_applications_receipt_key" ON "policy_applications"("receipt");

-- CreateIndex
CREATE INDEX "policy_applications_userId_subjectType_updatedAt_idx" ON "policy_applications"("userId", "subjectType", "updatedAt");

-- AddForeignKey
ALTER TABLE "policy_favorites" ADD CONSTRAINT "policy_favorites_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "policy_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_applications" ADD CONSTRAINT "policy_applications_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "policy_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_application_materials" ADD CONSTRAINT "policy_application_materials_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "policy_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_application_materials" ADD CONSTRAINT "policy_application_materials_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


CREATE UNIQUE INDEX "policy_one_active_application" ON "policy_applications" ("userId", "policyId") WHERE "status" NOT IN ('approved','rejected','withdrawn','stopped');
COMMENT ON TABLE "policy_match_profiles" IS '政策主体画像';
COMMENT ON COLUMN "policy_match_profiles"."id" IS '记录标识';
COMMENT ON COLUMN "policy_match_profiles"."userId" IS '认证用户标识';
COMMENT ON COLUMN "policy_match_profiles"."subjectType" IS '个人或企业主体';
COMMENT ON COLUMN "policy_match_profiles"."payload" IS '结构化业务信息';
COMMENT ON COLUMN "policy_match_profiles"."version" IS '记录版本';
COMMENT ON COLUMN "policy_match_profiles"."updatedAt" IS '更新时间';
COMMENT ON TABLE "policy_definitions" IS '演示政策规则库';
COMMENT ON COLUMN "policy_definitions"."id" IS '记录标识';
COMMENT ON COLUMN "policy_definitions"."title" IS '政策名称';
COMMENT ON COLUMN "policy_definitions"."subjectType" IS '个人或企业主体';
COMMENT ON COLUMN "policy_definitions"."category" IS '政策类别';
COMMENT ON COLUMN "policy_definitions"."benefit" IS '支持内容';
COMMENT ON COLUMN "policy_definitions"."amount" IS '支持金额';
COMMENT ON COLUMN "policy_definitions"."channel" IS '办理渠道';
COMMENT ON COLUMN "policy_definitions"."endsAt" IS '截止时间';
COMMENT ON COLUMN "policy_definitions"."active" IS '发布状态';
COMMENT ON COLUMN "policy_definitions"."version" IS '记录版本';
COMMENT ON COLUMN "policy_definitions"."description" IS '政策说明';
COMMENT ON COLUMN "policy_definitions"."rules" IS '匹配规则';
COMMENT ON COLUMN "policy_definitions"."materials" IS '材料清单';
COMMENT ON COLUMN "policy_definitions"."externalUrl" IS '外部办理地址';
COMMENT ON TABLE "policy_favorites" IS '政策收藏';
COMMENT ON COLUMN "policy_favorites"."userId" IS '认证用户标识';
COMMENT ON COLUMN "policy_favorites"."policyId" IS '政策标识';
COMMENT ON COLUMN "policy_favorites"."createdAt" IS '创建时间';
COMMENT ON TABLE "policy_match_snapshots" IS '匹配历史快照';
COMMENT ON COLUMN "policy_match_snapshots"."id" IS '记录标识';
COMMENT ON COLUMN "policy_match_snapshots"."userId" IS '认证用户标识';
COMMENT ON COLUMN "policy_match_snapshots"."subjectType" IS '个人或企业主体';
COMMENT ON COLUMN "policy_match_snapshots"."profile" IS '画像快照';
COMMENT ON COLUMN "policy_match_snapshots"."results" IS '政策及规则匹配快照';
COMMENT ON COLUMN "policy_match_snapshots"."createdAt" IS '创建时间';
COMMENT ON TABLE "policy_applications" IS '政策申请及办理记录';
COMMENT ON COLUMN "policy_applications"."id" IS '记录标识';
COMMENT ON COLUMN "policy_applications"."userId" IS '认证用户标识';
COMMENT ON COLUMN "policy_applications"."subjectType" IS '个人或企业主体';
COMMENT ON COLUMN "policy_applications"."policyId" IS '政策标识';
COMMENT ON COLUMN "policy_applications"."status" IS '业务状态';
COMMENT ON COLUMN "policy_applications"."policyVersion" IS '申请政策版本';
COMMENT ON COLUMN "policy_applications"."version" IS '记录版本';
COMMENT ON COLUMN "policy_applications"."payload" IS '结构化业务信息';
COMMENT ON COLUMN "policy_applications"."prepared" IS '已准备材料';
COMMENT ON COLUMN "policy_applications"."receipt" IS '演示受理编号';
COMMENT ON COLUMN "policy_applications"."submissionKey" IS '提交幂等键';
COMMENT ON COLUMN "policy_applications"."events" IS '业务事件时间线';
COMMENT ON COLUMN "policy_applications"."createdAt" IS '创建时间';
COMMENT ON COLUMN "policy_applications"."updatedAt" IS '更新时间';
COMMENT ON TABLE "policy_application_materials" IS '申报私有材料';
COMMENT ON COLUMN "policy_application_materials"."applicationId" IS '申请标识';
COMMENT ON COLUMN "policy_application_materials"."code" IS '材料项目代码';
COMMENT ON COLUMN "policy_application_materials"."fileId" IS '私有文件标识';

