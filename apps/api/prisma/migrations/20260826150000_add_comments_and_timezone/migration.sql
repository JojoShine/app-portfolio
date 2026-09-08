-- 默认使用东八区，所有时间字段均采用 TIMESTAMPTZ 保存绝对时间。
DO $$
BEGIN
  EXECUTE format('ALTER DATABASE %I SET timezone TO %L', current_database(), 'Asia/Shanghai');
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE '当前数据库用户无权修改数据库默认时区，Prisma 连接仍会使用 Asia/Shanghai';
END
$$;

SET TIME ZONE 'Asia/Shanghai';

COMMENT ON TYPE "user_status" IS '用户状态：正常、停用、禁用';
COMMENT ON TYPE "file_type_enum" IS '文件类型：图片、文档、视频、音频、其他';
COMMENT ON TYPE "app_status" IS '应用状态：可用、开发中、已下线';

COMMENT ON TABLE "users" IS '平台用户';
COMMENT ON COLUMN "users"."id" IS '用户ID';
COMMENT ON COLUMN "users"."username" IS '用户名';
COMMENT ON COLUMN "users"."email" IS '邮箱地址';
COMMENT ON COLUMN "users"."phone" IS '联系电话';
COMMENT ON COLUMN "users"."avatar" IS '头像地址';
COMMENT ON COLUMN "users"."status" IS '用户状态';
COMMENT ON COLUMN "users"."created_at" IS '创建时间';
COMMENT ON COLUMN "users"."updated_at" IS '更新时间';

COMMENT ON TABLE "files" IS '文件元数据';
COMMENT ON COLUMN "files"."id" IS '文件ID';
COMMENT ON COLUMN "files"."filename" IS '存储文件名';
COMMENT ON COLUMN "files"."original_name" IS '原始文件名';
COMMENT ON COLUMN "files"."mime_type" IS 'MIME类型';
COMMENT ON COLUMN "files"."size" IS '文件大小（字节）';
COMMENT ON COLUMN "files"."path" IS 'MinIO对象路径';
COMMENT ON COLUMN "files"."file_type" IS '文件类型';
COMMENT ON COLUMN "files"."uploaded_by" IS '上传用户ID';
COMMENT ON COLUMN "files"."is_public" IS '是否公开';
COMMENT ON COLUMN "files"."created_at" IS '创建时间';
COMMENT ON COLUMN "files"."updated_at" IS '更新时间';

COMMENT ON TABLE "categories" IS '应用目录分类';
COMMENT ON COLUMN "categories"."id" IS '分类ID';
COMMENT ON COLUMN "categories"."name" IS '分类名称';
COMMENT ON COLUMN "categories"."sort" IS '显示顺序';
COMMENT ON COLUMN "categories"."created_at" IS '创建时间';
COMMENT ON COLUMN "categories"."updated_at" IS '更新时间';

COMMENT ON TABLE "apps" IS 'H5应用目录';
COMMENT ON COLUMN "apps"."id" IS '应用ID';
COMMENT ON COLUMN "apps"."name" IS '应用名称';
COMMENT ON COLUMN "apps"."description" IS '应用简介';
COMMENT ON COLUMN "apps"."icon" IS '应用图标';
COMMENT ON COLUMN "apps"."path" IS '前端访问路径';
COMMENT ON COLUMN "apps"."status" IS '应用状态';
COMMENT ON COLUMN "apps"."category_id" IS '所属分类ID';
COMMENT ON COLUMN "apps"."is_scenario" IS '是否为场景化应用';
COMMENT ON COLUMN "apps"."sort" IS '显示顺序';
COMMENT ON COLUMN "apps"."created_at" IS '创建时间';
COMMENT ON COLUMN "apps"."updated_at" IS '更新时间';

COMMENT ON TABLE "enrollment_seasons" IS '招生年度';
COMMENT ON COLUMN "enrollment_seasons"."id" IS '招生年度ID';
COMMENT ON COLUMN "enrollment_seasons"."year" IS '招生年份';
COMMENT ON COLUMN "enrollment_seasons"."name" IS '招生年度名称';
COMMENT ON COLUMN "enrollment_seasons"."active" IS '是否为当前启用年度';
COMMENT ON COLUMN "enrollment_seasons"."created_at" IS '创建时间';
COMMENT ON COLUMN "enrollment_seasons"."updated_at" IS '更新时间';

COMMENT ON TABLE "enrollment_windows" IS '招生报名时间窗口';
COMMENT ON COLUMN "enrollment_windows"."id" IS '时间窗口ID';
COMMENT ON COLUMN "enrollment_windows"."season_id" IS '招生年度ID';
COMMENT ON COLUMN "enrollment_windows"."stage" IS '学段';
COMMENT ON COLUMN "enrollment_windows"."category" IS '报名类别';
COMMENT ON COLUMN "enrollment_windows"."starts_at" IS '报名开始时间';
COMMENT ON COLUMN "enrollment_windows"."ends_at" IS '报名截止时间';
COMMENT ON COLUMN "enrollment_windows"."created_at" IS '创建时间';
COMMENT ON COLUMN "enrollment_windows"."updated_at" IS '更新时间';

COMMENT ON TABLE "enrollment_schools" IS '招生学校';
COMMENT ON COLUMN "enrollment_schools"."id" IS '学校ID';
COMMENT ON COLUMN "enrollment_schools"."season_id" IS '招生年度ID';
COMMENT ON COLUMN "enrollment_schools"."stage" IS '学段';
COMMENT ON COLUMN "enrollment_schools"."category" IS '报名类别';
COMMENT ON COLUMN "enrollment_schools"."name" IS '学校名称';
COMMENT ON COLUMN "enrollment_schools"."address" IS '学校地址';
COMMENT ON COLUMN "enrollment_schools"."scope_summary" IS '招生范围摘要';
COMMENT ON COLUMN "enrollment_schools"."policy_title" IS '招生政策标题';
COMMENT ON COLUMN "enrollment_schools"."policy_version" IS '招生政策版本';
COMMENT ON COLUMN "enrollment_schools"."policy_content" IS '招生政策内容';
COMMENT ON COLUMN "enrollment_schools"."form_rules" IS '报名表单与材料规则';
COMMENT ON COLUMN "enrollment_schools"."active" IS '是否启用';
COMMENT ON COLUMN "enrollment_schools"."sort" IS '显示顺序';
COMMENT ON COLUMN "enrollment_schools"."created_at" IS '创建时间';
COMMENT ON COLUMN "enrollment_schools"."updated_at" IS '更新时间';

COMMENT ON TABLE "enrollment_contents" IS '招生门户内容';
COMMENT ON COLUMN "enrollment_contents"."id" IS '内容ID';
COMMENT ON COLUMN "enrollment_contents"."season_id" IS '招生年度ID，空值表示通用内容';
COMMENT ON COLUMN "enrollment_contents"."type" IS '内容类型';
COMMENT ON COLUMN "enrollment_contents"."stage" IS '适用学段';
COMMENT ON COLUMN "enrollment_contents"."category" IS '适用报名类别';
COMMENT ON COLUMN "enrollment_contents"."title" IS '标题';
COMMENT ON COLUMN "enrollment_contents"."summary" IS '摘要';
COMMENT ON COLUMN "enrollment_contents"."content" IS '结构化正文';
COMMENT ON COLUMN "enrollment_contents"."image_url" IS '图片地址';
COMMENT ON COLUMN "enrollment_contents"."target" IS '跳转目标';
COMMENT ON COLUMN "enrollment_contents"."starts_at" IS '展示开始时间';
COMMENT ON COLUMN "enrollment_contents"."ends_at" IS '展示结束时间';
COMMENT ON COLUMN "enrollment_contents"."active" IS '是否启用';
COMMENT ON COLUMN "enrollment_contents"."sort" IS '显示顺序';
COMMENT ON COLUMN "enrollment_contents"."created_at" IS '创建时间';
COMMENT ON COLUMN "enrollment_contents"."updated_at" IS '更新时间';

COMMENT ON TABLE "enrollment_applications" IS '招生报名申请';
COMMENT ON COLUMN "enrollment_applications"."id" IS '报名申请ID';
COMMENT ON COLUMN "enrollment_applications"."owner_user_id" IS '报名所属用户ID';
COMMENT ON COLUMN "enrollment_applications"."season_id" IS '招生年度ID';
COMMENT ON COLUMN "enrollment_applications"."school_id" IS '报名学校ID';
COMMENT ON COLUMN "enrollment_applications"."stage" IS '学段';
COMMENT ON COLUMN "enrollment_applications"."category" IS '报名类别';
COMMENT ON COLUMN "enrollment_applications"."status" IS '报名状态';
COMMENT ON COLUMN "enrollment_applications"."student_name_encrypted" IS '学生姓名密文';
COMMENT ON COLUMN "enrollment_applications"."student_name_hash" IS '学生姓名检索摘要';
COMMENT ON COLUMN "enrollment_applications"."student_id_encrypted" IS '学生证件号码密文';
COMMENT ON COLUMN "enrollment_applications"."student_id_hash" IS '学生证件号码检索摘要';
COMMENT ON COLUMN "enrollment_applications"."student_id_last_six_hash" IS '学生证件号码后六位检索摘要';
COMMENT ON COLUMN "enrollment_applications"."payload_encrypted" IS '报名表单数据密文';
COMMENT ON COLUMN "enrollment_applications"."draft_version" IS '草稿版本号';
COMMENT ON COLUMN "enrollment_applications"."policy_version" IS '已确认政策版本';
COMMENT ON COLUMN "enrollment_applications"."policy_confirmed_at" IS '政策确认时间';
COMMENT ON COLUMN "enrollment_applications"."authorization_version" IS '共享数据授权版本';
COMMENT ON COLUMN "enrollment_applications"."authorized_at" IS '共享数据授权时间';
COMMENT ON COLUMN "enrollment_applications"."declaration_version" IS '真实性承诺版本';
COMMENT ON COLUMN "enrollment_applications"."truth_confirmed_at" IS '真实性承诺确认时间';
COMMENT ON COLUMN "enrollment_applications"."submitted_at" IS '报名提交时间';
COMMENT ON COLUMN "enrollment_applications"."submission_receipt" IS '提交回执号';
COMMENT ON COLUMN "enrollment_applications"."idempotency_key" IS '提交幂等键';
COMMENT ON COLUMN "enrollment_applications"."review_message" IS '审核意见';
COMMENT ON COLUMN "enrollment_applications"."returned_fields" IS '退回修改字段';
COMMENT ON COLUMN "enrollment_applications"."offline_arrangement" IS '线下审核安排';
COMMENT ON COLUMN "enrollment_applications"."admitted_school_name" IS '录取学校名称';
COMMENT ON COLUMN "enrollment_applications"."has_update" IS '是否有家长未查看的状态更新';
COMMENT ON COLUMN "enrollment_applications"."last_viewed_at" IS '家长最后查看时间';
COMMENT ON COLUMN "enrollment_applications"."created_at" IS '创建时间';
COMMENT ON COLUMN "enrollment_applications"."updated_at" IS '更新时间';

COMMENT ON TABLE "enrollment_application_versions" IS '招生报名版本快照';
COMMENT ON COLUMN "enrollment_application_versions"."id" IS '版本快照ID';
COMMENT ON COLUMN "enrollment_application_versions"."application_id" IS '报名申请ID';
COMMENT ON COLUMN "enrollment_application_versions"."version" IS '版本号';
COMMENT ON COLUMN "enrollment_application_versions"."event" IS '版本事件';
COMMENT ON COLUMN "enrollment_application_versions"."snapshot_encrypted" IS '报名快照密文';
COMMENT ON COLUMN "enrollment_application_versions"."created_by" IS '操作用户ID';
COMMENT ON COLUMN "enrollment_application_versions"."note" IS '版本备注';
COMMENT ON COLUMN "enrollment_application_versions"."created_at" IS '创建时间';

COMMENT ON TABLE "enrollment_verifications" IS '招生共享数据核验记录';
COMMENT ON COLUMN "enrollment_verifications"."id" IS '核验记录ID';
COMMENT ON COLUMN "enrollment_verifications"."application_id" IS '报名申请ID';
COMMENT ON COLUMN "enrollment_verifications"."type" IS '核验类型';
COMMENT ON COLUMN "enrollment_verifications"."source" IS '数据来源';
COMMENT ON COLUMN "enrollment_verifications"."adapter_version" IS '数据适配器版本';
COMMENT ON COLUMN "enrollment_verifications"."queried_at" IS '查询时间';
COMMENT ON COLUMN "enrollment_verifications"."status" IS '核验状态';
COMMENT ON COLUMN "enrollment_verifications"."original_encrypted" IS '部门返回原始数据密文';
COMMENT ON COLUMN "enrollment_verifications"."declared_encrypted" IS '家长确认或修改后的数据密文';
COMMENT ON COLUMN "enrollment_verifications"."manually_modified" IS '是否被家长手动修改';
COMMENT ON COLUMN "enrollment_verifications"."modification_reason" IS '手动修改原因';
COMMENT ON COLUMN "enrollment_verifications"."failure_reason" IS '查询失败原因';
COMMENT ON COLUMN "enrollment_verifications"."created_at" IS '创建时间';
COMMENT ON COLUMN "enrollment_verifications"."updated_at" IS '更新时间';

COMMENT ON TABLE "enrollment_materials" IS '招生报名图片材料';
COMMENT ON COLUMN "enrollment_materials"."id" IS '材料关联ID';
COMMENT ON COLUMN "enrollment_materials"."application_id" IS '报名申请ID';
COMMENT ON COLUMN "enrollment_materials"."file_id" IS '文件ID';
COMMENT ON COLUMN "enrollment_materials"."item_code" IS '材料项编码';
COMMENT ON COLUMN "enrollment_materials"."sort" IS '材料排序';
COMMENT ON COLUMN "enrollment_materials"."deleted_at" IS '软删除时间';
COMMENT ON COLUMN "enrollment_materials"."created_at" IS '创建时间';
COMMENT ON COLUMN "enrollment_materials"."updated_at" IS '更新时间';

COMMENT ON TABLE "enrollment_publications" IS '招生公示配置';
COMMENT ON COLUMN "enrollment_publications"."id" IS '公示配置ID';
COMMENT ON COLUMN "enrollment_publications"."season_id" IS '招生年度ID';
COMMENT ON COLUMN "enrollment_publications"."type" IS '公示类型';
COMMENT ON COLUMN "enrollment_publications"."published" IS '是否已统一发布';
COMMENT ON COLUMN "enrollment_publications"."published_at" IS '发布时间';
COMMENT ON COLUMN "enrollment_publications"."arrangement" IS '线下审核地点和时间安排';
COMMENT ON COLUMN "enrollment_publications"."updated_by" IS '最后更新用户ID';
COMMENT ON COLUMN "enrollment_publications"."created_at" IS '创建时间';
COMMENT ON COLUMN "enrollment_publications"."updated_at" IS '更新时间';

COMMENT ON TABLE "enrollment_audit_logs" IS '招生业务审计日志';
COMMENT ON COLUMN "enrollment_audit_logs"."id" IS '审计日志ID';
COMMENT ON COLUMN "enrollment_audit_logs"."application_id" IS '报名申请ID';
COMMENT ON COLUMN "enrollment_audit_logs"."actor_id" IS '操作主体ID';
COMMENT ON COLUMN "enrollment_audit_logs"."action" IS '操作类型';
COMMENT ON COLUMN "enrollment_audit_logs"."details" IS '操作详情';
COMMENT ON COLUMN "enrollment_audit_logs"."request_id" IS '请求追踪ID';
COMMENT ON COLUMN "enrollment_audit_logs"."created_at" IS '创建时间';
