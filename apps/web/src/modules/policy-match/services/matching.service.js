import api from '../../../shared/api/api';
export const matchingService={create:(subjectType)=>api.post('/policy-match/matches',{subjectType}),list:(subjectType)=>api.get('/policy-match/matches',{params:{subjectType}}),get:(id)=>api.get('/policy-match/matches/'+id)};
