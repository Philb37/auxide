import React from 'react';

export function SegmentedControl({options=[],value,onChange,size='md',block=true}){
  const sm=size==='sm';
  const opts=options.map(o=>typeof o==='string'?{value:o,label:o}:o);
  return <div role="tablist" style={{display:sm||!block?'inline-flex':'grid',gridTemplateColumns:`repeat(${opts.length},minmax(0,1fr))`,background:sm?'var(--surface-sunken)':'var(--surface-track)',borderRadius:999,padding:sm?3:4,font:sm?'600 12px var(--font-ui)':'600 13px var(--font-ui)',textAlign:'center'}}>
    {opts.map(o=>{const on=o.value===value;return <span key={o.value} role="tab" aria-selected={on} onClick={()=>onChange&&onChange(o.value)} style={{padding:sm?'5px 11px':'9px 0',minWidth:!sm&&!block?64:undefined,borderRadius:999,cursor:'pointer',background:on?'#fff':'transparent',color:on?'var(--text-primary)':'var(--text-muted)',boxShadow:on?'var(--shadow-seg)':'none'}}>{o.label}</span>;})}
  </div>;
}