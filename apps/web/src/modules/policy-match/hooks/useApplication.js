import {useCallback,useEffect,useRef,useState} from 'react';
import useResource from './useResource';
import useAction from './useAction';
import {applicationService} from '../services/application.service';
import {getBenefitCheck} from '../services/policy.service';
export function useMaterialImage(fileId,onUpload){
  const[value,setValue]=useState([]);const[error,setError]=useState('');const urls=useRef(new Set());
  useEffect(()=>{const allocated=urls.current;return()=>allocated.forEach(url=>applicationService.release(url));},[]);
  useEffect(()=>{
    let cancelled=false;let currentUrl='';setValue([]);setError('');
    if(fileId)applicationService.preview(fileId).then(url=>{
      if(cancelled){applicationService.release(url);return;}
      currentUrl=url;setValue([{url}]);
    }).catch(()=>{if(!cancelled)setError('图片加载失败，请重新进入页面重试');});
    return()=>{cancelled=true;if(currentUrl)applicationService.release(currentUrl);};
  },[fileId]);
  const upload=async file=>{
    setError('');
    try{await onUpload(file);const url=URL.createObjectURL(file);urls.current.add(url);return {url};}
    catch(e){setError(e.message);throw e;}
  };
  return {value,onChange:items=>setValue(items.slice(-1)),upload,error};
}
export default function useApplication(id){
  const resource=useResource(useCallback(async()=>{const row=await applicationService.get(id);return {...row,benefitCheck:await getBenefitCheck(row.policyId)};},[id]));
  const currentCheck=resource.data?.benefitCheck;const setResourceData=resource.setData;
  const setData=useCallback(row=>setResourceData({...row,benefitCheck:currentCheck}),[setResourceData,currentCheck]);
  const action=useAction();const[preview,setPreview]=useState('');const objectUrl=useRef('');
  useEffect(()=>()=>{if(objectUrl.current)applicationService.release(objectUrl.current);},[]);
  const closePreview=()=>{if(objectUrl.current)applicationService.release(objectUrl.current);objectUrl.current='';setPreview('');};
  const openPreview=(fileId)=>action.run(async()=>{const url=await applicationService.preview(fileId);if(objectUrl.current)applicationService.release(objectUrl.current);objectUrl.current=url;setPreview(url);});
  const upload=async(code,file)=>{
    const result=await action.run(async()=>{
    if(file.size>10*1024*1024||!['image/jpeg','image/png'].includes(file.type))throw new Error('请上传10MB以内的JPG或PNG图片');
    const saved=await applicationService.upload(file);
    const row=await applicationService.attach(id,{code,fileId:saved.id,version:resource.data.version});
    setData(row);
    return row;
    });
    if(!result)throw new Error('图片未上传成功，请检查格式、大小或稍后重试');
    return result;
  };
  return {resource:{...resource,setData},action,preview,closePreview,openPreview,upload};
}
