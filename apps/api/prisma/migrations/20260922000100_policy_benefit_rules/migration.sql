ALTER TABLE "policy_definitions" ADD COLUMN "benefitRules" JSONB NOT NULL DEFAULT '{}';
COMMENT ON COLUMN "policy_definitions"."benefitRules" IS '申报周期、重复享受和叠加互斥规则及来源';
