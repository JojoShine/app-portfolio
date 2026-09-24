import {useId,useRef,useState} from 'react';
import {Popup} from 'antd-mobile';
import PropTypes from 'prop-types';
import {CheckOutline,DownOutline} from 'antd-mobile-icons';

const options = [
  {value:'score',label:'匹配度优先'},
  {value:'deadline',label:'截止时间'},
  {value:'amount',label:'支持力度'},
];

export default function PolicySortSelect({value,onChange}) {
  const [open,setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const optionRefs = useRef([]);
  const listId = useId();
  const selectedIndex = options.findIndex(option=>option.value===value);

  const close = ()=>setOpen(false);
  const handleKeyDown = event=>{
    if (event.key==='Escape') {event.preventDefault();close();return;}
    if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
    event.preventDefault();
    if (!open) {setOpen(true);return;}
    const index = optionRefs.current.indexOf(document.activeElement);
    const next = event.key==='Home'?0:event.key==='End'?options.length-1:
      (index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;
    optionRefs.current[next]?.focus();
  };

  return <div className="pm-sort" ref={root} onKeyDown={handleKeyDown}>
    <button type="button" ref={trigger} className="pm-sort-trigger"
      aria-label={`政策排序：${options[selectedIndex].label}`} aria-haspopup="dialog"
      aria-expanded={open} aria-controls={open?listId:undefined} onClick={()=>setOpen(!open)}>
      {options[selectedIndex].label}<DownOutline/>
    </button>
    <Popup visible={open} position="bottom" closeOnMaskClick onClose={close}
      getContainer={()=>root.current} bodyClassName="pm-sort-sheet" destroyOnClose
      afterShow={()=>optionRefs.current[selectedIndex]?.focus()}
      afterClose={()=>trigger.current?.focus()}>
      <section id={listId} role="dialog" aria-modal="true" aria-labelledby={`${listId}-title`}
        onKeyDown={event=>{
          if (event.key!=='Tab') return;
          const buttons=[...event.currentTarget.querySelectorAll('button')];
          const index=buttons.indexOf(document.activeElement);
          event.preventDefault();
          buttons[(index+(event.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();
        }}>
        <h2 id={`${listId}-title`} className="pm-sort-title">排序方式</h2>
        <div role="listbox" aria-label="政策排序" className="pm-sort-options">
          {options.map((option,index)=><button type="button" role="option" key={option.value}
            ref={node=>{optionRefs.current[index]=node;}} tabIndex={-1}
            aria-selected={value===option.value} className="pm-sort-option"
            onClick={()=>{onChange(option.value);close();}}>
            {option.label}{value===option.value&&<CheckOutline/>}
          </button>)}
        </div>
        <button type="button" className="pm-sort-cancel" onClick={close}>取消</button>
      </section>
    </Popup>
  </div>;
}

PolicySortSelect.propTypes = {
  value:PropTypes.oneOf(options.map(option=>option.value)).isRequired,
  onChange:PropTypes.func.isRequired,
};
