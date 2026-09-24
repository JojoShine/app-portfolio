const q=(key,label,options,type='select',hint='')=>({key,label,options,type,hint});
export const steps={
  personal:[
    {title:'基础情况',fields:[q('age','年龄',null,'number'),q('region','所在地区',null,'text'),q('residence','户籍情况',['本地户籍','非本地户籍'])]},
    {title:'教育与人才',fields:[q('education','最高学历',['大专及以下','本科','硕士','博士']),q('graduationYear','毕业年份',null,'number'),q('qualification','人才或职业资质',['职业资格','人才认定','暂未取得'])]},
    {title:'就业与社保',fields:[q('employment','就业状态',['已就业','待就业','灵活就业','在校']),q('industry','所属行业',null,'text'),q('socialMonths','连续缴纳社保月数',null,'number')]},
    {title:'创业情况',fields:[q('startup','是否已创业',['是','否']),q('startupYears','创业年限',null,'number')]},
    {title:'确认信息',fields:[]},
  ],
  company:[
    {title:'企业基础',fields:[q('name','企业名称',null,'text'),q('region','登记地区',null,'text'),q('industry','所属行业',null,'text'),q('years','成立年限',null,'number')]},
    {title:'经营情况',fields:[q('employees','员工人数',null,'number'),q('revenue','年营业收入（万元）',null,'number'),q('taxStatus','纳税状态',['正常','异常'])]},
    {title:'创新资质',fields:[q('rdRatio','研发投入占营收比例（%）',null,'number'),q('qualifications','有效资质',['高新技术企业','科技型中小企业','专精特新企业'],'multi'),q('patents','有效知识产权数量',null,'number')]},
    {title:'用工与项目',fields:[q('newJobs','新增就业人数',null,'number'),q('projectStage','项目阶段',['筹备','研发','产业化']),q('investment','项目投资（万元）',null,'number')]},
    {title:'确认信息',fields:[]},
  ],
};
