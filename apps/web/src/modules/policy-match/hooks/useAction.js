import {useCallback,useRef,useState} from 'react';
export default function useAction(){
  const[busy,setBusy]=useState(false);const[error,setError]=useState('');const pending=useRef(false);
  const run=useCallback(async(fn)=>{if(pending.current)return;pending.current=true;setBusy(true);setError('');try{return await fn();}catch(e){setError(e.message);}finally{pending.current=false;setBusy(false);}},[]);
  return {busy,error,run};
}
