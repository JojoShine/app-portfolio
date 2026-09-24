export const benefitLabel=check=>check?.existing?'已有办理记录':check?.blocked?'互斥申报受限':check?.stacking==='exclusive'?'不可重复享受':check?.stacking==='stackable'?'按规则可叠加':check?.stacking==='difference'?'仅补差额，需核实':'重复享受需核实';
export const applicationPath=record=>'/policy-match/'+(record.channel==='external'?'external/':['draft','supplement_required'].includes(record.status)?'apply/':'records/')+record.id;
export const date=(value)=>value?new Date(value).toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai',month:'long',day:'numeric'}):'—';
export const time=(value)=>value?new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
export const eligibility={eligible:'条件符合',potential:'可能符合',ineligible:'暂不符合',expired:'已截止'};
export const statuses={draft:'草稿',submitted:'已提交',supplement_required:'需补充材料',under_review:'演示审核中',approved:'演示审核通过',rejected:'演示审核未通过',withdrawn:'已撤回',preparing:'准备材料',visited_external:'已前往办理',stopped:'已停止'};
export const isActive=(a)=>!['approved','rejected','withdrawn','stopped'].includes(a.status);
export const displayValue=(v)=>v===null||v===undefined||v===''?'待补充':Array.isArray(v)?v.join('、')||'暂无':String(v);
