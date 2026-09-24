import api from '../../../shared/api/api';
export const getBenefitCheck=id=>api.get('/policy-match/policies/'+id+'/benefit-check');
export const policyService={list:(subjectType)=>api.get('/policy-match/policies',{params:{subjectType}}),get:(id)=>api.get('/policy-match/policies/'+id),favorites:()=>api.get('/policy-match/favorites'),favorite:(id,enabled)=>enabled?api.put('/policy-match/policies/'+id+'/favorite'):api.delete('/policy-match/policies/'+id+'/favorite')};
