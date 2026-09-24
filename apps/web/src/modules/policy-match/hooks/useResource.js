import {useCallback,useEffect,useRef,useState} from 'react';
export default function useResource(loader) {
  const [state,setState]=useState({data:null,error:'',loading:true});
  const revision=useRef(0);
  const reload=useCallback(async()=>{
    const current=++revision.current;
    setState(s=>({...s,loading:true,error:''}));
    try{const data=await loader();if(current===revision.current)setState({data,error:'',loading:false});}
    catch(error){if(current===revision.current)setState(s=>({...s,error:error.message,loading:false}));}
  },[loader]);
  useEffect(()=>{const requestRevision=revision;reload();return()=>{requestRevision.current++;};},[reload]);
  const setData=useCallback((data)=>setState(s=>({...s,data})),[]);
  return {...state,reload,setData};
}
