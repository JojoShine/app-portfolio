import {useCallback} from 'react';
import useResource from './useResource';
import {usePolicy} from '../components/PolicyContext';
import {profileService} from '../services/profile.service';
import {policyService} from '../services/policy.service';
import {matchingService} from '../services/matching.service';
import {applicationService} from '../services/application.service';
export default function useDashboard(){
  const {subjectType,authenticated}=usePolicy();
  return useResource(useCallback(async()=>{
    const policies=await policyService.list(subjectType);
    if(!authenticated)return {policies,profile:{completeness:0,filled:0,count:subjectType==='personal'?12:14},matches:[],applications:[]};
    const [profile,matches,applications]=await Promise.all([profileService.get(subjectType),matchingService.list(subjectType),applicationService.list(subjectType)]);
    return {policies,profile,matches,applications};
  },[subjectType,authenticated]));
}
