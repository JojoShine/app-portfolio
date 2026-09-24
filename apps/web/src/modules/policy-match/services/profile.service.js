import api from '../../../shared/api/api';
export const profileService={get:(type)=>api.get('/policy-match/profiles/'+type),save:(type,data)=>api.put('/policy-match/profiles/'+type,data)};
