import { useState } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Button,
  Checkbox,
  Dialog,
  ImageUploader,
  Input,
  Picker,
  TextArea,
  Toast,
} from 'antd-mobile';
import {
  CameraOutline,
  CheckCircleFill,
  ContentOutline,
  DownOutline,
  ExclamationCircleOutline,
  FileOutline,
  PictureOutline,
  UpOutline,
  UserCircleOutline,
} from 'antd-mobile-icons';
import { CURRENT_YEAR, getCategory, getStage } from '../domain/constants';
import useEnrollmentStore from '../store/enrollmentStore';
import enrollmentService from '../services';
import { fileCapability } from '../../../shared/capabilities';
import {
  CompactNotice,
  FixedActionBar,
  GovHero,
  SectionTitle,
  SourceTag,
  SummaryRows,
  TimelineCluster,
} from '../components';
import studentPortrait from '../assets/reference/student-portrait.png';

const studentRows = (student) => [
  { label: '学生姓名', value: student.name },
  { label: '证件类型', value: student.documentType },
  { label: '证件号码', value: student.documentNumber },
  { label: '户籍所在地', value: student.householdLocation },
  { label: '当前居住地址', value: student.residenceAddress },
  { label: '原就读学校', value: student.previousSchool },
  { label: '学籍号', value: student.studentRecordNumber },
];

const familyRows = (family) => [
  { label: '当前监护人', value: `${family.guardianName}（${family.guardianRelation}）` },
  { label: '监护人证件号码', value: family.guardianDocument },
  { label: '监护人联系电话', value: family.guardianPhone },
  { label: '户主', value: family.householdHeadName },
  { label: '户主证件号码', value: family.householdHeadDocument },
  { label: '户主联系电话', value: family.householdHeadPhone },
  { label: '户主与学生关系', value: family.householdHeadRelation },
  { label: '户籍地址', value: family.householdAddress },
];

const propertyRows = (property) => property.hasProperty === false
  ? [
    { label: '报名依据', value: '家庭无房产' },
    { label: '当前居住地址', value: property.residenceAddress },
  ]
  : [
    { label: '报名依据', value: property.propertyMode === 'special' ? '特殊房产' : '家庭房产' },
    { label: '不动产权利人', value: property.ownerName },
    { label: '权利人证件号码', value: property.ownerDocument },
    { label: '与学生关系', value: property.relation },
    { label: '不动产权证号', value: property.certificateNumber },
    { label: '房产地址', value: property.address },
    { label: '房产用途', value: property.usage },
    { label: '建筑面积', value: property.area ? `${property.area} ㎡` : '待补充' },
    { label: '当前居住地址', value: property.residenceAddress },
  ];

const materialRows = (materials) => [
  { label: '户口簿', value: materials.householdBook ? '已上传' : '待补充' },
  { label: '房产证明', value: materials.propertyProof ? '已上传' : '待补充' },
  { label: '监护人身份证', value: materials.guardianId ? '已上传' : '待补充' },
  { label: '学生证件照', value: materials.studentPhoto ? '已上传' : '待补充' },
  { label: '学籍证明', value: materials.studentRegistrationProof ? '已上传' : '' },
  { label: '社保材料', value: materials.socialSecurity ? '已上传' : '按需补充' },
  { label: '营业执照', value: materials.businessLicense ? '已上传' : '按需补充' },
  { label: '父辈无房证明', value: materials.parentNoProperty ? '已上传' : '按需补充' },
  { label: '社保核验对象', value: materials.socialEnabled ? materials.socialPerson : '' },
  { label: '参保地区／状态', value: materials.socialEnabled ? `${materials.socialRegion} · ${materials.socialStatus}` : '' },
  { label: '连续缴纳月数', value: materials.socialEnabled ? `${materials.socialMonths}个月` : '' },
  { label: '营业执照主体', value: materials.businessEnabled ? materials.businessName : '' },
  { label: '统一社会信用代码', value: materials.businessEnabled ? materials.businessCreditCode : '' },
  { label: '父亲无房核验', value: materials.noPropertyEnabled ? materials.fatherNoPropertyResult : '' },
  { label: '母亲无房核验', value: materials.noPropertyEnabled ? materials.motherNoPropertyResult : '' },
];

export const ApplicationOverviewPage = () => {
  const navigate = useNavigate();
  const flow = useEnrollmentStore((state) => state.flow);
  const selectedSchool = useEnrollmentStore((state) => state.selectedSchool);
  const draft = useEnrollmentStore((state) => state.draft);
  const savedAt = useEnrollmentStore((state) => state.savedAt);
  const [expanded, setExpanded] = useState({ student: true });
  const school = selectedSchool;
  const stage = getStage(flow.stageId);
  const propertyComplete = draft.property.hasProperty === false
    ? Boolean(draft.property.residenceAddress)
    : Boolean(draft.property.area);
  const materialComplete = Boolean(
    draft.materials.studentPhoto
    && draft.materials.householdBook
    && (draft.property.hasProperty === false || draft.materials.propertyProof)
    && (flow.stageId !== 'middle' || draft.materials.studentRegistrationProof)
  );

  if (!school) {
    return <Navigate to="/enrollment/applications" replace />;
  }

  const toggle = (key) => setExpanded((value) => ({ ...value, [key]: !value[key] }));
  const edit = (key) => navigate(`/enrollment/edit/${key}`);

  return (
    <div className="enrollment-page enrollment-page--with-actions application-overview-page">
      <main className="enrollment-content">
        <section className="application-overview-head">
          <div className="application-context">{draft.student.name.slice(0, 1)}*{draft.student.name.slice(-1)} <span>·</span> {school.name} <span>·</span> {stage.name}</div>
          <p className="autosave-line"><CheckCircleFill /> 共享数据已带入 <span>·</span> 已自动保存 {savedAt}</p>
        </section>

        <div className="information-timeline">
          <TimelineCluster
            number={1}
            title="学生信息"
            status="已完成"
            statusTone="success"
            expanded={Boolean(expanded.student)}
            onToggle={() => toggle('student')}
            onEdit={() => edit('student')}
            summary={`${draft.student.name} · ${draft.student.householdLocation}`}
          >
            <div className="timeline-photo-row"><span>学生照片</span><img src={studentPortrait} alt="学生证件照" /></div>
            <SummaryRows rows={studentRows(draft.student)} />
            <div className="source-tags">{draft.student.modifiedReason ? <SourceTag type="modified" /> : <SourceTag type="department" />}</div>
          </TimelineCluster>

          <TimelineCluster
            number={2}
            title="家庭及户籍信息"
            status="已完成"
            statusTone="success"
            expanded={Boolean(expanded.family)}
            onToggle={() => toggle('family')}
            onEdit={() => edit('family')}
            summary={`监护人${draft.family.guardianName}（${draft.family.guardianRelation}） · 户主${draft.family.householdHeadName}（${draft.family.householdHeadRelation}）`}
          >
            <SummaryRows rows={familyRows(draft.family)} />
            <div className="source-tags">{draft.family.modifiedReason ? <SourceTag type="modified" /> : <SourceTag type="department" />}</div>
          </TimelineCluster>

          <TimelineCluster
            number={3}
            title="房产及居住信息"
            status={propertyComplete ? '已完成' : '待补充'}
            statusTone={propertyComplete ? 'success' : 'warning'}
            expanded={Boolean(expanded.property)}
            onToggle={() => toggle('property')}
            onEdit={() => edit('property')}
            summary={draft.property.hasProperty === false ? `无房产 · ${draft.property.residenceAddress || '居住地址待补充'}` : `权利人${draft.property.ownerName} · ${draft.property.area ? `建筑面积${draft.property.area}㎡` : '建筑面积待补充'}`}
          >
            <SummaryRows rows={propertyRows(draft.property)} />
            <div className="source-tags">{draft.property.modifiedReason ? <SourceTag type="modified" /> : <SourceTag type="department" />}</div>
          </TimelineCluster>

          <TimelineCluster
            number={4}
            title="材料上传"
            status={materialComplete ? '已完成' : '待补充'}
            statusTone={materialComplete ? 'success' : 'warning'}
            expanded={Boolean(expanded.materials)}
            onToggle={() => toggle('materials')}
            onEdit={() => edit('materials')}
            summary={`已上传${Object.values(draft.materials).filter((value) => value === true).length}项 · ${materialComplete ? '材料齐全' : '仍有材料待补充'}`}
          >
            <SummaryRows rows={materialRows(draft.materials)} />
            <div className="source-tags">{draft.materials.modifiedReason ? <SourceTag type="modified" /> : <SourceTag type="manual" />}</div>
          </TimelineCluster>
        </div>
      </main>
      <FixedActionBar secondary={<Button fill="outline" size="large" onClick={() => navigate('/enrollment')}>暂存退出</Button>}>
        <Button block color="primary" size="large" onClick={() => navigate('/enrollment/review')}>预览并提交</Button>
      </FixedActionBar>
    </div>
  );
};

const Field = ({ label, required = false, source = '', children, hint = '' }) => (
  <label className="edit-field" data-required={required ? 'true' : 'false'}>
    <span className="edit-field__label">{label}</span>
    <div className={`edit-field__control${source ? ' edit-field__control--sourced' : ''}`}>
      {children}
      {source && <SourceTag type={source} />}
    </div>
    {hint && <small>{hint}</small>}
  </label>
);

Field.propTypes = {
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  source: PropTypes.string,
  children: PropTypes.node.isRequired,
  hint: PropTypes.string,
};

const PickerControl = ({ options, value = '', onChange }) => {
  const selectedIndex = Math.max(0, options.findIndex((option) => Object.is(option.value, value)));
  const pickerOptions = options.map((option, index) => ({ label: option.label, value: String(index) }));
  return (
    <Picker
      columns={[pickerOptions]}
      value={[String(selectedIndex)]}
      onConfirm={(next) => onChange(options[Number(next[0])]?.value)}
    >
      {(items, actions) => (
        <button type="button" className="edit-picker-control" onClick={actions.open}>
          <span>{items[0]?.label || options[selectedIndex]?.label}</span><DownOutline />
        </button>
      )}
    </Picker>
  );
};

PickerControl.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.node.isRequired, value: PropTypes.any })).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error || new Error('图片预览生成失败'));
  reader.readAsDataURL(file);
});

const ImageMaterial = ({
  title,
  itemCode,
  required = false,
  value = false,
  onChange,
  onUpload,
  onRemove,
  description = '',
}) => {
  const [files, setFiles] = useState(value ? [{ url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="120"><rect width="180" height="120" fill="#edf3ff"/><text x="90" y="66" font-size="18" text-anchor="middle" fill="#2457d6">已上传材料</text></svg>')}` }] : []);
  const upload = async (file) => {
    try {
      const material = await onUpload(file, itemCode);
      return { url: await readFileAsDataUrl(file), materialId: material.id };
    } catch (error) {
      Toast.show({ content: error.message || '图片上传失败，请重试' });
      throw error;
    }
  };
  return (
    <section className="material-upload-card">
      <div className="material-upload-card__head">
        <span><strong>{title}</strong>{required && <em>必传</em>}</span>
        {description && <small>{description}</small>}
      </div>
      <div className="material-upload-card__control">
        <ImageUploader
          value={files}
          onChange={(next) => {
            setFiles(next);
            onChange(next.length > 0);
          }}
          upload={upload}
          onDelete={async (item) => {
            if (item.materialId) await onRemove(item.materialId);
            return true;
          }}
          multiple
          maxCount={10}
          accept="image/*"
        >
          <div className="custom-upload-button"><CameraOutline /><span>上传图片</span></div>
        </ImageUploader>
        <p><PictureOutline /> 仅支持图片，最多10张，单张不超过10MB</p>
      </div>
    </section>
  );
};

ImageMaterial.propTypes = {
  title: PropTypes.string.isRequired,
  itemCode: PropTypes.string.isRequired,
  required: PropTypes.bool,
  value: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  description: PropTypes.string,
};

const StudentPhotoField = ({ value = false, onChange, onUpload }) => {
  const [preview, setPreview] = useState(studentPortrait);
  const upload = async (file) => {
    if (!file) return;
    try {
      await onUpload(file, 'student_photo');
      setPreview(URL.createObjectURL(file));
      onChange(true);
    } catch (error) {
      Toast.show({ content: error.message || '证件照上传失败，请重试' });
    }
  };
  return (
    <section className="student-photo-field" data-uploaded={value ? 'true' : 'false'}>
      <span className="edit-field__label">学生证件照</span>
      <div className="student-photo-uploader">
        <div className="student-photo-placeholder"><img src={preview} alt="学生证件照" /><small>近期正面免冠照，建议纯色背景</small></div>
        <div className="student-photo-actions">
          <label className="photo-action"><CameraOutline />拍照<input type="file" accept="image/*" capture="user" onChange={(event) => upload(event.target.files?.[0])} /></label>
          <label className="photo-action"><PictureOutline />从相册选择<input type="file" accept="image/*" onChange={(event) => upload(event.target.files?.[0])} /></label>
        </div>
      </div>
    </section>
  );
};

StudentPhotoField.propTypes = {
  value: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
};

export const ClusterEditPage = () => {
  const navigate = useNavigate();
  const { cluster } = useParams();
  const flow = useEnrollmentStore((state) => state.flow);
  const selectedSchool = useEnrollmentStore((state) => state.selectedSchool);
  const draft = useEnrollmentStore((state) => state.draft);
  const originalDraft = useEnrollmentStore((state) => state.originalDraft);
  const savedAt = useEnrollmentStore((state) => state.savedAt);
  const updateCluster = useEnrollmentStore((state) => state.updateCluster);
  const serverApplicationId = useEnrollmentStore((state) => state.serverApplicationId);
  const serverVersion = useEnrollmentStore((state) => state.serverVersion);
  const syncServerApplication = useEnrollmentStore((state) => state.syncServerApplication);
  const initialData = draft[cluster] || draft.student;
  const [values, setValues] = useState(() => JSON.parse(JSON.stringify(initialData)));
  const [saving, setSaving] = useState(false);
  const departmentFields = initialData._departmentFields || [];
  const originalCluster = originalDraft[cluster] || originalDraft.student;
  const propertySwitched = cluster === 'property' && values.selectedPropertyId !== originalCluster.selectedPropertyId;
  const hasDepartmentModifications = !propertySwitched && departmentFields.some((field) => values[field] !== originalCluster[field]);
  const stage = getStage(flow.stageId);
  const school = selectedSchool;
  const parentsNoPropertyApplicable = Boolean(
    school?.formRules?.parentsNoPropertyRequiredWhenGrandparentProperty
    && /[祖外]/.test(String(draft.property.relation || ''))
  );
  const propertyRecords = values.records?.length ? values.records : (values.ownerName ? [{
    id: values.selectedPropertyId || 'property-current',
    ownerName: values.ownerName,
    ownerDocument: values.ownerDocument,
    relation: values.relation,
    certificateNumber: values.certificateNumber,
    address: values.address,
    usage: values.usage,
    area: values.area,
  }] : []);
  const selectedPropertyId = values.selectedPropertyId || propertyRecords[0]?.id;

  if (!school) {
    return <Navigate to="/enrollment/applications" replace />;
  }

  const setFields = (patch) => {
    setValues((current) => ({ ...current, ...patch }));
    updateCluster(cluster, patch);
  };

  const setField = (field, value) => {
    const patch = { [field]: value };
    const householdField = {
      guardianName: 'householdHeadName',
      guardianDocument: 'householdHeadDocument',
      guardianPhone: 'householdHeadPhone',
      guardianRelation: 'householdHeadRelation',
    }[field];
    if (cluster === 'family' && values.guardianIsHouseholdHead && householdField) patch[householdField] = value;
    setFields(patch);
  };

  const setGuardianAsHouseholdHead = (checked) => setFields({
    guardianIsHouseholdHead: checked,
    ...(checked ? {
      householdHeadName: values.guardianName,
      householdHeadDocument: values.guardianDocument,
      householdHeadPhone: values.guardianPhone,
      householdHeadRelation: values.guardianRelation,
    } : {}),
  });

  const selectProperty = (property) => {
    setFields({
      selectedPropertyId: property.id,
      ownerName: property.ownerName,
      ownerDocument: property.ownerDocument,
      relation: property.relation,
      certificateNumber: property.certificateNumber,
      address: property.address,
      usage: property.usage,
      area: property.area,
      modifiedReason: '',
    });
  };

  const setPropertyMode = (mode) => {
    if (mode === 'none') {
      setFields({ propertyMode: mode, hasProperty: false });
      return;
    }
    if (mode === 'family') {
      const property = propertyRecords[0];
      setFields({
        propertyMode: mode,
        hasProperty: true,
        ...(property ? {
          selectedPropertyId: property.id,
          ownerName: property.ownerName,
          ownerDocument: property.ownerDocument,
          relation: property.relation,
          certificateNumber: property.certificateNumber,
          address: property.address,
          usage: property.usage,
          area: property.area,
        } : {}),
      });
      return;
    }
    setFields({
      propertyMode: mode,
      hasProperty: true,
      selectedPropertyId: '',
      ownerName: '',
      ownerDocument: '',
      relation: '',
      certificateNumber: '',
      address: '',
      usage: '住宅',
      area: '',
    });
  };

  const uploadMaterial = async (file, itemCode) => {
    if (!serverApplicationId) throw new Error('报名草稿尚未创建');
    const uploaded = await fileCapability.upload(file);
    const material = await enrollmentService.addMaterial(serverApplicationId, {
      fileId: uploaded.id,
      itemCode,
      sort: 0,
    });
    syncServerApplication({ id: serverApplicationId, version: material.version });
    return material;
  };

  const removeMaterial = async (materialId) => {
    const result = await enrollmentService.removeMaterial(serverApplicationId, materialId);
    syncServerApplication({ id: serverApplicationId, version: result.version });
  };

  const save = async () => {
    const patchValues = { ...values };
    delete patchValues.modifiedReason;
    delete patchValues._departmentFields;
    if (cluster === 'materials') {
      if (!values.socialEnabled) {
        ['socialPerson', 'socialDocument', 'socialRegion', 'socialStatus', 'socialFirstDate', 'socialMonths'].forEach((key) => delete patchValues[key]);
      }
      if (!values.businessEnabled) {
        ['businessOwnerRelation', 'businessCreditCode', 'businessName', 'businessOperator', 'businessType', 'businessAddress', 'businessEstablishedDate', 'businessStatus'].forEach((key) => delete patchValues[key]);
      }
      if (!parentsNoPropertyApplicable) patchValues.noPropertyEnabled = false;
      if (!parentsNoPropertyApplicable || !values.noPropertyEnabled) {
        ['noPropertyRegion', 'fatherNoPropertyResult', 'motherNoPropertyResult'].forEach((key) => delete patchValues[key]);
      }
    }
    if (hasDepartmentModifications && !values.modifiedReason?.trim()) {
      Toast.show({ content: '修改部门数据需填写修改原因' });
      return;
    }
    const reason = values.modifiedReason?.trim();
    const reasonTypes = {
      student: ['household'],
      family: ['household'],
      property: ['property'],
      materials: [
        ...(values.socialEnabled ? ['social_security'] : []),
        ...(values.businessEnabled ? ['business_license'] : []),
        ...(parentsNoPropertyApplicable && values.noPropertyEnabled ? ['parents_no_property'] : []),
      ],
    }[cluster] || [];
    const modificationReasons = reason
      ? Object.fromEntries(reasonTypes.map((type) => [type, reason]))
      : {};

    setSaving(true);
    try {
      const application = await enrollmentService.saveDraft(
        serverApplicationId,
        serverVersion,
        { [cluster]: patchValues },
        cluster === 'student'
          ? { studentName: values.name, studentIdNumber: values.documentNumber }
          : {},
        modificationReasons
      );
      updateCluster(cluster, values);
      syncServerApplication(application);
      Toast.show({ icon: 'success', content: '已保存' });
      navigate('/enrollment/overview');
    } catch (error) {
      Toast.show({ content: error.message || '保存失败，请重试' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`enrollment-page enrollment-page--with-actions edit-page edit-page--${cluster}`}>
      <div className="edit-page__meta">
        <span>{draft.student.name.slice(0, 1)}*{draft.student.name.slice(-1)} <i>·</i> {school.name} <i>·</i> {stage.name}</span>
        <em><CheckCircleFill /> 已自动保存 {savedAt}</em>
      </div>
      <main className="enrollment-content">
        <CompactNotice type="info">共享数据已自动带入，请核对并补充</CompactNotice>

        {cluster === 'student' && (
          <div className="edit-form">
            <Field label="学生姓名" required source="department"><Input value={values.name} onChange={(value) => setField('name', value)} /></Field>
            <Field label="证件类型" required source="department">
              <PickerControl
                options={[{ label: '居民身份证', value: '居民身份证' }, { label: '其他证件', value: '其他证件' }]}
                value={values.documentType}
                onChange={(value) => setField('documentType', value)}
              />
            </Field>
            <Field label="证件号码" required source="department"><Input value={values.documentNumber} onChange={(value) => setField('documentNumber', value)} /></Field>
            <StudentPhotoField
              value={Boolean(values.photoName || draft.materials.studentPhoto)}
              onChange={(value) => {
                setField('photoName', value ? '已上传' : '');
                updateCluster('materials', { studentPhoto: value });
              }}
              onUpload={uploadMaterial}
            />
            <Field label="户籍所在地" required source="department"><Input value={values.householdLocation} onChange={(value) => setField('householdLocation', value)} /></Field>
            <Field label="当前居住地址" required source={hasDepartmentModifications ? 'modified' : 'department'}>
              <TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={values.residenceAddress} onChange={(value) => setField('residenceAddress', value)} />
              {hasDepartmentModifications && <Input className="modified-reason" value={values.modifiedReason} onChange={(value) => setField('modifiedReason', value)} placeholder="请输入修改原因" />}
            </Field>
            {flow.stageId !== 'kindergarten' && (
              <Field label={flow.stageId === 'middle' ? '原小学' : '原幼儿园（选填）'} required={flow.stageId === 'middle'} source="manual">
                <Input value={values.previousSchool} onChange={(value) => setField('previousSchool', value)} />
              </Field>
            )}
            {flow.stageId === 'middle' && (
              <Field label="学籍号" required source="manual">
                <Input value={values.studentRecordNumber} onChange={(value) => setField('studentRecordNumber', value)} placeholder="请输入学生学籍号" />
              </Field>
            )}
          </div>
        )}

        {cluster === 'family' && (
          <div className="edit-form">
            <SectionTitle>监护人信息</SectionTitle>
            <Field label="监护人姓名" required source="department"><Input value={values.guardianName} onChange={(value) => setField('guardianName', value)} /></Field>
            <Field label="与学生关系" required><PickerControl options={['父亲', '母亲', '其他法定监护人'].map((item) => ({ label: item, value: item }))} value={values.guardianRelation} onChange={(value) => setField('guardianRelation', value)} /></Field>
            <Field label="证件号码" required source="department"><Input value={values.guardianDocument} onChange={(value) => setField('guardianDocument', value)} /></Field>
            <Field label="联系电话" required source="manual"><Input type="tel" value={values.guardianPhone} onChange={(value) => setField('guardianPhone', value)} /></Field>
            <SectionTitle>户籍信息</SectionTitle>
            <Checkbox className="guardian-household-check" checked={Boolean(values.guardianIsHouseholdHead)} onChange={setGuardianAsHouseholdHead}>监护人即户主</Checkbox>
            <Field label="户主姓名" required source="department"><Input value={values.householdHeadName} onChange={(value) => setField('householdHeadName', value)} /></Field>
            <Field label="户主证件号码" required source="department"><Input value={values.householdHeadDocument} onChange={(value) => setField('householdHeadDocument', value)} /></Field>
            <Field label="户主联系电话" required source="manual"><Input type="tel" value={values.householdHeadPhone} onChange={(value) => setField('householdHeadPhone', value)} /></Field>
            <Field label="户主与学生关系" required><PickerControl options={['父亲', '母亲', '祖父母', '其他'].map((item) => ({ label: item, value: item }))} value={values.householdHeadRelation} onChange={(value) => setField('householdHeadRelation', value)} /></Field>
            <Field label="户籍地址" required source="department"><TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={values.householdAddress} onChange={(value) => setField('householdAddress', value)} /></Field>
            {hasDepartmentModifications && (
            <Field label="部门数据修改原因" hint="修改共享户籍或监护人关键数据时填写">
              <Input value={values.modifiedReason} onChange={(value) => setField('modifiedReason', value)} placeholder="例如：部门数据未及时更新" />
            </Field>
            )}
          </div>
        )}

        {cluster === 'property' && (
          <div className="edit-form">
            <Field label="报名依据" required>
              <PickerControl
                options={[
                  { label: '家庭房产', value: 'family' },
                  { label: '特殊房产', value: 'special' },
                  { label: '家庭无房产', value: 'none' },
                ]}
                value={values.propertyMode || (values.hasProperty === false ? 'none' : 'family')}
                onChange={setPropertyMode}
              />
            </Field>
            {values.hasProperty !== false && (
              <>
                <Field label="产权人" required source="department"><Input value={values.ownerName} onChange={(value) => setField('ownerName', value)} /></Field>
                <Field label="产权人身份证号" required source="department"><Input value={values.ownerDocument} onChange={(value) => setField('ownerDocument', value)} /></Field>
                <Field label="产权人与学生关系" required source="department">
                  <PickerControl
                    options={['父亲', '母亲', '祖父', '祖母', '外祖父', '外祖母', '其他'].map((item) => ({ label: item, value: item }))}
                    value={values.relation}
                    onChange={(value) => setField('relation', value)}
                  />
                </Field>
              </>
            )}
            <Field label="当前居住地址" required source="manual"><TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={values.residenceAddress} onChange={(value) => setField('residenceAddress', value)} /></Field>
            {values.hasProperty !== false && values.propertyMode !== 'special' && (
              <section className="property-choice-section">
                <SectionTitle>选择报名房产</SectionTitle>
                <div className="property-choice-list">
                  {propertyRecords.map((property) => (
                    <Checkbox
                      key={property.id}
                      className={`property-choice-card ${selectedPropertyId === property.id ? 'is-selected' : ''}`}
                      checked={selectedPropertyId === property.id}
                      onChange={(checked) => checked && selectProperty(property)}
                    >
                      <div className="property-choice-card__head">
                        <strong>{property.address}</strong>
                        <SourceTag type="department" />
                      </div>
                      <div className="property-choice-card__rows">
                        <span>产权证号<strong>{property.certificateNumber}</strong></span>
                        <span>房产用途<strong>{property.usage}</strong></span>
                        <span>建筑面积<strong>{property.area} ㎡</strong></span>
                      </div>
                    </Checkbox>
                  ))}
                </div>
              </section>
            )}
            {values.propertyMode === 'special' && (
              <section className="special-property-fields">
                <SectionTitle>填写特殊房产信息</SectionTitle>
                <Field label="产权证号" required source="manual"><Input value={values.certificateNumber} onChange={(value) => setField('certificateNumber', value)} /></Field>
                <Field label="房产地址" required source="manual"><TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={values.address} onChange={(value) => setField('address', value)} /></Field>
                <Field label="房产用途" required source="manual"><PickerControl options={[{ label: '住宅', value: '住宅' }, { label: '其他', value: '其他' }]} value={values.usage} onChange={(value) => setField('usage', value)} /></Field>
                <Field label="建筑面积" required source="manual"><Input type="number" value={values.area} onChange={(value) => setField('area', value)} placeholder="请输入建筑面积（㎡）" /></Field>
              </section>
            )}
            {hasDepartmentModifications && (
            <Field label="部门数据修改原因" hint="修改共享房产关键数据时填写">
              <Input value={values.modifiedReason} onChange={(value) => setField('modifiedReason', value)} placeholder="例如：产权信息已变更" />
            </Field>
            )}
          </div>
        )}

        {cluster === 'materials' && (
          <div className="material-list">
            <ImageMaterial title="户口簿" itemCode="household_book" required value={values.householdBook} onChange={(value) => setField('householdBook', value)} onUpload={uploadMaterial} onRemove={removeMaterial} description="户主页、学生页及监护人页" />
            {draft.property.hasProperty !== false && <ImageMaterial title="房产证明" itemCode="property_certificate" required value={values.propertyProof} onChange={(value) => setField('propertyProof', value)} onUpload={uploadMaterial} onRemove={removeMaterial} description="不动产权证或其他合法住房证明" />}
            <ImageMaterial title="监护人身份证" itemCode="guardian_id" required value={values.guardianId} onChange={(value) => setField('guardianId', value)} onUpload={uploadMaterial} onRemove={removeMaterial} />
            {flow.stageId === 'middle' && <ImageMaterial title="学籍证明" itemCode="student_registration" required value={values.studentRegistrationProof} onChange={(value) => setField('studentRegistrationProof', value)} onUpload={uploadMaterial} onRemove={removeMaterial} />}
            <section className="conditional-materials">
              <h3><FileOutline /> 条件性材料</h3>
              <p>仅在外来人员无房无户籍，或使用祖辈房产且学校要求时补充。</p>
              <div className="conditional-group">
                <Checkbox checked={values.socialEnabled} onChange={(value) => setField('socialEnabled', value)}>需要补充社保信息</Checkbox>
                {values.socialEnabled && (
                  <div className="conditional-group__fields">
                    <Field label="参保人" required><PickerControl options={['父亲', '母亲', '其他法定监护人'].map((item) => ({ label: item, value: item }))} value={values.socialPerson} onChange={(value) => setField('socialPerson', value)} /></Field>
                    <Field label="参保人证件号码" required source="department"><Input value={values.socialDocument} onChange={(value) => setField('socialDocument', value)} /></Field>
                    <Field label="参保地区" required source="department"><Input value={values.socialRegion} onChange={(value) => setField('socialRegion', value)} /></Field>
                    <Field label="参保状态" required source="department"><Input value={values.socialStatus} onChange={(value) => setField('socialStatus', value)} /></Field>
                    <Field label="首次参保时间" required source="department"><Input value={values.socialFirstDate} onChange={(value) => setField('socialFirstDate', value)} placeholder="YYYY-MM" /></Field>
                    <Field label="连续缴纳月数" required source="department"><Input type="number" value={values.socialMonths} onChange={(value) => setField('socialMonths', value)} /></Field>
                    <ImageMaterial title="社保证明图片" itemCode="social_security_proof" value={values.socialSecurity} onChange={(value) => setField('socialSecurity', value)} onUpload={uploadMaterial} onRemove={removeMaterial} />
                  </div>
                )}
              </div>
              <div className="conditional-group">
                <Checkbox checked={values.businessEnabled} onChange={(value) => setField('businessEnabled', value)}>需要补充营业执照信息</Checkbox>
                {values.businessEnabled && (
                  <div className="conditional-group__fields">
                    <Field label="经营主体与学生关系" required><PickerControl options={['父亲', '母亲', '其他法定监护人'].map((item) => ({ label: item, value: item }))} value={values.businessOwnerRelation} onChange={(value) => setField('businessOwnerRelation', value)} /></Field>
                    <Field label="统一社会信用代码" required source="department"><Input value={values.businessCreditCode} onChange={(value) => setField('businessCreditCode', value)} /></Field>
                    <Field label="市场主体名称" required source="department"><Input value={values.businessName} onChange={(value) => setField('businessName', value)} /></Field>
                    <Field label="经营者或法定代表人" required source="department"><Input value={values.businessOperator} onChange={(value) => setField('businessOperator', value)} /></Field>
                    <Field label="主体类型" required source="department"><Input value={values.businessType} onChange={(value) => setField('businessType', value)} /></Field>
                    <Field label="注册地址" required source="department"><TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={values.businessAddress} onChange={(value) => setField('businessAddress', value)} /></Field>
                    <Field label="成立日期" required source="department"><Input value={values.businessEstablishedDate} onChange={(value) => setField('businessEstablishedDate', value)} placeholder="YYYY-MM-DD" /></Field>
                    <Field label="登记状态" required source="department"><Input value={values.businessStatus} onChange={(value) => setField('businessStatus', value)} /></Field>
                    <ImageMaterial title="营业执照图片" itemCode="business_license" value={values.businessLicense} onChange={(value) => setField('businessLicense', value)} onUpload={uploadMaterial} onRemove={removeMaterial} />
                  </div>
                )}
              </div>
              {parentsNoPropertyApplicable && <div className="conditional-group">
                <Checkbox checked={values.noPropertyEnabled} onChange={(value) => setField('noPropertyEnabled', value)}>使用祖辈房产并需父辈无房证明</Checkbox>
                {values.noPropertyEnabled && (
                  <div className="conditional-group__fields">
                    <Field label="核验区域" required source="department"><Input value={values.noPropertyRegion} onChange={(value) => setField('noPropertyRegion', value)} /></Field>
                    <Field label="父亲名下房产核验结果" required source="department"><PickerControl options={['无房', '有房', '未查到结果'].map((item) => ({ label: item, value: item }))} value={values.fatherNoPropertyResult} onChange={(value) => setField('fatherNoPropertyResult', value)} /></Field>
                    <Field label="母亲名下房产核验结果" required source="department"><PickerControl options={['无房', '有房', '未查到结果'].map((item) => ({ label: item, value: item }))} value={values.motherNoPropertyResult} onChange={(value) => setField('motherNoPropertyResult', value)} /></Field>
                    <ImageMaterial title="父辈无房证明图片" itemCode="parents_no_property_proof" value={values.parentNoProperty} onChange={(value) => setField('parentNoProperty', value)} onUpload={uploadMaterial} onRemove={removeMaterial} description="父母双方分别提供，特殊情况可上传说明材料" />
                  </div>
                )}
              </div>}
            </section>
            {hasDepartmentModifications && (
            <Field label="部门数据修改原因" hint="修改条件性共享数据时填写">
              <Input value={values.modifiedReason} onChange={(value) => setField('modifiedReason', value)} placeholder="例如：部门数据与实际情况不一致" />
            </Field>
            )}
            <Field label="补充说明（选填）"><TextArea autoSize={{ minRows: 3, maxRows: 6 }} value={values.note} onChange={(value) => setField('note', value)} placeholder="如有特殊情况可在此说明" /></Field>
          </div>
        )}
      </main>
      <FixedActionBar>
        <div className="save-action">
          <span><CheckCircleFill /> 已自动保存 {savedAt}</span>
          <Button color="primary" size="large" loading={saving} onClick={save}>保存并返回</Button>
        </div>
      </FixedActionBar>
    </div>
  );
};

const ReviewSection = ({ title, expanded, onToggle, children }) => (
  <section className={`review-section${expanded ? ' review-section--expanded' : ''}`}>
    <div className="review-section__head">
      <h2>{title}</h2>
      <button type="button" onClick={onToggle} aria-label={expanded ? `收起${title}` : `展开${title}`}>
        {expanded ? <UpOutline /> : <DownOutline />}
      </button>
    </div>
    {expanded && <div className="review-section__card">{children}</div>}
  </section>
);

ReviewSection.propTypes = {
  title: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

const maskDocument = (value = '') => value.length > 8
  ? `${value.slice(0, 4)}${'*'.repeat(Math.max(4, value.length - 8))}${value.slice(-4)}`
  : value;

const maskPhone = (value = '') => value.length >= 7
  ? `${value.slice(0, 3)}****${value.slice(-4)}`
  : value;

export const ReviewSubmitPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const readOnly = searchParams.get('readonly') === '1';
  const flow = useEnrollmentStore((state) => state.flow);
  const selectedSchool = useEnrollmentStore((state) => state.selectedSchool);
  const draft = useEnrollmentStore((state) => state.draft);
  const submitApplication = useEnrollmentStore((state) => state.submitApplication);
  const serverApplicationId = useEnrollmentStore((state) => state.serverApplicationId);
  const serverVersion = useEnrollmentStore((state) => state.serverVersion);
  const syncServerApplication = useEnrollmentStore((state) => state.syncServerApplication);
  const [declared, setDeclared] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState({ student: true, family: true, property: true, materials: true });
  const stage = getStage(flow.stageId);
  const category = getCategory(flow.categoryId);
  const school = selectedSchool;
  const toggle = (key) => setExpanded((value) => ({ ...value, [key]: !value[key] }));
  const uploadedMaterialNames = [
    ['householdBook', '户口簿'],
    ['propertyProof', '房产证明'],
    ['guardianId', '监护人身份证'],
    ['studentPhoto', '学生证件照'],
    ['studentRegistrationProof', '学籍证明'],
    ['socialSecurity', '社保证明'],
    ['businessLicense', '营业执照'],
    ['parentNoProperty', '父辈无房证明'],
  ].filter(([key]) => draft.materials[key]).map(([, label]) => label);

  if (!school) {
    return <Navigate to="/enrollment/applications" replace />;
  }

  const submit = async () => {
    if (!declared) {
      Toast.show({ content: '请先勾选真实性声明' });
      return;
    }
    const confirmed = await Dialog.confirm({
      title: '确认提交报名？',
      content: '提交后不能自行撤回，请确认所有信息真实、完整。',
      confirmText: '确认提交',
    });
    if (!confirmed) return;
    setSubmitting(true);
    try {
      const serverApplication = await enrollmentService.submitApplication(serverApplicationId, serverVersion);
      syncServerApplication(serverApplication);
      submitApplication(serverApplication);
      navigate('/enrollment/success', { replace: true });
    } catch (error) {
      Toast.show({ content: error.message || '提交失败，请核对报名信息' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="enrollment-page review-page">
      <main className="enrollment-content">
        <GovHero title={`${draft.student.name} · ${school.name}`} subtitle={`${CURRENT_YEAR}年${stage.name} · ${category.name}`} compact visual="summary" />

        <div className="review-sections">
          <ReviewSection title="学生信息" expanded={expanded.student} onToggle={() => toggle('student')}>
            <div className="review-photo"><span>学生证件照</span><img src={studentPortrait} alt="学生证件照" /></div>
            <SummaryRows rows={studentRows(draft.student).map((row) => row.label === '证件号码' ? { ...row, value: maskDocument(row.value) } : row)} />
            {draft.student.modifiedReason && (
              <div className="data-compare">
                <strong>当前居住地址 <SourceTag type="modified" /></strong>
                <p><span>本次申报值</span>{draft.student.residenceAddress}</p>
                <small>修改原因：{draft.student.modifiedReason}</small>
              </div>
            )}
          </ReviewSection>

          <ReviewSection title="家庭及户籍信息" expanded={expanded.family} onToggle={() => toggle('family')}>
            <div className="review-person-group">
              <h3><UserCircleOutline /> 户主（{draft.family.householdHeadRelation || '父亲'}）</h3>
              <SummaryRows rows={[
                { label: '姓名', value: draft.family.householdHeadName },
                { label: '证件号码', value: maskDocument(draft.family.householdHeadDocument) },
                { label: '联系电话', value: maskPhone(draft.family.householdHeadPhone) },
                { label: '与学生关系', value: draft.family.householdHeadRelation },
              ]} />
            </div>
            <div className="review-person-group review-person-group--guardian">
              <h3><UserCircleOutline /> 监护人（{draft.family.guardianRelation || '母亲'}）</h3>
              <SummaryRows rows={[
                { label: '姓名', value: draft.family.guardianName },
                { label: '证件号码', value: maskDocument(draft.family.guardianDocument) },
                { label: '联系电话', value: maskPhone(draft.family.guardianPhone) },
                { label: '与学生关系', value: draft.family.guardianRelation },
              ]} />
            </div>
            {draft.family.modifiedReason && <p className="modified-note"><SourceTag type="modified" /> 修改原因：{draft.family.modifiedReason}</p>}
          </ReviewSection>

          <ReviewSection title="房产及居住信息" expanded={expanded.property} onToggle={() => toggle('property')}>
            <SummaryRows rows={propertyRows(draft.property)} />
            {draft.property.modifiedReason && <p className="modified-note"><SourceTag type="modified" /> 修改原因：{draft.property.modifiedReason}</p>}
          </ReviewSection>

          <ReviewSection title="材料上传" expanded={expanded.materials} onToggle={() => toggle('materials')}>
            <SummaryRows rows={materialRows(draft.materials)} />
            {uploadedMaterialNames.length > 0 && (
              <div className="material-thumbnails">
                {uploadedMaterialNames.map((name) => <div key={name}><PictureOutline /><span>{name}</span></div>)}
              </div>
            )}
            {draft.materials.modifiedReason && <p className="modified-note"><SourceTag type="modified" /> 修改原因：{draft.materials.modifiedReason}</p>}
          </ReviewSection>
        </div>

        {!readOnly && (
          <section className="truth-declaration">
            <h3><ContentOutline /> 真实性声明</h3>
            <Checkbox checked={declared} onChange={setDeclared}>
              本人确认以上报名信息及材料真实、准确、完整，并同意学校按招生政策进行审核。
            </Checkbox>
            <p><ExclamationCircleOutline /> 初审通过不代表最终录取，录取结果以统一发布信息为准。</p>
          </section>
        )}

        {!readOnly && (
          <div className="review-submit-action">
            <Button block color="primary" size="large" loading={submitting} disabled={!declared} onClick={submit}>确认提交报名</Button>
          </div>
        )}
      </main>
    </div>
  );
};

export const SubmitSuccessPage = () => {
  const navigate = useNavigate();
  const application = useEnrollmentStore((state) => state.application);
  return (
    <div className="enrollment-page success-page">
      <main className="enrollment-content">
        <div className="success-mark"><CheckCircleFill /></div>
        <h1>报名已提交</h1>
        <p>报名信息已进入学校审核，请在“我的报名”查看最新状态。</p>
        {application ? (
          <>
            <div className="success-receipt">
              <SummaryRows rows={[
                { label: '报名编号', value: application.applicationNumber || application.id },
                { label: '学生', value: application.studentName },
                { label: '学校', value: application.schoolName },
                { label: '当前状态', value: application.status },
              ]} />
            </div>
            <Button block color="primary" size="large" onClick={() => navigate(`/enrollment/applications/${application.id}`)}>查看报名详情</Button>
          </>
        ) : <CompactNotice type="info">可在“我的报名”中查看刚刚提交的记录。</CompactNotice>}
        <Button block fill="none" onClick={() => navigate('/enrollment')}>返回招生报名首页</Button>
      </main>
    </div>
  );
};
