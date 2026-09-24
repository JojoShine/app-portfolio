import {useCallback,useEffect,useRef,useState} from 'react';
import useResource from './useResource';
import useAction from './useAction';
import {profileService} from '../services/profile.service';
export default function useProfileFlow(type){
  const resource=useResource(useCallback(()=>profileService.get(type),[type]));
  const [payload,setPayload]=useState({});
  const [saved,setSaved]=useState('');
  const version=useRef(0);
  const action=useAction();
  useEffect(()=>{if(resource.data){setPayload(resource.data.payload);version.current=resource.data.version;}},[resource.data]);
  const save=()=>action.run(async()=>{const row=await profileService.save(type,{payload,version:version.current});version.current=row.version;setSaved('已保存 '+new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}));return row;});
  return {resource,payload,saved,setPayload,save,...action};
}
